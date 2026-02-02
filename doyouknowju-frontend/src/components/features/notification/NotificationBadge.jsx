import React from 'react';

// [설명] 안 읽은 알림 개수(count)를 빨간색 뱃지로 보여주는 컴포넌트입니다.
const NotificationBadge = ({ count }) => {
    // 0개 이하면 아무것도 표시하지 않음
    if (count <= 0) return null;
    return (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {count > 99 ? '99+' : count} {/* 99개 넘으면 99+로 표시 */}
        </span>
    );
};
export default NotificationBadge;
