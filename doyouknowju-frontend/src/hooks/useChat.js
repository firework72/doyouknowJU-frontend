// src/hooks/useChat.js
import { useEffect, useState, useRef } from 'react';

const useChat = (userId) => {
    const [messages, setMessages] = useState([]); // 주고받은 메시지 목록
    const ws = useRef(null); // 웹소켓 연결 객체 (통화 연결선)

    useEffect(() => {
        // 1. 웹소켓 서버 주소 (백엔드 WebSocketConfig에서 설정한 주소)
        // 주의: http가 아니라 ws를 씁니다. context path(/dykj)도 꼭 넣어야 해요.
        const WEB_SOCKET_URL = "ws://localhost:8080/dykj/ws-chat";

        // 2. 서버 연결 시도
        ws.current = new WebSocket(WEB_SOCKET_URL);

        // 3. 연결 성공 시 실행
        ws.current.onopen = () => {
            console.log("✅ 채팅 서버에 연결되었습니다!");
        };

        // 4. 메시지를 받았을 때 실행 (서버 -> 나)
        ws.current.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data); // JSON 문자열을 객체로 변환
            // 기존 메시지 목록에 새 메시지 추가
            setMessages((prev) => [...prev, receivedMessage]);
        };

        // 5. 컴포넌트가 꺼질 때 연결 끊기 (청소)
        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    // 6. 메시지 보내기 함수 (나 -> 서버)
    const sendMessage = (text) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const messageObj = {
                userId: userId,       // 누가
                chatContent: text,    // 무슨 말을 (VO 필드명과 일치해야 함!)
            };
            ws.current.send(JSON.stringify(messageObj)); // 서버로 전송
        } else {
            console.log("❌ 서버와 연결되지 않았습니다.");
        }
    };

    return { messages, sendMessage };
};

export default useChat;