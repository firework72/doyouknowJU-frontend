const COLOR_PALETTE = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', // 기본 6색
  '#8AC926', '#1982C4', '#6A4C93', '#FF595E', '#2EC4B6'  // 추가 색상
];

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const HoldingChart = ({holdings}) => {

    const labelData = holdings.map((holding) => holding.stockName);
    labelData = [...labelData, '예수금'];

    const data = {
        labels: labelData,
        datasets: [
            {
                data: holdings.map((holding) => holding.totalCount),
                backgroundColor: COLOR_PALETTE,
            },
        ],
    };

    return (
      <></>  
    );
}

export default HoldingChart;
