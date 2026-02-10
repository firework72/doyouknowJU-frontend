const BASE_URL = "http://localhost:8080/dykj/api/members";

export const memberApi = {
    // 회원 탈퇴
    withdraw: async (password) => {
        try {
            const response = await fetch(`${BASE_URL}/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '탈퇴 처리에 실패했습니다.');
            }
            return true;
        } catch (error) {
            console.error("회원 탈퇴 중 에러 발생: ", error);
            throw error;
        }
    }
};
