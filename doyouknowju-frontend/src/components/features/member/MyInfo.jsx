import { Button, Card } from "../../common";
import './MyInfo.css';


const MyInfo = ({user, onOpenAttendance}) => {
    if(!user) return null;

    return(
        <Card className="my-info-card">
            <div className="card-header">
                <span className="section-title">내정보</span>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onOpenAttendance}
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
                <div className="info-item">
                    <span className="info-label">누적 출석</span>
                    <span className="info-value">{user.consecDays}일</span>
                </div>
            </div>
        </Card>
    );
};

export default MyInfo;