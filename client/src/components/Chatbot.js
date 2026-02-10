import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // useAuth 훅 임포트

// 챗봇 컴포넌트
function Chatbot({ onClose }) {
  const { token } = useAuth(); // 인증 토큰 가져오기
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 요청 헤더 설정
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post('/chatbot/message', {
        message: input,
      }, { headers }); // 헤더를 요청에 포함

      const botMessage = { sender: 'bot', text: response.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('챗봇 메시지 전송 오류:', error);
      const errorMessage = { sender: 'bot', text: '죄송합니다, 답변을 생성하는 중 오류가 발생했습니다.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col">
      <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
        <h2 className="text-lg font-bold">게시판 챗봇</h2>
        <button onClick={onClose} className="text-2xl hover:text-gray-200">&times;</button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-3 max-w-xs ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
            <div
              className={`p-3 rounded-lg ${msg.sender === 'bot' ? 'bg-gray-200 text-black' : 'bg-blue-500 text-white'}`}
              dangerouslySetInnerHTML={{ __html: msg.text }}
            />
          </div>
        ))}
        {isLoading && <div className="p-3 rounded-lg bg-gray-200 text-black self-start">답변을 생성 중입니다...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          className="flex-1 border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isLoading}
        >
          전송
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
