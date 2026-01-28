import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Signup from '../components/features/signup/Signup';
import StockDetail from '../components/features/stock/StockDetail'; // Dong : 주식 상세 페이지

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<div>로그인 페이지</div>} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/stock/:stockId" element={<StockDetail />} /> {/* Dong : 주식 상세 페이지 */}
            <Route path="*" element={<HomePage />} />
        </Routes>
    );
};

export default AppRoutes;
