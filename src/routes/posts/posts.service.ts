import { Injectable } from '@nestjs/common';
import envConfig from 'src/shared/config';

@Injectable()
export class PostsService {
    getPost() {
       
        return 'This action returns all posts';
    }
    create(body: any) {
        return body;
    }
    getDetail(id: string) {
        return `This action returns details for post with id ${id}`;
    }
    updatePost(id:string,body: any) {
        return `update posst ${id} voi body la : ${body}`;
    }
    
}
