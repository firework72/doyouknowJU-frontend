import { useState, useEffect } from 'react';
import { getNotifications, markAsRead as apiMarkAsRead } from '../api/notificationApi';

export const useNotification = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // [설명] 알림 목록을 서버에서 가져와서 상태(State)에 저장하는 함수
    const fetchNotifications = async () => {
        if (!userId) return;
        const data = await getNotifications(userId);
        if (data) {
            setNotifications(data);
            // 읽지 않은(isRead === 'N') 알림의 개수를 세어서 저장
            setUnreadCount(data.filter(n => n.isRead === 'N').length);
        }
    };

    // [설명] 1분마다 또는 컴포넌트가 처음 나타날 때 알림을 확인 (Polling 방식)
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // 1분 간격 타이머
        return () => clearInterval(interval); // 컴포넌트 사라질 때 타이머 정리
    }, [userId]);

    // [설명] 알림 클릭 시 읽음 처리하고, 화면에도 즉시 반영하는 함수
    const handleRead = async (notiNo) => {
        await apiMarkAsRead(notiNo); // 서버에 읽음 요청
        // 서버 응답 기다리지 않고 화면(State)을 먼저 업데이트 (낙관적 업데이트)
        setNotifications(prev => prev.map(n =>
            n.notiNo === notiNo ? { ...n, isRead: 'Y' } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1)); // 안 읽은 개수 1 감소
    };

    return { notifications, unreadCount, fetchNotifications, handleRead };
};
