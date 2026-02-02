import styles from './RankingTable.module.css';

function RankingTable({data}) {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th className={styles.th}>순위</th>
                    <th className={styles.th}>닉네임</th>
                    <th className={styles.th}>초기자산</th>
                    <th className={styles.th}>현재자산</th>
                    <th className={styles.th}>수익률</th>
                </tr>
            </thead>
            <tbody>
                {
                    data?.map((ranking, index) => (
                        <tr key={index} className={styles.row}>
                            <td className={styles.td}>{ranking.rank}</td>
                            <td className={styles.td}>{ranking.userId}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{ranking.startPoint}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{ranking.currentPoint}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{ranking.returnRate}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export default RankingTable;