import { useState } from 'react'
import ComponentsTestPage from './pages/ComponentsTestPage'
import StockView from './front/StockView'
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Header from './components/layout/Header';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <>
        <BrowserRouter>
        <Header logoSrc="" />
        <AppRoutes />
        <StockView />
        </BrowserRouter>
    </>
    )
}

export default App;