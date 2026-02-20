import React from "react";
import { Button, Modal } from "../../common";

const BanNoticeModal = ({ isOpen, onClose, banLimitDate }) => {
    // 정지 기한 다음날 0시 0분 0초로 표시
    const formatDate = (dateStr) =>{
        const date = new Date(dateStr);
        date.setDate(date.getDate() + 1);
        date.setHours(0, 0, 0, 0);

        return date.toLocaleString('ko-KR',{
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }
    
    return (
        <Modal 
            isOpen={isOpen}
            onClose={onClose}
            title="계정 이용 정지 안내"
            hideCloseButton={true}
            closeOnOverlayClick={false}
            width="560px"
        >
            <div className="ban-notice-content" style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div className="ban-icon" style={{ fontSize: '3rem', color: '#e74a3b', marginBottom: '20px' }}>
                    <i className="fas fa-user-slash"></i>
                </div>
                <h3 style={{ marginBottom: '15px' }}>해당 계정은 정지 상태입니다.</h3>
                <p style={{ lineHeight: '1.6', color: '#666', marginBottom: '20px' }}>
                    운영 정책 위반으로 인해 해당 계정의 이용이 정지되었습니다.<br />
                    정지 해제 일시: <br />
                    <strong style={{ color: '#e74a3b', fontSize: '1.1rem' }}>{formatDate(banLimitDate)}</strong>
                </p>
                <p className="notice-sub" style={{ fontSize: '0.85rem', color: '#999', marginBottom: '25px' }}>
                    해제 일시가 되면 자동으로 활동 상태로 변경되어 로그인이 가능해집니다.
                </p>
                <Button
                    variant="danger"
                    fullWidth
                    onClick={onClose}
                    style={{ padding: '12px' }}
                >
                    확인
                </Button>
            </div>
        </Modal>
    )
}

export default BanNoticeModal;