import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  providers: [AuthService,HashingService,PrismaService],
  controllers: [AuthController]
})
export class AuthModule {}
