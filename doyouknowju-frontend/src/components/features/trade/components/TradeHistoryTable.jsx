import styles from './TradeHistoryTable.module.css';

function TradeHistoryTable({data}) {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th className={styles.th}>거래일자</th>
                    <th className={styles.th}>종목코드</th>
                    <th className={styles.th}>종목이름</th>
                    <th className={styles.thRight}>거래유형</th>
                    <th className={styles.thRight}>수량</th>
                    <th className={styles.thRight}>단가</th>
                    <th className={styles.thRight}>금액</th>
                    <th className={styles.thRight}>잔고</th>
                </tr>
            </thead>
            <tbody>
                {
                    data?.map((trade, index) => (
                        <tr key={index} className={styles.row}>
                            <td className={styles.td}>{trade.tradeDate}</td>
                            <td className={styles.td}>{trade.stockId}</td>
                            <td className={styles.td}>{trade.stockName}</td>
                            <td className={styles.td}>{trade.tradeCategory === 'BUY' ? '매수' : '매도'}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{trade.tradeCount.toLocaleString()}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{trade.stockPrice.toLocaleString()}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>
                                {trade.totalTradePrice.toLocaleString()}
                            </td>
                            <td className={`${styles.td} ${styles.numberCell}`}>
                                {trade.afterBalance.toLocaleString()}
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export default TradeHistoryTable;