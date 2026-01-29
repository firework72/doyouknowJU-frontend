import React, { useState, useEffect, useRef } from 'react';
import useChat from '../../../hooks/useChat';
import axios from 'axios';
import { useAuth } from '@/hooks/AuthContext';

const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const ChatWindow = () => {
    const { user } = useAuth();
    const myId = user?.userId || "Guest";
    const { messages, sendMessage, fetchMessages, hasMore, loading } = useChat(myId);

    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const scrollContainerRef = useRef(null);
    const messagesEndRef = useRef(null);

    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [dimensions, setDimensions] = useState({ width: 350, height: 500 });
    const [isDragging, setIsDragging] = useState(false);
    const [resizeType, setResizeType] = useState(null);
    const [rel, setRel] = useState({ x: 0, y: 0 });

    const [isCooldown, setIsCooldown] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [reportModal, setReportModal] = useState({ isOpen: false, targetMsg: null });

    const baseFontSize = Math.max(12, dimensions.width / 28);
    const titleFontSize = baseFontSize + 4;
    const timeFontSize = Math.max(9, baseFontSize - 3);

    const handleScroll = async (e) => {
        const { scrollTop, scrollHeight } = e.currentTarget;
        if (scrollTop === 0 && hasMore && !loading) {
            const firstMsgId = messages[0]?.chatId;
            const beforeHeight = scrollHeight;
            const count = await fetchMessages(firstMsgId);
            if (count > 0) {
                setTimeout(() => {
                    const afterHeight = scrollContainerRef.current.scrollHeight;
                    scrollContainerRef.current.scrollTop = afterHeight - beforeHeight;
                }, 0);
            }
        }
    };

    useEffect(() => {
        if (!loading && messagesEndRef.current && scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            if (scrollHeight - scrollTop - clientHeight < 200) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, loading]);

    useEffect(() => {
        let timer;
        if (isCooldown && remainingTime > 0) {
            timer = setInterval(() => setRemainingTime(prev => prev - 1), 1000);
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
                let nw = dimensions.width, nh = dimensions.height, nx = position.x, ny = position.y;
                if (resizeType.includes('n')) nh -= dy;
                if (resizeType.includes('s')) { nh += dy; ny -= dy; }
                if (resizeType.includes('w')) nw -= dx;
                if (resizeType.includes('e')) { nw += dx; nx -= dx; }
                if (nw >= 300) { setDimensions(p => ({ ...p, width: nw })); setPosition(p => ({ ...p, x: Math.max(0, nx) })); }
                if (nh >= 400) { setDimensions(p => ({ ...p, height: nh })); setPosition(p => ({ ...p, y: Math.max(0, ny) })); }
                setRel({ x: e.pageX, y: e.pageY });
            }
        };
        const onMouseUp = () => { setIsDragging(false); setResizeType(null); };
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
        if (inputValue.trim() === "" || isCooldown) return;
        sendMessage(inputValue);
        setInputValue("");
        setIsCooldown(true);
        setRemainingTime(10);
    };

    const submitReport = async (reason) => {
        if (!window.confirm(`'${reason}' 사유로 신고하시겠습니까?`)) return;
        try {
            const res = await axios.post('/dykj/api/report/insert', {
                reportType: 'CHAT', contentId: reportModal.targetMsg.chatId,
                reporterId: myId, targetId: reportModal.targetMsg.userId, reportReason: reason
            });
            if (res.data === "success") {
                alert("신고가 접수되었습니다.");
                setReportModal({ isOpen: false, targetMsg: null });
            }
        } catch (e) { alert("서버 통신 실패"); }
    };

    return (
        <>
            {isOpen ? (
                <div style={{
                    position: 'fixed', bottom: `${position.y}px`, right: `${position.x}px`,
                    width: `${dimensions.width}px`, height: `${dimensions.height}px`,
                    border: '1px solid #ccc', backgroundColor: 'white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderRadius: '10px',
                    display: 'flex', flexDirection: 'column', zIndex: 1000
                }}>
                    <div onMouseDown={(e) => onMouseDownResize(e, 'nw')} style={{ position: 'absolute', top: 0, left: 0, width: '15px', height: '15px', cursor: 'nw-resize', zIndex: 1001 }} />
                    <div onMouseDown={(e) => onMouseDownResize(e, 'ne')} style={{ position: 'absolute', top: 0, right: 0, width: '15px', height: '15px', cursor: 'ne-resize', zIndex: 1001 }} />
                    <div onMouseDown={(e) => onMouseDownResize(e, 'sw')} style={{ position: 'absolute', bottom: 0, left: 0, width: '15px', height: '15px', cursor: 'sw-resize', zIndex: 1001 }} />
                    <div onMouseDown={(e) => onMouseDownResize(e, 'se')} style={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', cursor: 'se-resize', zIndex: 1001 }} />

                    <div onMouseDown={onMouseDownDrag} style={{ padding: '10px 15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'move', userSelect: 'none' }}>
                        <h3 style={{ margin: 0, fontSize: `${titleFontSize}px` }}>📈 주식 토론방</h3>
                        <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✖</button>
                    </div>

                    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div ref={scrollContainerRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'scroll', padding: '15px' }}>
                            {loading && <div style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>불러오는 중...</div>}
                            {Array.isArray(messages) && messages.map((msg, idx) => (
                                <div key={idx} style={{ marginBottom: '15px', textAlign: msg.userId === myId ? 'right' : 'left' }}>
                                    <div style={{ fontSize: `${timeFontSize}px`, color: '#888' }}>{msg.userId}</div>
                                    <div style={{ display: 'flex', flexDirection: msg.userId === myId ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '5px' }}>
                                        {/* [수정] 주식봇일 경우 배경색을 노란색(#fff9c4)으로 변경 */}
                                        <div style={{
                                            padding: '8px 12px',
                                            borderRadius: '10px',
                                            backgroundColor: msg.userId === myId ? '#e3f2fd' : (msg.userId === '주식봇🤖' ? '#fff9c4' : '#f5f5f5'),
                                            fontSize: `${baseFontSize}px`,
                                            border: msg.userId === '주식봇🤖' ? '1px solid #ffe082' : 'none'
                                        }}>
                                            {msg.chatContent}
                                        </div>
                                        {msg.userId !== myId && msg.userId !== '주식봇🤖' && (
                                            <button onClick={() => setReportModal({ isOpen: true, targetMsg: msg })} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🚨</button>
                                        )}
                                        <span style={{ fontSize: `${timeFontSize}px`, color: '#aaa' }}>{formatTime(msg.sendTime)}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {reportModal.isOpen && (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', backgroundColor: 'white', border: '2px solid #ff4d4f', borderRadius: '10px', padding: '15px', zIndex: 5000 }}>
                                {['욕설 및 비하', '도배', '광고', '기타'].map(r => (
                                    <button key={r} onClick={() => submitReport(r)} style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '5px' }}>{r}</button>
                                ))}
                                <button onClick={() => setReportModal({ isOpen: false })} style={{ width: '100%', padding: '8px', backgroundColor: '#eee' }}>취소</button>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '10px', display: 'flex', borderTop: '1px solid #eee' }}>
                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} disabled={isCooldown} placeholder={isCooldown ? `${remainingTime}s 대기` : "입력..."} style={{ flex: 1, padding: '8px', fontSize: `${baseFontSize}px` }} />
                        <button onClick={handleSend} disabled={isCooldown} style={{ marginLeft: '5px', padding: '8px 15px', backgroundColor: isCooldown ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{isCooldown ? `${remainingTime}s` : '전송'}</button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} style={{ position: 'fixed', bottom: '20px', right: '20px', width: '55px', height: '55px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', zIndex: 1000 }}>💬</button>
            )}
        </>
    );
};

export default ChatWindow;