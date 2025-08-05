import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
    providers: [PrismaService, HashingService, TokenService],
    exports: [PrismaService],
    imports: [JwtModule],
})
export class SharedModule {}
