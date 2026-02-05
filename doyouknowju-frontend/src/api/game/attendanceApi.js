const BASE_URL = "http://localhost:8080/dykj/api/game";

export const attendanceApi = {
    // 출석 이력 조회
    getHistory: async () => {
        try {
            const response = await fetch(`${BASE_URL}/attend/history`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch attendance history');
            }
            return await response.json();
        } catch (error) {
            console.error("출석 이력 조회 중 에러 발생: ", error);
            throw error;
        }
    },

    // 출석 체크 (필요 시 추가)
    checkIn: async () => {
        try {
            const response = await fetch(`${BASE_URL}/attend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to check in');
            }
            return await response.json();
        } catch (error) {
            console.error("출석 체크 중 에러 발생: ", error);
            throw error;
        }
    }
};
