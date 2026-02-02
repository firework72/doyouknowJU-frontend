
import styles from './RankingTable.module.css';

function AllRankingTable({data}) {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th className={styles.th}>순위</th>
                    <th className={styles.th}>닉네임</th>
                    <th className={styles.th}>자산</th>
                </tr>
            </thead>
            <tbody>
                {
                    data?.map((ranking, index) => (
                        <tr key={index} className={styles.row}>
                            <td className={styles.td}>{ranking.rank}</td>
                            <td className={styles.td}>{ranking.userId}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{ranking.points}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export default AllRankingTable;