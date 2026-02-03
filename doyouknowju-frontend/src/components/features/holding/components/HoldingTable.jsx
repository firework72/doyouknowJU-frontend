import styles from './HoldingTable.module.css';

function HoldingTable({data}) {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th className={styles.th}>종목코드</th>
                    <th className={styles.th}>종목이름</th>
                    <th className={styles.th}>보유수량</th>
                    <th className={styles.th}>매입가격</th>
                    <th className={styles.th}>현재가격</th>
                    <th className={styles.th}>평가손익</th>
                    <th className={styles.th}>평가손익률</th>
                </tr>
            </thead>
            <tbody>
                {
                    data?.map((holding, index) => (
                        <tr key={index} className={styles.row}>
                            <td className={styles.td}>{holding.stockId}</td>
                            <td className={styles.td}>{holding.stockName}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{holding.totalCount}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{holding.totalPrice}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{holding.currentPrice * holding.totalCount}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{holding.profitAndLoss}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{holding.profitAndLossRate}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export default HoldingTable;