import React, { useState, useEffect, useRef } from 'react';
import useChat from '../../../hooks/useChat';
import axios from 'axios';
import { useAuth } from '@/hooks/AuthContext';
import { titleApi, getImageUrl } from '../../../api/game/titleApi';

const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const ChatWindow = () => {
    const { user } = useAuth(); //
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

    const [showSearch, setShowSearch] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [matches, setMatches] = useState([]);
    const [matchIdx, setMatchIdx] = useState(0);
    const searchInputRef = useRef(null);

    // 유저별 칭호 정보를 저장할 상태
    const [userTitlesMap, setUserTitlesMap] = useState({});

    // [추가] 가입일 기준 7일 경과 여부 계산 로직 (한국식: 가입일 = 1일차)
    const getChatPermission = () => {
        if (!user || !user.enrollDate) return { canChat: false, diffDays: 0 };
        if (user.userRole === 'ADMIN') return { canChat: true, diffDays: 999 };

        const enrollDate = new Date(user.enrollDate);
        const today = new Date();
        // 시간 차이를 일 단위로 변환 후 +1 (당일 1일차)
        const diffTime = Math.abs(today - enrollDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return {
            canChat: diffDays >= 7,
            diffDays: diffDays
        };
    };

    const { canChat, diffDays } = getChatPermission();

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
    // const titleFontSize = baseFontSize + 4; // 사용되지 않아 주석 처리
    const timeFontSize = Math.max(9, baseFontSize - 3);

    const handleScroll = async (e) => {
        const { scrollTop, scrollHeight } = e.currentTarget;
        if (scrollTop === 0 && hasMore && !loading) {
            const firstMsgId = messages[0]?.chatId;
            const beforeHeight = scrollHeight;
            const count = await fetchMessages(firstMsgId);
            if (count > 0) {
                setTimeout(() => {
                    if (scrollContainerRef.current) {
                        const afterHeight = scrollContainerRef.current.scrollHeight;
                        scrollContainerRef.current.scrollTop = afterHeight - beforeHeight;
                    }
                }, 0);
            }
        }
    };

    // 메시지 목록이 업데이트될 때마다 칭호 정보가 없는 유저들을 확인하여 일괄 조회
    useEffect(() => {
        if (!messages || messages.length === 0) return;

        const missingUserIds = new Set();
        messages.forEach(msg => {
            // 시스템, 봇 제외
            if (msg.userId === '시스템🤖' || msg.userId === '주식봇🤖') return;

            // 이미 맵에 정보가 있거나, 메시지 자체에 정보가 있으면 패스
            // 하지만 메시지 자체 정보(실시간)를 우선으로 하되, 
            // 히스토리 메시지(정보 없음)는 맵에서 확인해야 함.
            // 맵에 없으면 조회 대상
            if (!userTitlesMap[msg.userId] && !msg.userTitle) {
                missingUserIds.add(msg.userId);
            }
        });

        if (missingUserIds.size > 0) {
            titleApi.getEquippedTitlesList(Array.from(missingUserIds))
                .then(titleList => {
                    setUserTitlesMap(prev => {
                        const newMap = { ...prev };
                        if (titleList && titleList.length > 0) {
                            titleList.forEach(title => {
                                if (title.userId) {
                                    newMap[title.userId] = {
                                        titleName: title.titleName,
                                        titleImgUrl: title.titleImgUrl,
                                        titleColor: title.titleColor
                                    };
                                }
                            });
                        }
                        // 조회했으나 칭호가 없는 유저도 있을 수 있음 (빈 객체라도 넣어 중복 조회 방지 가능하지만 일단 생략)
                        return newMap;
                    });
                })
                .catch(err => console.error("칭호 정보 조회 실패:", err));
        }
    }, [messages]); // messages 의존성 경고 무시 가능 혹은 messages 변경 시마다 실행

    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            }, 50);
        }
    }, [isOpen]);

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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
                if (isOpen) {
                    e.preventDefault();
                    setShowSearch(prev => !prev);
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (!keyword.trim()) {
            setMatches([]);
            return;
        }
        const found = messages.map((m, i) =>
            m.chatContent.toLowerCase().includes(keyword.toLowerCase()) ? i : -1
        ).filter(i => i !== -1);
        setMatches(found);
        setMatchIdx(0);
    }, [keyword, messages]);

    useEffect(() => {
        if (matches.length > 0 && matches[matchIdx] !== undefined) {
            const targetElement = document.getElementById(`msg-${matches[matchIdx]}`);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [matchIdx, matches]);

    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && isOpen) setIsOpen(false);
        };
        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isOpen]);

    const handleInputChange = (e) => {
        const text = e.target.value;
        if (new TextEncoder().encode(text).length <= 500) {
            setInputValue(text);
        }
    };

    const handleSend = () => {
        if (inputValue.trim() === "" || isCooldown || !canChat) return;
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

    const getDisplayTitleInfo = (msg) => {
        // 1. 메시지 자체에 정보가 있으면 우선 사용 (실시간 메시지)
        if (msg.userTitle || msg.userTitleImgUrl) {
            return {
                titleName: msg.userTitle,
                titleImgUrl: msg.userTitleImgUrl,
                titleColor: msg.userTitleColor
            };
        }
        // 2. 없으면 맵에서 조회 (히스토리 메시지)
        return userTitlesMap[msg.userId] || null;
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
                        <h3 style={{ margin: 0, fontSize: `${baseFontSize + 4}px` }}>📈 주식 토론방</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onMouseDown={(e) => e.stopPropagation()} onClick={() => { setShowSearch(prev => !prev); setTimeout(() => searchInputRef.current?.focus(), 100); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }} title="검색 (Ctrl+F)">🔍</button>
                            <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✖</button>
                        </div>
                    </div>

                    {showSearch && (
                        <div style={{ padding: '8px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', gap: '5px', borderBottom: '1px solid #ddd' }}>
                            <input ref={searchInputRef} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="검색어 입력..." style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }} />
                            <span style={{ fontSize: '12px', color: '#666', minWidth: '40px', textAlign: 'center' }}>{matches.length > 0 ? `${matchIdx + 1}/${matches.length}` : '0/0'}</span>
                            <button onClick={() => setMatchIdx(prev => (prev - 1 + matches.length) % matches.length)} style={{ cursor: 'pointer', border: 'none', background: 'none' }}>⬆️</button>
                            <button onClick={() => setMatchIdx(prev => (prev + 1) % matches.length)} style={{ cursor: 'pointer', border: 'none', background: 'none' }}>⬇️</button>
                            <button onClick={() => { setShowSearch(false); setKeyword(""); }} style={{ cursor: 'pointer', border: 'none', background: 'none' }}>✖</button>
                        </div>
                    )}

                    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div ref={scrollContainerRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'scroll', padding: '15px' }}>
                            {loading && <div style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>불러오는 중...</div>}
                            {Array.isArray(messages) && messages.map((msg, idx) => {
                                const titleInfo = getDisplayTitleInfo(msg);
                                return (
                                    <div id={`msg-${idx}`} key={idx} style={{ marginBottom: '15px', textAlign: msg.userId === myId ? 'right' : 'left' }}>
                                        <div style={{ fontSize: `${timeFontSize}px`, color: '#888', display: 'flex', alignItems: 'center', justifyContent: msg.userId === myId ? 'flex-end' : 'flex-start', gap: '5px' }}>
                                            {/* 칭호 이미지 표시 (우선) */}
                                            {titleInfo && titleInfo.titleImgUrl ? (
                                                <img
                                                    src={getImageUrl(titleInfo.titleImgUrl)}
                                                    alt={titleInfo.titleName || "칭호"}
                                                    style={{ height: '20px', verticalAlign: 'middle' }}
                                                    title={titleInfo.titleName}
                                                />
                                            ) : (
                                                /* 이미지가 없는데 텍스트가 있으면 텍스트 표시 (혹은 이미지 로드 실패 시) */
                                                titleInfo && titleInfo.titleName && (
                                                    <span style={{
                                                        fontWeight: 'bold',
                                                        color: titleInfo.titleColor || '#007bff'
                                                    }}>
                                                        [{titleInfo.titleName}]
                                                    </span>
                                                )
                                            )}
                                            <span>{msg.userId}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: msg.userId === myId ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '5px' }}>
                                            <div style={{
                                                padding: '8px 12px', borderRadius: '10px',
                                                backgroundColor: msg.userId === myId ? '#e3f2fd' : (msg.userId === '주식봇🤖' ? '#fff9c4' : '#f5f5f5'),
                                                fontSize: `${baseFontSize}px`,
                                                border: msg.userId === '주식봇🤖' ? '1px solid #ffe082' : 'none',
                                                wordBreak: 'break-all',
                                            }}>
                                                {highlightText(msg.chatContent, keyword)}
                                            </div>
                                            {msg.userId !== myId && msg.userId !== '주식봇🤖' && (
                                                <button onClick={() => setReportModal({ isOpen: true, targetMsg: msg })} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🚨</button>
                                            )}
                                            <span style={{ fontSize: `${timeFontSize}px`, color: '#aaa' }}>{formatTime(msg.sendTime)}</span>
                                        </div>
                                    </div>
                                )
                            })}
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
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isCooldown || !canChat}
                            placeholder={
                                !canChat
                                    ? `가입 7일 후 가능 (현재 ${diffDays}일차)`
                                    : (isCooldown ? `${remainingTime}s 대기` : "입력...")
                            }
                            style={{ flex: 1, padding: '8px', fontSize: `${baseFontSize}px` }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isCooldown || !canChat}
                            style={{
                                marginLeft: '5px', padding: '8px 15px',
                                backgroundColor: (isCooldown || !canChat) ? '#ccc' : '#007bff',
                                color: 'white', border: 'none', borderRadius: '4px',
                                cursor: (isCooldown || !canChat) ? 'default' : 'pointer'
                            }}
                        >
                            {isCooldown ? `${remainingTime}s` : '전송'}
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} style={{ position: 'fixed', bottom: '20px', right: '20px', width: '55px', height: '55px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', zIndex: 1000 }}>💬</button>
            )}
        </>
    );
};

export default ChatWindow;