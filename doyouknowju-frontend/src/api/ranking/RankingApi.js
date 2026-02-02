
// 랭킹 페이지에 필요한 API

import api from "../trade/axios";

export const rankingApi = {

    getWeeklyRanking : async (page) => {
        const response = await api.get(`http://localhost:8080/dykj/api/ranking/weekly/${page}`);
        return response.data;
    },

    getMonthlyRanking : async (page) => {
        const response = await api.get(`http://localhost:8080/dykj/api/ranking/monthly/${page}`);
        return response.data;
    },

    getYearlyRanking : async (page) => {
        const response = await api.get(`http://localhost:8080/dykj/api/ranking/yearly/${page}`);
        return response.data;
    },

    getAllRanking : async (page) => {
        const response = await api.get(`http://localhost:8080/dykj/api/ranking/all/${page}`);
        return response.data;
    },
}

export default rankingApi;