import styles from './StockDetail.module.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { tradeApi } from '../../../api/trade/TradeApi.js';
import BuyConfirmModal from './components/BuyConfirmModal.jsx';
import {Button, Input} from '@/components/common';
import { useAuth } from '../../../hooks/AuthContext.jsx';
/*
    필요한 상태값 : 주식 ID, 회원 정보
    필요한 함수 : 주식 매수, 주식 매도
*/

function StockDetail() {
    
    const { stockId } = useParams();
    const { user } = useAuth();

    const [stockPrice, setStockPrice] = useState(0);
    const [stockCount, setStockCount] = useState("0");
    const [isOpen, setIsOpen] = useState(true);

    const fetchStockPrice = async () => {
        const response = await tradeApi.getStockPrice(stockId);
        setStockPrice(response.output.stck_prpr);
    };

    useEffect(() => {
        console.log(user);
        // 마운트 시 초기 1회 주식 현재가 정보 조회
        fetchStockPrice();

        // 이후 10초마다 주식 현재가 정보 갱신
        setInterval(() => {
            fetchStockPrice();
        }, 10000);
    }, [stockId]);

    // 마운트 해제되면 setInterval 중지
    useEffect(() => {
        return () => {
            clearInterval();
        };
    }, []);

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

    const handleBuy = () => {

    }
    
    return (
        <>
            <div className={styles.stockDetailContainer}>
                <h1>StockDetail</h1>
                <span>{stockId}</span>
                <h3>{stockPrice}</h3>
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
                    onClick={()=>setIsOpen(true)}
                >
                    매수
                </Button>
                <Button
                    variant="primary"
                    disabled={stockPrice === 0}
                >
                    매도
                </Button>  
            </div>
            <BuyConfirmModal isOpen={isOpen}
            onClose={()=>setIsOpen(false)}
            footer={
                <>
                    <Button
                        variant="danger"
                        onClick={()=>setIsOpen(false)}
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
        </> 
    );
}

export default StockDetail;