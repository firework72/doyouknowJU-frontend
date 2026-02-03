import React from 'react';
import styled from 'styled-components';
import Modal from '../../common/Modal';

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  text-align: center;
`;

const SuccessIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 20px;
  animation: bounce 1s ease-in-out infinite alternate;

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-10px); }
  }
`;

const Message = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
`;

const RewardText = styled.p`
  font-size: 1.1rem;
  color: #8b5cf6;
  font-weight: bold;
  margin-bottom: 5px;
`;

const InfoText = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const CloseButton = styled.button`
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 12px 40px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: #7c3aed;
    transform: translateY(-2px);
  }
`;

const AttendanceModal = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="출석 완료!"
            footer={<CloseButton onClick={onClose}>확인</CloseButton>}
        >
            <ContentWrapper>
                <SuccessIcon>🎉</SuccessIcon>
                <Message>{data.message}</Message>
                {data.gainedExp > 0 && (
                    <RewardText>+{data.gainedExp} EXP 획득</RewardText>
                )}
                <InfoText>현재 누적으로 {data.cumulativeDays}일째 출석 중입니다!</InfoText>
            </ContentWrapper>
        </Modal>
    );
};

export default AttendanceModal;
