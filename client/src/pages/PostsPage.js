import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const postsPerPage = 10;
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `/posts?page=${currentPage}&limit=${postsPerPage}`,
        );
        setPosts(response.data.posts);
        setTotalPages(Math.ceil(response.data.total / postsPerPage));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!searchKeyword.trim()) {
      fetchPosts();
    }
  }, [currentPage, searchKeyword]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      // fetch posts for page 1
      const response = await axios.get(
        `/posts?page=${currentPage}&limit=${postsPerPage}`,
      );
      setPosts(response.data.posts);
      setTotalPages(Math.ceil(response.data.total / postsPerPage));
      return;
    }
    try {
      const response = await axios.get(`/posts/search?keyword=${searchKeyword}`);
      setSearchResults(response.data);
      setTotalPages(Math.ceil(response.data.length / postsPerPage));
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
    }
  };

  const displayPosts =
    searchResults.length > 0 || searchKeyword.trim() ? searchResults : posts;

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // New pagination rendering logic
  const pageNumbersToShow = 5;
  const currentGroup = Math.ceil(currentPage / pageNumbersToShow);
  const startPage = (currentGroup - 1) * pageNumbersToShow + 1;
  const endPage = Math.min(startPage + pageNumbersToShow - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (loading) {
    return <div className="text-center mt-10 text-xl">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500 text-xl">
        에러가 발생했습니다: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">게시판</h1>
        {user && (
          <button
            onClick={() => navigate('/posts/new')}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            새 글 작성
          </button>
        )}
      </div>

      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="flex-grow p-2 border border-gray-300 rounded-l-md"
          />
          <button
            type="submit"
            className="p-2 text-white bg-blue-500 rounded-r-md"
          >
            검색
          </button>
        </form>
      </div>

      {/* Posts Table */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성 시간
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayPosts.length > 0 ? (
              displayPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/posts/${post.id}`}
                      className="text-primary hover:underline font-semibold"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {post.user.nickname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(post.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  {searchKeyword.trim()
                    ? '검색 결과가 없습니다.'
                    : '게시글이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          {/* Previous Button */}
          <button
            onClick={() => paginate(startPage - 1)}
            disabled={startPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="sr-only">Previous</span>
            &lt;
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                currentPage === number
                  ? 'z-10 bg-primary border-primary text-white font-bold'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {number}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => paginate(endPage + 1)}
            disabled={endPage >= totalPages}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="sr-only">Next</span>
            &gt;
          </button>
        </nav>
      </div>
    </div>
  );
}

export default PostsPage;