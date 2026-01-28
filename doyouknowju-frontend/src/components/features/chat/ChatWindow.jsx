import React, { useState, useEffect, useRef } from 'react';
import useChat from '../../../hooks/useChat';

const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', {
        hour: 'numeric', minute: '2-digit', hour12: true
    });
};

const ChatWindow = () => {
    const myId = "testUser1";
    const { messages, sendMessage } = useChat(myId);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // 1. 상태 관리: 위치 및 크기
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [dimensions, setDimensions] = useState({ width: 350, height: 500 });

    // 2. 드래그 및 리사이즈 상태
    const [isDragging, setIsDragging] = useState(false);
    const [resizeType, setResizeType] = useState(null);
    const [rel, setRel] = useState({ x: 0, y: 0 });

    // --- [추가] 도배 방지 상태 변수 ---
    const [isCooldown, setIsCooldown] = useState(false); // 대기 중인지 여부
    const [remainingTime, setRemainingTime] = useState(0); // 남은 대기 시간

    const baseFontSize = Math.max(12, dimensions.width / 28);
    const titleFontSize = baseFontSize + 4;
    const timeFontSize = Math.max(9, baseFontSize - 3);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // --- [추가] 타이머 관리 로직 ---
    useEffect(() => {
        let timer;
        if (isCooldown && remainingTime > 0) {
            timer = setInterval(() => {
                setRemainingTime((prev) => prev - 1);
            }, 1000);
        } else if (remainingTime === 0) {
            setIsCooldown(false);
        }
        return () => clearInterval(timer);
    }, [isCooldown, remainingTime]);

    const onMouseDownDrag = (e) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        const box = e.currentTarget.parentElement.getBoundingClientRect();
        setRel({ x: e.pageX - box.left, y: e.pageY - box.top });
        e.stopPropagation();
    };

    const onMouseDownResize = (e, type) => {
        if (e.button !== 0) return;
        setResizeType(type);
        setRel({ x: e.pageX, y: e.pageY });
        e.stopPropagation();
        e.preventDefault();
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (isDragging) {
                const newPosX = window.innerWidth - e.pageX + rel.x - dimensions.width;
                const newPosY = window.innerHeight - e.pageY + rel.y - dimensions.height;
                setPosition({
                    x: Math.max(0, Math.min(newPosX, window.innerWidth - dimensions.width)),
                    y: Math.max(0, Math.min(newPosY, window.innerHeight - dimensions.height))
                });
            } else if (resizeType) {
                const dx = e.pageX - rel.x;
                const dy = e.pageY - rel.y;
                let newWidth = dimensions.width;
                let newHeight = dimensions.height;
                let newPosX = position.x;
                let newPosY = position.y;

                if (resizeType.includes('n')) newHeight -= dy;
                if (resizeType.includes('s')) { newHeight += dy; newPosY -= dy; }
                if (resizeType.includes('w')) newWidth -= dx;
                if (resizeType.includes('e')) { newWidth += dx; newPosX -= dx; }

                if (newWidth >= 300 && newWidth <= window.innerWidth - 40) {
                    setDimensions(prev => ({ ...prev, width: newWidth }));
                    setPosition(prev => ({ ...prev, x: Math.max(0, newPosX) }));
                }
                if (newHeight >= 400 && newHeight <= window.innerHeight - 40) {
                    setDimensions(prev => ({ ...prev, height: newHeight }));
                    setPosition(prev => ({ ...prev, y: Math.max(0, newPosY) }));
                }
                setRel({ x: e.pageX, y: e.pageY });
            }
        };

        const onMouseUp = () => {
            setIsDragging(false);
            setResizeType(null);
        };

        if (isDragging || resizeType) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging, resizeType, rel, dimensions, position]);

    const handleSend = () => {
        // --- [수정] 도배 방지 체크 추가 ---
        if (inputValue.trim() === "" || isCooldown) return;

        sendMessage(inputValue);
        setInputValue("");

        // 대기 시간 시작 (10초)
        setIsCooldown(true);
        setRemainingTime(10);
    };

    return (
        <>
            {isOpen ? (
                <div style={{
                    position: 'fixed', bottom: `${position.y}px`, right: `${position.x}px`,
                    width: `${dimensions.width}px`, height: `${dimensions.height}px`,
                    border: '1px solid #ccc', backgroundColor: 'white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderRadius: '10px',
                    display: 'flex', flexDirection: 'column', zIndex: 1000,
                    transition: (isDragging || resizeType) ? 'none' : 'all 0.1s'
                }}>
                    {/* 리사이즈 핸들 4개 */}
                    <div onMouseDown={(e) => onMouseDownResize(e, 'nw')} style={{ position: 'absolute', top: 0, left: 0, width: '15px', height: '15px', cursor: 'nw-resize', zIndex: 1001 }} />
                    <div onMouseDown={(e) => onMouseDownResize(e, 'ne')} style={{ position: 'absolute', top: 0, right: 0, width: '15px', height: '15px', cursor: 'ne-resize', zIndex: 1001 }} />
                    <div onMouseDown={(e) => onMouseDownResize(e, 'sw')} style={{ position: 'absolute', bottom: 0, left: 0, width: '15px', height: '15px', cursor: 'sw-resize', zIndex: 1001 }} />
                    <div onMouseDown={(e) => onMouseDownResize(e, 'se')} style={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', cursor: 'se-resize', zIndex: 1001 }} />

                    {/* 헤더 */}
                    <div onMouseDown={onMouseDownDrag} style={{
                        padding: '10px 15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee',
                        display: 'flex', justifycontent: 'space-between', alignItems: 'center',
                        borderRadius: '10px 10px 0 0', cursor: 'move', userSelect: 'none'
                    }}>
                        <h3 style={{ margin: 0, fontSize: `${titleFontSize}px` }}>📈 주식 토론방</h3>
                        <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: `${titleFontSize}px` }}>✖</button>
                    </div>

                    {/* 채팅 내역 */}
                    <div style={{ flex: 1, overflowY: 'scroll', padding: '15px' }}>
                        {Array.isArray(messages) && messages.map((msg, index) => (
                            <div key={index} style={{ marginBottom: '15px', textAlign: msg.userId === myId ? 'right' : 'left' }}>
                                <div style={{ fontSize: `${timeFontSize}px`, color: '#888', marginBottom: '4px' }}>{msg.userId}</div>
                                <div style={{ display: 'flex', flexDirection: msg.userId === myId ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '5px' }}>
                                    <div style={{
                                        display: 'inline-block', padding: '8px 12px', borderRadius: '10px',
                                        backgroundColor: msg.userId === myId ? '#e3f2fd' : '#f5f5f5', maxWidth: '70%', textAlign: 'left',
                                        fontSize: `${baseFontSize}px`, lineHeight: '1.4'
                                    }}>{msg.chatContent}</div>
                                    <span style={{ fontSize: `${timeFontSize}px`, color: '#aaa' }}>{formatTime(msg.sendTime)}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 입력 영역 (대기 시간 적용) */}
                    <div style={{ padding: '10px', display: 'flex', borderTop: '1px solid #eee', backgroundColor: isCooldown ? '#f9f9f9' : 'white' }}>
                        <input
                            type="text" value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isCooldown} // 대기 중일 때 입력창 잠금
                            placeholder={isCooldown ? `${remainingTime}초 뒤에 입력 가능` : "메시지 입력..."}
                            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: `${baseFontSize}px`, backgroundColor: isCooldown ? '#eee' : 'white' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isCooldown} // 대기 중일 때 버튼 잠금
                            style={{
                                marginLeft: '5px', padding: '8px 15px',
                                backgroundColor: isCooldown ? '#ccc' : '#007bff',
                                color: 'white', border: 'none', borderRadius: '4px',
                                fontSize: `${baseFontSize}px`,
                                cursor: isCooldown ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isCooldown ? `${remainingTime}s` : '전송'}
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} style={{
                    position: 'fixed', bottom: '20px', right: '20px', width: '55px', height: '55px', borderRadius: '50%',
                    backgroundColor: '#007bff', color: 'white', border: 'none', fontSize: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>💬</button>
            )}
        </>
    );
};

export default ChatWindow;