// server/src/auth/auth.controller.ts

import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common'; // 1. Get, UseGuards, Req 임포트import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport'; // 2. AuthGuard 임포트!
import { AuthService } from './auth.service';

@Controller('auth') // 1. /auth 주소로 요청을 받음
export class AuthController {
  constructor(private authService: AuthService) {}

  // 2. [POST] 로그인 API 추가!
  @Post('login') // 2. "POST /auth/login" 주소의 요청을 처리!
  login(@Body() loginDto: LoginDto) {
    // 3. 요청으로 온 JSON 바디를 loginDto 객체로 받아서
    // 4. authService의 login 함수로 전달!
    return this.authService.login(loginDto);
  }

  // 5. [GET] 새로운 프로필 조회 API 추가!
  @Get('profile')
  @UseGuards(AuthGuard('jwt')) // 6. "이 API는 JWT '보안 검색대'를 통과해야 해!"
  getProfile(@Req() req) {
    // 7. '보안 검색대'(JwtStrategy)를 통과하면,
    //    req 객체 안에 user 정보가 자동으로 담겨있어! (JwtStrategy의 validate 함수 덕분)
    return req.user;
  }
}