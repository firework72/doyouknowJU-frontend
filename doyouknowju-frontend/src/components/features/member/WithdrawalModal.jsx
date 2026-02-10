import { useState } from 'react';
import styled from 'styled-components';
import Modal from '../../common/Modal';
import { Button } from '../../common';

const ModalContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const WarningText = styled.p`
  color: #ff4d4f;
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 10px;
  text-align: center;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #666;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #ff4d4f;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const WithdrawalModal = ({ isOpen, onClose, onWithdraw }) =>{
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async() =>{
        if(!password) {
            alert("비밀번호를 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        try{
            await onWithdraw(password);
            setPassword('');
        }catch(error){

        }finally{
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="회원 탈퇴"
        >
            <ModalContent>
                <WarningText>
                    정말로 탈퇴하시겠습니까?<br />
                    다시 복구할 수 없습니다.
                </WarningText>

                <InputGroup>
                    <Label htmlFor="withdrawal-password">본인 확인을 위해 비밀번호를 입력해주세요</Label>
                    <Input
                        id="withdrawal-password"
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        autoFocus
                    />
                </InputGroup>

                <ButtonGroup>
                    <Button
                        variant="outline"
                        style={{ flex: 1 }}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        취소
                    </Button>
                    <Button
                        variant='danger'
                        style={{flex: 1, backgroundColor: '#ff4d4f', color: 'white'}}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '처리 중...' : '탈퇴하기'}
                    </Button>
                </ButtonGroup>
            </ModalContent>
        </Modal>
    );
};

export default WithdrawalModal;