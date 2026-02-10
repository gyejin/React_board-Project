import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    user: User,
    postId: number,
  ): Promise<Comment> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      user,
      post,
    });

    try {
      return await this.commentsRepository.save(comment);
    } catch (error) {
      throw new InternalServerErrorException('댓글 작성에 실패했습니다.');
    }
  }

  async findAll(postId: number): Promise<Comment[]> {
    try {
      return await this.commentsRepository.find({
        where: { post: { id: postId } },
        relations: ['user'],
        order: { created_at: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        '댓글 목록을 불러오지 못했습니다.',
      );
    }
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) {
      throw new NotFoundException(`${id}번 댓글을 찾을 수 없습니다.`);
    }
    return comment;
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.user.id !== user.id) {
      throw new ForbiddenException('이 댓글을 수정할 권한이 없습니다.');
    }

    Object.assign(comment, updateCommentDto);

    try {
      return await this.commentsRepository.save(comment);
    } catch (error) {
      throw new InternalServerErrorException('댓글 수정에 실패했습니다.');
    }
  }

  async remove(id: number, user: User): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.user.id !== user.id) {
      throw new ForbiddenException('이 댓글을 삭제할 권한이 없습니다.');
    }

    const result = await this.commentsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`${id}번 댓글을 찾을 수 없습니다.`);
    }
  }
}