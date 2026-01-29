
// 주식 거래 페이지에 필요한 API

import api from "./axios";

export const tradeApi = {

    // 종목 코드를 바탕으로 종목 이름 조회
    getStockName: async (stockId) => {
        // TODO: 종목 이름 조회 API 호출 경로 수정 필요
        const response = await api.get(`http://localhost:8080/dykj/api/stocks/${stockId}/name`);
        return response.data;
    },

    // 종목 코드와 현재 가격, 입력된 개수를 바탕으로 매수하기
    buyStock : async (data) => {
        const response = await api.post(`http://localhost:8080/dykj/api/trade/buy`, data);
        return response.data;
    },

    // 종목 코드와 현재 가격, 입력된 개수를 바탕으로 매도하기

    

    
    // 주식 가격 조회
    getStockPrice: async (stockId) => {
        const response = await api.get(`http://localhost:8080/dykj/api/stocks/${stockId}/price`);
        return response.data;
    }
}

export default tradeApi;