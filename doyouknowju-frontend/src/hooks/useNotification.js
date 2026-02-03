import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markAsRead as apiMarkAsRead } from '../api/notificationApi';

export const useNotification = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const SIZE = 20;

    // 알림 목록 가져오기 (isMore가 true면 기존 리스트 뒤에 추가)
    const fetchNotifications = useCallback(async (isMore = false) => {
        if (!userId) return;

        const currentOffset = isMore ? notifications.length : 0;
        const data = await getNotifications(userId, currentOffset, SIZE);

        if (data) {
            if (isMore) {
                setNotifications(prev => [...prev, ...data]);
            } else {
                setNotifications(data);
                setUnreadCount(data.filter(n => n.isRead === 'N').length);
            }
            // 가져온 데이터가 SIZE보다 작으면 더 이상 데이터가 없는 것
            setHasMore(data.length === SIZE);
        }
    }, [userId, notifications.length]);

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const handleRead = async (notiNo) => {
        await apiMarkAsRead(notiNo);
        setNotifications(prev => prev.map(n => n.notiNo === notiNo ? { ...n, isRead: 'Y' } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return { notifications, unreadCount, hasMore, fetchNotifications, handleRead };
};