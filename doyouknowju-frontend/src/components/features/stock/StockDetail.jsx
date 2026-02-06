import styles from './StockDetail.module.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { tradeApi } from '../../../api/trade/TradeApi.js';
import BuyConfirmModal from './components/BuyConfirmModal.jsx';
import { Button, Input, Card } from '@/components/common';
import { useAuth } from '../../../hooks/AuthContext.jsx';
import Toast from '../../common/Toast.jsx';
import SellConfirmModal from './components/SellConfirmModal.jsx';
import api from '../../../api/trade/axios';
/*
    필요한 상태값 : 주식 ID, 회원 정보
    필요한 함수 : 주식 매수, 주식 매도
*/

function StockDetail() {

    const { stockId } = useParams();
    const { user, setUser } = useAuth();

    const [stockPrice, setStockPrice] = useState(0);
    const [stockCount, setStockCount] = useState("1");
    const [stockFluctuation, setStockFluctuation] = useState(0);
    const [stockContrastRatio, setStockContrastRatio] = useState(0);
    const [stockName, setStockName] = useState("");
    const [stockNews, setStockNews] = useState([]);

    const [pageLoading, setPageLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [sellModalOpen, setSellModalOpen] = useState(false);

    const fetchStockName = async () => {
        const response = await tradeApi.getStockName(stockId);
        setStockName(response);
        fetchStockNews(response);
    }

    const fetchStockNews = async (name) => {
        try {
            const response = await api.get('/api/news/search', {
                params: { keyword: name }
            });
            setStockNews(response.data);
        } catch (error) {
            console.error("뉴스 로드 실패", error);
        }
    }

    const fetchStockInfo = async () => {
        const priceResponse = await tradeApi.getStockPrice(stockId);
        setStockPrice(priceResponse.output.stck_prpr);
        setStockFluctuation(priceResponse.output.prdy_vrss);
        setStockContrastRatio(priceResponse.output.prdy_ctrt);
    };

    useEffect(() => {
        setPageLoading(true);
        console.log(stockId);
        console.log(user);
        fetchStockName();
        // 마운트 시 초기 1회 주식 현재가 정보 조회
        fetchStockInfo();
        // 이후 10초마다 주식 현재가 정보 갱신
        const intervalId = setInterval(() => {
            fetchStockInfo();
        }, 10000);

        setPageLoading(false);

        return () => {
            clearInterval(intervalId);
        };
    }, [stockId]);

    const handleStockCountChange = (e) => {
        console.log(e.target.value);
        if (e.target.value === "0") {
            e.preventDefault();
            return;
        }

        if (e.target.value.length > 9) {
            e.preventDefault();
            return;
        }
        setStockCount(e.target.value.replace(/[^0-9]/g, ''));
    }

    const handleBuy = async () => {
        // 종목코드, 매수개수, 매수가격, 회원ID, 거래종류, 총매수가격 전달

        const data = {
            stockId: stockId,
            tradeCount: stockCount,
            stockPrice: stockPrice,
            userId: user.userId,
            tradeCategory: "BUY",
            totalTradePrice: stockPrice * stockCount
        }
        try {
            const response = await tradeApi.buyStock(data);
            console.log(response);
            showToast("success", "매수되었습니다.");
            // 현재 회원의 잔고를 업데이트한다.
            setUser({ ...user, points: response.afterBalance })
        } catch (error) {
            console.log(error);
            showToast("error", error.response.data);
        } finally {
            setBuyModalOpen(false);
        }
    }

    const handleSell = async () => {
        // 종목코드, 매도개수, 매도가격, 회원ID, 거래종류, 총매도가격 전달

        const data = {
            stockId: stockId,
            tradeCount: stockCount,
            stockPrice: stockPrice,
            userId: user.userId,
            tradeCategory: "SELL",
            totalTradePrice: stockPrice * stockCount
        }
        try {
            const response = await tradeApi.sellStock(data);
            console.log(response);
            showToast("success", "매도되었습니다.");
            // 현재 회원의 잔고를 업데이트한다.
            setUser({ ...user, points: response.afterBalance })
        } catch (error) {
            console.log(error);
            showToast("error", error.response.data);
        } finally {
            setSellModalOpen(false);
        }
    }

    const showToast = (type, message) => {
        setToast({ type, message });
    }

    return (
        <>
            <div className={styles.container}>
                {
                    pageLoading ? (
                        <p>데이터를 불러오고 있습니다.</p>
                    ) : stockName === "" ? (
                        <>
                            <p>⚠︎ 존재하지 않는 종목입니다.</p>
                        </>
                    ) : (
                        <>
                            <div className={styles.inline}>
                                <h1>{stockName}</h1>
                                <span>{stockId}</span>
                            </div>
                            <h2 className={stockFluctuation > 0 ? styles.riseColor : styles.fallColor}>{stockPrice} ({stockFluctuation}, {stockContrastRatio})</h2>
                            <Card>
                                <h2>차트</h2>
                                <p>Stock Chart will be here.</p>
                            </Card>
                            <Card>
                                <h2>주식 매수/매도</h2>
                                <p>수량을 선택하고 매수/매도 버튼을 눌러 거래하세요.</p>
                                <p>현재 {user.points}원을 보유하고 있습니다.</p>
                                <br></br>
                                <div className={styles.alignRow}>
                                    <Input
                                        type="text"
                                        placeholder="수량"
                                        disabled={stockPrice === 0}
                                        value={stockCount}
                                        min={1}
                                        max={999999999}
                                        maxLength={9}
                                        step={1}
                                        onChange={(e) => handleStockCountChange(e)}
                                    />

                                </div>
                                <Button
                                    variant="danger"
                                    disabled={stockPrice === 0}
                                    onClick={() => setBuyModalOpen(true)}
                                >
                                    매수
                                </Button>
                                <Button
                                    variant="primary"
                                    disabled={stockPrice === 0}
                                    onClick={() => setSellModalOpen(true)}
                                >
                                    매도
                                </Button>
                            </Card>
                            <Card>
                                <h2>관련 뉴스</h2>
                                {stockNews && stockNews.length > 0 ? (
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {stockNews.map((news) => (
                                            <li key={news.newsId} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                                <a href={news.newsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#333', display: 'block' }}>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{news.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                        {news.pubDate} | {news.newsCategory}
                                                    </div>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{stockName} 와/과 관련된 결과가 없습니다.</p>
                                )}
                            </Card>

                        </>
                    )
                }
            </div>
            <BuyConfirmModal isOpen={buyModalOpen}
                onClose={() => setBuyModalOpen(false)}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setBuyModalOpen(false)}
                        >
                            취소
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleBuy()}
                        >
                            매수
                        </Button>
                    </>
                }>
                <p>매수하시겠습니까?</p>
                <p>주식 수량 : {stockCount}</p>
                <p>주식 가격 : {stockPrice}</p>
                <p>총 가격 : {stockCount * stockPrice}</p>
            </BuyConfirmModal>
            <SellConfirmModal isOpen={sellModalOpen}
                onClose={() => setSellModalOpen(false)}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setSellModalOpen(false)}
                        >
                            취소
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => handleSell()}
                        >
                            매도
                        </Button>
                    </>
                }>
                <p>매도하시겠습니까?</p>
                <p>주식 수량 : {stockCount}</p>
                <p>주식 가격 : {stockPrice}</p>
                <p>총 가격 : {stockCount * stockPrice}</p>
            </SellConfirmModal>
            {
                toast && (
                    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 2000 }}>
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onClose={() => setToast(null)}
                        />
                    </div>
                )
            }

        </>
    );
}

export default StockDetail;