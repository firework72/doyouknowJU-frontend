import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import StockTop10View from '../front/StockView';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { Badge, Button } from '../components/common';
import AttendanceModal from '../components/features/game/Attendance/AttendanceModal';
import LevelUpModal from '../components/features/game/LevelUpModal';
import QuizModal from '../components/features/game/QuizModal';
import api from '../api/trade/axios';
import Ranking from '../components/features/ranking/Ranking';
import PopularBoardsPanel from '../components/features/community/PopularBoardsPanel';
import { getImageUrl } from '../api/game/titleApi';
import { fetchKospiIndexChart, fetchKosdaqIndexChart } from '../api/stockApi';

function HomePage() {
    const navigate = useNavigate();
    const { user, login, logout, refreshUser } = useAuth();

    const [loginId, setLoginId] = useState('');
    const [loginPwd, setLoginPwd] = useState('');
    const [newsList, setNewsList] = useState([]);
    const [kospiChart, setKospiChart] = useState([]);
    const [kosdaqChart, setKosdaqChart] = useState([]);
    const [indexChartLoading, setIndexChartLoading] = useState(true);

    const [attendanceModal, setAttendanceModal] = useState({
        isOpen: false,
        data: null,
    });
    const [levelUpModal, setLevelUpModal] = useState({
        isOpen: false,
        level: 1,
    });
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

    const toNumber = (value) => {
        if (value === null || value === undefined) return null;
        const normalized = String(value).replace(/,/g, '').trim();
        if (normalized === '') return null;
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : null;
    };

    const toIndexChartPoints = (rows) => {
        if (!Array.isArray(rows)) return [];

        const points = rows
            .map((item, idx) => {
                const close =
                    toNumber(item?.bstp_nmix_prpr) ??
                    toNumber(item?.close) ??
                    toNumber(item?.stck_clpr) ??
                    toNumber(item?.stckPrpr) ??
                    toNumber(item?.stck_prpr) ??
                    toNumber(item?.nowVal) ??
                    toNumber(item?.value) ??
                    toNumber(item?.price);

                if (close === null) return null;

                const rawTime = String(item?.stck_cntg_hour ?? '').trim();
                const timeNumber = /^\d{6}$/.test(rawTime) ? Number(rawTime) : null;

                return {
                    value: close,
                    label: String(
                        item?.time ??
                        item?.dateTime ??
                        item?.stck_cntg_hour ??
                        item?.xymd ??
                        item?.stck_bsop_date ??
                        idx,
                    ),
                    timeNumber,
                    dayDiff: toNumber(item?.bstp_nmix_prdy_vrss) ?? toNumber(item?.prdy_vrss),
                    dayRate: toNumber(item?.bstp_nmix_prdy_ctrt) ?? toNumber(item?.prdy_ctrt),
                };
            })
            .filter(Boolean);

        const validTimePoints = points.filter(
            (point) => point.timeNumber !== null && point.timeNumber >= 0 && point.timeNumber <= 235959,
        );

        const base = validTimePoints.length > 1 ? validTimePoints : points;
        return [...base].sort((a, b) => (a.timeNumber ?? 0) - (b.timeNumber ?? 0));
    };

    useEffect(() => {
        if (user) {
            refreshUser();
        }

        api.get('/api/news')
            .then((res) => setNewsList(res.data))
            .catch((err) => console.error('뉴스 불러오기 실패:', err));

        const formatYmd = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        };

        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 1);

        const start = formatYmd(startDate);
        const end = formatYmd(endDate);

        setIndexChartLoading(true);
        Promise.all([
            fetchKospiIndexChart({ start, end, period: 1 }),
            fetchKosdaqIndexChart({ start, end, period: 1 }),
        ])
            .then(async ([kospiRows, kosdaqRows]) => {
                let nextKospiRows = kospiRows;
                let nextKosdaqRows = kosdaqRows;

                const isKospiEmpty = !Array.isArray(nextKospiRows) || nextKospiRows.length === 0;
                const isKosdaqEmpty = !Array.isArray(nextKosdaqRows) || nextKosdaqRows.length === 0;

                if (isKospiEmpty || isKosdaqEmpty) {
                    const [fallbackKospiRows, fallbackKosdaqRows] = await Promise.all([
                        fetchKospiIndexChart(),
                        fetchKosdaqIndexChart(),
                    ]);

                    if (isKospiEmpty) nextKospiRows = fallbackKospiRows;
                    if (isKosdaqEmpty) nextKosdaqRows = fallbackKosdaqRows;
                }

                setKospiChart(toIndexChartPoints(nextKospiRows));
                setKosdaqChart(toIndexChartPoints(nextKosdaqRows));
            })
            .catch((err) => {
                console.error('지수 차트 조회 실패:', err);
                setKospiChart([]);
                setKosdaqChart([]);
            })
            .finally(() => {
                setIndexChartLoading(false);
            });
    }, []);

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8080/dykj/api/members/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: loginId, userPwd: loginPwd }),
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                login(data);
                alert(`반가워요, ${data.userId}님!`);
            } else {
                const errorData = await response.json();
                alert(errorData.message || '아이디 또는 비밀번호를 확인해주세요.');
                setLoginId('');
                setLoginPwd('');
            }
        } catch (error) {
            console.error('로그인 중 에러 발생:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    const handleLogout = async () => {
        logout();
    };

    const handleAttend = async () => {
        try {
            const response = await fetch('http://localhost:8080/dykj/api/game/attend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok) {
                if (data.success) {
                    setAttendanceModal({ isOpen: true, data });
                    refreshUser();
                } else {
                    alert(data.message);
                }
            } else {
                alert(data.message || '출석체크 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('출석체크 중 에러 발생:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    const handleQuizComplete = (result) => {
        if (result.isCorrect) {
            refreshUser();
        }
    };

    const handleCloseAttendance = () => {
        const { data } = attendanceModal;
        setAttendanceModal({ ...attendanceModal, isOpen: false });
        if (data && data.levelUp) {
            setLevelUpModal({ isOpen: true, level: data.currentLevel });
        }
    };

    const buildSparklineCoordinates = (points, width, height, padding = 8) => {
        if (!points || points.length === 0) {
            return { linePath: '', areaPath: '', minValue: 0, maxValue: 0 };
        }

        const values = points.map((point) => point.value);
        const rawMin = Math.min(...values);
        const rawMax = Math.max(...values);
        const pad = Math.max((rawMax - rawMin) * 0.12, rawMax * 0.0015, 0.5);
        const minValue = rawMin - pad;
        const maxValue = rawMax + pad;
        const valueRange = maxValue - minValue || 1;
        const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

        const coords = points.map((point, index) => {
            const x = padding + stepX * index;
            const y = height - padding - ((point.value - minValue) / valueRange) * (height - padding * 2);
            return { x, y };
        });

        const linePath = coords
            .map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x.toFixed(2)} ${coord.y.toFixed(2)}`)
            .join(' ');

        const first = coords[0];
        const last = coords[coords.length - 1];
        const areaPath = `${linePath} L ${last.x.toFixed(2)} ${(height - padding).toFixed(2)} L ${first.x.toFixed(2)} ${(height - padding).toFixed(2)} Z`;

        return { linePath, areaPath, minValue, maxValue };
    };

    const formatIndexTime = (raw) => {
        const value = String(raw ?? '').replace(/\D/g, '');
        if (value.length >= 6) {
            const hh = value.slice(0, 2);
            const mm = value.slice(2, 4);
            return `${hh}:${mm}`;
        }
        return '';
    };

    const formatIndexValue = (value) => value.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const renderIndexChart = (title, points) => {
        if (!points.length) {
            return (
                <div className="index-mini-card">
                    <div className="index-mini-header">
                        <span className="index-mini-title">{title}</span>
                    </div>
                    <div className="index-mini-sub">데이터 없음</div>
                </div>
            );
        }

        const latest = points.length > 0 ? points[points.length - 1]?.value : null;
        const previous = points.length > 1 ? points[points.length - 2]?.value : null;
        const latestPoint = points.length > 0 ? points[points.length - 1] : null;
        const minuteDiff = latest !== null && previous !== null ? latest - previous : 0;
        const minuteRate = previous ? (minuteDiff / previous) * 100 : 0;
        const diff = latestPoint?.dayDiff ?? minuteDiff;
        const changeRate = latestPoint?.dayRate ?? minuteRate;
        const width = 360;
        const height = 150;
        const chartPadding = 10;
        const { linePath, areaPath, minValue, maxValue } = buildSparklineCoordinates(points, width, 112, chartPadding);
        const firstLabel = formatIndexTime(points[0]?.label);
        const middleLabel = formatIndexTime(points[Math.floor(points.length / 2)]?.label);
        const lastLabel = formatIndexTime(points[points.length - 1]?.label);
        const isUp = (diff ?? 0) >= 0;
        const toneClass = isUp ? 'is-up' : 'is-down';
        const tickValues = [
            maxValue,
            maxValue - (maxValue - minValue) / 3,
            maxValue - ((maxValue - minValue) * 2) / 3,
            minValue,
        ];

        return (
            <div className={`index-mini-card ${toneClass}`}>
                <div className="index-mini-header">
                    <span className="index-mini-title">{title}</span>
                    {latest !== null && (
                        <span className="index-mini-price">{formatIndexValue(latest)}</span>
                    )}
                </div>
                <div className="index-mini-sub">
                    {latest === null
                        ? '데이터 없음'
                        : `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} (${changeRate >= 0 ? '+' : ''}${changeRate.toFixed(2)}%)`}
                </div>
                <div className="index-mini-chart-wrap">
                    <svg viewBox={`0 0 ${width} ${height}`} className="index-mini-svg" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`${title}-fill`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isUp ? 'rgba(229, 57, 53, 0.40)' : 'rgba(30, 136, 229, 0.40)'} />
                                <stop offset="100%" stopColor={isUp ? 'rgba(229, 57, 53, 0.04)' : 'rgba(30, 136, 229, 0.04)'} />
                            </linearGradient>
                        </defs>
                        <line x1="8" y1="20" x2="292" y2="20" className="index-grid-line" />
                        <line x1="8" y1="56" x2="292" y2="56" className="index-grid-line index-grid-mid" />
                        <line x1="8" y1="92" x2="292" y2="92" className="index-grid-line" />
                        {areaPath && <path d={areaPath} fill={`url(#${title}-fill)`} />}
                        {linePath && <path d={linePath} className="index-mini-line" />}
                    </svg>
                    <div className="index-y-axis">
                        {tickValues.map((tick, idx) => (
                            <span key={`${title}-tick-${idx}`}>{formatIndexValue(tick)}</span>
                        ))}
                    </div>
                </div>
                <div className="index-x-axis">
                    <span>{firstLabel || '-'}</span>
                    <span>{middleLabel || '-'}</span>
                    <span>{lastLabel || '-'}</span>
                </div>
            </div>
        );
    };

    return (
        <main className="main-container">
            <div className="main-grid">
                <div className="grid-row top-row">
                    <Card className="large-card" id="rising-section">
                        <StockTop10View />
                    </Card>
                    <Card className="large-card" id="falling-section">
                        <h3 className="section-title">지수 1분봉</h3>
                        <p className="section-description">코스피 / 코스닥 1분봉 차트</p>
                        <div className="section-content index-chart-grid">
                            {indexChartLoading ? (
                                <div className="index-chart-loading">지수 차트를 불러오는 중...</div>
                            ) : (
                                <>
                                    {renderIndexChart('KOSPI', kospiChart)}
                                    {renderIndexChart('KOSDAQ', kosdaqChart)}
                                </>
                            )}
                        </div>
                    </Card>
                    <Card className="small-card" id="myinfo-section">
                        {user ? (
                            <div className="user-profile">
                                <h3 className="section-title">내 정보</h3>
                                {user.equippedTitleName && (
                                    <div className="equipped-title-display">
                                        {user.equippedTitleImgUrl && (
                                            <img
                                                src={getImageUrl(user.equippedTitleImgUrl)}
                                                alt={user.equippedTitleName}
                                                className="homepage-equipped-title-img"
                                            />
                                        )}
                                        <Badge variant={user.equippedTitleColor || 'success'}>[{user.equippedTitleName}]</Badge>
                                    </div>
                                )}
                                <p className="welcome-msg"><strong>{user.userId}</strong>님, 환영합니다!</p>
                                <div className="user-stats">
                                    <p>보유 자산: {user.points?.toLocaleString()}원</p>
                                    <p>레벨: {user.userLevel}</p>
                                    <p>누적 출석: {user.consecDays}일</p>
                                </div>
                                <div className="auth-links">
                                    <button onClick={handleLogout} className="auth-link-btn">로그아웃</button>
                                </div>
                                <div className="auth-links">
                                    <Button onClick={handleAttend} variant="primary" size="sm" className="home-auth-btn">출석체크</Button>
                                    <Button onClick={() => setIsQuizModalOpen(true)} variant="secondary" size="sm" className="home-auth-btn">OX퀴즈</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="login-form">
                                <Input type="text" placeholder="아이디" className="login-input" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                                <Input type="password" placeholder="비밀번호" className="login-input" value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)} />
                                <div className="auth-links">
                                    <button onClick={handleLogin} className="auth-link-btn">로그인</button>
                                    <span className="auth-divider">/</span>
                                    <Link to="/signup" className="auth-link">회원가입</Link>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="grid-row bottom-row">
                    <Card className="medium-card" id="ranking-section">
                        <h3 className="section-title" onClick={() => navigate('/ranking')} style={{ cursor: 'pointer' }}>랭킹 &gt;</h3>
                        <p className="section-description">랭킹은 매일 자정 갱신됩니다.</p>
                        <div className="section-content">
                            <Ranking groupSize={3} /> {/* Dong : Ranking.jsx 추가 */}
                        </div>
                    </Card>
                    <Card className="medium-card" id="posts-section">
                        <h3 className="section-title">게시글</h3>
                        <p className="section-description">실시간 / 인기 게시글</p>
                        <div className="section-content">
                            <PopularBoardsPanel />
                        </div>
                    </Card>

                    <Card className="small-card" id="news-section">
                        <h3 className="section-title">뉴스 정보</h3>

                        {newsList.length > 0 && newsList[0].aiSummary && (
                            <div style={{ background: '#f0f7ff', padding: '10px', borderRadius: '5px', marginBottom: '10px', fontSize: '0.82rem', borderLeft: '4px solid #007bff' }}>
                                <strong style={{ color: '#007bff' }}>AI 요약:</strong> {newsList[0].aiSummary}
                            </div>
                        )}

                        <div className="section-content">
                            {newsList.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {newsList.map((news) => (
                                        <li key={news.newsId} style={{ marginBottom: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <a href={news.newsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#333' }}>
                                                • {news.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="section-description">뉴스를 불러오는 중...</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <AttendanceModal isOpen={attendanceModal.isOpen} onClose={handleCloseAttendance} data={attendanceModal.data} />
            <LevelUpModal isOpen={levelUpModal.isOpen} onClose={() => setLevelUpModal({ ...levelUpModal, isOpen: false })} level={levelUpModal.level} />
            <QuizModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} onLevelUp={(level) => setLevelUpModal({ isOpen: true, level })} onQuizComplete={handleQuizComplete} />
        </main>
    );
}

export default HomePage;
