import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { tradeApi } from '../../../../api/trade/TradeApi';

function StockChart({stockId}) {

    const chartContainerRef = useRef(null);

    const [stockChartData, setStockChartData] = useState([]);
    const [chartData, setChartData] = useState([]);

    let chart = useRef(null);
    let candleSeries = useRef(null);

    const fetchStockChartData = async () => {
        setTimeout(async () => {
            try {
                const response = await tradeApi.getStockChartData(stockId);
                console.log(response);
                setStockChartData(response.output2);
            } catch (error) {
                console.error("주식 차트 데이터 로드 실패", error);
            }
        }, 2000);
    }

    useEffect(()=>{
        console.log(stockId);
        if (!chartContainerRef.current) return;

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
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
                timeVisible: true,
                secondsVisible: false,
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

        candleSeries.current = chart.current.addSeries(CandlestickSeries, {
            upColor: '#d20d0d', 
            downColor: '#0d47d2', 
            borderVisible: false, 
            wickUpColor: '#d20d0d', 
            wickDownColor: '#0d47d2', 
        });

        fetchStockChartData();

        // const data = [
        //     { time: '2018-01-01', open: 100, high: 120, low: 90, close: 110 },
        //     { time: '2018-01-02', open: 110, high: 130, low: 100, close: 125 },
        //     { time: '2018-01-03', open: 125, high: 140, low: 115, close: 135 },
        //     { time: '2018-01-04', open: 135, high: 150, low: 125, close: 145 },
        //     { time: '2018-01-05', open: 145, high: 160, low: 135, close: 155 },
        // ];

        const handleResize = () => {
            chart.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            chart.current.remove();
            window.removeEventListener('resize', handleResize);
            clearTimeout(fetchStockChartData);
        };
    },[]);

    useEffect(()=>{
        setChartData(stockChartData.reverse().map((item)=>{
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