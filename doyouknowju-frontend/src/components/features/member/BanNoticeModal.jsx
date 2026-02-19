import React from "react";
import { Modal } from "../../common";

const BanNoticeModal = ({ isOpen, onClose, banLimitDate }) => {
    return (
        <Modal 
            isOpen={isOpen}
            onClose={onClose}
            title="계정 이용 정지 안내"
            hideCloseButton={true}
            closeOnOverlayClick={false}
        >
            <div className="ban-notice-content">
                <div className="ban-icon">
                    <i className="fas fa-user-slash"></i>
                </div>
                <h3>해당 계정은 정지 상태입니다.</h3>
                <p>
                    운영 정책 위반으로 인해 해당 계정의 이용이 정지되었습니다.<br />
                    정지 해제 일시: <strong>{new Date(banLimitDate).toLocaleString()}</strong>
                </p>
                <p className="notice-sub">해제 일시가 되면 자동으로 활동 상태로 변경됩니다.</p>
                <button className="ban-notice-btn" onClick={onClose}>확인</button>
            </div>
        </Modal>
    )
}

export default BanNoticeModal;