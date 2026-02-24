import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchStockSearch, fetchStockPrices } from '../api/stockApi';

// 媛쒕퀎 二쇱떇 ??ぉ 而댄룷?뚰듃
const StockListItem = ({ stock, priceInfo, navigate }) => {
    const stockId = stock.stockId;
    const stockName = stock.stockName;

    const signNum = priceInfo?.prdy_vrss_sign ? parseInt(priceInfo.prdy_vrss_sign, 10) : NaN;
    const arrow = signNum === 1 || signNum === 2 ? '▲' : (signNum === 4 || signNum === 5 ? '▼' : '');

    const currentPriceNum = priceInfo?.stck_prpr != null ? Number(priceInfo.stck_prpr) : NaN;
    const currentPrice = Number.isFinite(currentPriceNum) ? currentPriceNum.toLocaleString() : '-';

    const changeValueNum = priceInfo?.prdy_vrss != null ? Number(priceInfo.prdy_vrss) : NaN;
    const changeValue = Number.isFinite(changeValueNum) ? changeValueNum.toLocaleString() : null;

    const changeRateNum = priceInfo?.prdy_ctrt != null ? Number(priceInfo.prdy_ctrt) : NaN;
    const changeRate = Number.isFinite(changeRateNum) ? changeRateNum : null;

    const getPriceColor = () => {
        if (!priceInfo) return '#333';
        if (signNum === 1 || signNum === 2) return '#d20d0d'; // ?곸듅
        if (signNum === 4 || signNum === 5) return '#0d42d2'; // ?섎씫
        return '#333';
    };

    return (
        <div style={styles.listItem} onClick={() => navigate(`/stock/${stockId}`)}>
            <div>
                <div style={styles.stockName}>{stockName}</div>
                <div style={styles.stockCode}>{stockId}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div style={styles.priceText}>
                    {currentPrice !== '-' ? `${currentPrice}원` : '가격을 불러오는 중...'}
                </div>

                {priceInfo && changeRate != null && changeValue != null && (
                    <div style={{ fontSize: '14px', color: getPriceColor(), fontWeight: 'bold' }}>
                        {arrow} {changeValue} ({changeRate}%)
                    </div>
                )}
            </div>
        </div>
    );
};

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [prices, setPrices] = useState({}); // { "005930": {...}, "000660": {...} }
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        const fetchAllData = async () => {
            const q = query.trim();
            if (!q) return;

            setLoading(true);
            try {
                // 1) 寃??寃곌낵 (DB)
                const searchData = await fetchStockSearch({ q, page: 1, size: 30 });
                setResults(searchData);

                // 2) 媛寃?(KIS, 理쒕? 30媛?
                const ids = searchData
                    .map((s) => s?.stockId)
                    .filter(Boolean)
                    .slice(0, 30);

                if (ids.length > 0) {
                    const fetchedPrices = await fetchStockPrices(ids);
                    setPrices(fetchedPrices);


                } else {
                    setPrices({});
                }
            } catch (error) {
                if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
                    console.error('데이터 로드 중 오류 발생:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();

        return () => controller.abort();
    }, [query]);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>
                '{query}' 검색 결과 <span style={{ color: '#888', fontSize: '18px' }}>{results.length}건</span>
            </h2>

            {loading ? (
                <div style={styles.message}>데이터를 불러오는 중입니다...</div>
            ) : results.length > 0 ? (
                <div style={styles.listWrapper}>
                    {results.map((stock, index) => {
                        const stockId = stock?.stockId;
                        return (
                            <StockListItem
                                key={stockId || index}
                                stock={stock}
                                priceInfo={stockId ? prices[stockId] : undefined}
                                navigate={navigate}
                            />
                        );
                    })}
                </div>
            ) : (
                <div style={styles.message}>검색 결과가 없습니다.</div>
            )}
        </div>
    );
};

// CSS-in-JS ?ㅽ???
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
    priceText: { fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' },
};

export default SearchPage;


