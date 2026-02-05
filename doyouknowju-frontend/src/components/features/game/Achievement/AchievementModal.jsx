import React, { useState } from "react";
import { Modal, Pagination } from "../../../common";
import AchievementItem from "./AchievementItem";
import './AchievementModal.css';

const ITEMS_PER_PAGE = 5;

const AchievementModal = ({ isOpen, onClose, achievements, onClaimReward }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // 페이지네이션 계산
    const totalItems = achievements.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // 현재 페이지 데이터 슬라이싱
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = achievements.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="도전 과제 전체 목록"
        >
            <div className="achievement-modal-list">
                {currentItems.length > 0 ? (
                    currentItems.map((achiev) => (
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

            {totalItems > 0 && (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </Modal>
    );
};

export default AchievementModal;