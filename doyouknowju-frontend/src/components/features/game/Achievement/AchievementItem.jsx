import React from 'react';
import { Card, Button, ProgressBar } from '../../../common';
import { getImageUrl } from '../../../../api/game/titleApi';
import './AchievementItem.css';

const AchievementItem = ({ achievement, onClaimReward, isPreview }) => {
    // 도전과제 상태 도출
    // 1. 달성 전: achievedAt 이 null 인 경우
    // 2. 달성 완료/보상 미수령: achievedAt 이 있고 isRewarded 가 'N' 인 경우
    // 3. 수령 완료: achievedAt 이 있고 isRewarded 가 'Y' 인 경우

    const isAchieved = !!achievement.achievedAt;
    const isRewarded = achievement.isRewarded === 'Y';

    let buttonText = "진행중...";
    let buttonVariant = "secondary";
    let isButtonDisabled = true;

    if (isAchieved) {
        if (!isRewarded) {
            buttonText = "보상 받기";
            buttonVariant = "primary";
            isButtonDisabled = false;
        } else {
            buttonText = "수령 완료";
            buttonVariant = "secondary";
            isButtonDisabled = true;
        }
    }

    return (
        <Card className={`achievement-item-card ${isPreview ? 'preview-mode' : ''}`}>
            <div className="achievement-main">
                <div className="achievement-info">
                    <div className="achievement-title-row">
                        <h4 className="achievement-name">{achievement.achievName}</h4>
                        {isAchieved && <span className="achieved-date">{achievement.achievedAt}</span>}
                    </div>
                    <p className="achievement-desc">{achievement.achievDesc}</p>
                </div>

                <div className="achievement-actions">
                    <div className="reward-info">
                        <span className="reward-label">보상</span>
                        <span className="reward-value">+{achievement.rewardExp} EXP</span>
                        {achievement.rewardTitleImgUrl && (
                            <div className="reward-title-wrapper" title={achievement.rewardTitleName}>
                                <img
                                    src={getImageUrl(achievement.rewardTitleImgUrl)}
                                    alt={achievement.rewardTitleName}
                                    className="reward-title-img"
                                />
                            </div>
                        )}
                    </div>

                    {!isPreview && (
                        <Button
                            variant={buttonVariant}
                            size="sm"
                            disabled={isButtonDisabled}
                            onClick={() => onClaimReward(achievement.achievementId)}
                        >
                            {buttonText}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default AchievementItem;