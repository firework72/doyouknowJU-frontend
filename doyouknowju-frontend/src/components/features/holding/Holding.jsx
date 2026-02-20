import styles from './Holding.module.css';
import { useAuth } from '@/hooks/AuthContext';
import holdingApi from '@/api/holding/HoldingApi';
import { useState, useEffect } from 'react';
import Toast from '@/components/common/Toast';
import Spinner from '@/components/common/Spinner';
import HoldingTable from './components/HoldingTable';

function Holding() {
    const { user } = useAuth();
    const [toast, setToast] = useState(null);
    const [holdings, setHoldings] = useState([]);
    const [currentAsset, setCurrentAsset] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMyHolding = async (userId) => {
        setIsLoading(true);
        try {
            const response = await holdingApi.getHoldingsByUserId(userId);
            console.log(response);
            setHoldings(response);
            let totalAsset = user.points;
            response.map((holding) => {
                totalAsset += holding.currentPrice * holding.totalCount;
            });
            setCurrentAsset(totalAsset);
        } catch (error) {
            console.log(error);
            setToast({type: "error", message: "정보를 불러오는 데 실패했습니다."});
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(()=>{
        fetchMyHolding(user.userId);
    }, []);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.alignColumn}>
                    <div className={styles.alignRow}>
                        <div className={styles.inline}>
                            <h1>보유종목</h1>
                        </div>
                    </div>
                </div>
                {
                    isLoading ? (
                        <Spinner/>
                    ) : (
                        <>
                            <h2>현재 자산 : <span className={styles.numberCell}>{currentAsset.toLocaleString()}</span> P</h2>
                            <HoldingTable data={holdings}></HoldingTable>
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

export default Holding;