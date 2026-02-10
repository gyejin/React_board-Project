
import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

class AskDto {
  question: string;
}

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  ask(@Body() askDto: AskDto) {
    return this.chatbotService.ask(askDto.question);
  }
}
