import { Link } from 'react-router-dom';
import './HomePage.css';
import Card from '../components/common/Card';
import Input from '../components/common/Input';

function HomePage() {
    return (
        <main className="main-container">
            <div className="main-grid">
                {/* 상단 행 */}
                <div className="grid-row top-row">
                    {/* 급상승 구역 */}
                    <Card className="large-card" id="rising-section">
                        <h3 className="section-title">급상승</h3>
                        <p className="section-description">주식명 / 현재가 / 등락률</p>
                        {/* TODO: 급상승 주식 리스트 구현 */}
                        <div className="section-content">
                            {/* 여기에 급상승 주식 데이터를 렌더링 */}
                        </div>
                    </Card>

                    {/* 급하락 구역 */}
                    <Card className="large-card" id="falling-section">
                        <h3 className="section-title">급하락</h3>
                        <p className="section-description">주식명 / 현재가 / 등락률</p>
                        {/* TODO: 급하락 주식 리스트 구현 */}
                        <div className="section-content">
                            {/* 여기에 급하락 주식 데이터를 렌더링 */}
                        </div>
                    </Card>

                    {/* 내정보 구역 */}
                    <Card className="small-card" id="myinfo-section">
                        <div className="login-form">
                            <Input
                                type="text"
                                placeholder="아이디"
                                className="login-input"
                            />
                            <Input
                                type="password"
                                placeholder="비밀번호"
                                className="login-input"
                            />
                            <div className="auth-links">
                                <Link to="/login" className="auth-link">로그인</Link>
                                <span className="auth-divider">/</span>
                                <Link to="/signup" className="auth-link">회원가입</Link>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 하단 행 */}
                <div className="grid-row bottom-row">
                    {/* 랭킹 구역 */}
                    <Card className="medium-card" id="ranking-section">
                        <h3 className="section-title">랭킹</h3>
                        <p className="section-description">연간 / 월간 / 주간</p>
                        {/* TODO: 랭킹 데이터 구현 */}
                        <div className="section-content">
                            {/* 여기에 랭킹 데이터를 렌더링 */}
                        </div>
                    </Card>

                    {/* 게시글 구역 */}
                    <Card className="medium-card" id="posts-section">
                        <h3 className="section-title">게시글</h3>
                        <p className="section-description">실시간 / 인기</p>
                        {/* TODO: 게시글 리스트 구현 */}
                        <div className="section-content">
                            {/* 여기에 게시글 데이터를 렌더링 */}
                        </div>
                    </Card>

                    {/* 뉴스 정보 구역 */}
                    <Card className="small-card" id="news-section">
                        <h3 className="section-title">뉴스 정보</h3>
                        <p className="section-description">뉴스 제목 / 링크</p>
                        {/* TODO: 뉴스 리스트 구현 */}
                        <div className="section-content">
                            {/* 여기에 뉴스 데이터를 렌더링 */}
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default HomePage;