import { useEffect, useState } from 'react';
import { Card } from '../components/common';
import api from '../api/trade/axios';

const NewsPage = () => {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNews = async () => {
        setLoading(true);
        try {
            // 뉴스 갱신 요청 (크롤링 + AI 요약) - 필요시 호출
            // 하지만 보통은 조회만 하고, 갱신은 별도 버튼이나 백엔드 스케줄러로 함.
            // 여기서는 조회 -> 데이터 없으면 갱신? 아니면 그냥 조회.
            // 사용자 요구사항: "뉴스 페이지 최상단에 AI 요약 표시"

            // 1. 뉴스 조회
            const res = await api.get('/api/news');
            if (res.data && res.data.length > 0) {
                setNewsList(res.data);
            } else {
                // 데이터 없으면 갱신 시도 (옵션)
                await refreshNews();
            }
        } catch (error) {
            console.error("뉴스 로드 실패", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshNews = async () => {
        try {
            setLoading(true);
            await api.post('/api/news/refresh'); // 갱신 트리거
            const res = await api.get('/api/news'); // 다시 조회
            setNewsList(res.data);
        } catch (error) {
            console.error("뉴스 갱신 실패", error);
            alert("뉴스 갱신에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    // AI 요약 텍스트 추출 (첫 번째 뉴스에 저장된 것 사용)
    const aiSummary = newsList.length > 0 ? newsList[0].aiSummary : null;
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '1.5rem' }}>📈 오늘의 증시 & 경제 뉴스</h2>

            {/* 상단: AI 요약 카드 */}
            <Card style={{ marginBottom: '20px', borderLeft: '5px solid #007bff', background: '#f8f9fa' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px', color: '#007bff' }}>🤖 Gemini AI 증시 요약 ({today})</h3>
                {loading ? (
                    <p>AI가 열심히 뉴스를 읽고 요약 중입니다... (약 5초 소요)</p>
                ) : aiSummary ? (
                    <p style={{ lineHeight: '1.6', fontSize: '1rem' }}>{aiSummary}</p>
                ) : (
                    <div>
                        <p>등록된 요약 정보가 없습니다.</p>
                        <button onClick={refreshNews} style={{ marginTop: '10px', padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            뉴스 갱신하기
                        </button>
                    </div>
                )}
            </Card>

            {/* 하단: 뉴스 리스트 */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>주요 경제 뉴스</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading && newsList.length === 0 ? (
                    <p>뉴스를 불러오는 중입니다...</p>
                ) : newsList.length > 0 ? (
                    newsList.map((news) => (
                        <Card key={news.newsId} style={{ display: 'flex', gap: '15px', padding: '15px', alignItems: 'center' }}>
                            {news.imageUrl && (
                                <img src={news.imageUrl} alt="뉴스 썸네일" style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '5px' }} />
                            )}
                            <div style={{ flex: 1 }}>
                                <a href={news.newsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'black' }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontWeight: '600' }}>{news.title}</h4>
                                </a>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    <span>{news.pubDate}</span> • <span>{news.newsCategory}</span>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p>표시할 뉴스가 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default NewsPage;
