import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import StockTop10View from '../front/StockView';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { Button } from '../components/common';
import AttendanceModal from '../components/features/game/Attendance/AttendanceModal';
import LevelUpModal from '../components/features/game/LevelUpModal';
import QuizModal from '../components/features/game/QuizModal';
// [추가] 뉴스 데이터를 가져오기 위한 api 인스턴스
import api from '../api/trade/axios';
import Ranking from '../components/features/ranking/Ranking';
import PopularBoardsPanel from '../components/features/community/PopularBoardsPanel';

function HomePage() {
    const navigate = useNavigate();
    const { user, login, logout, refreshUser } = useAuth();

    const [loginId, setLoginId] = useState("");
    const [loginPwd, setLoginPwd] = useState("");

    // [추가] 뉴스 데이터를 저장할 변수
    const [newsList, setNewsList] = useState([]);

    //모달 오픈 여부
    const [attendanceModal, setAttendanceModal] = useState({
        isOpen: false,
        data: null
    });
    const [levelUpModal, setLevelUpModal] = useState({
        isOpen: false,
        level: 1
    })
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

    // [수정] 기존 로직 유지하면서 뉴스만 추가로 불러옴
    useEffect(() => {
        if (user) {
            refreshUser();
        }

        // 뉴스 데이터 가져오기 로직 추가
        api.get('/api/news')
            .then(res => setNewsList(res.data))
            .catch(err => console.error("뉴스 불러오기 실패:", err));
    }, []);

    // --- 아래는 사용자님의 원본 로그인/로그아웃/출석 로직 (절대 건드리지 않음) ---
    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8080/dykj/api/members/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: loginId, userPwd: loginPwd }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                login(data);
                alert("반가워요, " + data.userId + "님!");
            } else {
                alert("아이디 또는 비밀번호를 확인해주세요.");
            }
        } catch (error) {
            console.error("로그인 중 에러 발생: ", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    }

    const handleLogout = async () => { logout(); }

    const handleAttend = async () => {
        try {
            const response = await fetch('http://localhost:8080/dykj/api/game/attend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                if (data.success) {
                    setAttendanceModal({ isOpen: true, data: data });
                    refreshUser();
                } else { alert(data.message); }
            } else { alert(data.message || "출석체크 중 오류가 발생했습니다."); }
        } catch (error) {
            console.error("출석체크 중 에러 발생: " + error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    }

    const handleQuizComplete = (result) => { if (result.isCorrect) { refreshUser(); } }

    const handleCloseAttendance = () => {
        const { data } = attendanceModal;
        setAttendanceModal({ ...attendanceModal, isOpen: false });
        if (data && data.levelUp) {
            setLevelUpModal({ isOpen: true, level: data.currentLevel });
        }
    }

    return (
        <main className="main-container">
            <div className="main-grid">
                {/* 상단 행 (원본 유지) */}
                <div className="grid-row top-row">
                    <Card className="large-card" id="rising-section">
                        <StockTop10View />
                    </Card>
                    <Card className="large-card" id="falling-section">
                        <h3 className="section-title">급하락</h3>
                        <p className="section-description">주식명 / 현재가 / 등락률</p>
                        <div className="section-content"></div>
                    </Card>
                    <Card className="small-card" id="myinfo-section">
                        {user ? (
                            <div className="user-profile">
                                <h3 className="section-title">내 정보</h3>
                                <p className="welcome-msg"><strong>{user.userId}</strong>님, 환영합니다!</p>
                                <div className="user-stats">
                                    <p>보유 자산: {user.points?.toLocaleString()}원</p>
                                    <p>레벨: {user.userLevel}</p>
                                    <p>누적 출석: {user.consecDays}일</p>
                                </div>
                                <div className="auth-links">
                                    <button onClick={handleLogout} className="auth-link-btn">로그아웃</button>
                                </div>
                                <div className="auth-links">
                                    <Button onClick={handleAttend} variant="primary" size="sm" className="home-auth-btn">출석체크</Button>
                                    <Button onClick={() => setIsQuizModalOpen(true)} variant="secondary" size="sm" className="home-auth-btn">OX퀴즈</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="login-form">
                                <Input type="text" placeholder="아이디" className="login-input" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                                <Input type="password" placeholder="비밀번호" className="login-input" value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)} />
                                <div className="auth-links">
                                    <button onClick={handleLogin} className="auth-link-btn">로그인</button>
                                    <span className="auth-divider">/</span>
                                    <Link to="/signup" className="auth-link">회원가입</Link>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* 하단 행 - 뉴스 구역만 업데이트 */}
                <div className="grid-row bottom-row">
                    <Card className="medium-card" id="ranking-section">
                        <h3 className="section-title">랭킹 Top 3</h3>
                        <p className="section-description">랭킹은 매일 자정 갱신됩니다.</p>
                        <div className="section-content">
                            <Ranking/> {/* Dong : Ranking.jsx 추가 */}
                        </div>
                    </Card>
                    <Card className="medium-card" id="posts-section">
                        <h3 className="section-title">게시글</h3>
                        <p className="section-description">실시간 / 인기 게시글</p>
                        <div className="section-content">
                            <PopularBoardsPanel />
                        </div>
                    </Card>

                    {/* [핵심 수정] 뉴스 정보 구역 */}
                    <Card className="small-card" id="news-section">
                        <h3 className="section-title">뉴스 정보</h3>

                        {/* 🤖 AI 요약박스 (데이터가 있을 때만 등장) */}
                        {newsList.length > 0 && newsList[0].aiSummary && (
                            <div style={{ background: '#f0f7ff', padding: '10px', borderRadius: '5px', marginBottom: '10px', fontSize: '0.82rem', borderLeft: '4px solid #007bff' }}>
                                <strong style={{ color: '#007bff' }}>AI 요약:</strong> {newsList[0].aiSummary}
                            </div>
                        )}

                        <div className="section-content">
                            {newsList.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {newsList.map((news) => (
                                        <li key={news.newsId} style={{ marginBottom: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <a href={news.newsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#333' }}>
                                                • {news.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="section-description">뉴스를 불러오는 중...</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* 모달들 (원본 유지) */}
            <AttendanceModal isOpen={attendanceModal.isOpen} onClose={handleCloseAttendance} data={attendanceModal.data} />
            <LevelUpModal isOpen={levelUpModal.isOpen} onClose={() => setLevelUpModal({ ...levelUpModal, isOpen: false })} level={levelUpModal.level} />
            <QuizModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} onLevelUp={(level) => setLevelUpModal({ isOpen: true, level })} onQuizComplete={handleQuizComplete} />
        </main>
    );
}

export default HomePage;
