// src/components/features/chat/ChatWindow.jsx
import React, { useState } from 'react';
import useChat from '../../../hooks/useChat';

const ChatWindow = () => {
    const myId = "testUser1";
    const { messages, sendMessage } = useChat(myId);
    const [inputValue, setInputValue] = useState("");

    // 1. 채팅창이 열려있는지 닫혀있는지 관리하는 상태 (기본값: false - 닫힘)
    const [isOpen, setIsOpen] = useState(false);

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
            {/* 2. 조건부 렌더링: isOpen이 true일 때만 채팅창을 보여줌 */}
            {isOpen ? (
                <div style={{
                    border: '1px solid #ccc',
                    padding: '0',
                    width: '350px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* 채팅창 헤더 (제목 + 닫기 버튼) */}
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
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}
                        >
                            ✖
                        </button>
                    </div>

                    {/* 채팅 내역 영역 */}
                    <div style={{ height: '350px', overflowY: 'scroll', padding: '15px' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ marginBottom: '10px', textAlign: msg.userId === myId ? 'right' : 'left' }}>
                                <div style={{ fontSize: '12px', color: '#888' }}>{msg.userId}</div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    backgroundColor: msg.userId === myId ? '#e3f2fd' : '#f1f1f1',
                                    maxWidth: '80%'
                                }}>
                                    {msg.chatContent}
                                </div>
                            </div>
                        ))}
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
                /* 3. 닫혀있을 때 보여줄 '50원 크기'의 버튼 (플로팅 버튼) */
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '55px',
                        height: '55px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    title="채팅 열기"
                >
                    💬
                </button>
            )}
        </>
    );
};

export default ChatWindow;