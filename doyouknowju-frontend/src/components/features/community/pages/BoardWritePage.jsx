import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import axios from 'axios';
import Input from '../../../common/Input';
import Button from '../../../common/Button';
import styles from './BoardWritePage.module.css';
import { fetchStockSuggestions } from '@/api/stockApi';
import { canWriteAfterSignupDays, getWriteRestrictionMessage } from '@/utils/accountEligibility';
import ReactQuill, { Quill } from 'react-quill-new';
import 'quill/dist/quill.snow.css';

function BoardWritePage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditMode = useMemo(() => !!boardId, [boardId]);
  const quillRef = useRef(null);
  const isWriteRestricted = !isEditMode && !canWriteAfterSignupDays(user);
  const writeRestrictionMessage = getWriteRestrictionMessage();

  const [formData, setFormData] = useState({
    boardTitle: '',
    boardContent: '',
    boardWriter: user?.userId,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockQuery, setStockQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteBtnPos, setDeleteBtnPos] = useState({ top: 0, left: 0 });
  const suggestionRequestIdRef = useRef(0);

  useEffect(() => {
    if (!isEditMode) {
      setFormData((prev) => ({
        ...prev,
        boardWriter: prev.boardWriter || user?.userId || user?.id || '',
      }));
    }
  }, [isEditMode, user]);

  useEffect(() => {
    const requestId = ++suggestionRequestIdRef.current;
    const timer = setTimeout(async () => {
      if (stockQuery.length >= 2) {
        const results = await fetchStockSuggestions(stockQuery);
        if (requestId !== suggestionRequestIdRef.current) return;
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        if (requestId !== suggestionRequestIdRef.current) return;
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
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

        if (data.stockId) {
          let stockName = data.stockName || data.boardStockName || data.mksc_shrn_iscd;

          if (!stockName) {
            try {
              const stockInfo = await fetchStockSuggestions(data.stockId);
              const match = stockInfo.find(
                (stock) =>
                  stock.code === data.stockId ||
                  stock.stockId === data.stockId ||
                  stock.mksc_shrn_iscd === data.stockId,
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
            name: stockName || data.stockId,
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
      const imageFormData = new FormData();
      imageFormData.append('file', file);

      try {
        const res = await axios.post('/dykj/api/files/images', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const imageUrl = typeof res.data === 'object' ? res.data.url || res.data.filePath : res.data;
        if (!imageUrl) throw new Error('올바른 이미지 URL을 받지 못했습니다.');

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        const index = range?.index || 0;

        quill.insertEmbed(index, 'image', imageUrl, 'user');

        setTimeout(() => {
          const editor = quillRef.current.getEditor();
          const image = editor.root.querySelector(`img[src="${imageUrl}"]`);
          if (image) {
            image.style.width = '300px';
            image.style.maxWidth = '100%';
            image.setAttribute('width', '300');
          }
        }, 100);

        quill.setSelection(index + 1);
      } catch (error) {
        console.error('이미지 업로드 오류:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['undo', 'redo'],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
          undo() {
            this.quill.history.undo();
          },
          redo() {
            this.quill.history.redo();
          },
        },
      },
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true,
      },
    }),
    [imageHandler],
  );

  const handleEditorClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedImage(e.target);
      setDeleteBtnPos({
        top: e.target.offsetTop,
        left: e.target.offsetLeft + e.target.offsetWidth - 30,
      });
    } else {
      setSelectedImage(null);
    }
  };

  const removeImage = useCallback(
    (e) => {
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
    },
    [selectedImage],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isWriteRestricted) {
      alert(writeRestrictionMessage);
      return;
    }

    const isContentEmpty =
      !formData.boardContent || formData.boardContent.replace(/<(.|\n)*?>/g, '').trim().length === 0;

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
      stockId: selectedStock
        ? selectedStock.code || selectedStock.id || selectedStock.stockId || selectedStock.mksc_shrn_iscd
        : null,
    };

    try {
      if (isEditMode) {
        await axios.put(`/dykj/api/boards/update/${boardId}`, submitData);
        alert('게시글을 수정했습니다.');
        navigate(`/board/${boardId}`);
      } else {
        await axios.post('/dykj/api/boards/insert', submitData);
        alert('게시글을 등록했습니다.');
        navigate('/board');
      }
    } catch (error) {
      console.error('요청 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestData: submitData,
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
        {isWriteRestricted && <p className={styles.restrictionNotice}>{writeRestrictionMessage}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <label className={styles.label}>제목</label>
            <Input
              type="text"
              name="boardTitle"
              value={formData.boardTitle}
              onChange={handleChange}
              placeholder="제목을 입력하세요."
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
                    {selectedStock.name || selectedStock.stockName} (
                    {selectedStock.code || selectedStock.id || selectedStock.stockId || selectedStock.mksc_shrn_iscd})
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
                    placeholder="주식 종목 입력 (입력하지 않으면 자유게시판으로 등록됩니다)"
                    fullWidth
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className={styles.suggestions}>
                      {suggestions.map((stock, idx) => (
                        <li
                          key={stock.code || stock.id || stock.stockId || stock.mksc_shrn_iscd || `${stock.name}-${idx}`}
                          onClick={() => handleStockSelect(stock)}
                          className={styles.suggestionItem}
                        >
                          <span className={styles.sName}>{stock.name || stock.stockName}</span>
                          <span className={styles.sCode}>
                            {stock.code || stock.id || stock.stockId || stock.mksc_shrn_iscd}
                          </span>
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
                placeholder="내용을 입력하세요."
                className={styles.quillEditor}
              />
              {selectedImage && (
                <button
                  type="button"
                  className={styles.imageDeleteBtn}
                  style={{ top: deleteBtnPos.top + 5, left: deleteBtnPos.left - 5 }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={removeImage}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className={styles.buttons}>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting || isWriteRestricted}>
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
