// src/hooks/useChat.js
import { useEffect, useState, useRef } from 'react';
import axios from 'axios'; // 1. 서버에 데이터를 요청하기 위한 도구 가져오기

const useChat = (userId) => {
    const [messages, setMessages] = useState([]); // 주고받은 메시지 목록
    const ws = useRef(null); // 웹소켓 연결 객체

    const fetchInitialMessages = async () => {
        try {
            // [수정 전] const response = await axios.get('http://localhost:8080/dykj/api/chat/list');
            // [수정 후] /dykj로 시작하면 Vite가 알아서 8080 서버로 연결해줍니다.
            const response = await axios.get('/dykj/api/chat/list');
            setMessages(response.data);
        } catch (error) {
            console.error("기존 메시지 로드 실패:", error);
        }
    };

    // 2. 웹소켓 서버 연결 (WS)
    useEffect(() => {
        fetchInitialMessages();

        // [수정 전] const WEB_SOCKET_URL = "ws://localhost:8080/dykj/ws-chat";
        // [수정 후] 프록시 설정을 통해 상대 경로로 접속이 가능해집니다.
        const WEB_SOCKET_URL = `ws://${window.location.host}/dykj/ws-chat`;

        ws.current = new WebSocket(WEB_SOCKET_URL);

        ws.current.onopen = () => {
            console.log("✅ 채팅 서버에 연결되었습니다!");
        };

        ws.current.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data);
            // 실시간으로 오는 메시지는 기존 목록 뒤에 차곡차곡 추가
            setMessages((prev) => [...prev, receivedMessage]);
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const sendMessage = (text) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const messageObj = {
                userId: userId,
                chatContent: text,
            };
            ws.current.send(JSON.stringify(messageObj));
        } else {
            console.log("❌ 서버와 연결되지 않았습니다.");
        }
    };

    return { messages, sendMessage };
};

export default useChat;