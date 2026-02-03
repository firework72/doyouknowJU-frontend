import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, onRead, onLoadMore, hasMore, onMarkAllAsRead, isLoading }) => {

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (hasMore && scrollHeight - scrollTop <= clientHeight + 20) {
            onLoadMore(true);
        }
    };

    if (!notifications || notifications.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '300px' }}>
                새로운 알림이 없습니다.
            </div>
        );
    }

    return (
        <div
            onScroll={handleScroll}
            style={{
                width: '320px',
                maxHeight: '400px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #eee'
            }}
        >
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#333',
                backgroundColor: '#fafafa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>알림 센터</span>
                {/* [추가] 모두 읽음 버튼 */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // 부모 클릭 이벤트 방지
                        onMarkAllAsRead();
                    }}
                    style={{
                        fontSize: '12px',
                        color: '#007bff',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#eef6ff'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    모두 읽음
                </button>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notifications.map((noti, idx) => (
                    <NotificationItem key={noti.notiNo || idx} notification={noti} onRead={onRead} />
                ))}
            </ul>
            {hasMore && isLoading && (
                <div style={{
                    padding: '10px',
                    textAlign: 'center', fontSize: '12px', color: '#999'
                }}>
                    더 불러오는 중...
                </div>
            )}
        </div>
    );
};

export default NotificationList;