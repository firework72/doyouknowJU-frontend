import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// 개별 주식 항목 컴포넌트 (가격 정보 제거)
const StockListItem = ({ stock, navigate }) => {
    const stockId = stock.stockId;
    const stockName = stock.stockName;

    return (
        <div
            style={styles.listItem}
            onClick={() => navigate(`/stock/${stockId}`)}
        >
            <div>
                <div style={styles.stockName}>{stockName}</div>
                <div style={styles.stockCode}>{stockId}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={styles.moveButton}>상세보기 〉</div>
            </div>
        </div>
    );
};

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                // 검색 호출 (Context Path: /dykj 반영)
                const searchRes = await axios.get(
                    `http://localhost:8080/dykj/api/stocks/search?q=${encodeURIComponent(query)}&page=1&size=20`
                );
                const searchData = Array.isArray(searchRes.data) ? searchRes.data : [];
                setResults(searchData);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>
                '{query}' 검색 결과 <span style={{ color: '#888', fontSize: '18px' }}>{results.length}건</span>
            </h2>

            {loading ? (
                <div style={styles.message}>검색 중입니다...</div>
            ) : results.length > 0 ? (
                <div style={styles.listWrapper}>
                    {results.map((stock, index) => (
                        <StockListItem
                            key={stock.stockId || index}
                            stock={stock}
                            navigate={navigate}
                        />
                    ))}
                </div>
            ) : (
                <div style={styles.message}>검색 결과가 없습니다.</div>
            )}
        </div>
    );
};

// CSS-in-JS 스타일
const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '40px 20px' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' },
    message: { textAlign: 'center', padding: '60px 0', color: '#666', fontSize: '18px' },
    listWrapper: { borderTop: '2px solid #333' },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0',
        borderBottom: '1px solid #eee',
        cursor: 'pointer',
    },
    stockName: { fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' },
    stockCode: { fontSize: '14px', color: '#888' },
    moveButton: { fontSize: '14px', color: '#888' }
};

export default SearchPage;