import { useState, useEffect } from 'react';
import './MyPage.css';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/common';

const MyPage = () => {
    const { user, setUser, loading: authLoading, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMemberInfo = async () => {
            if (!user) {
                alert("로그인이 필요한 페이지입니다.");
                navigate('/', { replace: true });
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/dykj/api/members/info`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const result = await response.json();
                    setUser(result);
                    localStorage.setItem('user', JSON.stringify(result));
                } else if (response.status === 401) {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                    logout(false);
                }
            } catch (err) {
                console.error("데이터 로딩 실패 : ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMemberInfo();
    }, []);

    if (authLoading || loading) {
        return (
            <div className="signup-loading-wrapper">
                <Spinner size="lg" />
                <p className="loading-text">정보를 불러오는 중...</p>
            </div>
        );
    }

    if(!user) return null;

    return (
        <div className="mypage-container">
            <div className="mypage-grid">
                {/* My Info Card */}
                <div className="mypage-card my-info-card">
                    <div className="section-title">내정보

                        <button>출석체크</button>
                    </div>

                    <div className="info-list">
                        <div className="info-item">
                            <span className="info-label">아이디</span>
                            <span className="info-value">{user.userId}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">경험치</span>
                            <span className="info-value">{user.experience}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">레벨</span>
                            <span className="info-value">Lv. {user.userLevel}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">보유 포인트</span>
                            <span className="info-value">{user.points?.toLocaleString()} P</span>
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
