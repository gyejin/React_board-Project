import { IsString, MinLength } from 'class-validator';

export class UpdateNicknameDto {
  @IsString()
  @MinLength(2)
  nickname: string;
}
