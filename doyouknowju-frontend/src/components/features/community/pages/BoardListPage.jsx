import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './BoardListPage.module.css';
import Button from '../../../common/Button';
import Pagination from '../../../common/Pagination';
import { useAuth } from '@/hooks/AuthContext';
import { fetchStockSuggestions } from '@/api/stockApi';
import axios from 'axios';

const boardApi = {
  getList: async ({ page, size, condition, keyword, boardType, stockId }) => {
    const params = {
      boardType: boardType === 'free' ? 'FREE' : 'STOCK',
      page: page || 1,
      size: size || 20,
    };

    if (keyword) {
      params.condition = condition;
      params.keyword = keyword;
    }

    if (stockId) {
      params.stockId = stockId;
    }

    const response = await axios.get('/dykj/api/boards/list', { params });

    if (Array.isArray(response.data)) {
      return {
        list: response.data,
        currentPage: page || 1,
        maxPage: 1,
        listCount: response.data.length,
      };
    }

    return response.data;
  },
};

function BoardListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const isAuthenticated = !!user;
  const [boardType, setBoardType] = useState('free');
  const [boards, setBoards] = useState([]);

  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchCondition, setSearchCondition] = useState('writer');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [stockQuery, setStockQuery] = useState('');
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [showStockSuggestions, setShowStockSuggestions] = useState(false);

  const popularStocks = [
    { name: '삼성전자', id: '005930' },
    { name: 'SK하이닉스', id: '000660' },
    { name: 'LG에너지솔루션', id: '373220' },
    { name: 'NAVER', id: '035420' },
    { name: '카카오', id: '035720' },
    { name: '현대차', id: '005380' },
    { name: '삼성바이오로직스', id: '207940' },
    { name: 'KIA', id: '000270' },
  ];

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    const condition = searchParams.get('condition') || 'title';
    const keyword = searchParams.get('keyword') || '';
    const stockId = searchParams.get('stockId') || '';

    setSearchCondition(condition);
    setSearchKeyword(keyword);

    fetchBoards(page, condition, keyword, boardType, stockId);
  }, [searchParams, boardType]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (stockQuery.length >= 2) {
        const results = await fetchStockSuggestions(stockQuery);
        setStockSuggestions(results);
        setShowStockSuggestions(true);
      } else {
        setStockSuggestions([]);
        setShowStockSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [stockQuery]);

  const fetchBoards = async (page, condition, keyword, type, stockId) => {
    setIsLoading(true);

    try {
      const response = await boardApi.getList({
        page,
        size: 10,
        condition: keyword ? condition : undefined,
        keyword: keyword || undefined,
        boardType: type,
        stockId: stockId || undefined,
      });

      setBoards(response.list || []);
      setPageInfo({
        currentPage: response.currentPage || page,
        totalPages: response.maxPage || 1,
        totalCount: response.listCount || 0,
      });
    } catch (error) {
      console.error('게시글 목록 조회 실패', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (searchKeyword) {
      params.set('condition', searchCondition);
      params.set('keyword', searchKeyword);
    } else {
      params.delete('condition');
      params.delete('keyword');
    }

    setSearchParams(params);
  };

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  const handleWrite = () => {
    navigate('/board/write');
  };

  const handleStockSelect = (stock) => {
    const stockId = stock.code || stock.id || stock.stockId || stock.mksc_shrn_iscd;
    const stockName = stock.name || stock.stockName;

    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    params.set('stockId', stockId);
    params.set('stockName', stockName);

    setSearchParams(params);
    setStockQuery('');
    setShowStockSuggestions(false);
  };

  const clearStockFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('stockId');
    params.delete('stockName');
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.topActions}>
          <div className={styles.tabContainer}>
            <button
              onClick={() => setBoardType('free')}
              className={`${styles.tabButton} ${boardType === 'free' ? styles.activeTab : ''}`}
            >
              자유게시판
            </button>
            <button
              onClick={() => setBoardType('stock')}
              className={`${styles.tabButton} ${boardType === 'stock' ? styles.activeTab : ''}`}
            >
              종목토론방
            </button>
          </div>

          {isAuthenticated && (
            <button onClick={handleWrite} className={styles.actionButton}>
              글쓰기
            </button>
          )}
        </div>

        {boardType === 'stock' && (
          <div className={styles.stockDashboard}>
            <div className={styles.stockSearchSection}>
              <h3 className={styles.subTitle}>관심 있는 종목을 검색해 보세요</h3>
              <div className={styles.stockSearchBox}>
                <input
                  type="text"
                  value={stockQuery}
                  onChange={(e) => setStockQuery(e.target.value)}
                  placeholder="종목명 또는 코드 입력 (예: 삼성전자)"
                  className={styles.stockInput}
                />
                {showStockSuggestions && stockSuggestions.length > 0 && (
                  <ul className={styles.stockSuggestions}>
                    {stockSuggestions.map((stock, idx) => (
                      <li key={idx} onClick={() => handleStockSelect(stock)} className={styles.stockSuggestionItem}>
                        <span className={styles.sName}>{stock.name || stock.stockName}</span>
                        <span className={styles.sCode}>{stock.code || stock.id || stock.stockId || stock.mksc_shrn_iscd}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className={styles.popularSection}>
              <h4 className={styles.popularTitle}>실시간 인기 종목</h4>
              <div className={styles.popularList}>
                {popularStocks.map((stock) => (
                  <button key={stock.id} onClick={() => handleStockSelect(stock)} className={styles.popularBadge}>
                    {stock.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {boardType === 'stock' && searchParams.get('stockId') && (
          <div className={styles.activeFilterArea}>
            <div className={styles.filterBadge}>
              <span className={styles.filterLabel}>현재 필터: </span>
              <span className={styles.filterValue}>{searchParams.get('stockName') || searchParams.get('stockId')}</span>
              <button onClick={clearStockFilter} className={styles.clearFilterBtn}>
                &times;
              </button>
            </div>
            <p className={styles.filterInfo}>해당 종목의 글만 표시됩니다.</p>
          </div>
        )}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colNo}>No.</th>
                <th className={styles.colTitle}>제목</th>
                <th className={styles.colWriter}>작성자</th>
                <th className={styles.colView}>조회수</th>
                <th className={styles.colDate}>등록일</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className={styles.empty}>
                    로딩중...
                  </td>
                </tr>
              ) : boards.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.empty}>
                    조회된 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                boards.map((board) => (
                  <tr key={board.boardId} onClick={() => handleBoardClick(board.boardId)}>
                    <td className={styles.center}>{board.boardId}</td>
                    <td className={styles.titleCell}>
                      <span className={styles.titleText}>{board.boardTitle}</span>
                    </td>
                    <td className={styles.center}>{board.userId}</td>
                    <td className={styles.center}>{board.viewCount}</td>
                    <td className={styles.center}>{board.createDate ? board.createDate.substring(0, 10) : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={pageInfo.currentPage} totalPages={pageInfo.totalPages} onPageChange={handlePageChange} />

        <div className={styles.searchContainer}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <select value={searchCondition} onChange={(e) => setSearchCondition(e.target.value)} className={styles.select}>
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="writer">작성자</option>
            </select>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="검색어를 입력하세요"
              className={styles.input}
            />
            <Button type="submit" variant="secondary" className={styles.searchButton}>
              검색
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BoardListPage;
