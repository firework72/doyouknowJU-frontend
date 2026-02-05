import { useState, useEffect } from 'react';
import './MyPage.css';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Modal, Card } from '../components/common';
import AttendanceCheckModal from '../components/features/game/Attendance/AttendanceCheckModal';
import MyInfo from '../components/features/member/MyInfo';
import AchievementCard from '../components/features/game/Achievement/AchievementCard';
import TitleCard from '../components/features/game/TItleCard';
import MyActivityCard from '../components/features/member/MyActivityCard';

const MyPage = () => {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    //모달 상태 관리
    const [isAttendanceModalOpen, setIsAttendenceModalOpen] = useState(false);
    const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
    const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
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
    }, [authLoading, user, navigate, refreshUser]);

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
                <MyInfo
                    user={user}
                    onOpenAttendance={()=>setIsAttendenceModalOpen(true)}
                />

                {/* Portfolio Card */}
                <Card className="portfolio-card">
                    <div className="card-header">
                        <span className="section-title">포트 폴리오</span>
                    </div>
                    <div className="placeholder-text">보유 자산 현황 준비 중..</div>
                </Card>
            </div>

            <div className="mypage-row-bottom">
                {/* 도전과제 컴포넌트 */}
                <AchievementCard onOpenModal={()=>setIsAchievementModalOpen(true)}/>

                {/* 칭호 컴포넌트 */}
                <TitleCard onOpenModal={()=>setIsTitleModalOpen(true)}/>

                {/* Posts / Comments Card */}
                <Card className="posts-card">
                    <div className="card-header">
                        <span className="section-title">작성한 게시글 / 댓글</span>
                    </div>
                    <MyActivityCard userId={user?.userId ?? user?.id} />
                </Card>
            </div>

            {/* 출석 확인 모달 */}
            <AttendanceCheckModal
                isOpen={isAttendanceModalOpen}
                onClose={()=>setIsAttendenceModalOpen(false)}
                user={user}
            />

            <Modal
                isOpen={isAchievementModalOpen}
                onClose={() => setIsAchievementModalOpen(false)}
                title="도전 과제 상세"
            >
                <div className="modal-scroll-content">
                    <p>전체 도전 과제 목록이 여기에 표시됩니다.</p>
                </div>
            </Modal>

            <Modal
                isOpen={isTitleModalOpen}
                onClose={() => setIsTitleModalOpen(false)}
                title="칭호 목록"
            >
                <div className="modal-scroll-content">
                    <p>획득 가능한 전체 칭호가 여기에 표시됩니다.</p>
                </div>
            </Modal>
        </div>
    );
};

export default MyPage;
