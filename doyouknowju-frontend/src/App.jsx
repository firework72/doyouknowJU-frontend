import { useState } from 'react'
import ComponentsTestPage from './pages/ComponentsTestPage'
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Header from './components/layout/Header';
import AppRoutes from './routes/AppRoutes';
import ChatWindow from './components/features/chat/ChatWindow';
import { AuthProvider } from './hooks/authContext';
import StockTop10View from './front/StockView';

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Header logoSrc="" />
          <AppRoutes />
          <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            <ChatWindow />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App;