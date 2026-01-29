import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContainer = styled.div`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  color: white;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  animation: ${fadeIn} 0.3s ease-out;
  max-width: 400px;
  width: 90%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    transform: rotate(30deg);
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 20px;
  color: #FFD700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const LevelNumber = styled.div`
  font-size: 4rem;
  font-weight: bold;
  margin: 20px 0;
  background: linear-gradient(to bottom, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
`;

const Message = styled.p`
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.5;
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
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

/**
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 함수
 * @param {number} level - 달성한 레벨
 */
const LevelUpModal = ({ isOpen, onClose, level }) => {
    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <Title>LEVEL UP!</Title>
                <LevelNumber>{level}</LevelNumber>
                <Message>
                    축하합니다! <br />
                    새로운 레벨에 도달하셨습니다.
                </Message>
                <CloseButton onClick={onClose}>확인</CloseButton>
            </ModalContainer>
        </Overlay>
    );
};

export default LevelUpModal;
