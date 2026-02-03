import api from "../trade/axios";

export const holdingApi = {
    getHoldingsByUserId : async (userId) => {
        const response = await api.get(`http://localhost:8080/dykj/api/holdings/${userId}`);
        return response.data;
    }
}

export default holdingApi;