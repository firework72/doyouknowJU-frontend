import { createChart } from 'lightweight-charts';

function StockChart() {

    const chart = createChart(document.getElementById('stock-chart-area'), {
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
    });

    const candleSeries = chart.addCandlestickSeries();

    const data = [
        { time: '2018-01-01', open: 100, high: 120, low: 90, close: 110 },
        { time: '2018-01-02', open: 110, high: 130, low: 100, close: 125 },
        { time: '2018-01-03', open: 125, high: 140, low: 115, close: 135 },
        { time: '2018-01-04', open: 135, high: 150, low: 125, close: 145 },
        { time: '2018-01-05', open: 145, high: 160, low: 135, close: 155 },
    ];

    candleSeries.setData(data);

    return (
        <div>
            <h1>StockChart</h1>
            {
                chart.timeScale.fitContent()
            }
        </div>
    );
}

export default StockChart;