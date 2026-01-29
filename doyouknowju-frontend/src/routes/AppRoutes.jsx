import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Signup from '../components/features/signup/Signup';
import SearchPage from '../pages/SearchPage';
import StockDetail from '../components/features/stock/StockDetail'; // Dong : 주식 상세 페이지
import MyPage from '../pages/MyPage';
import TestLevelUp from '../pages/TestLevelUp';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/test-levelup" element={<TestLevelUp/>}/>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/stock/:stockId" element={<StockDetail />} />
            <Route path="*" element={<HomePage />} />
        </Routes>
    );
};

export default AppRoutes;
