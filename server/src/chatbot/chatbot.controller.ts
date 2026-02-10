import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtOptionalGuard } from 'src/auth/jwt-optional.guard';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @UseGuards(JwtOptionalGuard) // 커스텀 가드로 교체
  async handleMessage(@Body('message') message: string, @Req() req) {
    // JwtOptionalGuard가 토큰이 유효하면 req.user를 채우고, 아니면 null로 둠
    const user = req.user || null;
    const reply = await this.chatbotService.generateResponse(message, user);
    return { reply };
  }
}
