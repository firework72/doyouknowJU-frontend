
import { useEffect, useState } from "react";
import { favoriteStockApi } from "../../../../api/favoriteStockApi";
import { Card, Spinner } from "../../../common";
import { useNavigate } from "react-router-dom";
import styles from "./FavoriteStockTable.module.css";

function FavoriteStockTable({userId}) {

    const navigate = useNavigate();
    const [favoriteStocks, setFavoriteStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFavoriteStocks = async () => {
        try {
            const response = await favoriteStockApi.getFavoriteStocks(userId);
            console.log(response);
            setFavoriteStocks(response);
        } catch (error) {
            console.error("관심 종목 로드 실패", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchFavoriteStocks();
    }, []);

    return (
        <>
        {isLoading ? (
            <Spinner />
        ) : (
            favoriteStocks.length === 0 ? (
                <div>
                    <p>관심 종목이 없습니다.</p>
                </div>
            ) : (
                <>
                {favoriteStocks.map((stock) => {
                    const change = Number(stock.stockPriceChange);
                    let priceClass = styles.priceNeutral;
                    let arrow = '-';

                    if (change > 0) {
                        priceClass = styles.priceUp;
                        arrow = '▲';
                    } else if (change < 0) {
                        priceClass = styles.priceDown;
                        arrow = '▼';
                    }

                    return (
                        <div key={stock.stockId}>
                            <Card className={styles.card} onClick={() => navigate(`/stock/${stock.stockId}`)}>
                                <div className={styles.stockInfo}>
                                    {stock.stockId}&nbsp;&nbsp;&nbsp;&nbsp;{stock.stockName}
                                </div>
                                <div className={`${styles.priceInfo} ${priceClass}`}>
                                    <span className={`${styles.stockPrice} ${styles.numberCell}`}>{Number(stock.stockPrice).toLocaleString()}</span>
                                    <span className={`${styles.numberCell}`}>{arrow}{Math.abs(change).toLocaleString()} ({stock.stockPriceChangeRate}%)</span>
                                </div>
                            </Card>
                        </div>
                    );
                })}
                </>
            )
        )}
        </>
    );
}

export default FavoriteStockTable;