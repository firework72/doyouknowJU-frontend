import { getImageUrl } from "../../../api/game/titleApi";
import { Button, Card } from "../../common";
import './MyInfo.css';


const MyInfo = ({ user, onOpenAttendance, onOpenWithdrawal }) => {
    if (!user) return null;

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
                <div className="info-item">
                    <span className="info-label">누적 출석</span>
                    <span className="info-value">{user.consecDays}일</span>
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