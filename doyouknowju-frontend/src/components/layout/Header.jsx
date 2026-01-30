import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchStockSuggestions } from '../../api/stockApi';
import './Header.css';

function Header({ logoSrc }) {
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
              <div className="logo-placeholder">로고</div>
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
        </div>
      </div>

      {/* 하단 구분선 */}
      <div className="header-line"></div>
    </header>
  );
}

export default Header;