import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, onRead, onLoadMore, hasMore }) => {

    // 스크롤 이벤트 핸들러
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // 바닥에서 20px 정도 남았을 때 추가 로딩 실행
        if (hasMore && scrollHeight - scrollTop <= clientHeight + 20) {
            onLoadMore(true);
        }
    };

    if (!notifications || notifications.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white' }}>알림이 없습니다.</div>;
    }

    return (
        <div
            onScroll={handleScroll}
            style={{
                width: '320px', maxHeight: '400px', backgroundColor: 'white',
                borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                overflowY: 'auto', display: 'flex', flexDirection: 'column', border: '1px solid #eee'
            }}
        >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                알림 센터
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notifications.map((noti, idx) => (
                    <NotificationItem key={noti.notiNo || idx} notification={noti} onRead={onRead} />
                ))}
            </ul>
            {hasMore && <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#999' }}>로딩 중...</div>}
        </div>
    );
};

export default NotificationList;