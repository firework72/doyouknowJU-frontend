import React from "react";
import { Modal } from "../../../common";
import AchievementItem from "./AchievementItem";

const AchievementModal = ({isOpen, onClose, achievements, onClaimReward}) =>{
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="도전 과제 전체 목록"
        >
            <div className="achievement-modal-list">
                {achievements.length > 0 ?(
                    achievements.map((achiev)=>(
                        <AchievementItem
                            key={achiev.achievementId}
                            achievement={achiev}
                            onClaimReward={onClaimReward}
                            isPreview={false}
                        />
                    ))
                ) : (
                    <div className="placeholder-text">도전 과제 정보를 불러올 수 없습니다.</div>
                )}
            </div>
        </Modal>
    );
};

export default AchievementModal;