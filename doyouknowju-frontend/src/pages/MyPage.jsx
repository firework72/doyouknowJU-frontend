import { useState, useEffect, useCallback } from 'react';
import './MyPage.css';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button, Modal, Card } from '../components/common';
import AttendanceCheckModal from '../components/features/game/Attendance/AttendanceCheckModal';
import MyInfo from '../components/features/member/MyInfo';
import AchievementCard from '../components/features/game/Achievement/AchievementCard';
import AchievementModal from '../components/features/game/Achievement/AchievementModal';
import { achievementApi } from '../api/game/achievementApi';
import { titleApi } from '../api/game/titleApi';
import MyActivityCard from '../components/features/member/MyActivityCard';
import TitleCard from '../components/features/game/Title/TitleCard';
import TitleModal from '../components/features/game/Title/TitleModal';
import LevelUpModal from '../components/features/game/LevelUpModal';
import { memberApi } from '../api/memberApi';
import WithdrawalModal from '../components/features/member/WithdrawalModal';
import HoldingChart from '../components/features/holding/components/HoldingChart'; // Dong : 보유 자산 현황 컴포넌트
import ReportModal from '../components/features/member/ReportModal';

const MyPage = () => {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    //모달 상태 관리
    const [isAttendanceModalOpen, setIsAttendenceModalOpen] = useState(false);
    const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
    const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [levelUpLevel, setLevelUpLevel] = useState(0);

    const [achievements, setAchievements] = useState([]);
    const [titles, setTitles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async() =>{
            if(authLoading) return;
            
            if (!user) {
                alert("로그인이 필요한 페이지입니다.");
                navigate('/',{replace: true});
                return;
            }

            try {
                // 병렬로 데이터 로드 가능
                const isRefreshed = await refreshUser();
                if (isRefreshed) {
                    await fetchAchievements();
                    await fetchMyTitles();
                    setLoading(false);
                }
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
                setLoading(false);
            }
        };

        checkSession();
    }, [authLoading, user, navigate, refreshUser]);

    const fetchAchievements = async () => {
        try {
            const data = await achievementApi.getAchievements();
            setAchievements(data);
        } catch (error) {
            console.error("도전과제 목록 조회 실패:", error);
        }
    };

    const fetchMyTitles = async() =>{
        try{
            const data = await titleApi .getMyTitles();
            setTitles(data);
        }catch (error) {
            console.error("칭호 목록 조회 실패: ", error);
        }
    }

    const handleClaimReward = async (achievementId) => {
        try {
            const result = await achievementApi.claimReward(achievementId);
            if (result.success) {
                // 목록 갱신 및 유저 정보(경험치 등) 갱신
                await fetchAchievements();
                await fetchMyTitles();
                await refreshUser();

                //레벨업 확인
                if(result.expResult?.isLevelUp){
                    setLevelUpLevel(result.expResult.currentLevel);
                    setIsLevelUpModalOpen(true);
                } else{
                    alert(result.message);
                }
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleWithdrawal = useCallback(async(password) => {
        try{
            await memberApi.withdraw(password);
            alert("탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
            window.location.href='/';
        }catch(error) {
            alert(error.message);
            throw error;
        }
    },[]);

    const handleCloseWithdrawal = useCallback(() => setIsWithdrawalModalOpen(false), []);

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
                    onOpenAttendance={() => setIsAttendenceModalOpen(true)}
                    onOpenWithdrawal={() => setIsWithdrawalModalOpen(true)}
                    onOpenReport={() => setIsReportModalOpen(true)}
                />

                {/* Portfolio Card */}
                <Card className="portfolio-card">
                    <div className="card-header">
                        <span className="section-title" onClick={() => navigate('/holding')} style={{cursor: 'pointer'}}>포트 폴리오 &gt;</span>
                    </div>
                    <HoldingChart /> {/* Dong : 보유 자산 현황 컴포넌트 */}
                </Card>
            </div>

            <div className="mypage-row-bottom">
                {/* 도전과제 컴포넌트 */}
                <AchievementCard 
                    achievements={achievements}
                    onOpenModal={()=>setIsAchievementModalOpen(true)}
                    onClaimReward={handleClaimReward}
                />

                {/* 칭호 컴포넌트 */}
                <TitleCard
                    titles={titles}
                    onOpenModal={()=>setIsTitleModalOpen(true)}
                />

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

            {/* 도전 과제 모달 */}
            <AchievementModal
                isOpen={isAchievementModalOpen}
                onClose={()=>setIsAchievementModalOpen(false)}
                achievements={achievements}
                onClaimReward={handleClaimReward}
            />

            {/* 칭호 모달 */}
            <TitleModal
                isOpen={isTitleModalOpen}
                onClose={()=>setIsTitleModalOpen(false)}
                titles={titles}
                onEquip={async () =>{
                    await refreshUser();
                    await fetchMyTitles();
                }}
            />

            {/* 레벨업 축하 모달 */}
            <LevelUpModal
                isOpen={isLevelUpModalOpen}
                onClose={() => setIsLevelUpModalOpen(false)}
                level={levelUpLevel}
            />

            {/* 회원 탈퇴 모달 */}
            <WithdrawalModal
                isOpen={isWithdrawalModalOpen}
                onClose={handleCloseWithdrawal}
                onWithdraw={handleWithdrawal}
            />

            {/* 신고 관리 모달 */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={()=>setIsReportModalOpen(false)}
            />
        </div>
    );
};

export default MyPage;
