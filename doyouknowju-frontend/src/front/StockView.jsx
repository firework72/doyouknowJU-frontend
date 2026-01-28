import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockTop10View = () => {
    // 1. 상태 변수 정의 (단일 객체가 아닌 배열로 변경)
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);

    // 2. 거래량 Top 10 데이터를 가져오는 함수
    const fetchTop10 = async () => {
        setLoading(true);
        try {
            // 백엔드에서 작성한 Top 10 API 호출
            const response = await axios.get(`http://localhost:8080/dykj/api/stocks/top10`);

            // 응답 데이터 저장 (백엔드 컨트롤러에서 이미 리스트로 반환하도록 짰다면 response.data)
            if (response.data) {
                setStocks(response.data);
            }
        } catch (error) {
            console.error("거래량 상위 데이터 가져오기 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. 실시간 폴링(Polling) 설정
    useEffect(() => {
        fetchTop10(); // 처음 로드 시 실행

        // 10초마다 순위 갱신 (순위 데이터는 5초보다는 10~30초가 적당합니다)
        const timer = setInterval(() => {
            fetchTop10();
        }, 10000);

        return () => clearInterval(timer);
    }, []); // 종목 코드가 없으므로 빈 배열을 넣어 한 번만 타이머 설정

    // 4. 등락에 따른 색상 결정 함수
    const getPriceColor = (val) => {
        const num = parseFloat(val);
        if (num > 0) return '#d20d0d'; // 상승 (빨간색)
        if (num < 0) return '#0d42d2'; // 하락 (파란색)
        return '#333'; // 보합
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>실시간 거래량 Top 10</h2>
                <button
                    onClick={fetchTop10}
                    disabled={loading}
                    style={{
                        padding: '5px 10px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        backgroundColor: '#fff'
                    }}
                >
                    {loading ? '갱신중...' : '새로고침'}
                </button>
            </div>

            <div style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                            <th style={styles.th}>순위</th>
                            <th style={styles.th}>종목명</th>
                            <th style={styles.th}>현재가</th>
                            <th style={styles.th}>등락율</th>
                            <th style={styles.th}>거래량</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.length > 0 ? (
                            stocks.map((stock, index) => (
                                <tr key={stock.mksc_shrn_iscd || index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{stock.hts_kor_isnm}</td>
                                    <td style={{ ...styles.td, textAlign: 'right' }}>
                                        {Number(stock.stck_prpr).toLocaleString()}원
                                    </td>
                                    <td style={{
                                        ...styles.td,
                                        textAlign: 'right',
                                        color: getPriceColor(stock.prdy_ctrt),
                                        fontWeight: 'bold'
                                    }}>
                                        {stock.prdy_ctrt}%
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'right', fontSize: '12px', color: '#666' }}>
                                        {Number(stock.acml_vol).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                    데이터를 불러오는 중입니다...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '10px', textAlign: 'right' }}>
                * 10초마다 자동 갱신됩니다.
            </p>
        </div>
    );
};

// 스타일 객체
const styles = {
    th: {
        padding: '12px 8px',
        fontSize: '14px',
        color: '#666',
        textAlign: 'center'
    },
    td: {
        padding: '12px 8px',
        fontSize: '14px'
    }
};

export default StockTop10View;