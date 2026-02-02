
import styles from './Ranking.module.css';
import Pagination from './components/Pagination';
import { useState, useEffect } from 'react';
import rankingApi from '../../../api/ranking/RankingApi';
import { Button } from '../../common';

function Ranking() {

    const [page, setPage] = useState(1);

    const [selectedRankingCategory, setSelectedRankingCategory] = useState("all");

    const [weeklyRanking, setWeeklyRanking] = useState([]);
    const [monthlyRanking, setMonthlyRanking] = useState([]);
    const [yearlyRanking, setYearlyRanking] = useState([]);
    const [allRanking, setAllRanking] = useState([]);

    const fetchWeeklyRanking =  async () => {
        try {
            const response = await rankingApi.getWeeklyRanking(page);
            setWeeklyRanking(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchAllRanking = async () => {
        try {
            const response = await rankingApi.getAllRanking(page);
            setAllRanking(response);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }


    useEffect(()=>{
        if(selectedRankingCategory === "weekly") {
            fetchWeeklyRanking();
        } else if(selectedRankingCategory === "monthly") {
            fetchMonthlyRanking();
        } else if(selectedRankingCategory === "yearly") {
            fetchYearlyRanking();
        } else {
            fetchAllRanking();
        }
    }, [page, selectedRankingCategory]);

    useEffect(()=>{
        fetchAllRanking();
    }, []);

    // useEffect(()=>{
    //     setWeeklyRanking([
    //         {
    //             nickname: "test",
    //             ranking: 1
    //         },
    //         {
    //             nickname: "test2",
    //             ranking: 2
    //         },
    //         {
    //             nickname: "test3",
    //             ranking: 3
    //         },
    //         {
    //             nickname: "test4",
    //             ranking: 4
    //         },
    //         {
    //             nickname: "test5",
    //             ranking: 5
    //         }
    //     ]);
    // }, []);

    const handleWeeklyRankingButton = () => {
        setPage(1);
        setSelectedRankingCategory("weekly");
    }

    const handleMonthlyRankingButton = () => {
        setPage(1);
        setSelectedRankingCategory("monthly");
    }

    const handleYearlyRankingButton = () => {
        setPage(1);
        setSelectedRankingCategory("yearly");
    }

    const handleAllRankingButton = () => {
        setPage(1);
        setSelectedRankingCategory("all");
    }

    return (
        <div className={styles.container}>
            <h1>랭킹</h1>
            <div>
                <Button
                    onClick={handleAllRankingButton}
                    variant={selectedRankingCategory === "all" ? "primary" : "secondary"}
                >
                    전체
                </Button>
                <Button
                    onClick={handleWeeklyRankingButton}
                    variant={selectedRankingCategory === "weekly" ? "primary" : "secondary"}
                >
                    주간
                </Button>
                <Button
                    onClick={handleMonthlyRankingButton}
                    variant={selectedRankingCategory === "monthly" ? "primary" : "secondary"}
                >
                    월간
                </Button>
                <Button
                    onClick={handleYearlyRankingButton}
                    variant={selectedRankingCategory === "yearly" ? "primary" : "secondary"}
                >
                    연간
                </Button>

            </div>
            {
                selectedRankingCategory === "all" &&
                <table>
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>닉네임</th>
                            <th>자산</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            allRanking?.map((ranking, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{ranking.userId}</td>
                                    <td>{ranking.points}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            }
            <Pagination />
        </div>
    );
}

export default Ranking;