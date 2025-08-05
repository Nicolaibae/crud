import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { LoginBodyDto } from './auth.dto';
import { TokenService } from 'src/shared/services/token.service';

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
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
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

        }
    }
}
