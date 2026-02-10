import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService, // 유저 정보를 다시 조회하기 위해
  ) {
    super({
      // 1. 토큰이 어디서 오는지 설정: "Authorization: Bearer [토큰]"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 2. 만료된 토큰은 거부!
      secretOrKey: configService.get<string>('JWT_SECRET')!, // 3. 토큰 검증용 비밀 키
    });
  }

  // 4. 토큰 검증 통과 후 실행되는 함수
  async validate(payload: any): Promise<User> {
    // payload에는 { username, sub, nickname }이 들어있어!
    
    // (선택 사항이지만 추천)
    // 토큰이 유효하더라도, 그 사이 사용자가 탈퇴했을 수 있으니
    // DB에서 한 번 더 확인해서 진짜 '있는' 유저인지 체크!
    const user = await this.usersService.findOneById(payload.sub); // 'sub'는 user.id였지!

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    // 5. 검증 완료! 이 user 객체는 앞으로 @Req() 데코레이터를 통해
    //    요청(request) 객체에 user 라는 이름으로 주입됨!
    return user;
  }
}