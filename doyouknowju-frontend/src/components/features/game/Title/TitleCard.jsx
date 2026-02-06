import { Button, Card, Badge } from "../../../common";
import './TitleCard.css';

const TitleCard = ({ titles, onOpenModal }) => {
    // 최근 획득한 순서대로 최대 3개까지만 표시
    const recentTitles = titles?.slice(0, 3) || [];

    return (
        <Card className="title-card">
            <div className="card-header">
                <span className="section-title">칭호</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenModal}
                >
                    더보기 +
                </Button>
            </div>

            <div className="title-preview-list">
                {recentTitles.length > 0 ? (
                    recentTitles.map(title => (
                        <Badge key={title.titleId} variant="info" className="title-badge">
                            {title.titleName}
                        </Badge>
                    ))
                ) : (
                    <div className="placeholder-text">보유한 칭호가 없습니다.</div>
                )}
            </div>
        </Card>
    );
};

export default TitleCard;