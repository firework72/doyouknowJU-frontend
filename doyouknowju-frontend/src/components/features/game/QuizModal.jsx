import React, { useState, useEffect } from 'react';
import { quizApi } from '../../../api/game/quizApi';
import './QuizModal.css';
import { Modal, Button } from '../../common';

const QuizModal = ({ isOpen, onClose, onQuizComplete, onLevelUp }) => {
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
            const data = await quizApi.getTodayQuiz();
            setQuiz(data);
        } catch (error) {
            // Error logged in API
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (answer) => {
        if (selectedAnswer || !quiz) return;
        setSelectedAnswer(answer);

        try {
            const data = await quizApi.solveQuiz(quiz.quizId, answer);
            setResult(data);

            if(onQuizComplete){
                onQuizComplete(data);
            }

            // 레벨업 체크
            if (data.levelUp && onLevelUp) {
                onLevelUp(data.currentLevel);
            }
        } catch (error) {
            alert(error.message || "서버와 통신 중 오류가 발생했습니다.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="데일리 OX 퀴즈"
            footer={result ? <Button className="primary" onClick={onClose} style={{width: '100%'}}>확인</Button> : null}
        >
            <div className="quiz-content">
                {loading ? (
                    <p>퀴즈를 불러오는 중...</p>
                ) : quiz ? (
                    <>
                        {quiz.solved && !result ? (
                            <p style={{ color: '#666' }}>오늘은 이미 퀴즈를 풀었습니다! 내일 다시 도전해주세요. 😊</p>
                        ) : (
                            <>
                                {!result && <p style={{ marginBottom: '10px', color: '#8b5cf6', fontWeight: 'bold' }}>오늘의 문제를 맞춰보세요!</p>}
                                <div className="question-box">
                                    <h3 className="question-text">{quiz.quizQuestion}</h3>
                                </div>
                                <div className="button-group">
                                    <button
                                        className="ox-button type-o"
                                        onClick={() => handleAnswer('O')}
                                        disabled={!!result || quiz.solved}
                                        style={selectedAnswer === 'O' ? { boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' } : {}}
                                    >
                                        O
                                    </button>
                                    <button
                                        className="ox-button type-x"
                                        onClick={() => handleAnswer('X')}
                                        disabled={!!result || quiz.solved}
                                        style={selectedAnswer === 'X' ? { boxShadow: '0 0 0 4px rgba(244, 63, 94, 0.2)' } : {}}
                                    >
                                        X
                                    </button>
                                </div>
                                {result && (
                                    <div className={`result-message ${result.correct ? 'success' : 'fail'}`}>
                                        <h4 style={{ color: result.correct ? '#10b981' : '#f43f5e' }}>
                                            {result.correct ? "정답입니다! 🎉" : "아쉽게도 틀렸습니다. 😢"}
                                        </h4>
                                        <p className="result-explanation">{result.quizExplain}</p>
                                        {result.correct && (
                                            <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#8b5cf6' }}>
                                                +{result.rewardExp} EXP 획득!
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <p>오늘은 준비된 퀴즈가 없습니다.</p>
                )}
            </div>
        </Modal>
    );
};

export default QuizModal;
