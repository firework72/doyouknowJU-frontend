import React, { useState, useEffect, useRef } from 'react'; // 1. 중복 import 정리 및 useRef 추가
import useChat from '../../../hooks/useChat';

// 시간 형식을 "오후 2:30" 형태로 변환하는 함수
const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

const ChatWindow = () => {
    const myId = "testUser1";
    const { messages, sendMessage } = useChat(myId);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // 2. 자동 스크롤을 위한 '깃발(Ref)' 생성
    const messagesEndRef = useRef(null);

    // 3. 메시지가 추가될 때마다 스크롤을 맨 아래로 내리는 로직
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]); // messages 데이터가 변경될 때마다 실행

    const handleSend = () => {
        if (inputValue.trim() === "") return;
        sendMessage(inputValue);
        setInputValue("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {isOpen ? (
                <div style={{
                    position: 'fixed', bottom: '80px', right: '20px', // 위치 고정 추가
                    border: '1px solid #ccc',
                    width: '350px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000
                }}>
                    {/* 헤더 영역 */}
                    <div style={{
                        padding: '10px 15px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: '10px 10px 0 0'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>📈 주식 토론방</h3>
                        <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>✖</button>
                    </div>

                    {/* 채팅 내역 영역 */}
                    <div style={{ height: '350px', overflowY: 'scroll', padding: '15px' }}>
                        {Array.isArray(messages) && messages.map((msg, index) => (
                            <div key={index} style={{ marginBottom: '15px', textAlign: msg.userId === myId ? 'right' : 'left' }}>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{msg.userId}</div>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: msg.userId === myId ? 'row-reverse' : 'row',
                                    alignItems: 'flex-end',
                                    gap: '5px'
                                }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        backgroundColor: msg.userId === myId ? '#e3f2fd' : '#f5f5f5',
                                        maxWidth: '70%',
                                        textAlign: 'left'
                                    }}>
                                        {msg.chatContent}
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#aaa', marginBottom: '2px' }}>
                                        {formatTime(msg.sendTime)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {/* 4. 스크롤 도착 지점 (보이지 않는 요소) */}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 입력 영역 */}
                    <div style={{ padding: '10px', display: 'flex', borderTop: '1px solid #eee' }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지 입력..."
                            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <button onClick={handleSend} style={{ marginLeft: '5px', padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            전송
                        </button>
                    </div>
                </div>
            ) : (
                /* 플로팅 버튼 */
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed', bottom: '20px', right: '20px',
                        width: '55px', height: '55px', borderRadius: '50%',
                        backgroundColor: '#007bff', color: 'white', border: 'none',
                        fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}
                >
                    💬
                </button>
            )}
        </>
    );
};

export default ChatWindow;