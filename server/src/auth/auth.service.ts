import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service'; // UsersService 임포트
import { JwtService } from '@nestjs/jwt'; // JwtService 임포트
import { LoginDto } from './dto/login.dto'; // 우리가 만든 DTO 임포트

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // 1. UsersService 주입
    private jwtService: JwtService, // 2. JwtService 주입
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 3. UsersService에 검증 요청!
    //    (실패하면 validateUser 함수가 알아서 401 에러를 던져줌)
    const user = await this.usersService.validateUser(username, password);

    // 4. 검증 성공! "출입증"에 담을 정보(payload) 생성
    //    (비밀번호 같은 민감 정보는 절대 넣으면 안 돼!)
    const payload = {
      username: user.username,
      sub: user.id, // 'sub'는 토큰의 주인을 의미하는 표준 용어야 (subject)
      nickname: user.nickname,
    };

    // 5. JWT 출입증 발급! 🎟️
    const accessToken = this.jwtService.sign(payload);

    // 6. 사용자에게 출입증 전달
    return {
      access_token: accessToken,
    };
  }
}