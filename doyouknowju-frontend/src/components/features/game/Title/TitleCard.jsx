import { Button, Card, Badge } from "../../../common";
import './TitleCard.css';

const TitleCard = ({ titles, onOpenModal }) => {
    // 최근 획득한 순서대로 최대 4개까지만 표시
    const recentTitles = titles?.slice(0, 4) || [];

    // 이미지 경로 처리 함수
    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;

        // 백엔드 컨텍스트 루트 포함 여부 확인
        const contextPath = '/dykj';
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;

        if (cleanUrl.startsWith(contextPath)) return cleanUrl;
        return `${contextPath}${cleanUrl}`;
    };

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
                        <div key={title.titleId} className="title-image-wrapper">
                            {title.titleImgUrl && (
                                <img
                                    src={getImageUrl(title.titleImgUrl)}
                                    alt={title.titleName}
                                    className="title-icon"
                                    title={title.titleName}
                                />
                            )}
                            {title.isEquipped === 'Y' &&(
                                <Badge variant="succeess" className="card-equipped-badge">장착중</Badge>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="placeholder-text">보유한 칭호가 없습니다.</div>
                )}
            </div>
        </Card>
    );
};

export default TitleCard;