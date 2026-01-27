import { Link } from 'react-router-dom';
import './Header.css';

function Header({ logoSrc }) {
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
            />
          </div>
        </div>
      </div>

      {/* 하단 구분선 */}
      <div className="header-line"></div>
    </header>
  );
}

export default Header;