// client/src/pages/LoginPage.js

import React, { useState } from 'react';
// 1. axios는 이제 필요 없으니 삭제!
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 2. 우리 '창고' 훅 임포트!

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { login } = useAuth(); // 3. '창고'에서 login 함수를 꺼내옴!

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      // 4. [변경!] 자체 axios 대신, AuthContext의 login 함수 호출
      const success = await login(username, password);

      if (success) {
        // 5. 로그인 성공! 메인 페이지로 이동
        navigate('/');
      } else {
        // 6. 로그인 실패 (AuthContext가 false를 반환)
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      // 7. (예외 처리)
      console.error('로그인 시도 중 예외 발생:', err);
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  // ... (return 부분의 폼(form) 코드는 이전과 동일) ...
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          로그인
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              아이디
            </label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              비밀번호
            </label>
            <input
              type="password"
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full p-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              로그인
            </button>
            <button
              type="button"
              className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
              onClick={() => navigate('/signup')}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;