import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hashing.service';

@Global()
@Module({
    providers: [PrismaService, HashingService],
    exports: [PrismaService]
})
export class SharedModule {}
