import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { LoginBodyDto } from './auth.dto';
import { TokenService } from 'src/shared/services/token.service';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper';

@Injectable()
export class AuthService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly prismaService: PrismaService,
        private readonly tokenService: TokenService,
    ) { }
    async generateTokens(payload: { userId: number }) {
        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.signAccessToken(payload),
            this.tokenService.signRefreshToken(payload)
        ])
        const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
        await this.prismaService.refreshToken.create({
            data: {
                token: refreshToken,
                userId: payload.userId,
                expiresAt: new Date(decodedRefreshToken.exp * 1000),
            },
        })
        return {
            accessToken,
            refreshToken
        }
    }

    async register(body: any) {
        try {
            const hashedPassword = await this.hashingService.hash(body.password);
            const user = await this.prismaService.user.create({
                data: {
                    email: body.email,
                    password: hashedPassword,
                    name: body.name,
                }
            })
            return user
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw new ConflictException('Email already exists');
            }
            throw error
        }
    }
    async login(body: LoginBodyDto) {
        try {
            const { email, password } = body;
            const user = await this.prismaService.user.findUnique({
                where: { email }
            });
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            const isPasswordValid = await this.hashingService.compare(password, user.password);
            if (!isPasswordValid) {
                throw new UnprocessableEntityException([
                    {
                        field: 'password',
                        error: 'Password is incorrect'
                    }
                ]);
            }
            const tokens = await this.generateTokens({ userId: user.id });
            return tokens
        } catch (error) {
            throw error
        }
    }
    async refreshToken(refreshToken: string) {
        try {
            //1. Kiểm tra refreshToken có hợp lệ không
            const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
            //2. Kiểm tra refreshToken có tồn tại trong DB không
            await this.prismaService.refreshToken.findUniqueOrThrow({
                where: {
                    token: refreshToken,
                },
            })
            //3. Xoa refreshToken cũ
            await this.prismaService.refreshToken.delete({
                where: { token: refreshToken }
            })
            //4. Tạo mới refreshToken và accessToken
            return await this.generateTokens({ userId });
        } catch (error) {
            // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
            // refresh token của họ đã bị đánh cắp
            if (isNotFoundPrismaError(error)) {
                throw new UnauthorizedException('Refresh token has been revoked or does not exist');
            }
            throw new UnauthorizedException();
        }
    }
    async logout(refreshToken: string) {
        try {
            //1. Kiểm tra refreshToken có hợp lệ không
            await this.tokenService.verifyRefreshToken(refreshToken);
            //2. Xóa refreshToken khỏi DB
            await this.prismaService.refreshToken.delete({
                where: { token: refreshToken }
            })
            return { message: 'Logged out successfully' };
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new UnauthorizedException('Refresh token not found');
            }
            throw new UnauthorizedException()
        }
    }
}
