import { useState, useEffect } from 'react';
import './MyPage.css';

const MyPage = () => {
    const [memberInfo, setMemberInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMemberInfo = async () => {

            //사용자 정보 가져오기
            const loginUser = JSON.parse(localStorage.getItem('user'));

            if(!loginUser || !loginUser.userId){
                alert("로그인이 필요한 페이지입니다.");
                window.location.href="/";
                return;
            }
            try {
                const response = await fetch(`http://localhost:8080/dykj/api/members/info?userId=${loginUser.userId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch user info');
                }

                const result = await response.json();
                setMemberInfo(result);

                localStorage.setItem('user',JSON.stringify(result));
            } catch (err) {
                console.error("Error fetching member info:", err);
                setError(err.message);
                setMemberInfo(loginUser);
            } finally {
                setLoading(false);
            }
        };

        fetchMemberInfo();
    }, []);

    if (loading) return <div className="mypage-container">Loading...</div>;

    return (
        <div className="mypage-container">
            <div className="mypage-grid">
                {/* My Info Card */}
                <div className="mypage-card my-info-card">
                    <div className="section-title">내정보</div>

                    <div className="info-list">
                        <div className="info-item">
                            <span className="info-label">아이디</span>
                            <span className="info-value">{memberInfo?.userId}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">경험치</span>
                            <span className="info-value">{memberInfo?.experience}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">레벨</span>
                            <span className="info-value">Lv. {memberInfo?.userLevel}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">보유 포인트</span>
                            <span className="info-value">{memberInfo?.points?.toLocaleString()} P</span>
                        </div>
                    </div>
                </div>

                {/* Portfolio Card */}
                <div className="mypage-card portfolio-card">
                    <div className="section-title">포트 폴리오</div>
                    <div className="placeholder-text"></div>
                </div>
            </div>

            <div className="mypage-row-bottom">
                {/* Titles / Achievements Card */}
                <div className="mypage-card title-card">
                    <div className="section-title">
                        보유 칭호<br />
                        도전 과제
                    </div>
                    <div className="placeholder-text"></div>
                </div>

                {/* Posts / Comments Card */}
                <div className="mypage-card posts-card">
                    <div className="section-title">작성한 게시글 / 댓글</div>
                    <div className="placeholder-text"></div>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
