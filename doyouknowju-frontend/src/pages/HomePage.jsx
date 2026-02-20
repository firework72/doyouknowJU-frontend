import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import StockTop10View from '../front/StockView';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';
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
    const [selectedIndex, setSelectedIndex] = useState('KOSPI');
    const [selectedRange, setSelectedRange] = useState('1h');
    const chartContainerRef = useRef(null);

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

    const toIndexChartRows = (rows) => {
        if (!Array.isArray(rows)) return [];

        const points = rows
            .map((item, idx) => {
                const close =
                    toNumber(item?.nowVal) ??
                    toNumber(item?.bstp_nmix_prpr) ??
                    toNumber(item?.closePrice);

                if (close === null) return null;

                const rawTime = String(item?.thistime ?? item?.stck_cntg_hour ?? item?.localDate ?? '').trim();
                let dateNumber = null;
                let timeNumber = null;
                let chartTime = null;

                if (/^\d{14}$/.test(rawTime)) {
                    const yyyy = Number(rawTime.slice(0, 4));
                    const mm = Number(rawTime.slice(4, 6));
                    const dd = Number(rawTime.slice(6, 8));
                    const hh = Number(rawTime.slice(8, 10));
                    const mi = Number(rawTime.slice(10, 12));
                    const ss = Number(rawTime.slice(12, 14));
                    dateNumber = Number(rawTime.slice(0, 8));
                    timeNumber = Number(rawTime.slice(8, 14));
                    chartTime = Math.floor(Date.UTC(yyyy, mm - 1, dd, hh, mi, ss) / 1000);
                } else if (/^\d{12}$/.test(rawTime)) {
                    const yyyy = Number(rawTime.slice(0, 4));
                    const mm = Number(rawTime.slice(4, 6));
                    const dd = Number(rawTime.slice(6, 8));
                    const hh = Number(rawTime.slice(8, 10));
                    const mi = Number(rawTime.slice(10, 12));
                    dateNumber = Number(rawTime.slice(0, 8));
                    timeNumber = Number(rawTime.slice(8, 12) + '00');
                    chartTime = Math.floor(Date.UTC(yyyy, mm - 1, dd, hh, mi, 0) / 1000);
                } else if (/^\d{6}$/.test(rawTime)) {
                    timeNumber = Number(rawTime);
                } else if (/^\d{8}$/.test(rawTime)) {
                    const yyyy = Number(rawTime.slice(0, 4));
                    const mm = Number(rawTime.slice(4, 6));
                    const dd = Number(rawTime.slice(6, 8));
                    dateNumber = Number(rawTime);
                    timeNumber = 0;
                    chartTime = Math.floor(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0) / 1000);
                }

                if (timeNumber === 888888) return null;
                if (dateNumber === null) {
                    const rawDate = String(item?.stck_bsop_date ?? item?.xymd ?? '').trim();
                    if (/^\d{8}$/.test(rawDate)) {
                        dateNumber = Number(rawDate);
                    }
                }

                if (!Number.isFinite(chartTime) && Number.isFinite(dateNumber) && Number.isFinite(timeNumber) && timeNumber >= 0) {
                    const dateText = String(dateNumber).padStart(8, '0');
                    const timeText = String(timeNumber).padStart(6, '0');
                    const yyyy = Number(dateText.slice(0, 4));
                    const mm = Number(dateText.slice(4, 6));
                    const dd = Number(dateText.slice(6, 8));
                    const hh = Number(timeText.slice(0, 2));
                    const mi = Number(timeText.slice(2, 4));
                    const ss = Number(timeText.slice(4, 6));
                    chartTime = Math.floor(Date.UTC(yyyy, mm - 1, dd, hh, mi, ss) / 1000);
                }

                return {
                    value: close,
                    label: String(
                        item?.time ??
                        item?.dateTime ??
                        item?.thistime ??
                        item?.stck_cntg_hour ??
                        item?.xymd ??
                        item?.stck_bsop_date ??
                        idx,
                    ),
                    timeNumber,
                    dateNumber,
                    sortKey: (dateNumber ?? 0) * 1000000 + (timeNumber ?? 0),
                    chartTime,
                    open: toNumber(item?.openVal) ?? toNumber(item?.openPrice) ?? close,
                    high: toNumber(item?.highVal) ?? toNumber(item?.highPrice) ?? close,
                    low: toNumber(item?.lowVal) ?? toNumber(item?.lowPrice) ?? close,
                    close,
                    dayDiff: toNumber(item?.changeVal) ?? toNumber(item?.bstp_nmix_prdy_vrss),
                    dayRate: toNumber(item?.changeRate) ?? toNumber(item?.bstp_nmix_prdy_ctrt),
                    tickVolume: toNumber(item?.quant) ?? toNumber(item?.cntg_vol) ?? 0,
                };
            })
            .filter(Boolean);
        return points
            .filter(
                (point) =>
                    Number.isFinite(point.chartTime) &&
                    Number.isFinite(point.open) &&
                    Number.isFinite(point.high) &&
                    Number.isFinite(point.low) &&
                    Number.isFinite(point.close) &&
                    point.timeNumber !== 888888,
            )
            .sort((a, b) => (a.sortKey ?? 0) - (b.sortKey ?? 0));
    };

    const toUniqueRowsByTime = (rows) => {
        if (!Array.isArray(rows) || rows.length === 0) return [];
        const unique = new Map();
        rows.forEach((row) => {
            if (Number.isFinite(row?.chartTime)) unique.set(row.chartTime, row);
        });
        return [...unique.values()].sort((a, b) => (a.chartTime ?? 0) - (b.chartTime ?? 0));
    };

    const applyRangeView = (rows, range) => {
        if (!Array.isArray(rows)) return [];
        const sorted = [...rows].sort((a, b) => (a.sortKey ?? 0) - (b.sortKey ?? 0));
        return sorted;
    };

    const loadIndexCharts = async (range = 'day', isCancelled = () => false) => {
        const queryParams = { range };

        try {
            const [kospiRows, kosdaqRows] = await Promise.all([
                fetchKospiIndexChart(queryParams),
                fetchKosdaqIndexChart(queryParams),
            ]);

            let nextKospiRows = kospiRows;
            let nextKosdaqRows = kosdaqRows;

            const isKospiEmpty = !Array.isArray(nextKospiRows) || nextKospiRows.length === 0;
            const isKosdaqEmpty = !Array.isArray(nextKosdaqRows) || nextKosdaqRows.length === 0;

            if (isKospiEmpty || isKosdaqEmpty) {
                const [fallbackKospiRows, fallbackKosdaqRows] = await Promise.all([
                    fetchKospiIndexChart(queryParams),
                    fetchKosdaqIndexChart(queryParams),
                ]);

                if (isKospiEmpty) nextKospiRows = fallbackKospiRows;
                if (isKosdaqEmpty) nextKosdaqRows = fallbackKosdaqRows;
            }

            if (isCancelled()) return;
            setKospiChart(applyRangeView(toUniqueRowsByTime(toIndexChartRows(nextKospiRows)), range));
            setKosdaqChart(applyRangeView(toUniqueRowsByTime(toIndexChartRows(nextKosdaqRows)), range));
        } catch (err) {
            console.error('지수 차트 조회 실패:', err);
            if (isCancelled()) return;
            setKospiChart([]);
            setKosdaqChart([]);
        } finally {
            if (isCancelled()) return;
            setIndexChartLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            refreshUser();
        }

        api.get('/api/news')
            .then((res) => setNewsList(res.data))
            .catch((err) => console.error('뉴스 불러오기 실패:', err));
    }, []);

    useEffect(() => {
        let cancelled = false;
        const pollingIntervalMs = selectedRange === '1h' || selectedRange === 'day' ? 20000 : 60000;

        const poll = async () => {
            if (cancelled) return;
            await loadIndexCharts(selectedRange, () => cancelled);
        };

        setIndexChartLoading(true);
        poll();
        const intervalId = setInterval(poll, pollingIntervalMs);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [selectedRange]);

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

    const selectedRows = useMemo(
        () => (selectedIndex === 'KOSPI' ? kospiChart : kosdaqChart),
        [selectedIndex, kospiChart, kosdaqChart],
    );
    const hasIntradaySelectedRows = useMemo(
        () => selectedRows.some((row) => Number(row?.timeNumber) > 0),
        [selectedRows],
    );

    const chartSummary = useMemo(() => {
        if (!selectedRows.length) return null;
        const last = selectedRows[selectedRows.length - 1];
        const rangeSecondsMap = {
            '1h': 60 * 60,
            day: 24 * 60 * 60,
            week: 7 * 24 * 60 * 60,
            month: 30 * 24 * 60 * 60,
            year: 365 * 24 * 60 * 60,
        };
        const targetSeconds = rangeSecondsMap[selectedRange] ?? 0;
        const targetTime = targetSeconds > 0 ? last.chartTime - targetSeconds : null;
        const baselineCandidates = targetTime
            ? selectedRows.filter((row) => Number.isFinite(row?.chartTime) && row.chartTime <= targetTime)
            : [];
        const baseline = baselineCandidates.length
            ? baselineCandidates[baselineCandidates.length - 1]
            : selectedRows[0];
        const dayHigh = Math.max(...selectedRows.map((row) => row.high));
        const dayLow = Math.min(...selectedRows.map((row) => row.low));
        const rangeDiff = last.close - baseline.close;
        const rangeRate = baseline.close !== 0 ? (rangeDiff / baseline.close) * 100 : 0;
        return {
            open: baseline.open,
            high: dayHigh,
            low: dayLow,
            close: last.close,
            diff: rangeDiff,
            rate: rangeRate,
            volume: last.tickVolume ?? 0,
        };
    }, [selectedRows, selectedRange]);

    useEffect(() => {
        if (!chartContainerRef.current || !selectedRows.length) return;
        const chart = createChart(chartContainerRef.current, {
            autoSize: true,
            layout: {
                background: { color: '#ffffff' },
                textColor: '#6b7280',
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: '#eef2f7' },
                horzLines: { color: '#eef2f7' },
            },
            rightPriceScale: {
                borderColor: '#e5e7eb',
            },
            timeScale: {
                borderColor: '#e5e7eb',
                timeVisible: (selectedRange === '1h' || selectedRange === 'day') && hasIntradaySelectedRows,
                secondsVisible: false,
            },
            crosshair: {
                horzLine: { color: '#9ca3af' },
                vertLine: { color: '#9ca3af' },
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#ef4444',
            downColor: '#2563eb',
            borderVisible: false,
            wickUpColor: '#ef4444',
            wickDownColor: '#2563eb',
            priceLineVisible: true,
            lastValueVisible: true,
        });

        const toCandleData = selectedRows.map((row) => ({
            time: row.chartTime,
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
        }));
        candleSeries.setData(toCandleData);

        const calcMA = (period) => {
            const data = [];
            for (let idx = 0; idx < selectedRows.length; idx += 1) {
                if (idx < period - 1) continue;
                const slice = selectedRows.slice(idx - period + 1, idx + 1);
                const avg = slice.reduce((sum, row) => sum + row.close, 0) / period;
                data.push({ time: selectedRows[idx].chartTime, value: avg });
            }
            return data;
        };

        const ma20 = chart.addSeries(LineSeries, {
            color: '#22c55e',
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
        });
        ma20.setData(calcMA(20));

        const ma60 = chart.addSeries(LineSeries, {
            color: '#ef4444',
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
        });
        ma60.setData(calcMA(60));

        if ((selectedRange === '1h' || selectedRange === 'day') && selectedRows.length) {
            const firstTime = selectedRows[0].chartTime;
            const lastTime = selectedRows[selectedRows.length - 1].chartTime;
            const visibleWindowSeconds =
                selectedRange === '1h'
                    ? 24 * 60 * 60
                    : 90 * 24 * 60 * 60;
            chart.timeScale().setVisibleRange({
                from: Math.max(firstTime, lastTime - visibleWindowSeconds),
                to: lastTime,
            });
        } else {
            chart.timeScale().fitContent();
        }

        return () => {
            chart.remove();
        };
    }, [selectedRows, selectedRange, hasIntradaySelectedRows]);

    return (
        <main className="main-container">
            <div className="main-grid">
                <div className="grid-row top-row">
                    <Card className="large-card" id="rising-section">
                        <StockTop10View />
                    </Card>
                    <Card className="large-card" id="falling-section">
                        <div className="index-panel-head">
                            <h3 className="section-title">차트</h3>
                            <div className="index-switch">
                                <button
                                    className={`index-switch-btn ${selectedIndex === 'KOSPI' ? 'is-active' : ''}`}
                                    onClick={() => setSelectedIndex('KOSPI')}
                                >
                                    코스피
                                </button>
                                <button
                                    className={`index-switch-btn ${selectedIndex === 'KOSDAQ' ? 'is-active' : ''}`}
                                    onClick={() => setSelectedIndex('KOSDAQ')}
                                >
                                    코스닥
                                </button>
                            </div>
                        </div>
                        <div className="index-toolbar">
                            <button className={`index-toolbar-btn ${selectedRange === '1h' ? 'is-active' : ''}`} onClick={() => setSelectedRange('1h')}>실시간</button>
                            <button className={`index-toolbar-btn ${selectedRange === 'day' ? 'is-active' : ''}`} onClick={() => setSelectedRange('day')}>일</button>
                            <button className={`index-toolbar-btn ${selectedRange === 'week' ? 'is-active' : ''}`} onClick={() => setSelectedRange('week')}>주</button>
                            <button className={`index-toolbar-btn ${selectedRange === 'month' ? 'is-active' : ''}`} onClick={() => setSelectedRange('month')}>월</button>
                            <button className={`index-toolbar-btn ${selectedRange === 'year' ? 'is-active' : ''}`} onClick={() => setSelectedRange('year')}>년</button>
                        </div>
                        {indexChartLoading ? (
                            <div className="index-chart-loading">지수 차트를 불러오는 중...</div>
                        ) : (
                            <>
                                {chartSummary && (
                                    <div className="index-ohlc-row">
                                        <span>시 {chartSummary.open.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        <span>고 {chartSummary.high.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        <span>저 {chartSummary.low.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        <span>종 {chartSummary.close.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        <span className={chartSummary.diff >= 0 ? 'is-up' : 'is-down'}>
                                            {chartSummary.diff >= 0 ? '▲' : '▼'} {Math.abs(chartSummary.diff).toFixed(2)} ({chartSummary.rate >= 0 ? '+' : ''}{chartSummary.rate.toFixed(2)}%)
                                        </span>
                                        <span>거래량 {chartSummary.volume.toLocaleString('ko-KR')}</span>
                                    </div>
                                )}
                                <div ref={chartContainerRef} className="index-advanced-chart" />
                            </>
                        )}
                    </Card>
                    <Card className="small-card" id="myinfo-section">
                        {user ? (
                            <div className="user-profile">
                                <h3 className="section-title">내 정보</h3>
                                <div className="user-info-list">
                                    <div className="user-info-item">
                                        <span className="info-label">아이디</span>
                                        <div className="info-value-with-title">
                                            {user.equippedTitleImgUrl && (
                                                <img
                                                    src={getImageUrl(user.equippedTitleImgUrl)}
                                                    alt={user.equippedTitleName}
                                                    className="homepage-title-icon"
                                                    title={user.equippedTitleName}
                                                />
                                            )}
                                            <strong>{user.userId}</strong>
                                        </div>
                                    </div>
                                    <div className="user-info-item">
                                        <span className="info-label">보유 자산</span>
                                        <span className="info-value">{user.points?.toLocaleString()}원</span>
                                    </div>
                                    <div className="user-info-item">
                                        <span className="info-label">레벨</span>
                                        <span className="info-value">Lv. {user.userLevel}</span>
                                    </div>
                                    <div className="user-info-item">
                                        <span className="info-label">누적 출석</span>
                                        <span className="info-value">{user.consecDays}일</span>
                                    </div>
                                </div>
                                <div className="auth-links home-profile-footer">
                                    <button onClick={handleLogout} className="auth-link-btn">로그아웃</button>
                                </div>
                                <div className="auth-links home-profile-actions">
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
