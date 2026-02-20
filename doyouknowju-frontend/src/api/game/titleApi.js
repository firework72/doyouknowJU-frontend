const BASE_URL = "/dykj/api/game";

// 이미지 경로 처리 함수
export const getImageUrl = (url) => {
    if (!url) return null;
    const contextPath = '/dykj';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return cleanUrl.startsWith(contextPath) ? cleanUrl : `${contextPath}${cleanUrl}`;
};

export const titleApi = {
    //칭호 목록 조회
    getMyTitles: async () => {
        try {
            const response = await fetch(`${BASE_URL}/titles`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch Titles');
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching titles:", error);
            throw error;
        }
    },

    // 칭호 장착
    equipTitle: async (titleId) => {
        try {
            const response = await fetch(`${BASE_URL}/titles/equip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ titleId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to equip title');
            }
            return await response.json();
        } catch (error) {
            console.error("Error equipping title: ", error);
            throw error;
        }
    },

    // 칭호 장착 해제
    unequipTitle: async () => {
        try {
            const response = await fetch(`${BASE_URL}/titles/unequip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to unequip title');
            }
            return await response.json();
        } catch (error) {
            console.error("Error unequipping title: ", error);
            throw error;
        }
    },

    // 여러 사용자의 장착 칭호 정보 대량 조회
    getEquippedTitlesList: async (userIds) => {
        try {
            const response = await fetch(`${BASE_URL}/titles/equipped-list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds })
            });
            if (!response.ok) {
                throw new Error('Failed to fetch equipped titles list');
            }
            return await response.json(); // List<TitleDTO> 반환
        } catch (error) {
            console.error("Error fetching equipped titles list:", error);
            throw error;
        }
    }
};
