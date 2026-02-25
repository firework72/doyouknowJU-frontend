const COLOR_PALETTE = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', // 기본 6색
  '#8AC926', '#1982C4', '#6A4C93', '#FF595E', '#2EC4B6'  // 추가 색상
];

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { holdingApi } from '../../../../api/holding/holdingApi';
import { useAuth } from '../../../../hooks/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '../../../common';

ChartJS.register(ArcElement, Tooltip, Legend);


// 3. 차트 옵션 설정 (주식 차트처럼 예쁘게 꾸미기)
const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'right', // 범례를 오른쪽에 배치 (bottom, top, left 가능)
            labels: {
                font: {
                    size: 12, // 폰트 크기
                },
                boxWidth: 10, // 색상 박스 크기
                padding: 20,  // 간격
            },
        },
        tooltip: {
            callbacks: {
                // 툴팁에 가격 표시할 때 'P' 단위 붙이기
                label: function (context) {
                    let label = context.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed !== null) {
                        label += new Intl.NumberFormat('ko-KR').format(context.parsed) + ' P';
                    }
                    return label;
                },
            },
        },
    },
    cutout: '70%', // 도넛의 구멍 크기 (클수록 얇은 도넛이 됨)
    animation: {
        duration: 1000,
    }
};

const HoldingChart = () => {

    const [isLoading, setIsLoading] = useState(true);

    const [holdings, setHoldings] = useState([]);

    const { user } = useAuth();

    const fetchHoldingData = async (userId) => {
        setIsLoading(true);
        try {
            const response = await holdingApi.getHoldingsByUserId(userId);
            setHoldings(response);
        } catch (error) {
            console.error("보유 주식 데이터 로드 실패", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (user && user.userId) {
            fetchHoldingData(user.userId);
        }
    }, []);

    let labelData = holdings.map((holding) => holding.stockName);
    labelData = [...labelData, '예수금'];

    let valueData = holdings.map((holding) => holding.currentPrice * holding.totalCount);
    valueData = [...valueData, user.points];

    const data = useMemo(()=>{
        return {
            labels: labelData.map(label=>label),
            datasets: [
                {
                    data: valueData.map(value=>value),
                    backgroundColor: valueData.map((_, idx) => COLOR_PALETTE[idx % COLOR_PALETTE.length]),
                    borderColor: valueData.map((_, idx) => COLOR_PALETTE[idx % COLOR_PALETTE.length]),
                    borderWidth: 1,
                },
            ],
        };
    }, [labelData, valueData]);


    return (
        isLoading ? (
            <>
                <Spinner/>
                <p>차트를 생성하는 중입니다.</p>
            </>
        ) : (
            <div>
                <div style={{ fontSize: '14px', color: '#888', textAlign: 'center' }}>총 자산 : &nbsp;
                    <span style={{ color: '#000',fontWeight: 'bold', fontSize: '25px'}}>
                        {new Intl.NumberFormat('ko-KR').format(
                            valueData.reduce((acc, cur) => acc + cur, 0)
                        )} P
                    </span>
                </div>
                <div style={{ display: 'flex', width: '100%', height: '350px', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                    <Doughnut style={{alignItems: 'center', justifyContent: 'center', width: '350px', height: '350px'}} data={data} options={options} />  
                </div>
            </div>
        )
    );
}

export default HoldingChart;
