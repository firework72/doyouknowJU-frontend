import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getNotifications, markAsRead as apiMarkAsRead } from '../api/notificationApi';

export const useNotification = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // [추가] 로딩 상태
    const SIZE = 20;
    const MAX_LIMIT = 140; // [추가] 최대 140개 제한

    const fetchNotifications = useCallback(async (isMore = false) => {
        if (!userId) return;
        if (isLoading) return; // [추가] 이미 불러오는 중이면 무시 (중복 방지)

        // [추가] 140개 넘으면 더 이상 안 불러옴
        if (isMore && notifications.length >= MAX_LIMIT) {
            setHasMore(false);
            return;
        }

        setIsLoading(true); // 로딩 시작
        try {
            const currentOffset = isMore ? notifications.length : 0;
            const data = await getNotifications(userId, currentOffset, SIZE);

            if (data) {
                if (isMore) {
                    // [중복 방지 강화] 기존에 있는 건 제외하고 합치기 (혹시 모를 중복 대비)
                    setNotifications(prev => {
                        const newItems = data.filter(d => !prev.some(p => p.notiNo === d.notiNo));
                        return [...prev, ...newItems];
                    });
                } else {
                    setNotifications(data);
                    setUnreadCount(data.filter(n => n.isRead === 'N').length);
                }
                // 데이터가 요청한 개수보다 적게 오면 끝난 것
                setHasMore(data.length === SIZE);
            }
        } catch (error) {
            console.error("알림 로딩 실패:", error);
        } finally {
            setIsLoading(false); // 로딩 끝
        }
    }, [userId, notifications.length, isLoading]);

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const handleRead = async (notiNo) => {
        await apiMarkAsRead(notiNo);
        setNotifications(prev => prev.map(n => n.notiNo === notiNo ? { ...n, isRead: 'Y' } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        if (!userId) return;
        try {
            await axios.put(`/dykj/api/notifications/read-all/${userId}`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: 'Y' })));
            setUnreadCount(0);
        } catch (error) {
            console.error("모두 읽음 실패:", error);
        }
    };

    return {
        notifications, unreadCount, hasMore,
        fetchNotifications, handleRead, handleMarkAllAsRead
    };
};