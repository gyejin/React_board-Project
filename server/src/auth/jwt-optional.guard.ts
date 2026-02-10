import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
  // handleRequest를 오버라이드하여 인증 실패 시 에러를 던지지 않도록 함
  handleRequest(err, user, info) {
    // err가 있거나 user가 없어도 에러를 던지지 않고 user 객체(또는 null)를 반환
    return user;
  }
}
