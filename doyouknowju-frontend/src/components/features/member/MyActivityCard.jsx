import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserPosts, fetchUserReplies } from '@/api/boardApi';
import { Modal } from '@/components/common';
import './MyActivityCard.css';

const toDateString = (value) => {
  if (!value) return '-';

  let date;
  if (Array.isArray(value)) {
    date = new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0, value[5] || 0);
  } else {
    date = new Date(value);
  }

  if (isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  })
    .format(date)
    .replace(/\. /g, '-')
    .replace('.', '');
};

const MyActivityCard = ({ userId }) => {
  const navigate = useNavigate();
  const previewSize = 3;
  const pageSize = 20;

  const [previewPosts, setPreviewPosts] = useState([]);
  const [previewReplies, setPreviewReplies] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'replies'

  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [repliesPage, setRepliesPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [repliesError, setRepliesError] = useState('');

  const hasMorePosts = useMemo(() => posts.length === pageSize, [posts.length]);
  const hasMoreReplies = useMemo(() => replies.length === pageSize, [replies.length]);

  useEffect(() => {
    if (!userId) return;
    let isActive = true;
    setPreviewLoading(true);
    setPreviewError('');

    Promise.all([
      fetchUserPosts(userId, { page: 1, size: previewSize }),
      fetchUserReplies(userId, { page: 1, size: previewSize }),
    ])
      .then(([postList, replyList]) => {
        if (!isActive) return;
        setPreviewPosts(Array.isArray(postList) ? postList : []);
        setPreviewReplies(Array.isArray(replyList) ? replyList : []);
      })
      .catch((error) => {
        console.error('내 활동 미리보기 조회 실패', error);
        if (!isActive) return;
        setPreviewPosts([]);
        setPreviewReplies([]);
        setPreviewError('최근 활동을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!isActive) return;
        setPreviewLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !isModalOpen) return;
    let isActive = true;
    setPostsLoading(true);
    setPostsError('');

    fetchUserPosts(userId, { page: postsPage, size: pageSize })
      .then((list) => {
        if (!isActive) return;
        setPosts(Array.isArray(list) ? list : []);
      })
      .catch((error) => {
        console.error('내 게시글 조회 실패', error);
        if (!isActive) return;
        setPosts([]);
        setPostsError('내 게시글을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!isActive) return;
        setPostsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [userId, isModalOpen, postsPage]);

  useEffect(() => {
    if (!userId || !isModalOpen) return;
    let isActive = true;
    setRepliesLoading(true);
    setRepliesError('');

    fetchUserReplies(userId, { page: repliesPage, size: pageSize })
      .then((list) => {
        if (!isActive) return;
        setReplies(Array.isArray(list) ? list : []);
      })
      .catch((error) => {
        console.error('내 댓글 조회 실패', error);
        if (!isActive) return;
        setReplies([]);
        setRepliesError('내 댓글을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!isActive) return;
        setRepliesLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [userId, isModalOpen, repliesPage]);

  const openModal = (tab) => {
    setActiveTab(tab);
    if (tab === 'posts') setPostsPage(1);
    if (tab === 'replies') setRepliesPage(1);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="my-activity">
      <section className="my-activity-section">
        <div className="my-activity-header">
          <h3 className="my-activity-title">최근 게시글</h3>
          <button type="button" className="my-activity-linkbtn" onClick={() => openModal('posts')}>
            전체보기
          </button>
        </div>

        {previewError && <div className="my-activity-error">{previewError}</div>}

        {previewLoading ? (
          <div className="my-activity-empty">불러오는 중...</div>
        ) : previewPosts.length === 0 ? (
          <div className="my-activity-empty">작성한 게시글이 없습니다.</div>
        ) : (
          <ul className="my-activity-list">
            {previewPosts.map((post) => (
              <li key={post.boardId} className="my-activity-item">
                <button
                  type="button"
                  className="my-activity-link"
                  onClick={() => navigate(`/board/${post.boardId}`)}
                >
                  <div className="my-activity-main">
                    <div className="my-activity-text">{post.boardTitle ?? '(제목 없음)'}</div>
                    <div className="my-activity-meta">
                      <span>{toDateString(post.modifyDate ?? post.createDate)}</span>
                      {post.viewCount !== undefined && <span>조회 {post.viewCount}</span>}
                      {post.stockName && <span>{post.stockName}</span>}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="my-activity-section">
        <div className="my-activity-header">
          <h3 className="my-activity-title">최근 댓글</h3>
          <button type="button" className="my-activity-linkbtn" onClick={() => openModal('replies')}>
            전체보기
          </button>
        </div>

        {previewError && <div className="my-activity-error">{previewError}</div>}

        {previewLoading ? (
          <div className="my-activity-empty">불러오는 중...</div>
        ) : previewReplies.length === 0 ? (
          <div className="my-activity-empty">작성한 댓글이 없습니다.</div>
        ) : (
          <ul className="my-activity-list">
            {previewReplies.map((reply) => (
              <li key={reply.replyId} className="my-activity-item">
                <button
                  type="button"
                  className="my-activity-link"
                  onClick={() => navigate(`/board/${reply.boardId}`)}
                  title="게시글로 이동"
                >
                  <div className="my-activity-main">
                    <div className="my-activity-text">{reply.replyContent ?? '(내용 없음)'}</div>
                    <div className="my-activity-meta">
                      <span>{toDateString(reply.modifyDate ?? reply.createDate)}</span>
                      <span>게시글 #{reply.boardId}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="작성한 게시글 / 댓글">
        <div className="my-activity-tabs">
          <button
            type="button"
            className={`my-activity-tab ${activeTab === 'posts' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            게시글
          </button>
          <button
            type="button"
            className={`my-activity-tab ${activeTab === 'replies' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('replies')}
          >
            댓글
          </button>
        </div>

        {activeTab === 'posts' ? (
          <>
            {postsError && <div className="my-activity-error">{postsError}</div>}
            {postsLoading ? (
              <div className="my-activity-empty">불러오는 중...</div>
            ) : posts.length === 0 ? (
              <div className="my-activity-empty">작성한 게시글이 없습니다.</div>
            ) : (
              <ul className="my-activity-list">
                {posts.map((post) => (
                  <li key={post.boardId} className="my-activity-item">
                    <button
                      type="button"
                      className="my-activity-link"
                      onClick={() => {
                        closeModal();
                        navigate(`/board/${post.boardId}`);
                      }}
                    >
                      <div className="my-activity-main">
                        <div className="my-activity-text">{post.boardTitle ?? '(제목 없음)'}</div>
                        <div className="my-activity-meta">
                          <span>{toDateString(post.modifyDate ?? post.createDate)}</span>
                          {post.viewCount !== undefined && <span>조회 {post.viewCount}</span>}
                          {post.stockName && <span>{post.stockName}</span>}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="my-activity-modalPager">
              <button
                type="button"
                className="my-activity-btn"
                onClick={() => setPostsPage((p) => Math.max(1, p - 1))}
                disabled={postsLoading || postsPage === 1}
              >
                이전
              </button>
              <span className="my-activity-page">{postsPage}</span>
              <button
                type="button"
                className="my-activity-btn"
                onClick={() => setPostsPage((p) => p + 1)}
                disabled={postsLoading || !hasMorePosts}
              >
                다음
              </button>
            </div>
          </>
        ) : (
          <>
            {repliesError && <div className="my-activity-error">{repliesError}</div>}
            {repliesLoading ? (
              <div className="my-activity-empty">불러오는 중...</div>
            ) : replies.length === 0 ? (
              <div className="my-activity-empty">작성한 댓글이 없습니다.</div>
            ) : (
              <ul className="my-activity-list">
                {replies.map((reply) => (
                  <li key={reply.replyId} className="my-activity-item">
                    <button
                      type="button"
                      className="my-activity-link"
                      onClick={() => {
                        closeModal();
                        navigate(`/board/${reply.boardId}`);
                      }}
                      title="게시글로 이동"
                    >
                      <div className="my-activity-main">
                        <div className="my-activity-text">{reply.replyContent ?? '(내용 없음)'}</div>
                        <div className="my-activity-meta">
                          <span>{toDateString(reply.modifyDate ?? reply.createDate)}</span>
                          <span>게시글 #{reply.boardId}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="my-activity-modalPager">
              <button
                type="button"
                className="my-activity-btn"
                onClick={() => setRepliesPage((p) => Math.max(1, p - 1))}
                disabled={repliesLoading || repliesPage === 1}
              >
                이전
              </button>
              <span className="my-activity-page">{repliesPage}</span>
              <button
                type="button"
                className="my-activity-btn"
                onClick={() => setRepliesPage((p) => p + 1)}
                disabled={repliesLoading || !hasMoreReplies}
              >
                다음
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MyActivityCard;
