import { getImageUrl } from "../../../api/game/titleApi";
import { Button, Card, ProgressBar } from "../../common";
import './MyInfo.css';


const MyInfo = ({ user, levelPolicies, onOpenAttendance, onOpenWithdrawal }) => {
    if (!user) return null;

    // 경험치 진행도 계산
    const currentExp = user.experience || 0;
    const currentLevel = user.userLevel || 1;

    const currentLevelPolicy = levelPolicies?.find(p => p.levelId === currentLevel);
    const nextLevelPolicy = levelPolicies?.find(p => p.levelId === currentLevel + 1);

    const minExp = currentLevelPolicy ? currentLevelPolicy.requiredExp : 0;
    const maxExp = nextLevelPolicy ? nextLevelPolicy.requiredExp : minExp * 2; // 다음 레벨 정책이 없으면 현재의 2배 (임시)

    const progressValue = currentExp - minExp;
    const progressMax = maxExp - minExp;
    const percentage = progressMax > 0 ? (progressValue / progressMax) * 100 : 100;

    return (
        <Card className="my-info-card">
            <div className="card-header">
                <span className="section-title">내정보</span>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onOpenAttendance}
                >
                    출석확인
                </Button>
            </div>

            <div className="info-list">
                <div className="info-item">
                    <span className="info-label">아이디</span>
                    <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {user.equippedTitleImgUrl && (
                            <img
                                src={getImageUrl(user.equippedTitleImgUrl)}
                                alt={user.equippedTitleName}
                                style={{ height: '20px', objectFit: 'contain' }}
                            />
                        )}
                        {user.userId}
                    </span>
                </div>
                <div className="info-item">
                    <span className="info-label">보유 포인트</span>
                    <span className="info-value">{user.points?.toLocaleString()} P</span>
                </div>

                <div className="info-item">
                    <span className="info-label">누적 출석</span>
                    <span className="info-value">{user.consecDays}일</span>
                </div>

                <div className="info-item">
                    <span className="info-label">레벨</span>
                    <span className="info-value">Lv. {user.userLevel}</span>
                </div>

                <div className="info-item exp-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span className="info-label">경험치</span>
                        <span className="info-value" style={{ fontSize: '0.8rem' }}>
                            {currentExp.toLocaleString()} / {maxExp.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                    </div>
                    <ProgressBar
                        value={progressValue}
                        max={progressMax}
                        color="primary"
                        height="sm"
                        className="exp-progress"
                    />
                </div>
            </div>

            {user.userRole !== 'ADMIN' && (
                <div className="card-footer" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', textAlgn: 'center' }}>
                    <Button
                        variant="link"
                        style={{ color: '#999', fontSize: '0.85rem', textDecoration: 'underLine', padding: '0' }}
                        onClick={() => { onOpenWithdrawal(); }}
                    >
                        회원 탈퇴
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default MyInfo;