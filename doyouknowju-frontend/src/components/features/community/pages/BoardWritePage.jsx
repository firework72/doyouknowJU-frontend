import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import axios from 'axios';
import Input from '../../../common/Input';
import Button from '../../../common/Button';
import styles from './BoardWritePage.module.css';
import { fetchStockSuggestions } from '@/api/stockApi';
import ReactQuill, { Quill } from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import { useRef } from 'react';

function BoardWritePage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditMode = useMemo(() => !!boardId, [boardId]);
  const quillRef = useRef(null);

  const [formData, setFormData] = useState({
    boardTitle: '',
    boardContent: '',
    boardWriter: user?.userId
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 종목 검색 관련 상태
  const [stockQuery, setStockQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteBtnPos, setDeleteBtnPos] = useState({ top: 0, left: 0 });

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

        // 기존 게시글의 종목 정보가 있으면 selectedStock에 설정
        if (data.stockId) {
          let stockName = data.stockName || data.boardStockName || data.mksc_shrn_iscd;

          // 종목 이름이 없으면 API로 조회 시도
          if (!stockName) {
            try {
              const stockInfo = await fetchStockSuggestions(data.stockId);
              // 정확히 일치하는 종목 찾기
              const match = stockInfo.find(
                s => (s.code === data.stockId) || (s.stockId === data.stockId) || (s.mksc_shrn_iscd === data.stockId)
              );
              if (match) {
                stockName = match.name || match.stockName || match.hts_kor_isnm;
              }
            } catch (err) {
              console.warn('종목 정보 조회 실패:', err);
            }
          }

          setSelectedStock({
            code: data.stockId,
            id: data.stockId,
            stockId: data.stockId,
            name: stockName || data.stockId, // 그래도 없으면 ID 표시
          });
        }
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

  const handleEditorChange = useCallback((content) => {
    setFormData((prev) => {
      if (prev.boardContent === content) return prev;
      return { ...prev, boardContent: content };
    });
  }, []);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await axios.post('/dykj/api/files/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // 결과물이 객체일 경우 필드를 추출하고, 아닐 경우 데이터 자체를 URL로 사용
        const imageUrl = (typeof res.data === 'object') ? (res.data.url || res.data.filePath) : res.data;

        if (!imageUrl) throw new Error('올바른 이미지 URL을 받지 못했습니다.');

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        const index = range?.index || 0;

        // 1. 이미지 삽입
        quill.insertEmbed(index, 'image', imageUrl, 'user');

        // 2. DOM에서 방금 삽입된 이미지 찾아서 스타일 강제 적용
        // (React-Quill은 즉시 DOM에 반영되지 않을 수 있으니 setTimeout 사용)
        setTimeout(() => {
          const editor = quillRef.current.getEditor();
          const img = editor.root.querySelector(`img[src="${imageUrl}"]`);
          if (img) {
            img.style.width = '300px';
            img.style.maxWidth = '100%';
            img.setAttribute('width', '300');
          }
        }, 100);

        // 커서를 이미지 다음으로 이동
        quill.setSelection(index + 1);

      } catch (error) {
        console.error('이미지 업로드 상세 에러:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ['undo', 'redo'], // 되돌리기, 다시실행 버튼 추가
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
        undo: function () {
          this.quill.history.undo();
        },
        redo: function () {
          this.quill.history.redo();
        },
      },
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
  }), [imageHandler]);

  // 이미지 클릭 시 삭제 버튼 위치 계산
  const handleEditorClick = (e) => {
    if (e.target.tagName === 'IMG') {
      const rect = e.target.getBoundingClientRect();
      const containerRect = quillRef.current.getEditor().container.getBoundingClientRect();

      setSelectedImage(e.target);
      setDeleteBtnPos({
        top: e.target.offsetTop,
        left: e.target.offsetLeft + e.target.offsetWidth - 30,
      });
    } else {
      setSelectedImage(null);
    }
  };

  const removeImage = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!selectedImage || !quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const blot = Quill.find(selectedImage);
    if (blot) {
      const index = quill.getIndex(blot);
      quill.deleteText(index, 1, 'user');
      setSelectedImage(null);
    }
  }, [selectedImage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isContentEmpty = !formData.boardContent || formData.boardContent.replace(/<(.|\n)*?>/g, '').trim().length === 0;

    if (!formData.boardTitle.trim() || isContentEmpty) {
      alert('제목과 내용을 입력하세요.');
      return;
    }

    setIsSubmitting(true);

    const submitData = {
      boardTitle: formData.boardTitle,
      boardContent: formData.boardContent,
      userId: formData.boardWriter,
      boardType: selectedStock ? 'STOCK' : 'FREE',
      stockId: selectedStock ? (selectedStock.code || selectedStock.id || selectedStock.stockId || selectedStock.mksc_shrn_iscd) : null,
    };

    try {
      if (isEditMode) {
        await axios.put(`/dykj/api/boards/update/${boardId}`, submitData);
        alert('게시글이 수정되었습니다.');
        navigate(`/board/${boardId}`);
      } else {
        await axios.post('/dykj/api/boards/insert', submitData);
        alert('게시글이 등록되었습니다.');
        navigate('/board');
      }
    } catch (error) {
      console.error('요청 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestData: submitData
      });
      alert(`${isEditMode ? '게시글 수정' : '게시글 등록'}에 실패했습니다. ${error.response?.data?.message || ''}`);
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
            <label className={styles.label}>토론 종목</label>
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
                    placeholder="주식 종목 입력 (입력하지 않을 시 자유게시판에 등록됩니다.)"
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
            <div className={styles.editorWrapper} onClick={handleEditorClick}>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.boardContent}
                onChange={handleEditorChange}
                modules={modules}
                placeholder="내용을 입력하세요"
                className={styles.quillEditor}
              />
              {selectedImage && (
                <button
                  type="button"
                  className={styles.imageDeleteBtn}
                  style={{ top: deleteBtnPos.top + 5, left: deleteBtnPos.left - 5 }}
                  onMouseDown={(e) => e.preventDefault()} // 포커스 뺏기 방지
                  onClick={removeImage}
                >
                  ✕
                </button>
              )}
            </div>
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
