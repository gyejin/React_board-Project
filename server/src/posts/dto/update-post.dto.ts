import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

// 1. CreatePostDto를 '상속'받아서 만듦
// 2. PartialType: 'title'과 'content'가 모두 "선택 사항(?)"이 되게 만들어줌!
export class UpdatePostDto extends PartialType(CreatePostDto) {}
