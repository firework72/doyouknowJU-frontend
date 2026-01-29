
import Modal from '@/components/common/Modal';

const BuyConfirmModal = ({isOpen, onClose, children, footer}) => {
    return (
        <Modal isOpen={isOpen}
            onClose={onClose}
            title="매수 확인"
            footer={footer}
        >
            {children}
        </Modal>
    );
}

export default BuyConfirmModal;