import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { PostsService } from 'src/posts/posts.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as stringSimilarity from 'string-similarity';

const COMMAND_INTENTS = {
  GET_MY_POSTS: { keywords: ['내가쓴글', '내가작성한게시물', '내글목록'], confidence: 0.7 },
  GET_LIKED_POSTS: { keywords: ['내가좋아요누른글', '좋아요한글', '좋아요목록'], confidence: 0.7 },
  SEARCH_POSTS: {
    keywords: ['찾아줘', '검색해줘', '알려줘', '관련글', '대한글', '라는글', '라는게시물', '이란게시물', '게시물있어', '게시글', '글'],
    confidence: 0.5,
  },
};

@Injectable()
export class ChatbotService implements OnModuleInit {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly postsService: PostsService,
  ) {}

  onModuleInit() {
    try {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY') || this.configService.get<string>('GOOGLE_API_KEY');
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey.length < 10) {
        console.warn('GEMINI_API_KEY 또는 GOOGLE_API_KEY가 .env 파일에 설정되지 않았거나 유효하지 않아 AI 기능이 비활성화됩니다.');
        this.genAI = null;
      } else {
        this.genAI = new GoogleGenerativeAI(apiKey);
      }
    } catch (error) {
      console.error('GoogleGenerativeAI 클라이언트 초기화 중 오류 발생:', error);
      this.genAI = null;
    }
  }

  async generateResponse(message: string, user: User | null): Promise<string> {
    const normalizedMessage = message.replace(/\s+/g, '').toLowerCase();
    const command = this.findBestCommand(normalizedMessage, message);

    try {
      if (command === 'GET_MY_POSTS') {
        if (!user) return '로그인하시면 회원님을 위한 맞춤 답변을 드릴 수 있어요.';
        const myPosts = await this.postsService.findMyPosts(user.id);
        return this.formatPostList(myPosts, `${user.nickname}님이 작성하신 글 목록입니다:`, '작성하신 게시물이 없습니다.');
      }

      if (command === 'GET_LIKED_POSTS') {
        if (!user) return '로그인하시면 회원님을 위한 맞춤 답변을 드릴 수 있어요.';
        const likedPosts = await this.postsService.findLikedPosts(user.id);
        return this.formatPostList(likedPosts, `${user.nickname}님이 좋아요를 누른 게시물 목록입니다:`, '아직 좋아요를 누른 게시물이 없습니다.');
      }

      if (command === 'SEARCH_POSTS') {
        const keyword = this.extractSearchKeyword(message);
        if (keyword) {
          const posts = await this.postsService.search(keyword);
          return this.formatPostList(posts, `'${keyword}'에 대한 검색 결과입니다:`, `요청하신 '${keyword}'에 대한 게시물을 찾을 수 없습니다.`);
        }
      }

      return this.callGenerativeAI(message, user);
    } catch (error) {
      console.error('요청 처리 중 오류 발생:', error);
      return '죄송합니다, 요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }

  private async callGenerativeAI(message: string, user: User | null): Promise<string> {
    if (!this.genAI) {
      return '죄송합니다, 현재 AI 기능을 사용할 수 없습니다. 관리자에게 문의해주세요.';
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
      const prompt = this.buildPrompt(message, user);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI 응답 시간 초과')), 10000),
      );

      const generationPromise = model.generateContent(prompt);
      const result = await Promise.race([generationPromise, timeoutPromise]);
      
      const response = result.response;

      if (!response || !response.candidates || response.candidates.length === 0 || !response.text()) {
        console.error('Gemini API 응답이 비어있거나 안전 문제로 차단되었습니다. 상세 정보:', JSON.stringify(response, null, 2));
        return '죄송합니다, 해당 주제에 대해서는 답변할 수 없습니다.';
      }
      
      return response.text();

    } catch (error) {
      console.error('Gemini API 호출 중 심각한 오류 발생:', JSON.stringify(error, null, 2));
      if (error.status === 503) {
        return '죄송합니다, AI 서비스가 현재 불안정하여 응답을 드릴 수 없습니다. 잠시 후 다시 시도해주세요.';
      }
      if (error.message && error.message.includes('AI 응답 시간 초과')) {
        return '죄송합니다, AI 서버로부터 응답을 받는 데 시간이 너무 오래 걸립니다. 잠시 후 다시 시도해주세요.';
      }
      if (error.message && error.message.includes('API key not valid')) {
        return '죄송합니다. AI 서비스 인증에 문제가 발생했습니다. 관리자가 확인 중입니다.';
      }
      return '죄송해요, 지금은 제 머리가 복잡해서 답변을 드리기 어려워요. 잠시 후에 다시 말을 걸어주시겠어요?';
    }
  }

  private findBestCommand(normalizedMessage: string, originalMessage: string): string | null {
    // 1. High-confidence check for specific, non-search commands
    for (const intentKey of ['GET_MY_POSTS', 'GET_LIKED_POSTS']) {
      const intent = COMMAND_INTENTS[intentKey];
      const { bestMatch } = stringSimilarity.findBestMatch(normalizedMessage, intent.keywords);
      if (bestMatch.rating > intent.confidence) {
        return intentKey;
      }
    }

    // 2. Explicit search intent check using keywords
    const searchIntent = COMMAND_INTENTS.SEARCH_POSTS;
    for (const keyword of searchIntent.keywords) {
      if (normalizedMessage.includes(keyword)) {
        const potentialKeyword = this.extractSearchKeyword(originalMessage);
        // Ensure that a keyword was actually extracted, preventing searches for just "글"
        if (potentialKeyword && potentialKeyword.toLowerCase() !== keyword) {
          return 'SEARCH_POSTS';
        }
      }
    }

    // 3. Fallback to AI for general conversation (including single-word topics)
    return null;
  }

  private extractSearchKeyword(message: string): string {
    const quoteRegex = /['"](.+?)['"]/;
    const quoteMatch = message.match(quoteRegex);
    if (quoteMatch && quoteMatch[1]) {
      return quoteMatch[1].trim();
    }

    const patterns = [
      '에 대해 찾아줘', '에 대해 알려줘', '에 대한 글', '관련 게시물', '관련 글',
      '검색해줘', '찾아줘', '알려줘', '라는 게시물', '라는 글', '이란 게시물', '이란 글',
      '게시물 있어', '글 있어', '게시글', '글'
    ].sort((a, b) => b.length - a.length);

    for (const pattern of patterns) {
      const lowerMessage = message.toLowerCase();
      const lowerPattern = pattern.toLowerCase();
      if (lowerMessage.endsWith(lowerPattern)) {
        const keyword = message.substring(0, lowerMessage.lastIndexOf(lowerPattern)).trim();
        if (keyword) {
          return keyword;
        }
      }
    }

    if (['너가찾아줘', '찾아줘'].includes(message.replace(/\s+/g, '').toLowerCase())) {
      return '';
    }

    return message.trim();
  }

  private buildPrompt(message: string, user: User | null): string {
    const userName = user ? user.nickname : '방문자';
    return `당신은 "ReactBoard" 커뮤니티의 AI 어시스턴트입니다. 당신의 핵심 임무는 사용자의 질문에 대해 정확하고 전문적인 답변을 제공하고, 요청 시 게시물을 직접 검색하여 결과를 제공하는 것입니다.

# 페르소나 및 응답 규칙:
- 항상 정중하고 형식적인 어조를 유지하십시오.
- 사용자의 질문 의도를 명확하게 파악하고, 간결하고 논리적으로 답변하십시오.
- **매우 중요: 당신은 데이터베이스에 직접 접근할 수 없습니다. 게시물 검색은 시스템이 처리하여 당신에게 결과를 전달합니다. 만약 시스템으로부터 검색 결과를 전달받지 않은 상태에서 사용자가 게시물 검색을 요청하면, 절대로 게시물 정보를 지어내지 마십시오. 대신, "어떤 키워드로 게시물을 찾아드릴까요?" 라고 되물어 명확한 검색어를 받도록 유도하십시오.**
- "로그아웃" 관련 질문에는 "화면 우측 상단의 프로필 아이콘을 클릭하신 후, '로그아웃' 버튼을 선택하시면 됩니다."라고 안내하십시오.
- AI로서의 한계를 명확히 인지하고, 추측성 정보가 아닌 사실에 기반하여 답변하십시오.

# 웹사이트 정보:
- 명칭: ReactBoard
- 주제: React 및 TypeScript 개발자 커뮤니티
- 주요 기능: 게시글 작성/조회, 댓글, 좋아요, 마이페이지, 인기 게시글. (참고: 웹사이트에는 별도의 검색창이 없습니다.)

---
# 사용자 정보:
- 이름: ${userName}
- 상태: ${user ? '로그인' : '비로그인'}

# 사용자의 요청: "${message}"
---

위 규칙과 정보를 바탕으로, 사용자의 요청에 대해 가장 전문적이고 유용한 답변을 생성하십시오.`;
  }

  private formatPostList(posts: Post[], title: string, emptyMessage: string): string {
    if (!posts || posts.length === 0) {
      return emptyMessage;
    }

    const postSummaries = posts.map(post => {
      const snippet = post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content;
      const author = post.user && post.user.nickname ? post.user.nickname : '알 수 없음';

      return `
        <div style="margin-bottom: 12px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
          <p style="font-weight: bold;">
            <a href="/posts/${post.id}" style="color: #3B82F6; text-decoration: underline;">${post.title}</a>
          </p>
          <p style="font-size: 0.9em; color: #4a5568;">작성자: ${author}</p>
          <p style="font-size: 0.9em; color: #718096;">내용: ${snippet}</p>
        </div>
      `;
    }).join('');

    return `${title}<div style="margin-top: 12px;">${postSummaries}</div>`;
  }
}