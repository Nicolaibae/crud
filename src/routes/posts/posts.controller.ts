import { Controller, Get, Post, Body, Param, Put, UseGuards, SerializeOptions, Delete } from '@nestjs/common';
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { APIKeyGuard } from 'src/shared/guards/api-key.guard';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreatePostBodyDTO, GetPostItemDTO } from './post.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Auth([AuthType.Bearer, AuthType.APIKey], { condition: ConditionGuard.And })
    @Get()
    async getPosts(@ActiveUser('userId') userId: number) {
        return await this.postsService.getPosts(userId).then((posts) => posts.map((post) => new GetPostItemDTO(post)))
    }


    @Post()
    @Auth([AuthType.Bearer])
    async createPost(@Body() body: CreatePostBodyDTO, @ActiveUser('userId') userId: number) {
        return new GetPostItemDTO(await this.postsService.createPost(userId, body))
    }

    @Get(':id')
    async getPost(@Param('id') id: string) {
        return new GetPostItemDTO(await this.postsService.getPost(Number(id)))
    }

    @Put(':id')
    @Auth([AuthType.Bearer])
    async updatePost(@Body() body: CreatePostBodyDTO, @Param('id') id: string, @ActiveUser('userId') userId: number) {
        return new GetPostItemDTO(
            await this.postsService.updatePost({
                postId: Number(id),
                userId,
                body,
            }),
        )
    }

    @Delete(':id')
    @Auth([AuthType.Bearer])
    deletePost(@Param('id') id: string, @ActiveUser('userId') userId: number): Promise<boolean> {
        return this.postsService.deletePost({
            postId: Number(id),
            userId,
        })
    }

}
