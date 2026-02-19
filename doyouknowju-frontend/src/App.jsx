// App.jsx
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Header from './components/layout/Header';
import AppRoutes from './routes/AppRoutes';
import ChatWindow from './components/features/chat/ChatWindow';
import { AuthProvider, useAuth } from '@/hooks/AuthContext';
import BanNoticeModal from './components/features/member/BanNoticeModal';
import { useState, useEffect } from 'react';

const BanCheckContainer = () => {
  const { user, logout } = useAuth();
  const [showBanModal, setShowBanModal] = useState(false);

  useEffect(() => {
    if (user && user.banLimitDate) {
      setShowBanModal(true);
    }
  }, [user]);

  const handleBanConfirm = async () => {
    await logout();
    setShowBanModal(false);
    window.location.href = '/';
  };

  if (!user || !user.banLimitDate) return null;

  return (
    <BanNoticeModal
      isOpen={showBanModal}
      onClose={handleBanConfirm}
      banLimitDate={user.banLimitDate}
    />
  );
};

const ChatContainer = () => {
  const { user, loading } = useAuth();
  // 로그인 안 되어 있으면 아무것도 안 보여줌
  if (loading || !user) return null;
  // 정지된 회원이면 채팅창 안 보여줌
  if (user.banLimitDate) return null;

  // [수정] 감싸는 div를 없애고 ChatWindow가 직접 위치를 잡게 합니다.
  return <ChatWindow />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header logoSrc="" />
        <AppRoutes />
        <BanCheckContainer />
        {/* 로그인 체크 후 채팅창 렌더링 */}
        <ChatContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;