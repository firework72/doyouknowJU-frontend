import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ notification, onRead }) => {
    const { notiNo, message, createAt, isRead, notiUrl } = notification;
    const navigate = useNavigate();

    // 알림 클릭 시 실행되는 함수
    const handleClick = () => {
        // 1. 서버에 읽음 상태 업데이트 요청
        onRead(notiNo);

        // 2. 알림에 저장된 URL(예: /stock/005930)로 이동
        if (notiUrl) {
            navigate(notiUrl);
        }
    };

    // 시간 계산 함수 (방금 전, N분 전 등)
    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;

        const seconds = Math.floor(diffInMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return `${past.getFullYear()}. ${String(past.getMonth() + 1).padStart(2, '0')}. ${String(past.getDate()).padStart(2, '0')}`;
    };

    // 메시지 디자인 파싱
    const stockMatch = message.match(/\[(.*?)\]/);
    const rateMatch = message.match(/([\d.]+%)/);
    const isUp = message.includes('상승');

    return (
        <li
            onClick={handleClick} // 수정된 클릭 핸들러 연결
            style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f5f5f5',
                cursor: 'pointer',
                backgroundColor: isRead === 'N' ? '#f0f7ff' : '#ffffff',
                transition: 'background-color 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                borderLeft: isRead === 'N' ? '4px solid #007bff' : '4px solid transparent'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isRead === 'N' ? '#f0f7ff' : '#ffffff')}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.4' }}>
                    {stockMatch && <strong style={{ color: '#007bff' }}>{stockMatch[0]} </strong>}
                    종목이 전일 대비
                    <span style={{ fontWeight: 'bold', color: isUp ? '#ff4d4f' : '#1890ff', marginLeft: '4px' }}>
                        {rateMatch ? rateMatch[0] : ''} {isUp ? '상승' : '하락'}
                    </span> 중!
                </div>
                {isRead === 'N' && (
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#007bff', borderRadius: '50%', marginTop: '5px' }} />
                )}
            </div>

            <span style={{ fontSize: '11px', color: '#999' }}>
                {formatTimeAgo(createAt)}
            </span>
        </li>
    );
};

export default NotificationItem;