import { Body, Controller, Post, SerializeOptions, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginBodyDto, LoginResDTO, RefreshTokenBodyDto, RefreshTokenResDTO, RegisterBodyDto, RegisterResDTO } from './auth.dto';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @SerializeOptions({ type:RegisterResDTO })
    @Post('register')
    async register(@Body() body: RegisterBodyDto) {
        const user = await this.authService.register(body);
        return user;
    }
    @Post('login')
    async login(@Body() body: LoginBodyDto) {
        const tokens = await this.authService.login(body);
        return new LoginResDTO(tokens  as Partial<LoginResDTO>);
    }
    @UseGuards(AccessTokenGuard)
    @SerializeOptions({ type: RefreshTokenResDTO })
    @Post('refresh-token')
    async refreshToken(@Body() body: RefreshTokenBodyDto) {
        const tokens = await this.authService.refreshToken(body.refreshToken);
        return tokens;
    }
}
