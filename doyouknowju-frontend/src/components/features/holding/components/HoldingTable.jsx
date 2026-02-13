import styles from './HoldingTable.module.css';

function HoldingTable({data}) {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th className={styles.th}>종목코드</th>
                    <th className={styles.th}>종목이름</th>
                    <th className={styles.thRight}>보유수량</th>
                    <th className={styles.thRight}>평균단가</th>
                    <th className={styles.thRight}>현재가</th>
                    <th className={styles.thRight}>평가손익</th>
                    <th className={styles.thRight}>수익률</th>
                </tr>
            </thead>
            <tbody>
                {
                    data?.map((holding, index) => (
                        <tr key={index} className={styles.row}>
                            <td className={styles.td}>{holding.stockId}</td>
                            <td className={styles.td}>{holding.stockName}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{holding.totalCount.toLocaleString()}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{Number(holding.totalPrice / holding.totalCount).toLocaleString()}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>
                                {holding.currentPrice.toLocaleString()}
                            </td>
                            <td className={`${styles.td} ${styles.numberCell} ${holding.profitAndLoss > 0 ? styles.positive : styles.negative}`}>
                                {holding.profitAndLoss.toLocaleString()}
                            </td>
                            <td className={`${styles.td} ${styles.numberCell} ${holding.profitAndLossRate > 0 ? styles.positive : styles.negative}`}>
                                {holding.profitAndLossRate.toFixed(2)}%
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export default HoldingTable;