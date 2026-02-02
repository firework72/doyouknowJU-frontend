import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, onRead }) => {
    if (!notifications || notifications.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '300px' }}>
                새로운 알림이 없습니다.
            </div>
        );
    }

    return (
        <div style={{
            width: '320px',
            maxHeight: '400px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #eee'
        }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold', fontSize: '15px', color: '#333', backgroundColor: '#fafafa' }}>
                알림 센터
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, overflowY: 'auto' }}>
                {notifications.map((noti, idx) => (
                    <NotificationItem key={noti.notiNo || idx} notification={noti} onRead={onRead} />
                ))}
            </ul>
        </div>
    );
};

export default NotificationList;