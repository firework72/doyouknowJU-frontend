import { useState, useEffect } from 'react';
import './MyPage.css';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Modal } from '../components/common';

const MyPage = () => {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isAttendanceModalOpen, setIsAttendenceModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async() =>{
            if(authLoading) return;
            
            if (!user) {
                alert("로그인이 필요한 페이지입니다.");
                navigate('/',{replace: true});
                return;
            }

            const isRefreshed = await refreshUser();
            if(isRefreshed){
                setLoading(false);
            }
        };

        checkSession();
    }, [authLoading, user, navigate]);

    if (authLoading || loading) {
        return (
            <div className="signup-loading-wrapper">
                <Spinner size="lg" />
                <p className="loading-text">정보를 불러오는 중...</p>
            </div>
        );
    }

    if(!user) return null;

    return (
        <div className="mypage-container">
            <div className="mypage-grid">
                {/* My Info Card */}
                <div className="mypage-card my-info-card">
                    <div className="section-title">
                        <span>내정보</span>

                        <Button
                            variant="primary"
                            size="sm"
                            onClick={()=>setIsAttendenceModalOpen(true)}
                            className="mypage-check-btn"
                        >
                            출석확인
                        </Button>
                    </div>

                    <div className="info-list">
                        <div className="info-item">
                            <span className="info-label">아이디</span>
                            <span className="info-value">{user.userId}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">경험치</span>
                            <span className="info-value">{user.experience}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">레벨</span>
                            <span className="info-value">Lv. {user.userLevel}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">보유 포인트</span>
                            <span className="info-value">{user.points?.toLocaleString()} P</span>
                        </div>
                    </div>
                </div>

                {/* Portfolio Card */}
                <div className="mypage-card portfolio-card">
                    <div className="section-title">포트 폴리오</div>
                    <div className="placeholder-text"></div>
                </div>
            </div>

            <div className="mypage-row-bottom">
                {/* Titles / Achievements Card */}
                <div className="mypage-card title-card">
                    <div className="section-title">
                        보유 칭호<br />
                        도전 과제
                    </div>
                    <div className="placeholder-text"></div>
                </div>

                {/* Posts / Comments Card */}
                <div className="mypage-card posts-card">
                    <div className="section-title">작성한 게시글 / 댓글</div>
                    <div className="placeholder-text"></div>
                </div>
            </div>

            {/* 출석 확인 모달 */}
            <Modal
                isOpen={isAttendanceModalOpen}
                onClose={() => setIsAttendenceModalOpen(false)}
                title="출석 확인"
            >
                <div className="attendance-calendar">
                    <div className="calendar-header">
                        {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
                    </div>
                    <div className="calendar-grid">
                        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                            <div key={day} className="calendar-weekday">{day}</div>
                        ))}
                        {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="calendar-date empty"></div>
                        ))}
                        {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }).map((_, i) => {
                            const date = i + 1;
                            const isToday = date === new Date().getDate();
                            return (
                                <div key={date} className={`calendar-date ${isToday ? 'today' : ''}`}>
                                    <span className="date-num">{date}</span>
                                    {isToday && <div className="checked-mark">✔</div>}
                                </div>
                            );
                        })}
                    </div>
                    <p className="attendance-info">
                        오늘도 방문해 주셔서 감사합니다! 🎉
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default MyPage;
