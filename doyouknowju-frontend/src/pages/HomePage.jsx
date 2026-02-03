import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import StockTop10View from '../front/StockView';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { Button } from '../components/common';
import AttendanceModal from '../components/features/game/AttendanceModal';
import LevelUpModal from '../components/features/game/LevelUpModal';
import QuizModal from '../components/features/game/QuizModal';

function HomePage() {
    const navigate = useNavigate();
    const { user, login, logout, refreshUser } = useAuth();

    const [loginId, setLoginId] = useState("");
    const [loginPwd, setLoginPwd] = useState("");

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

    //최신 정보 동기화
    useEffect(()=>{
        if(user){
            refreshUser();
        }
    },[]);

    //로그인 요청
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

    const handleLogout = async() => {
        logout();
    }

    //출석 체크 요청
    const handleAttend = async() =>{
        try{
            const response = await fetch('http://localhost:8080/dykj/api/game/attend',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                credentials: 'include'
            });
        
            const data = await response.json();
        
            if(response.ok) {
                if(data.success){
                    setAttendanceModal({
                        isOpen: true,
                        data: data
                    });
                    refreshUser();
                } else {
                    alert(data.message);
                }
            } else {
                alert(data.message || "출석체크 중 오류가 발생했습니다.");
            }
        }catch(error){
            console.error("출석체크 중 에러 발생: "+error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    }

    //퀴즈 완료 핸들러
    const handleQuizComplete = (result) =>{
        if(result.isCorrect){
            refreshUser();
        }
    }

    //출석 모달 닫은 후 레벨업 확인
    const handleCloseAttendance = () =>{
        const {data} = attendanceModal;
        setAttendanceModal({...attendanceModal, isOpen: false});

        if(data && data.levelUp){
            setLevelUpModal({
                isOpen: true,
                level: data.currentLevel
            });
        }
    }

    return (
        <main className="main-container">
            <div className="main-grid">
                <div className="grid-row top-row">
                    {/* Top10 주식 구역 */}
                    <Card className="large-card" id="rising-section">
                        <StockTop10View />
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
                                <Input
                                    type="text"
                                    placeholder="아이디"
                                    className="login-input"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                />
                                <Input
                                    type="password"
                                    placeholder="비밀번호"
                                    className="login-input"
                                    value={loginPwd}
                                    onChange={(e) => setLoginPwd(e.target.value)}
                                />
                                <div className="auth-links">
                                    <button onClick={handleLogin} className="auth-link-btn">로그인</button>
                                    <span className="auth-divider">/</span>
                                    <Link to="/signup" className="auth-link">회원가입</Link>
                                </div>
                            </div>
                        )}
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
                        <p className="section-description">실시간 / 인기 게시글</p>
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

            {/* 출석 체크 모달 */}
            <AttendanceModal
                isOpen={attendanceModal.isOpen}
                onClose={handleCloseAttendance}
                data={attendanceModal.data}
            />

            {/* 레벨업 모달 */}
            <LevelUpModal
                isOpen={levelUpModal.isOpen}
                onClose={()=>setLevelUpModal({...levelUpModal,isOpen: false})}
                level={levelUpModal.level}
            />

            {/* OX 퀴즈 모달 */}
            <QuizModal
                isOpen={isQuizModalOpen}
                onClose={()=>setIsQuizModalOpen(false)}
                onLevelUp={(level)=>setLevelUpModal({isOpen: true, level})}
            />
        </main>
    );
}

export default HomePage;