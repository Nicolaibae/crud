import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { APIKeyGuard } from 'src/shared/guards/api-key.guard';
import { PrismaService } from 'src/shared/services/prisma.service';

@Controller('posts')
export class PostsController {
    constructor(private readonly prismaService: PrismaService) {}
    @UseGuards(AccessTokenGuard)
    @UseGuards(APIKeyGuard)
    @Get()
    getPosts() {
        return this.prismaService.post.findMany();
    }
    @Post()
    createPost(@Body() body: any) {
        const userId = 1;
        return this.prismaService.post.create({
            
            data:{
                title: body.title,
                content: body.content,
                authorId: body.authorId || userId, // Giả sử userId là 1
            }
        });
    }
    // @Get('/:id')
    // getdetails(@Param('id') id: string) {
    //     return this.prismaService.getDetail(id)
    // }
    // @Put('/:id')
    // updatePosts(@Param('id') id: string, @Body() body: any){
    //     return this.prismaService.updatePost(id,body);
    // }
}
