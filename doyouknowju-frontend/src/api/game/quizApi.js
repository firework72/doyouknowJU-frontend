const BASE_URL = "http://localhost:8080/dykj/api/game";

export const quizApi = {
    // 오늘의 퀴즈 조회
    getTodayQuiz: async () => {
        try {
            const response = await fetch(`${BASE_URL}/quiz/today`, {
                credentials: 'include'
            });
            if (response.ok) {
                return await response.json();
            } else if (response.status === 404) {
                return null;
            } else {
                throw new Error('Failed to fetch quiz');
            }
        } catch (error) {
            console.error("퀴즈 조회 중 에러:", error);
            throw error;
        }
    },

    // 퀴즈 풀기
    solveQuiz: async (quizId, answer) => {
        try {
            const response = await fetch(`${BASE_URL}/quiz/solve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quizId, answer }),
                credentials: 'include'
            });

            if (response.ok) {
                return await response.json();
            } else {
                const errorMsg = await response.text();
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error("퀴즈 제출 중 에러:", error);
            throw error;
        }
    }
};
