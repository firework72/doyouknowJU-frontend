import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Signup from '../components/features/member/Signup';
import SearchPage from '../pages/SearchPage';
import StockDetail from '../components/features/stock/StockDetail'; // Dong : 주식 상세 페이지
import BoardListPage from '../components/features/community/pages/BoardListPage';
import BoardWritePage from '../components/features/community/pages/BoardWritePage';
import BoardDetailPage from '../components/features/community/pages/BoardDetailPage';
import MyPage from '../pages/MyPage';
import TestLevelUp from '../pages/TestLevelUp';
import RankingPage from '../components/features/ranking/RankingPage'; // Dong : 랭킹 페이지
import Holding from '../components/features/holding/Holding'; // Dong : 보유종목 페이지
import NewsPage from '../pages/NewsPage';
import StockPage from '../components/features/stock/StockPage';
import AdminPage from '../pages/AdminPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/admin/*" element={<AdminPage />} /> {/* [taek] 관리자 페이지 추가 */}
            <Route path="/holding" element={<Holding />} /> {/* Dong : 보유종목 페이지 */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/test-levelup" element={<TestLevelUp />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/board" element={<BoardListPage />} />
            <Route path="/board/write" element={<BoardWritePage />} />
            <Route path="/board/:boardId/edit" element={<BoardWritePage />} />
            <Route path="/board/:boardId" element={<BoardDetailPage />} />
            <Route path="/stock" element={<StockPage />} /> {/* Dong : 주식 페이지 */}
            <Route path="/stock/:stockId" element={<StockDetail />} />
            <Route path="/ranking" element={<RankingPage />} /> {/* Dong : 랭킹 페이지 */}
            <Route path="/news" element={<NewsPage />} /> {/* 뉴스 페이지 추가 */}
            <Route path="*" element={<HomePage />} />
        </Routes>
    );
};

export default AppRoutes;
