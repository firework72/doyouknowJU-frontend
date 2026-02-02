import axios from 'axios';

// Context Path(/dykj) 반영
// [설명] 백엔드 API 기본 경로입니다. Context Path인 /dykj를 포함해야 합니다.
const API_BASE_URL = 'http://localhost:8080/dykj/api/notifications';

// [설명] 서버에서 해당 유저의 알림 목록을 가져오는 함수 (GET 요청)
export const getNotifications = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }
};

// [설명] 특정 알림을 읽음 처리하라고 서버에 요청하는 함수 (PUT 요청)
export const markAsRead = async (notiNo) => {
    try {
        await axios.put(`${API_BASE_URL}/read/${notiNo}`);
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
    }
};
