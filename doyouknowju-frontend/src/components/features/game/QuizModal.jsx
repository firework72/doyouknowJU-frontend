import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../../common/Modal';

const QuizContent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px 0;
	text-align: center;
`;

const QuestionBox = styled.div`
	background: #f8f9fa;
	border-radius: 16px;
	padding: 24px;
	width: 100%;
	margin-bottom: 30px;
	min-height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid #eee;
`;

const QuestionText = styled.h3`
	font-size: 1.25rem;
	color: #333;
	line-height: 1.6;
	word-break: keep-all;
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 20px;
	width: 100%;
`;

const OXButton = styled.button`
	flex: 1;
	height: 100px;
	font-size: 3rem;
	font-weight: bold;
	border-radius: 16px;
	border: 2px solid transparent;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	
	background: ${props => props.type === 'O' ? '#ecfdf5' : '#fff1f2'};
	color: ${props => props.type === 'O' ? '#10b981' : '#f43f5e'};
	border-color: ${props => props.type === 'O' ? '#10b981' : '#f43f5e'};

	&:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		filter: brightness(0.95);
	}

	&:disabled {
		cursor: default;
		transform: none;
		opacity: 0.6;
	}
`;

const ResultMessage = styled.div`
	margin-top: 20px;
	padding: 20px;
	border-radius: 12px;
	width: 100%;
	background: ${props => props.$success ? '#f0fdf4' : '#fef2f2'};
	border: 1px solid ${props => props.$success ? '#bbf7d0' : '#fecaca'};
`;

const Explanation = styled.p`
	font-size: 0.95rem;
	color: #666;
	margin-top: 10px;
	line-height: 1.5;
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
	transition: background 0.2s;

	&:hover {
		background: #7c3aed;
	}
`;

const QuizModal = ({ isOpen, onClose, onQuizComplete }) => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchTodayQuiz();
        } else {
            setSelectedAnswer(null);
            setResult(null);
        }
    }, [isOpen]);

    const fetchTodayQuiz = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/dykj/api/game/quiz/today', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setQuiz(data);
            } else if (response.status === 404) {
                setQuiz(null);
            }
        } catch (error) {
            console.error("퀴즈 조회 중 에러:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (answer) => {
        if (selectedAnswer || !quiz) return;
        setSelectedAnswer(answer);

        try {
            const response = await fetch('http://localhost:8080/dykj/api/game/quiz/solve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quizId: quiz.quizId, answer: answer }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);

                // 레벨업 체크
                if (data.levelUp && onLevelUp) {
                    onLevelUp(data.currentLevel);
                }
            } else {
                const errorMsg = await response.text();
                alert(errorMsg);
            }
        } catch (error) {
            console.error("퀴즈 제출 중 에러:", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="데일리 OX 퀴즈"
            footer={result ? <CloseButton onClick={onClose}>확인</CloseButton> : null}
        >
            <QuizContent>
                {loading ? (
                    <p>퀴즈를 불러오는 중...</p>
                ) : quiz ? (
                    <>
                        {quiz.solved && !result ? (
                            <p style={{ color: '#666' }}>오늘은 이미 퀴즈를 풀었습니다! 내일 다시 도전해주세요. 😊</p>
                        ) : (
                            <>
                                {!result && <p style={{ marginBottom: '10px', color: '#8b5cf6', fontWeight: 'bold' }}>오늘의 문제를 맞춰보세요!</p>}
                                <QuestionBox>
                                    <QuestionText>{quiz.quizQuestion}</QuestionText>
                                </QuestionBox>
                                <ButtonGroup>
                                    <OXButton
                                        type="O"
                                        onClick={() => handleAnswer('O')}
                                        disabled={!!result || quiz.solved}
                                        style={selectedAnswer === 'O' ? { boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' } : {}}
                                    >
                                        O
                                    </OXButton>
                                    <OXButton
                                        type="X"
                                        onClick={() => handleAnswer('X')}
                                        disabled={!!result || quiz.solved}
                                        style={selectedAnswer === 'X' ? { boxShadow: '0 0 0 4px rgba(244, 63, 94, 0.2)' } : {}}
                                    >
                                        X
                                    </OXButton>
                                </ButtonGroup>
                                {result && (
                                    <ResultMessage $success={result.correct}>
                                        <h4 style={{ color: result.correct ? '#10b981' : '#f43f5e' }}>
                                            {result.correct ? "정답입니다! 🎉" : "아쉽게도 틀렸습니다. 😢"}
                                        </h4>
                                        <Explanation>{result.quizExplain}</Explanation>
                                        {result.correct && (
                                            <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#8b5cf6' }}>
                                                +{result.rewardExp} EXP 획득!
                                            </p>
                                        )}
                                    </ResultMessage>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <p>오늘은 준비된 퀴즈가 없습니다.</p>
                )}
            </QuizContent>
        </Modal>
    );
};

export default QuizModal;
