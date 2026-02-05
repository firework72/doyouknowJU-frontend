import React from "react";
import { Button, Card } from "../../../common"
import './AchievementCard.css';
import AchievementItem from "./AchievementItem";

const AchievementCard = ({ achievements = [], onOpenModal, onClaimReward}) => {
    const recentAchievements = [...achievements]
        .filter(a=>a.achievedAt)
        .slice(0,3);
    
    return(
        <Card className="achievement-card">
            <div className="card-header">
                <span className="section-title">도전 과제</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenModal}
                >
                    더보기 +
                </Button>
            </div>
            <div className="achievement-preview-list">
                {recentAchievements.length > 0 ? (
                    recentAchievements.map((achiev) => (
                        <AchievementItem 
                            key={achiev.achievementId} 
                            achievement={achiev}
                            isPreview={true} // [팁] 메인용으로 간소화하고 싶을 때 사용
                        />
                    ))
                ) : (
                    <div className="placeholder-text">최근 달성한 도전 과제가 없습니다.</div>
                )}
            </div>
        </Card>
    );
};

export default AchievementCard;