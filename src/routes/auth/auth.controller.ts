import { Body, Controller, Post, SerializeOptions } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterBodyDto, RegisterResDTO } from './auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @SerializeOptions({ type:RegisterResDTO })
    @Post('register')
    async register(@Body() body: RegisterBodyDto) {
        const user = await this.authService.register(body);
        return user;
    }
}
