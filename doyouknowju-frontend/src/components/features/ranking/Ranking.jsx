
import styles from './Ranking.module.css';
import Pagination from './components/Pagination';
import { useState, useEffect } from 'react';
import rankingApi from '../../../api/ranking/RankingApi';
import { Button } from '../../common';
import RankingTable from './components/RankingTable';

function Ranking({groupSize = 50}) {

    const GROUP_SIZE = groupSize;

    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    const [selectedRankingCategory, setSelectedRankingCategory] = useState("all");

    const [periodRanking, setPeriodRanking] = useState([]);

    const fetchSeasonRanking = async () => {
        try {
            const response = await rankingApi.getSeasonRanking(selectedRankingCategory, page, GROUP_SIZE);
            console.log(response);
            setPeriodRanking(response);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchTotalPage = async () => {
        try {
            const response = await rankingApi.getRankingCountBySeason(selectedRankingCategory);
            console.log(response);
            setTotalPage(Math.ceil(response / GROUP_SIZE));
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(()=>{
        fetchSeasonRanking();
        fetchTotalPage();
        setPeriodRanking(periodRanking.slice(0, GROUP_SIZE));
    }, [page, selectedRankingCategory]);

    useEffect(()=>{
        setPage(1);
    }, [selectedRankingCategory]);

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
        setSelectedRankingCategory("weekly");
    }

    const handleMonthlyRankingButton = () => {
        setSelectedRankingCategory("monthly");
    }

    const handleYearlyRankingButton = () => {
        setSelectedRankingCategory("yearly");
    }

    const handleAllRankingButton = () => {
        setSelectedRankingCategory("all");
    }

    return (
        <div className={styles.container}>
            <div>
                <Button
                    onClick={()=>{setSelectedRankingCategory("all"); setPage(1);}}
                    variant={selectedRankingCategory === "all" ? "primary" : "secondary"}
                >
                    전체
                </Button>
                <Button
                    onClick={()=>{setSelectedRankingCategory("weekly"); setPage(1);}}
                    variant={selectedRankingCategory === "weekly" ? "primary" : "secondary"}
                >
                    주간
                </Button>
                <Button
                    onClick={()=>{setSelectedRankingCategory("monthly"); setPage(1);}}
                    variant={selectedRankingCategory === "monthly" ? "primary" : "secondary"}
                >
                    월간
                </Button>
                <Button
                    onClick={()=>{setSelectedRankingCategory("yearly"); setPage(1);}}
                    variant={selectedRankingCategory === "yearly" ? "primary" : "secondary"}
                >
                    연간
                </Button>

            </div>
            <RankingTable data={periodRanking} isSimplified={true} />
        </div>
    );
}

export default Ranking;