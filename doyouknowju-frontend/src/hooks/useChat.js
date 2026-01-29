// src/hooks/useChat.js
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const useChat = (userId) => {
    const [messages, setMessages] = useState([]);
    const [hasMore, setHasMore] = useState(true); // 더 가져올 데이터가 있는지 확인
    const [loading, setLoading] = useState(false); // 중복 요청 방지
    const ws = useRef(null);

    // 메시지 로드 함수 (lastChatId가 있으면 페이징 처리)
    const fetchMessages = async (lastChatId = null) => {
        if (loading || (!hasMore && lastChatId !== null)) return 0;

        setLoading(true);
        try {
            const limit = lastChatId ? 50 : 100; // 처음엔 100개, 이후엔 50개씩
            const response = await axios.get('/dykj/api/chat/list', {
                params: { lastChatId, limit }
            });

            // 서버에서 DESC(최신순)로 오기 때문에 프론트 출력용으로 reverse()
            const newMessages = response.data.reverse();

            if (newMessages.length < limit) {
                setHasMore(false); // 가져온 개수가 limit보다 적으면 더 이상 데이터 없음
            }

            if (lastChatId) {
                // 이전 대화 추가: 기존 메시지 '앞에' 붙임
                setMessages((prev) => [...newMessages, ...prev]);
            } else {
                // 첫 로드: 메시지 리스트 초기화
                setMessages(newMessages);
            }

            setLoading(false);
            return newMessages.length; // 몇 개 가져왔는지 반환
        } catch (error) {
            console.error("메시지 로드 실패:", error);
            setLoading(false);
            return 0;
        }
    };

    useEffect(() => {
        fetchMessages(); // 최초 100개 로드

        const WEB_SOCKET_URL = `ws://${window.location.host}/dykj/ws-chat`;
        ws.current = new WebSocket(WEB_SOCKET_URL);

        ws.current.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data);
            // 실시간 메시지는 무조건 맨 뒤에 추가
            setMessages((prev) => [...prev, receivedMessage]);
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const sendMessage = (text) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const messageObj = { userId, chatContent: text };
            ws.current.send(JSON.stringify(messageObj));
        }
    };

    return { messages, sendMessage, fetchMessages, hasMore, loading };
};

export default useChat;