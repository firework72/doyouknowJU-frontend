import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchStockSuggestions } from '../../api/stockApi';
import { useNotification } from '../../hooks/useNotification';
import NotificationBadge from '../features/notification/NotificationBadge';
import NotificationList from '../features/notification/NotificationList';
import { useAuth } from '@/hooks/AuthContext';
import './Header.css';

function Header({ logoSrc }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // [중요 수정] 훅에서 필요한 모든 기능을 꺼냅니다.
  const {
    notifications,
    unreadCount,
    handleRead,
    handleMarkAllAsRead,
    fetchNotifications,
    hasMore,
    isLoading
  } = useNotification(user ? user.userId : null);

  // [흰색 화면 해결] 상태 선언을 명확히 분리합니다.
  const [showNotiList, setShowNotiList] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        const results = await fetchStockSuggestions(query);
        if (Array.isArray(results)) {
          setSuggestions(results);
          setShowSuggestions(true);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e) => setQuery(e.target.value);
  const handleKeyDown = (e) => e.key === 'Enter' && handleSearchSubmit();
  const handleSearchSubmit = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (stock) => {
    const stockId = stock.code || stock.stockId || stock.id;
    navigate(`/stock/${stockId}`);
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo-link">
            {logoSrc ? <img src={logoSrc} alt="로고" className="logo-image" /> : <div className="logo-text">DYKJ</div>}
          </Link>
          <nav className="nav-menu">
            <Link to="/stock" className="nav-button">주식 페이지</Link>
            <Link to="/news" className="nav-button">뉴스 페이지</Link>
            <Link to="/board" className="nav-button">게시판 페이지</Link>
            <Link to="/mypage" className="nav-button">마이 페이지</Link>
          </nav>
        </div>

        <div className="header-right">
          <div className="search-box">
            <input type="text" placeholder="주식 검색창" className="search-input" value={query} onChange={handleInputChange} onKeyDown={handleKeyDown} />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="search-suggestions">
                {suggestions.map((item, index) => (
                  <li key={index} className="suggestion-item" onClick={() => handleSuggestionClick(item)}>
                    <span className="stock-name">{item.name || item.stockName}</span>
                    <span className="stock-code">{item.mksc_shrn_iscd || item.stockId || item.code || item.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {user && (
            <div
              className="notification-container"
              onClick={() => setShowNotiList(!showNotiList)}
              style={{ display: 'flex', alignItems: 'center', marginLeft: '15px', position: 'relative', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '24px' }}>🔔</span>
              <NotificationBadge count={unreadCount} />

              {showNotiList && (
                <div style={{ position: 'absolute', top: '100%', right: '0', zIndex: 1000 }}>
                  {/* [중요] List 컴포넌트에 모든 prop을 전달합니다. */}
                  <NotificationList
                    notifications={notifications}
                    onRead={handleRead}
                    onLoadMore={fetchNotifications}
                    hasMore={hasMore}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="header-line"></div>
    </header>
  );
}

export default Header;