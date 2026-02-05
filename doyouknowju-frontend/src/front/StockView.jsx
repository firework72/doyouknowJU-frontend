import React, { useState, useEffect } from 'react';
import {
    fetchTop10FallRate,
    fetchTop10MarketCap,
    fetchTop10RiseRate,
    fetchTop10TradeValueNaver,
    fetchTop10Volume,
} from '../api/stockApi';

const StockTop10View = () => {
    // 1. 상태 변수 정의
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('volume'); // 'volume' | 'amount' | 'rise' | 'fall' | 'marketCap'

    // 2. Top 10 데이터를 가져오는 함수
    const fetchTop10 = async () => {
        setLoading(true);
        try {
            let data = [];
            if (activeTab === 'volume') {
                data = await fetchTop10Volume();
            } else if (activeTab === 'amount') {
                data = await fetchTop10TradeValueNaver();
            } else if (activeTab === 'rise') {
                data = await fetchTop10RiseRate();
            } else if (activeTab === 'fall') {
                data = await fetchTop10FallRate();
            } else if (activeTab === 'marketCap') {
                data = await fetchTop10MarketCap();
            }

            if (data) {
                setStocks(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Top 10 데이터 가져오기 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. 탭이 바뀌거나 처음 로드될 때, 그리고 주기적으로 갱신
    useEffect(() => {
        fetchTop10();

        const refreshMs = activeTab === 'amount' ? 20000 : 10000;
        const timer = setInterval(() => {
            fetchTop10();
        }, refreshMs);

        return () => clearInterval(timer);
    }, [activeTab]);

    // 4. 등락에 따른 색상 결정 함수
    const toNumber = (value) => {
        if (value === null || value === undefined) return NaN;
        if (typeof value === 'number') return value;
        const text = String(value).replaceAll(',', '').replaceAll('%', '').trim();
        if (!text) return NaN;
        return Number(text);
    };

    const getPriceColor = (val) => {
        const num = toNumber(val);
        if (num > 0) return '#d20d0d'; // 상승 (빨간색)
        if (num < 0) return '#0d42d2'; // 하락 (파란색)
        return '#333'; // 보합
    };

    // 숫자 포맷팅 (거래대금은 억 단위 변환 등 고려 가능하나 일단 localeString)
    const formatNumber = (num) => {
        const value = toNumber(num);
        if (!Number.isFinite(value)) return '-';
        return value.toLocaleString();
    };

    const formatAmount = (amount) => {
        // 거래대금의 경우 단위가 크면 '억' 단위로 표시하는게 좋을수도 있음.
        // 여기서는 일단 원단위/백만원단위 고려없이 그대로 출력하거나,
        // 필요시: return Math.round(amount / 1000000).toLocaleString() + '백만';
        const value = toNumber(amount);
        if (!Number.isFinite(value)) return '-';
        if (value >= 100000000) return (value / 100000000).toFixed(1) + '억';
        return value.toLocaleString();
    };

    const getStockKey = (stock, index) =>
        stock.mksc_shrn_iscd ||
        stock.stckShrnIscd ||
        stock.itemCode ||
        stock.code ||
        stock.symbol ||
        index;

    const getStockName = (stock) =>
        stock.hts_kor_isnm ||
        stock.htsKorIsnm ||
        stock.stockName ||
        stock.itmsNm ||
        stock.name ||
        stock.stockNameKr ||
        '-';

    const getPrice = (stock) =>
        stock.stck_prpr ??
        stock.stckPrpr ??
        stock.nowVal ??
        stock.currentPrice ??
        stock.closePrice ??
        stock.nowPrice ??
        stock.price ??
        '-';

    const getChangeRate = (stock) => {
        const raw =
            stock.prdy_ctrt ??
            stock.prdyCtrt ??
            stock.changeRate ??
            stock.fluctuationsRatio ??
            stock.changesRatio ??
            stock.changeRate ??
            stock.changePercent;

        let value = toNumber(raw);
        if (!Number.isFinite(value)) return 0;

        const changeValue = toNumber(stock.changeValue ?? stock.prdyVrss ?? stock.prdy_vrss);
        if (Number.isFinite(changeValue) && changeValue < 0) return -Math.abs(value);

        const changeSign = String(stock.changeSign ?? stock.prdyVrssSign ?? stock.prdy_vrss_sign ?? '').toUpperCase();
        const isDownSign = changeSign === '-' || changeSign === 'DOWN' || changeSign === 'FALL' || changeSign === '2';
        if (isDownSign) value = -Math.abs(value);
        return value;
    };

    const getVolume = (stock) =>
        stock.acml_vol ?? stock.acmlVol ?? stock.accVolume ?? stock.volume ?? '-';

    const getTradeValue = (stock) => stock.acml_tr_pbmn ?? stock.accAmount ?? stock.tradeValue ?? stock.amount ?? '-';

    const getMarketCap = (stock) => stock.marketCap ?? stock.mrktTotAmt ?? stock.market_cap ?? '-';

    const emptyMessage =
        activeTab === 'marketCap'
            ? '시가총액 Top10 데이터가 없습니다.'
            : activeTab === 'rise'
                ? '상승률 Top10 데이터가 없습니다.'
                : activeTab === 'fall'
                    ? '하락률 Top10 데이터가 없습니다.'
                    : activeTab === 'amount'
                        ? '거래대금 Top10 데이터가 없습니다.'
                        : '데이터가 없습니다.';

    return (
        <div style={{ padding: '20px', fontFamily: 'Outfit, Noto Sans KR, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>실시간 Top 10</h2>
                    <button
                        onClick={fetchTop10}
                        disabled={loading}
                        style={{
                            padding: '6px 12px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            backgroundColor: '#fff',
                            fontSize: '12px'
                        }}
                    >
                        {loading ? '갱신중...' : '새로고침'}
                    </button>
                </div>

                {/* 탭 버튼 영역 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setActiveTab('volume')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: activeTab === 'volume' ? '#333' : '#f0f0f0',
                            color: activeTab === 'volume' ? '#fff' : '#666',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        거래량 상위
                    </button>
                    <button
                        onClick={() => setActiveTab('amount')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: activeTab === 'amount' ? '#333' : '#f0f0f0',
                            color: activeTab === 'amount' ? '#fff' : '#666',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        거래대금 상위
                    </button>
                    <button
                        onClick={() => setActiveTab('rise')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: activeTab === 'rise' ? '#333' : '#f0f0f0',
                            color: activeTab === 'rise' ? '#fff' : '#666',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        상승률 상위
                    </button>
                    <button
                        onClick={() => setActiveTab('fall')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: activeTab === 'fall' ? '#333' : '#f0f0f0',
                            color: activeTab === 'fall' ? '#fff' : '#666',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        하락률 상위
                    </button>
                    <button
                        onClick={() => setActiveTab('marketCap')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: activeTab === 'marketCap' ? '#333' : '#f0f0f0',
                            color: activeTab === 'marketCap' ? '#fff' : '#666',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        시가총액 상위
                    </button>
                </div>
            </div>

            <div style={{
                border: '1px solid #eee',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                background: '#fff'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                            <th style={styles.th}>순위</th>
                            <th style={styles.th}>종목명</th>
                            <th style={styles.th}>현재가</th>
                            <th style={styles.th}>등락율</th>
                            <th style={styles.th}>
                                {activeTab === 'amount' ? '거래대금' : activeTab === 'marketCap' ? '시가총액' : '거래량'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.length > 0 ? (
                            stocks.map((stock, index) => (
                                <tr key={getStockKey(stock, index)} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#666' }}>{index + 1}</td>
                                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{getStockName(stock)}</td>
                                    <td style={{ ...styles.td, textAlign: 'right' }}>
                                        {formatNumber(getPrice(stock))}
                                    </td>
                                    <td style={{
                                        ...styles.td,
                                        textAlign: 'right',
                                        color: getPriceColor(getChangeRate(stock)),
                                        fontWeight: 'bold'
                                    }}>
                                        {getChangeRate(stock) > 0 ? '+' : ''}{getChangeRate(stock)}%
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'right', fontSize: '12px', color: '#666' }}>
                                        {activeTab === 'amount'
                                            ? formatAmount(getTradeValue(stock)) // 네이버 거래대금
                                            : activeTab === 'marketCap'
                                                ? formatAmount(getMarketCap(stock))
                                                : formatNumber(getVolume(stock))
                                        }
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '60px 0', textAlign: 'center', color: '#999' }}>
                                    {loading ? '데이터 불러오는 중...' : emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <p style={{ fontSize: '11px', color: '#aaa', marginTop: '12px', textAlign: 'center' }}>
                * 탭에 따라 10~20초마다 자동으로 갱신됩니다.
            </p>
        </div>
    );
};

// 스타일 객체
const styles = {
    th: {
        padding: '12px',
        fontSize: '13px',
        color: '#888',
        fontWeight: '500',
        textAlign: 'center'
    },
    td: {
        padding: '14px 12px',
        fontSize: '14px'
    }
};

export default StockTop10View;
