import React from "react";
import { Button, Card } from "../../common"
import './AchievementCard.css';

const AchievementCard = ({onOpenModal}) => {
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
            <div className="placeholder-text">도전 과제 표시</div>
        </Card>
    );
};

export default AchievementCard;