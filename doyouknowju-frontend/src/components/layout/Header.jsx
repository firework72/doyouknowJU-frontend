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
  // 수정 후 (userId로 변경)
  const { notifications, unreadCount, handleRead } = useNotification(user ? user.userId : null); const [showNotiList, setShowNotiList] = useState(false);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        const results = await fetchStockSuggestions(query);
        if (Array.isArray(results)) {
          setSuggestions(results);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setQuery('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
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
        {/* 왼쪽: 로고 및 네비게이션 */}
        <div className="header-left">
          {/* 로고 이미지 */}
          <Link to="/" className="logo-link">
            {logoSrc ? (
              <img src={logoSrc} alt="로고" className="logo-image" />
            ) : (
              <div className="logo-text">DYKJ</div>
            )}
          </Link>

          {/* 네비게이션 메뉴 */}
          <nav className="nav-menu">
            <Link to="/stock" className="nav-button">주식 페이지</Link>
            <Link to="/news" className="nav-button">뉴스 페이지</Link>
            <Link to="/board" className="nav-button">게시판 페이지</Link>
            <Link to="/mypage" className="nav-button">마이 페이지</Link>
          </nav>
        </div>

        {/* 오른쪽: 검색창 및 로그인 */}
        <div className="header-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="주식 검색창"
              className="search-input"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="search-suggestions">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(item)}
                  >
                    {/* Display name and code, adjust fields as per API */}
                    <span className="stock-name">{item.name || item.stockName}</span>
                    <span className="stock-code">{item.id || item.mksc_shrn_iscd || item.code || item.stockId}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 알림 아이콘 영역 */}
          {user && (
            <div
              className="relative ml-4 cursor-pointer notification-container"
              onClick={() => setShowNotiList(!showNotiList)}
              style={{ display: 'flex', alignItems: 'center', marginLeft: '15px', position: 'relative', cursor: 'pointer' }}
            >
              <span className="text-2xl" style={{ fontSize: '24px' }}>🔔</span>
              <NotificationBadge count={unreadCount} />

              {showNotiList && (
                <div
                  className="absolute right-0 top-10 z-50"
                  style={{ position: 'absolute', top: '100%', right: '0', zIndex: 1000 }}
                >
                  <NotificationList notifications={notifications} onRead={handleRead} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 하단 구분선 */}
      <div className="header-line"></div>
    </header>
  );
}

export default Header;