import React from 'react';

const NotificationItem = ({ notification, onRead }) => {
    const { notiNo, message, createAt, isRead, notiUrl } = notification;

    // 날짜 포맷 (예: 2024. 2. 2.)
    const dateStr = new Date(createAt).toLocaleDateString();

    return (
        <li
            // 안 읽음(N)이면 파란 배경, 읽음(Y)이면 흰 배경 적용
            className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${isRead === 'N' ? 'bg-blue-50' : 'bg-white'}`}
            // 클릭 시 부모(List -> Hook)에서 전달받은 onRead 함수 실행
            onClick={() => onRead(notiNo)}
        >
            <div className="flex justify-between items-start">
                <p className={`text-sm ${isRead === 'N' ? 'font-bold text-black' : 'text-gray-600'}`}>
                    {message}
                </p>
                {/* 안 읽었으면 파란 점 표시 */}
                {isRead === 'N' && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>}
            </div>
            <span className="text-xs text-gray-400 mt-1 block">{dateStr}</span>
        </li>
    );
};
export default NotificationItem;
