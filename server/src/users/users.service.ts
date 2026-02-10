import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PostsService } from 'src/posts/posts.service';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private postsService: PostsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const { username, password, nickname } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      nickname,
    });

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('이미 존재하는 아이디 또는 닉네임입니다.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async validateUser(username: string, pass: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result as User;
    } else {
      throw new UnauthorizedException('로그인 정보가 올바르지 않습니다.');
    }
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('해당 유저를 찾을 수 없습니다.');
    }
    const { password, ...result } = user;
    return result as User;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateNickname(
    id: number,
    updateNicknameDto: UpdateNicknameDto,
  ): Promise<User> {
    const { nickname } = updateNicknameDto;
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { nickname },
    });
    if (existingUser) {
      throw new ConflictException('이미 존재하는 닉네임입니다.');
    }

    user.nickname = nickname;
    await this.usersRepository.save(user);

    const { password, ...result } = user;
    return result as User;
  }

  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = updatePasswordDto;
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    await this.usersRepository.save(user);
  }

  async findUserPosts(userId: number): Promise<Post[]> {
    return this.postsService.findMyPosts(userId);
  }
}
