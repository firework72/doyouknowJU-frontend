import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import axios from 'axios';
import Button from '../../../common/Button';
import styles from './BoardDetailPage.module.css';

const toDateString = (value) => {
  if (!value) return '-';
  const str = String(value);
  return str.length >= 10 ? str.substring(0, 10) : str;
};

function BoardDetailPage() {
  const { boardNo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [board, setBoard] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);

  useEffect(() => {
    const fetchBoard = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/dykj/api/boards/${boardNo}`);
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
  }, [boardNo, navigate]);

  const fetchReplies = useCallback(async () => {
    try {
      const { data } = await axios.get(`/dykj/api/boards/${boardNo}/replies`);
      setReplies(Array.isArray(data) ? data : data?.list || []);
    } catch (error) {
      console.error('댓글 조회 실패', error);
    }
  }, [boardNo]);

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

  const handleEdit = () => navigate(`/board/${boardNo}/edit`);

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/dykj/api/boards/${boardNo}`);
      alert('게시글이 삭제되었습니다.');
      navigate('/board');
    } catch (error) {
      console.error(error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handleReplySubmit = async () => {
    if (!isAuthenticated) return;
    if (!replyContent.trim()) return;

    setIsReplySubmitting(true);
    try {
      await axios.post(`/dykj/api/boards/${boardNo}/replies`, { replyContent: replyContent.trim() });
      setReplyContent('');
      await fetchReplies();
    } catch (error) {
      console.error(error);
      alert('댓글 등록에 실패했습니다.');
    } finally {
      setIsReplySubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
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
    <div className="container">
      <div className={styles.wrapper}>
        <h2 className={styles.title}>게시글 상세보기</h2>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleGoList}>
            목록으로
          </Button>
        </div>

        <table className={styles.table}>
          <tbody>
            <tr>
              <th>제목</th>
              <td colSpan="3">{title}</td>
            </tr>
            <tr>
              <th>작성자</th>
              <td>{writer}</td>
              <th>작성일</th>
              <td>{toDateString(createdAt)}</td>
            </tr>
            <tr>
              <th>첨부파일</th>
              <td colSpan="3">
                {board.originName && fileUrl ? (
                  <a href={fileUrl} className={styles.fileLink} download>
                    {board.originName}
                  </a>
                ) : (
                  '첨부파일이 없습니다.'
                )}
              </td>
            </tr>
            <tr>
              <th>내용</th>
              <td colSpan="3" />
            </tr>
            <tr>
              <td colSpan="4" className={styles.content}>
                {board.boardContent ?? board.content ?? ''}
              </td>
            </tr>
          </tbody>
        </table>

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
            >
              등록하기
            </Button>
          </div>

          <div className={styles.replyCount}>
            댓글 (<span>{replies.length}</span>) 개
          </div>

          <div className={styles.replyList}>
            {replies.length === 0 ? (
              <p className={styles.noReply}>등록된 댓글이 없습니다.</p>
            ) : (
              replies.map((reply) => (
                <div key={reply.replyNo ?? reply.id} className={styles.replyItem}>
                  <span className={styles.replyWriter}>{reply.replyWriter ?? reply.writer ?? '-'}</span>
                  <span className={styles.replyContent}>{reply.replyContent ?? reply.content ?? ''}</span>
                  <span className={styles.replyDate}>{toDateString(reply.createDate ?? reply.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardDetailPage;
