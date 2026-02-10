import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { PostsModule } from './posts/posts.module'; // 1. PostsModule 임포트

@Module({
  imports: [PostsModule], // 2. PostsModule을 imports 배열에 추가
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}