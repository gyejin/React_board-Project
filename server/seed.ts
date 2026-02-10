// 파일명: seed.ts
// 이 스크립트를 실행하기 위해 'pg' 라이브러리가 필요합니다.
// 터미널에서 'npm install pg @types/pg' 를 실행해주세요.

import { Client } from 'pg';

// --- 1. 데이터 생성 ---
const TOPICS = [
  {
    title: 'React 19의 새로운 기능 분석',
    content: 'React 19의 자동 메모이제이션과 새로운 훅(Hook)들에 대해 알아봅니다.',
    keywords: ['React', 'Frontend'],
  },
  {
    title: 'Nest.js에서 TypeORM 마이그레이션 전략',
    content: 'Nest.js 프로젝트에서 TypeORM을 사용하여 데이터베이스 스키마를 안전하게 관리하는 방법입니다.',
    keywords: ['Nest.js', 'Backend', 'TypeORM'],
  },
  {
    title: 'RAG 파이프라인 구축 시 고려사항',
    content: 'LLM의 환각을 줄이는 RAG. 효과적인 구축을 위한 Vector DB 선택과 청킹 전략을 논의합니다.',
    keywords: ['RAG', 'AI', 'LLM'],
  },
  {
    title: 'AWS S3와 CloudFront로 프론트엔드 배포하기',
    content: 'React 앱을 AWS S3에 정적 호스팅하고, CloudFront를 통해 전 세계에 빠르게 배포하는 방법입니다.',
    keywords: ['AWS', 'DevOps', 'React'],
  },
  {
    title: 'LLM Fine-tuning을 위한 LoRA 기법 이해',
    content: '적은 파라미터로 LLM을 효율적으로 파인튜닝하는 LoRA의 원리와 실제 적용 사례를 살펴봅니다.',
    keywords: ['Finetuning', 'AI', 'LLM'],
  },
  {
    title: 'React Server Components (RSC) 심층 탐구',
    content: 'RSC가 기존 CSR, SSR과 어떻게 다르며, Next.js에서 어떻게 활용되는지 알아봅니다.',
    keywords: ['React', 'Next.js', 'Frontend'],
  },
  {
    title: 'Nest.js의 DI와 Module 시스템',
    content: 'Nest.js의 핵심인 의존성 주입(DI)과 모듈 시스템의 원리를 이해하고 효과적으로 사용하는 법을 배웁니다.',
    keywords: ['Nest.js', 'Backend', 'Architecture'],
  },
  {
    title: 'LangChain을 활용한 RAG 시스템 구현',
    content: 'LangChain 프레임워크를 사용하여 문서 로딩부터 답변 생성까지 RAG 시스템을 빠르게 구현합니다.',
    keywords: ['RAG', 'AI', 'LangChain'],
  },
  {
    title: 'AWS Lambda와 API Gateway로 서버리스 API 만들기',
    content: '비용 효율적인 서버리스 아키텍처. Lambda 함수와 API Gateway를 연동하여 REST API를 구축합니다.',
    keywords: ['AWS', 'Serverless', 'Backend'],
  },
  {
    title: 'PEFT를 이용한 효율적인 LLM 파인튜닝',
    content: 'Parameter-Efficient Fine-Tuning(PEFT) 라이브러리를 활용한 다양한 LLM 튜닝 기법을 소개합니다.',
    keywords: ['Finetuning', 'AI', 'PEFT'],
  },
];

const USER_COUNT = 50;
const POSTS_PER_USER = 2;

// --- 2. 메인 실행 함수 ---
async function main() {
  // !!! 중요 !!!
  // 아래 'YOUR_SUPABASE_CONNECTION_STRING' 부분을 실제 Supabase 연결 문자열로 교체해주세요.
  // Supabase 대시보드 > Project Settings > Database > Connection string 에서 찾을 수 있습니다.
  const connectionString = "postgresql://postgres.geqtjphjhouoihwnllvo:essasf134!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";
  
  

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Supabase 데이터베이스에 성공적으로 연결되었습니다.');

    // --- 유저 생성 ---
    console.log(`${USER_COUNT}명의 유저 생성을 시작합니다...`);
    const users = Array.from({ length: USER_COUNT }, (_, i) => ({
      username: `user${i + 1}`,
      password: 'hashed_password', // 실제 프로젝트에서는 bcrypt 등으로 해싱해야 합니다.
      nickname: `user${i + 1}`,
    }));

    const userValues = users.map(u => `('${u.username}', '${u.password}', '${u.nickname}')`).join(',');
    const userInsertQuery = `INSERT INTO "Users" (username, password, nickname) VALUES ${userValues} RETURNING id, nickname;`;
    
    const userResult = await client.query(userInsertQuery);
    const createdUsers = userResult.rows; // [{ id: 1, nickname: 'user1' }, ...]
    console.log(`${createdUsers.length}명의 유저가 성공적으로 생성되었습니다.`);

    // --- 게시글 생성 ---
    console.log(`${USER_COUNT * POSTS_PER_USER}개의 게시글 생성을 시작합니다...`);
    const posts: { title: string; content: string; userId: any; }[] = [];
    for (let i = 0; i < USER_COUNT; i++) {
      const user = createdUsers[i];
      for (let j = 0; j < POSTS_PER_USER; j++) {
        const topic = TOPICS[(i * POSTS_PER_USER + j) % TOPICS.length];
        posts.push({
          title: `${topic.keywords.join('/')} 관련 질문: ${topic.title} #${i + 1}`,
          content: topic.content,
          userId: user.id,
        });
      }
    }

    const postValues = posts.map(p => `('${p.title.replace(/'/g, "''")}', '${p.content.replace(/'/g, "''")}', ${p.userId})`).join(',');
    const postInsertQuery = `INSERT INTO "Posts" (title, content, user_id) VALUES ${postValues};`;

    await client.query(postInsertQuery);
    console.log(`${posts.length}개의 게시글이 성공적으로 생성되었습니다.`);
    
    console.log('\n🎉 모든 데이터 생성이 완료되었습니다!');

  } catch (error) {
    console.error('데이터 생성 중 오류가 발생했습니다:', error);
  } finally {
    await client.end();
    console.log('데이터베이스 연결이 종료되었습니다.');
  }
}

main();
