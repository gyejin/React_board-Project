import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyPage = () => {
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [newNickname, setNewNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('myPosts');

  useEffect(() => {
    if (user) {
      fetchMyPosts();
      fetchLikedPosts();
    }
  }, [user]);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
  });

  const fetchMyPosts = async () => {
    try {
      const response = await axios.get(`/users/${user.id}/posts`, getAuthHeaders());
      setMyPosts(response.data);
    } catch (error) {
      console.error('내 게시물을 가져오는데 실패했습니다:', error);
    }
  };

  const fetchLikedPosts = async () => {
    try {
      const response = await axios.get('/posts/liked', getAuthHeaders());
      setLikedPosts(response.data);
    } catch (error) {
      console.error('좋아요 누른 게시물을 가져오는데 실패했습니다:', error);
    }
  };

  const handleNicknameChange = async (e) => {
    e.preventDefault();
    setError('');
    if (!newNickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    try {
      await axios.put('/users/nickname', { nickname: newNickname }, getAuthHeaders());
      alert('닉네임이 성공적으로 변경되었습니다. 다시 로그인해주세요.');
      logout();
    } catch (err) {
      setError(err.response?.data?.message || '닉네임 변경에 실패했습니다.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    if (!currentPassword || !newPassword) {
      setError('모든 비밀번호 필드를 입력해주세요.');
      return;
    }
    try {
      await axios.put('/users/password', { currentPassword, newPassword }, getAuthHeaders());
      alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
      logout();
    } catch (err) {
      setError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    }
  };

  if (!user) {
    return <div className="text-center mt-10">로그인이 필요합니다.</div>;
  }

  const renderPosts = (posts) => {
    if (posts.length === 0) {
      return <p className="text-gray-500">게시물이 없습니다.</p>;
    }
    return (
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id} className="border-b pb-2">
            <Link to={`/posts/${post.id}`} className="text-blue-600 hover:underline">
              {post.title}
            </Link>
            <span className="text-sm text-gray-500 ml-4">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">마이페이지</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
        >
          {isEditing ? '취소' : '회원정보 수정'}
        </button>
      </div>

      {!isEditing ? (
        <div>
          <p className="text-lg mb-6">
            <span className="font-semibold">{user.nickname}</span>님, 환영합니다.
          </p>
          <div className="border-t pt-6">
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveTab('myPosts')}
                className={`py-2 px-4 font-semibold ${activeTab === 'myPosts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              >
                나의 게시물 ({myPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('likedPosts')}
                className={`py-2 px-4 font-semibold ${activeTab === 'likedPosts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              >
                좋아요 누른 게시물 ({likedPosts.length})
              </button>
            </div>
            {activeTab === 'myPosts' ? renderPosts(myPosts) : renderPosts(likedPosts)}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">닉네임 변경</h2>
            <form onSubmit={handleNicknameChange} className="space-y-4">
              <input
                type="text"
                placeholder="새 닉네임"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
              <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                닉네임 변경
              </button>
            </form>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">비밀번호 변경</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
              <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                비밀번호 변경
              </button>
            </form>
          </div>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default MyPage;
