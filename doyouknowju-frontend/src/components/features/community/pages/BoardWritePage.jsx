import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import axios from 'axios';
import Input from '../../../common/Input';
import Button from '../../../common/Button';
import styles from './BoardWritePage.module.css';
import { fetchStockSuggestions } from '@/api/stockApi';

function BoardWritePage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditMode = useMemo(() => !!boardId, [boardId]);

  const [formData, setFormData] = useState({
    boardTitle: '',
    boardContent: '',
    boardWriter: user?.userId || user?.id || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 종목 검색 관련 상태
  const [stockQuery, setStockQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    if (!isEditMode) {
      setFormData((prev) => ({
        ...prev,
        boardWriter: prev.boardWriter || user?.userId || user?.id || '',
      }));
    }
  }, [isEditMode, user]);

  // 종목 검색 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (stockQuery.length >= 2) {
        const results = await fetchStockSuggestions(stockQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [stockQuery]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchBoard = async () => {
      try {
        const { data } = await axios.get(`/dykj/api/boards/detail/${boardId}`);
        setFormData({
          boardTitle: data.boardTitle ?? data.title ?? '',
          boardContent: data.boardContent ?? data.content ?? '',
          boardWriter: data.boardWriter ?? data.writer ?? user?.userId ?? user?.id ?? '',
        });
      } catch (error) {
        console.error('게시글 조회 실패', error);
        alert('게시글을 불러올 수 없습니다.');
        navigate('/board');
      }
    };

    fetchBoard();
  }, [boardId, isEditMode, navigate, user]);

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setStockQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeSelectedStock = () => {
    setSelectedStock(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.boardTitle.trim() || !formData.boardContent.trim()) {
      alert('제목과 내용을 입력하세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        boardTitle: formData.boardTitle,
        boardContent: formData.boardContent,
        userId: formData.boardWriter,
        boardType: selectedStock ? 'STOCK' : 'FREE',
        stockId: selectedStock ? (selectedStock.code || selectedStock.id || selectedStock.stockId || selectedStock.mksc_shrn_iscd) : null,
      };

      console.log('Sending request to:', isEditMode ? `/dykj/api/boards/update/${boardId}` : '/dykj/api/boards/insert');
      console.log('Request Body:', JSON.stringify(submitData, null, 2));

      if (isEditMode) {
        submitData.boardId = boardId;
        await axios.post(`/dykj/api/boards/update/${boardId}`, submitData);
        alert('게시글이 수정되었습니다.');
        navigate(`/board/${boardId}`);
      } else {
        await axios.post('/dykj/api/boards/insert', submitData);
        alert('게시글이 등록되었습니다.');
        navigate('/board');
      }
    } catch (error) {
      console.error(error);
      alert(isEditMode ? '게시글 수정에 실패했습니다.' : '게시글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) navigate(`/board/${boardId}`);
    else navigate('/board');
  };

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{isEditMode ? '게시글 수정하기' : '게시글 작성하기'}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <label className={styles.label}>제목</label>
            <Input
              type="text"
              name="boardTitle"
              value={formData.boardTitle}
              onChange={handleChange}
              placeholder="제목을 입력하세요"
              required
              fullWidth
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>작성자</label>
            <Input type="text" name="boardWriter" value={formData.boardWriter} readOnly fullWidth />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>관련 종목</label>
            <div className={styles.stockSearchArea}>
              {selectedStock ? (
                <div className={styles.selectedStock}>
                  <span className={styles.stockInfo}>
                    {selectedStock.name || selectedStock.stockName} ({selectedStock.code || selectedStock.id || selectedStock.stockId || selectedStock.mksc_shrn_iscd})
                  </span>
                  <button type="button" onClick={removeSelectedStock} className={styles.removeBtn}>
                    &times;
                  </button>
                </div>
              ) : (
                <div className={styles.searchWrapper}>
                  <Input
                    type="text"
                    value={stockQuery}
                    onChange={(e) => setStockQuery(e.target.value)}
                    placeholder="주식 종목 입력 (2글자 이상)"
                    fullWidth
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className={styles.suggestions}>
                      {suggestions.map((stock, idx) => (
                        <li key={idx} onClick={() => handleStockSelect(stock)} className={styles.suggestionItem}>
                          <span className={styles.sName}>{stock.name || stock.stockName}</span>
                          <span className={styles.sCode}>{stock.code || stock.id || stock.stockId || stock.mksc_shrn_iscd}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>내용</label>
            <textarea
              name="boardContent"
              value={formData.boardContent}
              onChange={handleChange}
              placeholder="내용을 입력하세요"
              required
              className={styles.textarea}
            />
          </div>

          <div className={styles.buttons}>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isEditMode ? '수정하기' : '등록하기'}
            </Button>
            <Button type="button" variant="danger" onClick={handleCancel} disabled={isSubmitting}>
              {isEditMode ? '이전으로' : '취소하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BoardWritePage;
