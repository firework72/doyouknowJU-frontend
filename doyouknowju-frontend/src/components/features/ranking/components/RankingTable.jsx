import styles from './RankingTable.module.css';
import { getImageUrl } from '@/api/game/titleApi.js';

function RankingTable({data}) {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th className={styles.th}>순위</th>
                    <th className={styles.th}>닉네임</th>
                    <th className={`${styles.th} ${styles.textAlignRight}`}>초기자산</th>
                    <th className={`${styles.th} ${styles.textAlignRight}`}>현재자산</th>
                    <th className={`${styles.th} ${styles.textAlignRight}`}>수익률</th>
                </tr>
            </thead>
            <tbody>
                {
                    data?.map((ranking, index) => (
                        <tr key={index} className={styles.row}>
                            <td className={styles.td}>{ranking.rank}</td>
                            <td className={styles.td}>
                                <span>
                                    {ranking.titleImgUrl && (
                                        <img
                                            src={getImageUrl(ranking.titleImgUrl)}
                                            alt={ranking.titleName}
                                            className="homepage-equipped-title-img"
                                        />
                                    )}
                                </span>{ranking.userId}
                            </td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{ranking.startPoint.toLocaleString()}</td>
                            <td className={`${styles.td} ${styles.numberCell}`}>{ranking.currentPoint.toLocaleString()}</td>
                            <td className={`${styles.td} ${styles.numberCell} ${ranking.returnRate > 0 ? styles.positive : styles.negative}`}>{ranking.returnRate.toFixed(2)}%</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export default RankingTable;