const BASE_URL = "http://localhost:8080/dykj/api/game";

export const achievementApi = {
    // 도전과제 목록 조회
    getAchievements: async () => {
        try {
            const response = await fetch(`${BASE_URL}/achiev/list`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' // 세션 쿠키 전달
            });
            if (!response.ok) {
                throw new Error('Failed to fetch achievements');
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching achievements:", error);
            throw error;
        }
    },

    // 보상 수령
    claimReward: async (achievementId) => {
        try {
            const response = await fetch(`${BASE_URL}/achiev/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ achievementId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to claim reward');
            }
            return await response.json();
        } catch (error) {
            console.error("Error claiming reward:", error);
            throw error;
        }
    },

    //칭호 목록 조회
    getMyTitles: async() => {
        try{
            const response = await fetch(`${BASE_URL}/titles`,{
                method: 'GET',
                headers: {'Content-Type' : 'application/json'},
                credentials: 'include'
            });

            if(!response.ok){
                throw new Error('Failed to fetch Titles');
            }
            return await response.json();
        }catch(error){
            console.error("Error fetching titles:",error);
            throw error;
        }
    }
};
