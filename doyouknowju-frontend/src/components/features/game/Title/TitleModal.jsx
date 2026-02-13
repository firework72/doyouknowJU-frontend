import React from 'react';
import { Modal, Badge } from '../../../common';
import './TitleModal.css';
import { achievementApi } from '../../../../api/game/achievementApi';
import { titleApi, getImageUrl } from '../../../../api/game/titleApi';

const TitleModal = ({ isOpen, onClose, titles, onEquip }) => {

    const handleEquip = async (titleId) => {
        try {
            const result = await titleApi.equipTitle(titleId);
            if (result.success) {
                alert(result.message);
                if (onEquip) onEquip();
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleUnequip = async() =>{
        try{
            const result = await titleApi.unequipTitle();
            if(result.success){
                alert(result.message);
                if(onEquip) onEquip();
            }
        }catch(error){
            alert(error.message);
        }
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
                        <div
                            key={title.titleId}
                            className={`title-item ${title.isEquipped === 'Y' ? 'equipped' : ''}`}
                            onClick={() => {
                                if(title.isEquipped === 'Y'){
                                    handleUnequip();
                                } else {
                                    handleEquip(title.titleId);
                                }
                            }}      
                        >
                            <div className="title-info-wrap">
                                {title.titleImgUrl && (
                                    <img
                                        src={getImageUrl(title.titleImgUrl)}
                                        alt={title.titleName}
                                        className="title-icon"
                                    />
                                )}
                                <span className="title-name">{title.titleName}</span>
                            </div>
                            {title.isEquipped === 'Y' && (
                                <Badge variant="success">장착중</Badge>
                            )}
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
