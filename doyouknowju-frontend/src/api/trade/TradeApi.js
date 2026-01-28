
// 주식 거래 페이지에 필요한 API

import api from "./axios";

export const tradeApi = {
    
    // 주식 가격 조회
    getStockPrice: async (stockId) => {
        const response = await api.get(`http://localhost:8080/dykj/api/stocks/${stockId}/price`);
        return response.data;
    }
}

export default tradeApi;