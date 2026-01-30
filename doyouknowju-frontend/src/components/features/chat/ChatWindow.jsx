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

    // [추가] 검색 관련 상태 변수 (Ctrl+F)
    const [showSearch, setShowSearch] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [matches, setMatches] = useState([]);
    const [matchIdx, setMatchIdx] = useState(0);
    const searchInputRef = useRef(null);

    // [추가] 검색어 하이라이팅 함수
    const highlightText = (text, query) => {
        if (!query || query.trim() === "") return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} style={{ backgroundColor: '#ffeb3b', fontWeight: 'bold' }}>{part}</span>
                : part
        );
    };

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

    // [추가] 채팅창이 열릴 때(isOpen) 스크롤을 맨 아래로 초기화
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            }, 50);
        }
    }, [isOpen]);

    // [기존] 새 메시지 도착 시 스크롤 처리 (사용자가 하단을 보고 있을 때만 자동 스크롤)
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

    // [수정] Ctrl+F 단축키 감지 (채팅창이 열려있을 때만 가로채기)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
                // 채팅창이 열려있을(isOpen) 때만 가로채서 커스텀 검색창을 엽니다.
                if (isOpen) {
                    e.preventDefault(); // 브라우저 기본 검색 차단
                    setShowSearch(prev => !prev);
                    // 검색창이 열릴 때 포커스 주기
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                }
                // isOpen이 false(닫힘)라면 e.preventDefault()를 하지 않으므로
                // 브라우저 기본(웹사이트 전체 검색) 기능이 정상 작동합니다.
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // [추가] 검색어가 바뀔 때마다 일치하는 메시지 인덱스 찾기
    useEffect(() => {
        if (!keyword.trim()) {
            setMatches([]);
            return;
        }
        // 메시지 내용 중 검색어가 포함된 것들의 인덱스를 추출
        const found = messages.map((m, i) =>
            m.chatContent.toLowerCase().includes(keyword.toLowerCase()) ? i : -1
        ).filter(i => i !== -1);

        setMatches(found);
        setMatchIdx(0); // 검색어가 바뀌면 첫 번째 결과부터 다시 보여줌
    }, [keyword, messages]);

    // [추가] 검색 결과 이동 (화살표 클릭 시 해당 메시지로 스크롤)
    useEffect(() => {
        if (matches.length > 0 && matches[matchIdx] !== undefined) {
            const targetIndex = matches[matchIdx];
            const targetElement = document.getElementById(`msg-${targetIndex}`);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [matchIdx, matches, showSearch]);

    // [추가] ESC 키를 누르면 채팅창 닫기 (사용자 편의성 향상)
    useEffect(() => {
        const handleEscKey = (e) => {
            // 키보드의 'Escape' 키가 눌렸고, 현재 채팅창이 열려있다면(isOpen)
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false); // 채팅창을 닫습니다 (버튼으로 돌아감)
            }
        };

        // 이벤트 리스너 등록 (윈도우 전체에서 키 입력을 감시)
        window.addEventListener('keydown', handleEscKey);

        // [중요] 뒷정리(Cleanup): 컴포넌트가 사라지거나 재실행될 때 리스너를 지워줍니다.
        // 이걸 안 하면 메모리 누수가 생기거나, 닫힌 후에도 계속 감시하는 좀비 코드가 됩니다.
        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen]);

    // [추가] 바이트 수 계산 및 입력 제한 함수 (오라클 VARCHAR2(500) 대응)
    const handleInputChange = (e) => {
        const text = e.target.value;
        const byteSize = new TextEncoder().encode(text).length;

        // 500바이트를 넘지 않을 때만 입력 허용
        if (byteSize <= 500) {
            setInputValue(text);
        }
    };

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* [추가] 돋보기 아이콘 버튼 (Ctrl+F와 동일 기능) */}
                            <button
                                onMouseDown={(e) => e.stopPropagation()} // 드래그 방지
                                onClick={() => {
                                    setShowSearch(prev => !prev);
                                    setTimeout(() => searchInputRef.current?.focus(), 100);
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
                                title="검색 (Ctrl+F)"
                            >
                                🔍
                            </button>
                            <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✖</button>
                        </div>
                    </div>

                    {/* [추가] 검색창 UI (showSearch가 true일 때만 보임) */}
                    {showSearch && (
                        <div style={{ padding: '8px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', gap: '5px', borderBottom: '1px solid #ddd' }}>
                            <input
                                ref={searchInputRef}
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="대화 내용 검색 (Ctrl+F)"
                                style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                            />
                            <span style={{ fontSize: '12px', color: '#666', minWidth: '40px', textAlign: 'center' }}>
                                {matches.length > 0 ? `${matchIdx + 1}/${matches.length}` : '0/0'}
                            </span>
                            <button onClick={() => setMatchIdx(prev => (prev - 1 + matches.length) % matches.length)} style={{ cursor: 'pointer', border: 'none', background: 'none' }} title="이전 결과">⬆️</button>
                            <button onClick={() => setMatchIdx(prev => (prev + 1) % matches.length)} style={{ cursor: 'pointer', border: 'none', background: 'none' }} title="다음 결과">⬇️</button>
                            <button onClick={() => { setShowSearch(false); setKeyword(""); }} style={{ cursor: 'pointer', border: 'none', background: 'none' }} title="닫기">✖</button>
                        </div>
                    )}

                    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div ref={scrollContainerRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'scroll', padding: '15px' }}>
                            {loading && <div style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>불러오는 중...</div>}
                            {Array.isArray(messages) && messages.map((msg, idx) => (
                                <div id={`msg-${idx}`} key={idx} style={{ marginBottom: '15px', textAlign: msg.userId === myId ? 'right' : 'left' }}>
                                    <div style={{ fontSize: `${timeFontSize}px`, color: '#888' }}>{msg.userId}</div>
                                    <div style={{ display: 'flex', flexDirection: msg.userId === myId ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '5px' }}>
                                        {/* [수정] 주식봇일 경우 배경색을 노란색(#fff9c4)으로 변경 */}
                                        <div style={{
                                            padding: '8px 12px',
                                            borderRadius: '10px',
                                            backgroundColor: msg.userId === myId ? '#e3f2fd' : (msg.userId === '주식봇🤖' ? '#fff9c4' : '#f5f5f5'),
                                            fontSize: `${baseFontSize}px`,
                                            border: msg.userId === '주식봇🤖' ? '1px solid #ffe082' : 'none',
                                            // [추가] 긴 단어도 강제로 줄바꿈하여 말풍선 안에 가둡니다.
                                            wordBreak: 'break-all',

                                        }}>
                                            {/* [수정] 검색어 하이라이팅 적용 함수 호출 */}
                                            {highlightText(msg.chatContent, keyword)}
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
                        <input type="text" value={inputValue} onChange={handleInputChange} onKeyPress={(e) => e.key === 'Enter' && handleSend()} disabled={isCooldown} placeholder={isCooldown ? `${remainingTime}s 대기` : "입력..."} style={{ flex: 1, padding: '8px', fontSize: `${baseFontSize}px` }} />
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