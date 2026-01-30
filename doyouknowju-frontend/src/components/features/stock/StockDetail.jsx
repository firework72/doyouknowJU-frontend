import styles from './StockDetail.module.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { tradeApi } from '../../../api/trade/TradeApi.js';
import BuyConfirmModal from './components/BuyConfirmModal.jsx';
import {Button, Input} from '@/components/common';
import { useAuth } from '../../../hooks/AuthContext.jsx';
import Toast from '../../common/Toast.jsx';
import SellConfirmModal from './components/SellConfirmModal.jsx';
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

    const [pageLoading, setPageLoading] = useState(true);    
    const [toast, setToast] = useState(null);
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [sellModalOpen, setSellModalOpen] = useState(false);

    const fetchStockPrice = async () => {
        const response = await tradeApi.getStockPrice(stockId);
        setStockPrice(response.output.stck_prpr);
        setStockFluctuation(response.output.prdy_vrss);
        setStockContrastRatio(response.output.prdy_ctrt);
    };

    useEffect(() => {
        console.log(stockId);
        console.log(user);
        // 마운트 시 초기 1회 주식 현재가 정보 조회
        fetchStockPrice();

        // 이후 10초마다 주식 현재가 정보 갱신
        const intervalId = setInterval(() => {
            fetchStockPrice();
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
            tradeCategory : "BUY",
            totalTradePrice: stockPrice * stockCount
        }
        try {
            const response = await tradeApi.buyStock(data);
            console.log(response);
            showToast("success", "매수되었습니다.");
            // 현재 회원의 잔고를 업데이트한다.
            setUser({...user, points: response.afterBalance})
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
            tradeCategory : "SELL",
            totalTradePrice: stockPrice * stockCount
        }
        try {
            const response = await tradeApi.sellStock(data);
            console.log(response);
            showToast("success", "매도되었습니다.");
            // 현재 회원의 잔고를 업데이트한다.
            setUser({...user, points: response.afterBalance})
        } catch (error) {
            console.log(error);
            showToast("error", error.response.data);
        } finally {
            setSellModalOpen(false);
        }
    }

    const showToast = (type, message) => {
        setToast({type, message});
    }
    
    return (
        <>
            <div className={styles.container}>
                {
                    pageLoading ? (
                        <p>데이터를 불러오고 있습니다.</p>
                    ) : (
                        <>
                            <div className={styles.inline}>
                                <h1>StockDetail</h1>
                                <span>{stockId}</span>
                            </div>
                            <h2 className={stockFluctuation > 0 ? styles.riseColor : styles.fallColor}>{stockPrice} ({stockFluctuation}, {stockContrastRatio})</h2>
                            <Input
                                type="text"
                                placeholder="수량"
                                disabled={stockPrice === 0}
                                value={stockCount}
                                min={1}
                                max={999999999}
                                maxLength={9}
                                step={1}
                                onChange={(e)=>handleStockCountChange(e)}
                            />
                            <Button
                                variant="danger"
                                disabled={stockPrice === 0}
                                onClick={()=>setBuyModalOpen(true)}
                            >
                                매수
                            </Button>
                            <Button
                                variant="primary"
                                disabled={stockPrice === 0}
                                onClick={()=>setSellModalOpen(true)}
                            >
                                매도
                            </Button>
                        </>
                    )
                }
            </div>
            <BuyConfirmModal isOpen={buyModalOpen}
            onClose={()=>setBuyModalOpen(false)}
            footer={
                <>
                    <Button
                        variant="danger"
                        onClick={()=>setBuyModalOpen(false)}
                    >
                        취소
                    </Button>
                    <Button
                        variant="primary"
                        onClick={()=>handleBuy()}
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
            onClose={()=>setSellModalOpen(false)}
            footer={
                <>
                    <Button
                        variant="danger"
                        onClick={()=>setSellModalOpen(false)}
                    >
                        취소
                    </Button>
                    <Button
                        variant="primary"
                        onClick={()=>handleSell()}
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