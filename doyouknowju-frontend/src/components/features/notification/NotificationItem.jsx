import React from 'react';

const NotificationItem = ({ notification, onRead }) => {
    const { notiNo, message, createAt, isRead } = notification;

    // 날짜 포맷 (예: 2026. 02. 02)
    const date = new Date(createAt);
    const dateStr = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;

    // 메시지에서 종목코드와 변동률 분리 (정규식 활용)
    const stockMatch = message.match(/\[(.*?)\]/); // [005930] 추출
    const rateMatch = message.match(/([\d.]+%)/); // 125.60% 추출
    const isUp = message.includes('상승');

    return (
        <li
            onClick={() => onRead(notiNo)}
            style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f5f5f5',
                cursor: 'pointer',
                backgroundColor: isRead === 'N' ? '#f0f7ff' : '#ffffff',
                transition: 'background-color 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isRead === 'N' ? '#f0f7ff' : '#ffffff')}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.4' }}>
                    {stockMatch && <strong style={{ color: '#007bff' }}>{stockMatch[0]} </strong>}
                    종목이 평단가 대비
                    <span style={{ fontWeight: 'bold', color: isUp ? '#ff4d4f' : '#1890ff', marginLeft: '4px' }}>
                        {rateMatch ? rateMatch[0] : ''} {isUp ? '상승' : '하락'}
                    </span> 중입니다!
                </div>
                {isRead === 'N' && (
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#007bff', borderRadius: '50%', marginTop: '5px' }} />
                )}
            </div>
            <span style={{ fontSize: '11px', color: '#999' }}>{dateStr}</span>
        </li>
    );
};

export default NotificationItem;