import React from 'react';
import { Modal } from '../../../common';
import './TitleModal.css';

const TitleModal = ({ isOpen, onClose, titles }) => {
    // 이미지 경로 처리 함수
    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;

        const contextPath = '/dykj';
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;

        if (cleanUrl.startsWith(contextPath)) return cleanUrl;
        return `${contextPath}${cleanUrl}`;
    };

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
                            {title.titleImgUrl && (
                                <img
                                    src={getImageUrl(title.titleImgUrl)}
                                    alt={title.titleName}
                                    className="title-icon"
                                />
                            )}
                            <span className="title-name">{title.titleName}</span>
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
