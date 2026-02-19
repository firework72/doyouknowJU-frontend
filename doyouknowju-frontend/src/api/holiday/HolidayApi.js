
import api from "../trade/axios";

export const holidayApi = {
   getIsHoliday : async () => {
     const response = await api.get(`http://localhost:8080/dykj/api/holiday/check`);
     return response.data;
   }
}

export default holidayApi;