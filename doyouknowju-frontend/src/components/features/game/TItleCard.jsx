import React from "react";
import { Button, Card } from "../../common";
import './TitleCard.css';

const TitleCard = ({onOpenModal}) =>{
    return(
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

            <div className="placeholder-text">보유한 칭호 표시</div>
        </Card>
    );
};

export default TitleCard;