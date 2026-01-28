import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Signup from '../components/features/signup/Signup';
import StockDetail from '../components/features/stock/StockDetail'; // Dong : 주식 상세 페이지
import MyPage from '../pages/MyPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/stock/:stockId" element={<StockDetail />} /> {/* Dong : 주식 상세 페이지 */}
            <Route path="*" element={<HomePage />} />
        </Routes>
    );
};

export default AppRoutes;
