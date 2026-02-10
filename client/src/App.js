import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MainPage from './pages/MainPage';
import PostsPage from './pages/PostsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NewPostPage from './pages/NewPostPage';
import EditPostPage from './pages/EditPostPage';
import PostDetailPage from './pages/PostDetailPage';
import MyPage from './pages/MyPage';
import { useAuth } from './context/AuthContext';
import Chatbot from './components/Chatbot';

function App() {
  const { user, logout } = useAuth();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral">
      {/* Navigation Bar */}
      <nav className="bg-base-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-primary">
                ReactBoard
              </Link>
              <div className="hidden md:flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  홈
                </Link>
                <Link
                  to="/posts"
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  게시판
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center">
                  <Link to="/mypage" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                    {user.nickname}님
                  </Link>
                  <button
                    onClick={logout}
                    className="ml-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/posts/new" element={<NewPostPage />} />
          <Route path="/posts/edit/:id" element={<EditPostPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </main>

      {/* Chatbot */}
      {!isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-xl flex items-center justify-center text-3xl hover:bg-primary-hover transition-transform transform hover:scale-110"
        >
          🤖
        </button>
      )}
      {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
    </div>
  );
}

export default App;