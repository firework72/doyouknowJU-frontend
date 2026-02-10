import api from "./trade/axios";

export const favoriteStockApi = {
    // 관심종목 추가
    addFavorite: async (userId, stockId) => {
        const response = await api.post(`/api/favorite-stock/add`, {
            userId: userId,
            stockId: stockId
        });
        return response.data;
    },

    // 관심종목 삭제
    removeFavorite: async (userId, stockId) => {
        const response = await api.post(`/api/favorite-stock/delete`, {
            userId: userId,
            stockId: stockId
        });
        return response.data;
    },

    // 관심종목 확인
    getIsFavorite: async (userId, stockId) => {
        const response = await api.get(`/api/favorite-stock/check/${userId}/${stockId}`);
        return response.data;
    },

    // 관심종목 목록 조회
    getFavoriteStocks: async (userId) => {
        const response = await api.get(`/api/favorite-stock/list/${userId}`);
        return response.data;
    }
}

export default favoriteStockApi;