
import {react, useEffect, useState} from 'react';
import { fetchStockSuggestions } from '../../../api/stockApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/AuthContext';
import styles from './StockPage.module.css';
import FavoriteStockTable from './components/FavoriteStockTable';

function StockPage() {

    const { user } = useAuth();
    const userId = user.userId;

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
        <>
          <div className={styles.container}>
            <h2>🔍 원하는 주식을 검색해보세요.</h2>
            <div className="search-box" style={{width: '100%'}}>
              <input type="text" placeholder="주식 검색창" className="search-input" value={query} onChange={handleInputChange} onKeyDown={handleKeyDown} style={{width: '100%'}} />
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
          <h2>⭐ 관심 종목 리스트</h2>
          <FavoriteStockTable userId={userId} />
          </div>

        </>
    );
}

export default StockPage;