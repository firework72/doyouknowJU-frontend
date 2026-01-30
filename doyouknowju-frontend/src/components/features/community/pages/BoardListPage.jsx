import { useNavigate, useSearchParams } from "react-router-dom"; // legacy
import { useEffect, useState } from "react";
import styles from './BoardListPage.module.css';
import Button from '../../../common/Button'; // Import Button

// Dummy Pagination Component
const Pagination = () => <div style={{ textAlign: 'center', padding: '20px' }}>페이지네이션 (Placeholder)</div>;

import axios from 'axios';

// boardApi: Real API call to /dykj/posts
const boardApi = {
    getList: async ({ page, size, condition, keyword, boardType }) => {

        const response = await axios.get('/dykj/api/boards/list');

        if (Array.isArray(response.data)) {
            return {
                list: response.data,
                currentPage: page,
                maxPage: 1,
                listCount: response.data.length
            };
        }

        return response.data;
    },
    // 검색도 getList에서 처리하므로 별도 API 호출이 필요 없을 수 있음 (서버 설계에 따라 다름)
    search: async ({ page, condition, keyword }) => {
        const params = {
            page: page || 1,
            size: 10,
            condition,
            keyword
        };
        const response = await axios.get('/dykj/posts', { params });
        return response.data;
    }
};

function BoardListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // isAuthenticated가 제거되어 에러가 나므로 임시 정의
    const isAuthenticated = false;

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


    return (
        <div className="container">
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        게시판
                    </h2>
                    {isAuthenticated && (
                        <Button variant="secondary" onClick={handleWrite}>
                            글쓰기
                        </Button>
                    )}
                </div>

                {/* 탭 버튼 */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setBoardType('free')}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            backgroundColor: boardType === 'free' ? '#333' : '#f0f0f0',
                            color: boardType === 'free' ? '#fff' : '#333',
                            fontWeight: 'bold',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        자유게시판
                    </button>
                    <button
                        onClick={() => setBoardType('stock')}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            backgroundColor: boardType === 'stock' ? '#333' : '#f0f0f0',
                            color: boardType === 'stock' ? '#fff' : '#333',
                            fontWeight: 'bold',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        종목토론방
                    </button>
                </div>

                {/* 게시글 목록 영역 */}
                <table className={styles.table}>
                    <thead>
                        {/* tr>th[className={styles.col}]*6 */}
                        <tr>
                            <th className={styles.colNo}>글번호</th>
                            <th className={styles.colTitle}>제목</th>
                            <th className={styles.colWriter}>작성자</th>
                            <th className={styles.colCount}>조회수</th>
                            <th className={styles.colDate}>작성일</th>
                            <th className={styles.colFile}>첨부파일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            isLoading ? (
                                <tr>
                                    <td colSpan='6' className={styles.empty}>
                                        로딩중 ...
                                    </td>
                                </tr>
                            ) : boards.length === 0 ? (
                                <tr>
                                    <td colSpan='6' className={styles.empty}>
                                        조회된 게시글이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                boards.map((board) => (
                                    <tr key={board.boardId}
                                        onClick={() => handleBoardClick(board.boardId)}
                                        className={styles.row}
                                    >
                                        <td>{board.boardId}</td>
                                        <td className={styles.titleCell}>{board.boardTitle}</td>
                                        <td>{board.userId}</td>
                                        <td>{board.viewCount}</td>
                                        <td>{board.createDate ? board.createDate.substring(0, 10) : '-'}</td>
                                        <td>{/* 첨부파일 필드 없음 */}</td>
                                    </tr>
                                ))
                            )
                        }
                    </tbody>
                </table>

                {/* 페이징바 위치 */}
                <Pagination
                    currentPage={pageInfo.currentPage}
                    totalPages={pageInfo.totalPages}
                    onPageChange={handlePageChange}
                />

                {/* 검색창 위치 */}
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

                    <Button type="submit" variant="secondary">
                        검색
                    </Button>
                </form>
            </div>
        </div>
    );

}

export default BoardListPage;
