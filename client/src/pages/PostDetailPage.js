import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentForm from '../components/CommentForm';

function PostDetailPage() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const fetchPostAndComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const postResponse = await axios.get(`/posts/${id}`);
      setPost(postResponse.data);
      const commentsResponse = await axios.get(`/posts/${id}/comments`);
      setComments(commentsResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        navigate('/posts');
      } catch (err) {
        setError('게시글 삭제 중 오류가 발생했습니다.');
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleLike = async () => {
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const response = await axios.patch(
        `/posts/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setPost(response.data); // 서버로부터 받은 최신 게시글 정보로 상태 업데이트
    } catch (err) {
      setError('좋아요 처리 중 오류가 발생했습니다.');
      console.error('Error liking post:', err);
    }
  };

  const addComment = async (text) => {
    try {
      const response = await axios.post(
        `/posts/${id}/comments`,
        { content: text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setComments([...comments, response.data]);
    } catch (err) {
      setError('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  const deleteComment = async (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/comments/${commentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComments(comments.filter((comment) => comment.id !== commentId));
      } catch (err) {
        setError('댓글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-xl">로딩 중... ⏳</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500 text-xl">
        에러가 발생했습니다: {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center mt-10 text-xl">게시글을 찾을 수 없습니다.</div>
    );
  }

  const isLiked = post.likedBy?.some((likeUser) => likeUser.id === user?.id);

  return (
    <div className="container mx-auto">
      <div className="bg-base-100 rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
        <div className="text-gray-500 text-sm mb-4 flex justify-between items-center">
          <div>
            <span>작성자: {post.user.nickname}</span>
            <span className="mx-2">|</span>
            <span>작성 시간: {new Date(post.created_at).toLocaleString()}</span>
          </div>
          <div className="text-gray-600">
            <span>👍 {post.likesCount}</span>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[200px]">
          {post.content}
        </p>
        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={handleLike}
            className={`font-semibold py-2 px-4 rounded-md text-sm transition duration-300 ${
              isLiked
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {isLiked ? '좋아요 취소' : '👍 좋아요'}
          </button>
          {user && user.id === post.user.id && (
            <>
              <button
                onClick={() => navigate(`/posts/edit/${post.id}`)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-300"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-300"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">댓글</h2>
        {user && <CommentForm handleSubmit={addComment} submitLabel="댓글 작성" />}
        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-100 p-4 rounded-md">
              <div className="flex justify-between">
                <span className="font-bold">{comment.user.nickname}</span>
                <div>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  {user && user.id === comment.user.id && (
                    <>
                      <button
                        onClick={() => alert('수정 기능은 곧 구현됩니다!')}
                        className="ml-2 text-sm text-blue-500"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="ml-2 text-sm text-red-500"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="mt-2">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostDetailPage;
