import React from 'react';
import { Card, Button, ProgressBar } from '../../../common';
import './AchievementItem.css';

const AchievementItem = ({ achievement, onClaimReward, isPreview }) => {
    // 보상 수령 여부 확인 ('N'이면 미수령 -> 버튼 활성화)
    const isNotClaimed = achievement.isRewarded === 'N';
    
    // 진행도 계산 (이미 달성했다면 100, 아니면 DB 설계에 따라 유동적 처리 가능)
    // 여기서는 달성 시점에 INSERT 된다고 하셨으므로 기본 100%로 표시합니다.
    const progress = 100; 

    return (
        <Card className={`achievement-item-card ${isPreview ? 'preview-mode' : ''}`}>
            <div className="achievement-main">
                <div className="achievement-info">
                    <div className="achievement-title-row">
                        <h4 className="achievement-name">{achievement.achievName}</h4>
                        <span className="achieved-date">{achievement.achievedAt}</span>
                    </div>
                    <p className="achievement-desc">{achievement.achievDesc}</p>
                </div>

                <div className="achievement-actions">
                    <div className="reward-info">
                        <span className="reward-label">보상</span>
                        <span className="reward-value">+{achievement.rewardExp} EXP</span>
                    </div>
                    
                    {!isPreview && ( // 프리뷰 모드(카드)에서는 버튼을 숨기거나 작게 처리 가능
                        <Button 
                            variant={isNotClaimed ? "primary" : "secondary"}
                            size="sm"
                            disabled={!isNotClaimed}
                            onClick={() => onClaimReward(achievement.achievementId)}
                            className="claim-btn"
                        >
                            {isNotClaimed ? "보상 받기" : "수령 완료"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="achievement-footer">
                <ProgressBar 
                    value={progress} 
                    color="exp" 
                    height="sm" 
                    showLabel={false} 
                />
                <span className="progress-text">{progress}% 달성</span>
            </div>
        </Card>
    );
};

export default AchievementItem;