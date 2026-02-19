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
    },

    // 관리자 전체 회원 목록
    getMemberList: async (page = 1, size = 10) => {
        const response = await fetch(`${BASE_URL}/list?page=${page}&size=${size}`,{
            credentials: 'include'
        });
        if(!response.ok) throw new Error('회원 목록 조회 실패');
        return response.json();
    },

    //관리자 회원 제재
    banMember: async (userId, banDays) => {
        const response = await fetch(`${BASE_URL}/ban`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, banDays }),
            credentials: 'include'
        });
        if(!response.ok) throw new Error('제재 처리 실패');
        return response.text();
    }
};
