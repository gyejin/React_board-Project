// server/src/posts/posts.service.ts

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository, Like } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const { title, content } = createPostDto;

    const post = this.postsRepository.create({
      title,
      content,
      user: user,
    });

    try {
      await this.postsRepository.save(post);
      return post;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('게시글 작성에 실패했습니다.');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ posts: Post[]; total: number }> {
    try {
      const [posts, total] = await this.postsRepository.findAndCount({
        relations: ['user'],
        order: {
          created_at: 'DESC',
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      const sanitizedPosts = posts.map((post) => {
        if (post.user) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userWithoutPassword } = post.user;
          return { ...post, user: userWithoutPassword as User };
        }
        return post;
      });

      return { posts: sanitizedPosts, total };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        '게시글 목록을 불러오지 못했습니다.',
      );
    }
  }

  async findOne(id: number): Promise<Post> {
    try {
      const post = await this.postsRepository.findOne({
        where: { id },
        relations: ['user', 'likedBy'],
      });

      if (!post) {
        throw new NotFoundException(`${id}번 게시글을 찾을 수 없습니다.`);
      }

      if (post.user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = post.user;
        return { ...post, user: userWithoutPassword as User };
      }

      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('게시글을 불러오지 못했습니다.');
    }
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    user: User,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (post.user.id !== user.id) {
      throw new ForbiddenException('이 게시글을 수정할 권한이 없습니다.');
    }

    Object.assign(post, updatePostDto);

    try {
      await this.postsRepository.save(post);
      return post;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('게시글 수정에 실패했습니다.');
    }
  }

  async remove(id: number, user: User): Promise<void> {
    const post = await this.findOne(id);

    if (post.user.id !== user.id) {
      throw new ForbiddenException('이 게시글을 삭제할 권한이 없습니다.');
    }

    try {
      const result = await this.postsRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`${id}번 게시글을 찾을 수 없습니다.`);
      }
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('게시글 삭제에 실패했습니다.');
    }
  }

  async toggleLike(postId: number, userId: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['likedBy', 'user'],
    });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const isLiked = post.likedBy.some((u) => u.id === user.id);

    if (isLiked) {
      post.likedBy = post.likedBy.filter((u) => u.id !== user.id);
    } else {
      post.likedBy.push(user);
    }

    post.likesCount = post.likedBy.length;
    await this.postsRepository.save(post);

    const updatedPost = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['likedBy', 'user'],
    });

    if (!updatedPost) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const sanitizeUser = (userObj: User): User => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...sanitized } = userObj;
      return sanitized as User;
    };

    updatedPost.user = sanitizeUser(updatedPost.user);
    updatedPost.likedBy = updatedPost.likedBy.map(sanitizeUser);

    return updatedPost;
  }

  async findPopular(): Promise<Post[]> {
    const popularPosts = await this.postsRepository.find({
      where: {
        likesCount: MoreThanOrEqual(5),
      },
      order: {
        likesCount: 'DESC',
      },
      relations: ['user'],
    });

    return popularPosts.map((post) => {
      if (post.user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = post.user;
        return { ...post, user: userWithoutPassword as User };
      }
      return post;
    });
  }

  async findMyPosts(userId: number): Promise<Post[]> {
    try {
      const posts = await this.postsRepository.find({
        where: { user: { id: userId } },
        relations: ['user'],
        order: {
          created_at: 'DESC',
        },
      });

      return posts.map((post) => {
        if (post.user) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userWithoutPassword } = post.user;
          return { ...post, user: userWithoutPassword as User };
        }
        return post;
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        '내가 쓴 글 목록을 불러오지 못했습니다.',
      );
    }
  }

  async findLikedPosts(userId: number): Promise<Post[]> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['likedPosts', 'likedPosts.user'],
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      return user.likedPosts.map((post) => {
        if (post.user) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userWithoutPassword } = post.user;
          return { ...post, user: userWithoutPassword as User };
        }
        return post;
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        '좋아요 누른 글 목록을 불러오지 못했습니다.',
      );
    }
  }

  async search(keyword: string): Promise<Post[]> {
    if (!keyword) return [];
    return this.postsRepository.find({
      where: [{ title: Like(`%${keyword}%`) }, { content: Like(`%${keyword}%`) }],
      relations: ['user'], // 작성자 정보 포함
      take: 5,
      order: { created_at: 'DESC' },
    });
  }
}

