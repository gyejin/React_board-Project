// server/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module'; // 1. UsersModule 임포트!
import { PassportModule } from '@nestjs/passport'; // 2. PassportModule 임포트!
import { JwtStrategy } from './jwt.strategy'; // 3. JwtStrategy 임포트!

@Module({
  imports: [
    UsersModule, // 4. UsersModule 등록 (UsersService를 쓰기 위해)
    PassportModule, // 5. PassportModule 등록
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // 6. JwtStrategy 등록
})
export class AuthModule {}