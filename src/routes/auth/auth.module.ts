import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthService,HashingService,PrismaService,TokenService],
  controllers: [AuthController],
   imports: [
    JwtModule.register({
      secret: 'your-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AuthModule {}
