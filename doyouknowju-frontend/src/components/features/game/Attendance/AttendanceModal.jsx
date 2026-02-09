import React from 'react';
import styled from 'styled-components';
import { Button, Modal } from '../../../common';

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

const AttendanceModal = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="출석 완료!"
            footer={
              <Button
                variant='primary'  
                onClick={onClose}
                style={{width: '100%'}}
              >
                확인
              </Button>}
              
        >
            <ContentWrapper>
                <SuccessIcon>🎉</SuccessIcon>
                <Message>{data.message}</Message>
                {data.gainedExp > 0 && (
                    <RewardText>+{data.gainedExp} EXP 획득</RewardText>
                )}
                <InfoText>현재 총 {data.cumulativeDays}일째 출석 중입니다!</InfoText>
            </ContentWrapper>
        </Modal>
    );
};

export default AttendanceModal;
