import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from './BoardListPage.module.css';
import Button from '../../../common/Button';
import Pagination from '../../../common/Pagination';
import { useAuth } from '@/hooks/AuthContext';
import { fetchStockSuggestions } from '@/api/stockApi';

import axios from 'axios';

// boardApi: Real API call to /dykj/posts
const boardApi = {
    getList: async ({ page, size, condition, keyword, boardType }) => {
        const params = {
            boardType: boardType === 'free' ? 'FREE' : 'STOCK',
            page: page || 1,
            size: size || 20,
        };

        if (keyword) {
            params.condition = condition;
            params.keyword = keyword;
        }

        const response = await axios.get('/dykj/api/boards/list', { params });

        // 백엔드 응답이 배열인 경우와 객체인 경우 모두 대응
        if (Array.isArray(response.data)) {
            return {
                list: response.data,
                currentPage: page || 1,
                maxPage: 1,
                listCount: response.data.length
            };
        }
        return response.data;
    },
    // search는 getList에서 통합 처리 가능하므로 유지 혹은 제거 가능 (여기서는 유지)
    search: async ({ page, condition, keyword, boardType }) => {
        const params = {
            boardType: boardType === 'free' ? 'FREE' : 'STOCK',
            page: page || 1,
            size: 20,
            condition,
            keyword
        };
        const response = await axios.get('/dykj/api/boards/list', { params });
        return response.data;
    }
};

function BoardListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const { user } = useAuth();
    const isAuthenticated = !!user;

    // 'free' (자유게시판) or 'stock' (종목토론방) - Default is 'free'
    const [boardType, setBoardType] = useState('free');

    const [boards, setBoards] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [searchCondition, setSearchCondition] = useState('writer');
    const [searchKeyword, setSearchKeyword] = useState('');

    // 종목 게시판 전용 상태
    const [stockQuery, setStockQuery] = useState('');
    const [stockSuggestions, setStockSuggestions] = useState([]);
    const [showStockSuggestions, setShowStockSuggestions] = useState(false);

    // 더미 인기 종목 데이터 (실제 프로젝트에서는 API 연동 가능)
    const popularStocks = [
        { name: '삼성전자', id: '005930' },
        { name: 'SK하이닉스', id: '000660' },
        { name: 'LG에너지솔루션', id: '373220' },
        { name: 'NAVER', id: '035420' },
        { name: '카카오', id: '035720' },
        { name: '현대차', id: '005380' },
        { name: '삼성바이오로직스', id: '207940' },
        { name: 'KIA', id: '000270' }
    ];


    //URL 파라미터에서 초기값 설정 
    useEffect(() => {
        const page = parseInt(searchParams.get('page')) || 1;
        const condition = searchParams.get('condition') || 'writer';
        const keyword = searchParams.get('keyword') || '';
        // URL param for type could be added, but for now using internal state or header selection

        setSearchCondition(condition);
        setSearchKeyword(keyword);

        //게시글 목록조회 함수 수행
        fetchBoards(page, condition, keyword, boardType);

        //게시글 검색 함수 수행
        //fetchSearchBoards(page,condition,keyword);

    }, [searchParams, boardType]);

    // 종목 검색 디바운스
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

    //게시글 목록 조회 
    const fetchBoards = async (page, condition, keyword, type) => {
        setIsLoading(true);

        try {
            const response = await boardApi.getList({
                page,
                size: 10,
                condition: keyword ? condition : undefined,
                keyword: keyword || undefined,
                boardType: type // Pass board type
            });


            setBoards(response.list || []); //목록 조회되었으면 상태값 갱신 아니라면 빈배열 처리 

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

    //페이지 변경 
    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);//현재 url정보를 이용하여 객체 생성후 수정 처리 할 수 있도록 준비 
        params.set("page", page);//파라미터 세팅(page=값) 
        setSearchParams(params);//useSearchParams를 이용하기 위해 준비 
    }

    //검색
    const handleSearch = (e) => {
        e.preventDefault(); //기본 이벤트 막기 
        const params = new URLSearchParams(); //searchParams 객체 생성
        params.set('page', '1'); //페이지 1 설정 
        if (searchKeyword) { //만약 검색어가 있다면 
            params.set('condition', searchCondition); //카테고리 세팅
            params.set('keyword', searchKeyword); //검색어 세팅
        }
        setSearchParams(params);//page,condition,keyword가 세팅된 searchparams객체로 상태변경


    }

    const fetchSearchBoards = async (page, condition, keyword) => {

        const response = await boardApi.search({
            page: page,
            condition: condition,
            keyword: keyword
        });

        setBoards(response.list);

        setPageInfo({
            currentPage: response.pi.currentPage || page,
            totalPages: response.pi.maxPage || 1,
            totalCount: response.pi.listCount || 0,
        });

    }


    //게시글 클릭(상세보기) 
    const handleBoardClick = (boardNo) => {
        //board/detail.bo?bno=3
        //board/detail/3
        navigate(`/board/${boardNo}`);
    };

    //글쓰기 (페이지이동)
    const handleWrite = () => {
        navigate('/board/write');
    }

    const handleStockSelect = (stock) => {
        const stockId = stock.code || stock.id || stock.stockId || stock.mksc_shrn_iscd;
        navigate(`/stock/${stockId}`); // 또는 해당 종목 게시글 필터링 로직
        setStockQuery('');
        setShowStockSuggestions(false);
    };


    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.topActions}>
                    {/* 탭 버튼 */}
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
                        <button
                            onClick={handleWrite}
                            className={styles.actionButton}
                        >
                            글쓰기
                        </button>
                    )}
                </div>

                {/* 종목 게시판 전용 대시보드 */}
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
                                    <button
                                        key={stock.id}
                                        onClick={() => handleStockSelect(stock)}
                                        className={styles.popularBadge}
                                    >
                                        {stock.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 게시글 목록 영역 */}
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
                            {
                                isLoading ? (
                                    <tr>
                                        <td colSpan='5' className={styles.empty}>
                                            로딩중 ...
                                        </td>
                                    </tr>
                                ) : boards.length === 0 ? (
                                    <tr>
                                        <td colSpan='5' className={styles.empty}>
                                            조회된 게시글이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    boards.map((board) => (
                                        <tr key={board.boardId}
                                            onClick={() => handleBoardClick(board.boardId)}
                                        >
                                            <td className={styles.center}>{board.boardId}</td>
                                            <td className={styles.titleCell}>
                                                <span className={styles.titleText}>{board.boardTitle}</span>
                                            </td>
                                            <td className={styles.center}>{board.userId}</td>
                                            <td className={styles.center}>{board.viewCount}</td>
                                            <td className={styles.center}>{board.createDate ? board.createDate.substring(0, 10) : '-'}</td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>

                {/* 페이징바 위치 */}
                <Pagination
                    currentPage={pageInfo.currentPage}
                    totalPages={pageInfo.totalPages}
                    onPageChange={handlePageChange}
                />

                {/* 검색창 위치 */}
                <div className={styles.searchContainer}>
                    <form onSubmit={handleSearch} className={styles.searchForm}>
                        <select
                            value={searchCondition}
                            onChange={(e) => setSearchCondition(e.target.value)}
                            className={styles.select}
                        >
                            <option value="writer">작성자</option>
                            <option value="title">제목</option>
                            <option value="content">내용</option>
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
