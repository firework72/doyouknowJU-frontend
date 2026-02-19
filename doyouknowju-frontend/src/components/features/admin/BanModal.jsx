import React, { useState } from 'react';
import { Modal } from '../../common';
import { memberApi } from '../../../api/memberApi';
import './BanModal.css';

const BanModal = ({ isOpen, onClose, userId, onSuccess }) => {
    const [banDays, setBanDays] = useState('3');
    const [loading, setLoading] = useState(false);

    const handleBan = async () => {
        try {
            setLoading(true);
            await memberApi.banMember(userId, parseInt(banDays));
            alert(`${userId} 계정에 ${banDays === '9999' ? '영구' : banDays + '일'} 정지 처리가 완료되었습니다.`);
            onSuccess();
        } catch (error) {
            console.error('Ban failed:', error);
            alert('제재 처리에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`계정 관리 - ${userId}`}>
            <div className="ban-modal-content">
                <p>해당 사용자에 대한 제재 기간을 선택해주세요.</p>
                <div className="ban-options">
                    <select value={banDays} onChange={(e) => setBanDays(e.target.value)}>
                        <option value="0">해당 없음</option>
                        <option value="3">3일 정지</option>
                        <option value="7">7일 정지</option>
                        <option value="30">30일 정지</option>
                        <option value="100">100일 정지</option>
                        <option value="9999">영구 정지</option>
                    </select>
                    <button
                        className="ban-submit-btn"
                        onClick={handleBan}
                        disabled={loading}
                    >
                        {loading ? '처리 중...' : '제재 적용'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BanModal;
