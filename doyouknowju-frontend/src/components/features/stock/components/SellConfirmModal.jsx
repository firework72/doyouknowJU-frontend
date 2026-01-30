
import Modal from '@/components/common/Modal';

const SellConfirmModal = ({isOpen, onClose, children, footer}) => {
    return (
        <Modal isOpen={isOpen}
            onClose={onClose}
            title="매도 확인"
            footer={footer}
        >
            {children}
        </Modal>
    );
}

export default SellConfirmModal;