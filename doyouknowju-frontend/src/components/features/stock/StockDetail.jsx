import styles from './StockDetail.module.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { tradeApi } from '../../../api/trade/TradeApi.js';
import {Button, Input} from '@/components/common';
/*
    필요한 상태값 : 주식 ID, 회원 정보
    필요한 함수 : 주식 매수, 주식 매도
*/

function StockDetail() {
    
    const { stockId } = useParams();

    // 10초마다 주식 현재가 정보 갱신
    const [stockPrice, setStockPrice] = useState(0);

    const fetchStockPrice = async () => {
        const response = await tradeApi.getStockPrice(stockId);
        setStockPrice(response.output.stck_prpr);
    };

    useEffect(() => {
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
    
    return (
        <div className={styles.stockDetailContainer}>
            <h1>StockDetail</h1>
            <span>{stockId}</span>
            <h3>{stockPrice}</h3>
            <Input
                type="number"
                placeholder="수량"
                disabled={stockPrice === 0}
            />
            <Button
                variant="danger"
                disabled={stockPrice === 0}
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
    );
}

export default StockDetail;