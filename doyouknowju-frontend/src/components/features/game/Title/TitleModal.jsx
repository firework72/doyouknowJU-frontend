import React from 'react';
import { Modal } from '../../../common';
import './TitleModal.css';

const TitleModal = ({ isOpen, onClose, titles }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="보유 칭호 목록"
        >
            <div className="title-modal-list">
                {titles && titles.length > 0 ? (
                    titles.map((title) => (
                        <div key={title.titleId} className="title-item">
                            {title.titleName}
                        </div>
                    ))
                ) : (
                    <div className="placeholder-text">아직 획득한 칭호가 없습니다.</div>
                )}
            </div>
        </Modal>
    );
};

export default TitleModal;
