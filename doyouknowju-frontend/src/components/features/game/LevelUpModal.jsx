import React from 'react';
import styled from 'styled-components';
import Modal from '../../common/Modal';

const LevelNumber = styled.div`
  font-size: 4rem;
  font-weight: bold;
  margin: 10px 0;
  background: linear-gradient(to bottom, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  text-align: center;
`;

const Message = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
  text-align: center;
  margin: 20px 0;
  color: #555;
`;

const CloseButton = styled.button`
  background: #FFD700;
  color: #333;
  border: none;
  padding: 10px 30px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  width: 100%;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
  }
`;

/**
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 함수
 * @param {number} level - 달성한 레벨
 */
const LevelUpModal = ({ isOpen, onClose, level }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="LEVEL UP!"
      footer={<CloseButton onClick={onClose}>확인</CloseButton>}
    >
      <div style={{ padding: '10px 0' }}>
        <LevelNumber>{level}</LevelNumber>
        <Message>
          축하합니다! <br />
          새로운 레벨에 도달하셨습니다.
        </Message>
      </div>
    </Modal>
  );
};

export default LevelUpModal;
