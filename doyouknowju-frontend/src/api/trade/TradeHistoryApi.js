
// 주식 거래 페이지에 필요한 API

import api from "./axios";

export const tradeHistoryApi = {

    // 회원의 거래 이력 조회
    getTradeHistoryByUserId: async (userId, page, groupSize) => {
        const response = await api.get(`http://localhost:8080/dykj/api/trade-history/${userId}/${page}/${groupSize}`);
        return response.data;
    },

    getTradeHistoryCountByUserId: async (userId) => {
        const response = await api.get(`http://localhost:8080/dykj/api/trade-history/${userId}/count`);
        return response.data;
    },
}

export default tradeHistoryApi;