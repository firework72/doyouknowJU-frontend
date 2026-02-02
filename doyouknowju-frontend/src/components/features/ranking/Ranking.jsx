
import styles from './Ranking.module.css';
import Pagination from './components/Pagination';
import { useState, useEffect } from 'react';

function Ranking() {

    const [weeklyRanking, setWeeklyRanking] = useState([]);
    const [monthlyRanking, setMonthlyRanking] = useState([]);
    const [yearlyRanking, setYearlyRanking] = useState([]);
    const [totalRanking, setTotalRanking] = useState([]);



    useEffect(()=>{
        setWeeklyRanking([
            {
                nickname: "test",
                ranking: 1
            },
            {
                nickname: "test2",
                ranking: 2
            },
            {
                nickname: "test3",
                ranking: 3
            },
            {
                nickname: "test4",
                ranking: 4
            },
            {
                nickname: "test5",
                ranking: 5
            }
        ]);
    }, []);

    return (
        <div className={styles.container}>
            <h1>랭킹</h1>
            <table>
                <thead>
                    <tr>
                        <th>순위</th>
                        <th>닉네임</th>
                        <th>랭킹</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        weeklyRanking.map((ranking, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{ranking.nickname}</td>
                                <td>{ranking.ranking}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <Pagination />
        </div>
    );
}

export default Ranking;