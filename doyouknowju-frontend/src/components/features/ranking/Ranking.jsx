
import styles from './Ranking.module.css';
import Pagination from './components/Pagination';
import { useState, useEffect } from 'react';
import rankingApi from '../../../api/ranking/RankingApi';
import { Button } from '../../common';
import AllRankingTable from './components/AllRankingTable';
import RankingTable from './components/RankingTable';

function Ranking() {

    const [page, setPage] = useState(1);

    const [selectedRankingCategory, setSelectedRankingCategory] = useState("all");

    const [weeklyRanking, setWeeklyRanking] = useState([]);
    const [monthlyRanking, setMonthlyRanking] = useState([]);
    const [yearlyRanking, setYearlyRanking] = useState([]);
    const [allRanking, setAllRanking] = useState([]);

    const [periodRanking, setPeriodRanking] = useState([]);

    const fetchWeeklyRanking =  async () => {
        try {
            const response = await rankingApi.getWeeklyRanking(page);
            setWeeklyRanking(response);
            setPeriodRanking(response);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchMonthlyRanking = async () => {
        try {
            const response = await rankingApi.getMonthlyRanking(page);
            setMonthlyRanking(response);
            setPeriodRanking(response);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchYearlyRanking = async () => {
        try {
            const response = await rankingApi.getYearlyRanking(page);
            setYearlyRanking(response);
            setPeriodRanking(response);
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
            <p>모든 랭킹은 매일 자정 갱신됩니다.</p>
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
                selectedRankingCategory === "all" && <AllRankingTable data={allRanking} />
            }
            {
                selectedRankingCategory !== "all" && <RankingTable data={periodRanking} />
            }
            <Pagination
                currentPage={page}
                totalPages={10}
                onPageChange={setPage}
            />
        </div>
    );
}

export default Ranking;