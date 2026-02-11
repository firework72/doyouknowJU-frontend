
import { useEffect, useState } from "react";
import { favoriteStockApi } from "../../../../api/favoriteStockApi";
import { Card, Spinner } from "../../../common";
import { useNavigate } from "react-router-dom";

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
            <>
            {favoriteStocks.map((stock) => (
                <div key={stock.stockId}>
                    <Card style={{cursor: 'pointer'}} onClick={() => navigate(`/stock/${stock.stockId}`)}>
                        <p><strong>{stock.stockId}&nbsp;&nbsp;&nbsp;&nbsp;{stock.stockName}</strong></p>
                        <p>{stock.stockPrice}</p>
                        <p>{stock.stockPriceChange}</p>
                        <p>{stock.stockPriceChangeRate}</p>
                    </Card>
                </div>
            ))}
            </>
        )}
        </>
    );
}

export default FavoriteStockTable;