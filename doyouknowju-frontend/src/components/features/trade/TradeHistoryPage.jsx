import styles from './TradeHistoryPage.module.css';
import { useAuth } from '@/hooks/AuthContext';
import tradeHistoryApi from '@/api/trade/TradeHistoryApi';
import { useState, useEffect } from 'react';
import Toast from '@/components/common/Toast';
import Spinner from '@/components/common/Spinner';
import TradeHistoryTable from './components/TradeHistoryTable';
import Pagination from './components/Pagination';
import { useNavigate } from 'react-router-dom';

function TradeHistoryPage() {

    const GROUP_SIZE = 10;

    const { user } = useAuth();

    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    const [toast, setToast] = useState(null);
    const [tradeHistories, setTradeHistories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMyTradeHistory = async (userId) => {
        setIsLoading(true);
        try {
            const response = await tradeHistoryApi.getTradeHistoryByUserId(userId, page, GROUP_SIZE);
            console.log(response);
            setTradeHistories(response);
        } catch (error) {
            console.log(error);
            setToast({type: "error", message: "정보를 불러오는 데 실패했습니다."});
        } finally {
            setIsLoading(false);
        }
    }

    const fetchTotalPage = async () => {
        try {
            const response = await tradeHistoryApi.getTradeHistoryCountByUserId(user.userId);
            console.log(response);
            setTotalPage(Math.ceil(response / GROUP_SIZE));
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(()=>{
        fetchMyTradeHistory(user.userId);
        fetchTotalPage();
    }, []);

    useEffect(()=>{
        fetchMyTradeHistory(user.userId);
    }, [page]);

    useEffect(()=>{
        setPage(1);
    }, [user]);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.alignColumn}>
                    <div className={styles.alignRow}>
                        <div className={styles.inline}>
                            <h1>거래내역</h1>
                        </div>
                    </div>
                </div>
                {
                    isLoading ? (
                        <Spinner/>
                    ) : (
                        <>
                            <TradeHistoryTable data={tradeHistories}></TradeHistoryTable>
                            <Pagination
                                currentPage={page}
                                totalPages={totalPage}
                                onPageChange={setPage}
                            />
                        </>
                    )
                }
            </div>
            {
                toast && (
                    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 2000 }}>
                        <Toast 
                            message={toast.message} 
                            type={toast.type} 
                            onClose={() => setToast(null)} 
                        />
                    </div>
                )
            }
        </>
    )
}

export default TradeHistoryPage;