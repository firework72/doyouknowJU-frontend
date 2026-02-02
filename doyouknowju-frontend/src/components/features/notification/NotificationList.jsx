import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, onRead }) => {
    // 알림이 없을 경우 안내 메시지 표시
    if (!notifications || notifications.length === 0) {
        return <div className="p-4 text-gray-500 text-center">알림이 없습니다.</div>;
    }

    // 알림이 있으면 목록(ul)으로 렌더링. 최대 높이(max-h-96)를 넘으면 스크롤 생성
    return (
        <div className="max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg w-80">
            <div className="p-3 border-b font-bold text-gray-700">알림 센터</div>
            <ul>
                {notifications.map(noti => (
                    <NotificationItem key={noti.notiNo} notification={noti} onRead={onRead} />
                ))}
            </ul>
        </div>
    );
};
export default NotificationList;
