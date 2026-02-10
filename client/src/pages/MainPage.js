import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function MainPage() {
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/posts/popular');
        setPopularPosts(response.data);
      } catch (err) {
        setError('인기 게시글을 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching popular posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">메인 페이지</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          인기 게시글
        </h2>
        {loading && <p className="text-gray-500">로딩 중...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {popularPosts.length > 0 ? (
          <ul className="space-y-4">
            {popularPosts.map((post) => (
              <li
                key={post.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Link
                  to={`/posts/${post.id}`}
                  className="text-lg font-semibold text-indigo-600 hover:underline"
                >
                  {post.title}
                </Link>
                <div className="text-gray-500 mt-1">
                  <span>Likes: {post.likesCount}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p className="text-gray-500">인기 게시글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default MainPage;