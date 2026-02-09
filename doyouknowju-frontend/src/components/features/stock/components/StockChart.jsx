import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { tradeApi } from '../../../../api/trade/TradeApi';

function StockChart({stockId}) {

    const chartContainerRef = useRef(null);

    const [stockChartData, setStockChartData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    const stockChartDataRef = useRef(stockChartData);
    const isFetchingRef = useRef(isFetching);

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const today = `${year}${month}${day}`;

    let chart = useRef(null);
    let candleSeries = useRef(null);

    useEffect(() => {
        isFetchingRef.current = isFetching;
    }, [isFetching]);

    const fetchStockChartData = async (endDate) => {
        setIsFetching(true);
        setTimeout(async () => {
            try {
                const response = await tradeApi.getStockChartData(stockId, endDate);
                setStockChartData((prevData) => [...response.output2.reverse(), ...prevData]);
                console.log("response", response.output2.reverse());
                console.log("stockChartData after Fetching", stockChartData.current);
            } catch (error) {
                console.error("주식 차트 데이터 로드 실패", error);
            } finally {
                setIsFetching(false);
            }
        }, 2000);
    }

    useEffect(()=>{
        console.log(stockId);
        if (!chartContainerRef.current) return;

        setStockChartData([]);

        // 차트 만들기
        chart.current = createChart(chartContainerRef.current, {
            layout: {
                background: { type: 'solid', color: '#222' },
                textColor: 'rgba(255, 255, 255, 0.9)',
            },
            grid: {
                vertLines: { color: 'rgba(70, 70, 70, 0)' },
                horzLines: { color: 'rgba(70, 70, 70, 0)' },
            },
            priceScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
            },
            leftPriceScale: {
                visible: true,
            },
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
                timeVisible: true,
                secondsVisible: false,
                minBarSpacing: 15,
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            crosshair: {
                mode: 0,
            },
            rightPriceScale: {
                visible: false,
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
        });

        // 차트를 캔들봉 스타일로 만들기
        candleSeries.current = chart.current.addSeries(CandlestickSeries, {
            upColor: '#d20d0d', 
            downColor: '#0d47d2', 
            borderVisible: false, 
            wickUpColor: '#d20d0d', 
            wickDownColor: '#0d47d2', 
        });

        // 데이터 가져오기
        fetchStockChartData(today);

        // window resize 시 차트 크기 조정
        const handleResize = () => {
            chart.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        // 스크롤이 왼쪽 끝에 다다르면 데이터 추가 로드

        const handleVisibleRangeChange = (visibleRange) => {
            if (visibleRange.from < 10) {
                if (!isFetchingRef.current && stockChartDataRef.current.length > 0) {
                    console.log(stockChartDataRef.current[0]);
                    let newDate = new Date(stockChartDataRef.current[0].stck_bsop_date);
                    newDate.setDate(newDate.getDate() - 1);
                    fetchStockChartData(`${newDate.getFullYear()}${String(newDate.getMonth() + 1).padStart(2, '0')}${String(newDate.getDate()).padStart(2, '0')}`);
                }
            }
        }

        chart.current.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

        return () => {
            chart.current.remove();
            window.removeEventListener('resize', handleResize);
            clearTimeout(fetchStockChartData);
            chart.current.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
        };
    },[stockId]);

    useEffect(()=>{
        stockChartDataRef.current = stockChartData;
        setChartData(stockChartDataRef.current.map((item)=>{
            return {
                time: `${item.stck_bsop_date.slice(0, 4)}-${item.stck_bsop_date.slice(4, 6)}-${item.stck_bsop_date.slice(6, 8)}`,
                open: Number(item.stck_oprc),
                high: Number(item.stck_hgpr),
                low: Number(item.stck_lwpr),
                close: Number(item.stck_clpr)
            }
        }));
        console.log("chartData", chartData);
        candleSeries.current.setData(chartData);
    },[stockChartData]);

    return (
        <div
            ref={chartContainerRef}
            style={{ width: '100%', height: '400px' }}
        />
    );
}

export default StockChart;