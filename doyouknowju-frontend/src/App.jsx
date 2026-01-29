// App.jsx
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Header from './components/layout/Header';
import AppRoutes from './routes/AppRoutes';
import ChatWindow from './components/features/chat/ChatWindow';
import { AuthProvider, useAuth } from '@/hooks/AuthContext';

const ChatContainer = () => {
  const { user, loading } = useAuth();
  // 로그인 안 되어 있으면 아무것도 안 보여줌
  if (loading || !user) return null;

  // [수정] 감싸는 div를 없애고 ChatWindow가 직접 위치를 잡게 합니다.
  return <ChatWindow />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header logoSrc="" />
        <AppRoutes />
        {/* 로그인 체크 후 채팅창 렌더링 */}
        <ChatContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;