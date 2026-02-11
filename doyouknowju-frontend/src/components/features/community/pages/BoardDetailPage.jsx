import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '../../../common/Button';
import styles from './BoardDetailPage.module.css';
import { useAuth } from '@/hooks/AuthContext';
import { insertReport, REPORT_TYPES } from '@/api/reportApi';
import { canWriteAfterSignupDays, getWriteRestrictionMessage } from '@/utils/accountEligibility';

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
    timeZone: 'Asia/Seoul'
  }).format(date).replace(/\. /g, '-').replace('.', '');
};

function BoardDetailPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const canWriteReply = canWriteAfterSignupDays(user);
  const writeRestrictionMessage = getWriteRestrictionMessage();
  const reporterId = user?.userId ?? user?.id ?? null;

  const [board, setBoard] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    reportType: null,
    contentId: null,
    targetId: null,
  });
  const [selectedReason, setSelectedReason] = useState('스팸');
  const [customReason, setCustomReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const reportReasons = useMemo(() => ['스팸', '욕설', '도배', '허위정보', '기타'], []);


  useEffect(() => {
    const fetchBoardAndReplies = async () => {
      setIsLoading(true);
      try {
        const [boardResponse, repliesResponse] = await Promise.all([
          axios.get(`/dykj/api/boards/detail/${boardId}`),
          axios.get(`/dykj/api/boards/${boardId}/replies`),
        ]);

        setBoard(boardResponse.data);
        const replyData = repliesResponse.data;
        setReplies(Array.isArray(replyData) ? replyData : replyData?.list || []);
      } catch (error) {
        console.error('게시글 조회 실패', error);
        alert('게시글을 조회할 수 없습니다.');
        navigate('/board');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardAndReplies();
  }, [boardId, navigate]);

  const fetchReplies = useCallback(async () => {
    try {
      const { data } = await axios.get(`/dykj/api/boards/${boardId}/replies`);
      setReplies(Array.isArray(data) ? data : data?.list || []);
    } catch (error) {
      console.error('댓글 조회 실패', error);
    }
  }, [boardId]);

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
    if (!canWriteReply) {
      alert(writeRestrictionMessage);
      return;
    }
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

  const openReportModal = ({ reportType, contentId, targetId }) => {
    if (!isAuthenticated) {
      alert('로그인 후 신고할 수 있습니다.');
      return;
    }

    if (!targetId || String(targetId).trim() === '' || String(targetId).trim() === '-') {
      alert('신고 대상을 찾을 수 없습니다.');
      return;
    }

    if (String(reporterId) === String(targetId)) {
      alert('본인의 글/댓글은 신고할 수 없습니다.');
      return;
    }

    setSelectedReason('스팸');
    setCustomReason('');
    setReportModal({ isOpen: true, reportType, contentId, targetId });
  };

  const closeReportModal = () => {
    setReportModal({ isOpen: false, reportType: null, contentId: null, targetId: null });
    setSelectedReason('스팸');
    setCustomReason('');
  };

  const submitReport = async () => {
    if (!reportModal.isOpen) return;
    if (!isAuthenticated || !reporterId) {
      alert('로그인 후 신고할 수 있습니다.');
      return;
    }

    const reason = selectedReason === '기타' ? customReason.trim() : selectedReason;
    if (!reason) {
      alert('신고 사유를 입력해주세요.');
      return;
    }

    if (!window.confirm(`'${reason}' 사유로 신고하시겠습니까?`)) return;

    setIsReporting(true);
    try {
      const result = await insertReport({
        reportType: reportModal.reportType,
        contentId: reportModal.contentId,
        reporterId,
        targetId: reportModal.targetId,
        reportReason: reason,
      });

      if (result === 'success') {
        alert('신고가 접수되었습니다.');
        closeReportModal();
      } else {
        alert('신고 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('신고 요청 실패', error);
      alert(error?.response?.data || '신고 요청 중 오류가 발생했습니다.');
    } finally {
      setIsReporting(false);
    }
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
  const boardTargetId = board.boardWriter ?? board.userId ?? board.writer;

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
          {!isAuthor && (
            <div className={styles.postBottomBar}>
              <button
                type="button"
                onClick={() =>
                  openReportModal({
                    reportType: REPORT_TYPES.BOARD,
                    contentId: boardId,
                    targetId: boardTargetId,
                  })
                }
                className={`${styles.actionButton} ${styles.reportButton} ${styles.bottomReportButton}`}
              >
                신고
              </button>
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
              placeholder={!isAuthenticated ? '로그인 후 댓글을 작성할 수 있습니다.' : !canWriteReply ? writeRestrictionMessage : '댓글을 입력하세요.'}
              className={styles.replyInput}
              readOnly={!isAuthenticated || !canWriteReply}
            />
            <Button
              variant="secondary"
              onClick={handleReplySubmit}
              disabled={!isAuthenticated || !canWriteReply || isReplySubmitting || !replyContent.trim()}
              isLoading={isReplySubmitting}
              className={styles.replySubmitButton}
            >
              등록
            </Button>
          </div>
          {isAuthenticated && !canWriteReply && (
            <p className={styles.restrictionNotice}>{writeRestrictionMessage}</p>
          )}

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
                        {!isEditing && (
                          <div className={styles.replyActions}>
                            {!isMyReply && (
                              <button
                                type="button"
                                onClick={() =>
                                  openReportModal({
                                    reportType: REPORT_TYPES.REPLY,
                                    contentId: reply.replyId,
                                    targetId: reply.userId,
                                  })
                                }
                                className={styles.reportBtn}
                              >
                                신고
                              </button>
                            )}
                            {isMyReply && (
                              <>
                                <button onClick={() => handleReplyEdit(reply)} className={styles.editBtn}>
                                  수정
                                </button>
                                <button onClick={() => handleReplyDelete(reply.replyId)} className={styles.deleteBtn}>
                                  ✕
                                </button>
                              </>
                            )}
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

      {reportModal.isOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTitle}>신고하기</div>
            <div className={styles.modalDesc}>신고 사유를 선택해주세요.</div>

            <div className={styles.reasonList}>
              {reportReasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`${styles.reasonButton} ${selectedReason === reason ? styles.reasonSelected : ''}`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {selectedReason === '기타' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="신고 사유를 입력해주세요."
                className={styles.reasonInput}
                maxLength={200}
              />
            )}

            <div className={styles.modalActions}>
              <Button variant="danger" onClick={submitReport} disabled={isReporting}>
                신고 등록
              </Button>
              <Button variant="secondary" onClick={closeReportModal} disabled={isReporting}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardDetailPage;

