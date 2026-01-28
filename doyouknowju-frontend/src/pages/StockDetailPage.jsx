import React from 'react';
import { useParams } from 'react-router-dom';

const StockDetailPage = () => {
    const { id } = useParams();

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>주식 상세 페이지</h2>
            <p>종목 코드: {id}</p>
            {/* 추후 여기에 주식 상세 정보 컴포넌트 추가 */}
        </div>
    );
};

export default StockDetailPage;
