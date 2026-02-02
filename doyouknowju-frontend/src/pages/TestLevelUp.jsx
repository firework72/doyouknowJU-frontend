import React, { useState } from 'react';
import axios from 'axios';
import LevelUpModal from '../components/features/game/LevelUpModal';
import { useAuth } from '../hooks/AuthContext';

const TestLevelUp = () => {
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState(0);
    const [log, setLog] = useState('');

    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(1);

    const { user, refreshUser, loading, authLoading } = useAuth();

    const navigate = React.useMemo(()=>(path) => window.location.href = path, []);

    React.useEffect(()=>{
        if(!authLoading && !user){
            alert("로그인이 필요한 페이지입니다.");
            window.location.href = '/';
        }else if (user){
            setUserId(user.userId);
        }
    },[user,authLoading]);

    const handleGainExp = async () => {
        if (!userId) {
            alert('유저 ID를 입력하세요');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/dykj/api/game/exp/test',{
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify({
                    amount: Number(amount),
                }),
                credentials: 'include',
            });

            if(!response.ok){
                if(response.status === 401){
                    await refreshUser();
                    return;
                }
                const errorData = await response.text();
                throw new Error(`서버 오류 (${response.status}): ${errorData}`);
            }

            const result = await response.json();
            setLog(JSON.stringify(result, null, 2));

            // 레벨업 여부 확인 및 모달 띄우기
            if(result.levelUp || result.isLevelUp){
                setCurrentLevel(result.currentLevel);
                setIsModalOpen(true);
            }

            await refreshUser();

        } catch (error) {
            console.error("Experience gain error:", error);
            setLog('에러 발생: ' + error.message);
            alert('경험치 획득 중 오류가 발생했습니다: '+error.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>레벨업 테스트 페이지</h1>

            <div style={{ marginBottom: '20px' }}>
                <label>User ID: </label>
                <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="DB에 존재하는 유저 ID"
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label>Exp Amount: </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>

            <button onClick={handleGainExp} style={{ padding: '10px 20px' }}>
                경험치 획득 (Gain Exp)
            </button>

            <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap', background: '#f0f0f0', padding: '10px' }}>
                <h3>Result Log:</h3>
                {log}
            </div>

            {/* 레벨업 모달 */}
            <LevelUpModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                level={currentLevel}
            />
        </div>
    );
};

export default TestLevelUp;
