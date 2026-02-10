import { Injectable } from '@nestjs/common';
import { PostsService } from './posts/posts.service';

@Injectable()
export class ChatbotService {
  private readonly apiKey: string;

  constructor(private readonly postsService: PostsService) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not set in the environment variables.');
    }
    this.apiKey = apiKey;
  }

  async ask(question: string): Promise<{ answer: string }> {
    const posts = await this.postsService.findAll();
    const knowledge = posts.posts
      .map((post) => `ID: ${post.id}, Title: ${post.title}, Content: ${post.content}`)
      .join('\n');

    const prompt = `You are a helpful chatbot for a message board. Based on the following board posts, answer the user's question.
      If the answer is not in the posts, say that you don't know.

      --- Board Posts ---
      ${knowledge}
      ---------------------

      Question: "${question}"
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google AI API Error:', errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || '죄송합니다, 답변을 생성하지 못했습니다.';
      return { answer: text };
    } catch (error) {
      console.error('Error generating content from LLM:', error);
      throw new Error('Failed to get an answer from the chatbot.');
    }
  }
}