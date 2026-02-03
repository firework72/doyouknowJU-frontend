import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '../../../common/Button';
import styles from './BoardDetailPage.module.css';
import { useAuth } from '@/hooks/AuthContext';

const toDateString = (value) => {
  if (!value) return '-';

  let date;

  // Spring Boot LocalDateTime 기본 설정 시 배열로 오는 경우 처리 [YYYY, MM, DD, HH, mm, ss]
  if (Array.isArray(value)) {
    date = new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0, value[5] || 0);
  } else {
    date = new Date(value);
  }

  if (isNaN(date.getTime())) return String(value);

  // 한국 시간(KST)으로 변환
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul'
  }).format(date).replace(/\. /g, '-').replace('.', '');
};

function BoardDetailPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [board, setBoard] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);


  useEffect(() => {
    const fetchBoard = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/dykj/api/boards/detail/${boardId}`);
        setBoard(data);
      } catch (error) {
        console.error('게시글 조회 실패', error);
        alert('게시글을 조회할 수 없습니다.');
        navigate('/board');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();
  }, [boardId, navigate]);

  const fetchReplies = useCallback(async () => {
    try {
      const { data } = await axios.get(`/dykj/api/boards/${boardId}/replies`);
      setReplies(Array.isArray(data) ? data : data?.list || []);
    } catch (error) {
      console.error('댓글 조회 실패', error);
    }
  }, [boardId]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  const isAuthor = useMemo(() => {
    if (!board) return false;
    const me = user?.userId ?? user?.id;
    const writer = board.boardWriter ?? board.userId ?? board.writer;
    return me && writer && String(me) === String(writer);
  }, [board, user]);

  const handleGoList = () => navigate('/board');

  const handleEdit = () => navigate(`/board/${boardId}/edit`);

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/dykj/api/boards/delete/${boardId}`);
      alert('게시글이 삭제되었습니다.');
      navigate('/board');
    } catch (error) {
      console.error('삭제 에러 상세:', error.response?.data || error.message);
      alert(`게시글 삭제에 실패했습니다. ${error.response?.data?.message || ''}`);
    }
  };

  const handleReplySubmit = async () => {
    if (!isAuthenticated) return;
    if (!replyContent.trim()) return;

    setIsReplySubmitting(true);
    try {
      await axios.post(`/dykj/api/boards/${boardId}/replies/insert`, {
        replyContent: replyContent.trim(),
        userId: user?.userId,
        boardId: boardId,
      });
      setReplyContent('');
      await fetchReplies();
    } catch (error) {
      console.error(error);
      alert('댓글 등록에 실패했습니다.');
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const handleReplyEdit = (reply) => {
    setEditingReplyId(reply.replyId);
    setEditingContent(reply.replyContent || reply.content || '');
  };

  const handleReplyUpdate = async (replyId) => {
    if (!editingContent.trim()) return;

    try {
      await axios.put(`/dykj/api/boards/replies/${replyId}/update`, {
        replyContent: editingContent.trim(),
      });
      setEditingReplyId(null);
      setEditingContent('');
      await fetchReplies();
    } catch (error) {
      console.error(error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleReplyDelete = async (replyId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`/dykj/api/boards/replies/${replyId}/delete`);
      await fetchReplies();
    } catch (error) {
      console.error(error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const cancelEdit = () => {
    setEditingReplyId(null);
    setEditingContent('');
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <p className={styles.loading}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!board) return null;

  const title = board.boardTitle ?? board.title ?? '(제목 없음)';
  const writer = board.boardWriter ?? board.userId ?? board.writer ?? '-';
  const createdAt = board.createDate ?? board.createdAt ?? board.createdDate;

  const fileUrl =
    board.changeName ? `/dykj/api/boards/files/${encodeURIComponent(board.changeName)}` : null;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>

        <div className={styles.actions}>
          <button
            onClick={handleGoList}
            className={styles.actionButton}
          >
            목록으로
          </button>
        </div>

        <div className={styles.postCard}>
          <div className={styles.postHeader}>
            <div className={styles.headerLabel}>작성자</div>
            <div className={styles.headerValue}>{writer}</div>
            <div className={styles.headerLabel}>작성일</div>
            <div className={styles.headerValue}>{toDateString(createdAt)}</div>
          </div>
          <div className={styles.postTitleArea}>
            {title}
          </div>
          <div
            className={styles.postContentArea}
            dangerouslySetInnerHTML={{ __html: board.boardContent ?? board.content ?? '' }}
          />
          {board.originName && (
            <div className={styles.postFooter}>
              <span className={styles.footerLabel}>첨부파일:</span>
              <a href={fileUrl} className={styles.fileLink} download>
                {board.originName}
              </a>
            </div>
          )}
        </div>

        {isAuthor && (
          <div className={styles.authorActions}>
            <Button variant="primary" onClick={handleEdit}>
              수정하기
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              삭제하기
            </Button>
          </div>
        )}

        <div className={styles.replySection}>
          <div className={styles.replyCount}>
            댓글 <span>{replies.length}</span>
          </div>

          <div className={styles.replyForm}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={isAuthenticated ? '댓글을 입력하세요' : '로그인 후 댓글을 작성할 수 있습니다.'}
              className={styles.replyInput}
              readOnly={!isAuthenticated}
            />
            <Button
              variant="secondary"
              onClick={handleReplySubmit}
              disabled={!isAuthenticated || isReplySubmitting || !replyContent.trim()}
              isLoading={isReplySubmitting}
              className={styles.replySubmitButton}
            >
              등록
            </Button>
          </div>

          <div className={styles.replyList}>
            {replies.length === 0 ? (
              <p className={styles.noReply}>등록된 댓글이 없습니다.</p>
            ) : (
              replies.map((reply) => {
                const isMyReply = user?.userId === reply.userId;
                const isEditing = editingReplyId === reply.replyId;

                return (
                  <div key={reply.replyId} className={styles.replyItem}>
                    <div className={styles.replyMain}>
                      <div className={styles.replyTop}>
                        <span className={styles.replyWriter}>{reply.userId}</span>
                        <span className={styles.replyDate}>{toDateString(reply.createDate ?? reply.createdAt)}</span>
                        {isMyReply && !isEditing && (
                          <div className={styles.replyActions}>
                            <button onClick={() => handleReplyEdit(reply)} className={styles.editBtn}>
                              수정
                            </button>
                            <button onClick={() => handleReplyDelete(reply.replyId)} className={styles.deleteBtn}>
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      {isEditing ? (
                        <div className={styles.editForm}>
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className={styles.editInput}
                          />
                          <div className={styles.editButtons}>
                            <Button variant="primary" onClick={() => handleReplyUpdate(reply.replyId)}>
                              저장
                            </Button>
                            <Button variant="secondary" onClick={cancelEdit}>
                              취소
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.replyContent}>{reply.replyContent ?? reply.content ?? ''}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardDetailPage;
