import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPopularBoards } from '@/api/boardApi';
import { getImageUrl } from '@/api/game/titleApi';
import styles from './PopularBoardsPanel.module.css';

const toDateString = (value) => {
  if (!value) return '-';

  let date;
  if (Array.isArray(value)) {
    date = new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0, value[5] || 0);
  } else {
    date = new Date(value);
  }

  if (isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  })
    .format(date)
    .replace(/\. /g, '-')
    .replace('.', '');
};

const PopularBoardsPanel = () => {
  const navigate = useNavigate();
  const [realtimeFree, setRealtimeFree] = useState([]);
  const [weeklyStock, setWeeklyStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    Promise.all([
      fetchPopularBoards({ boardType: 'free', range: 'realtime', limit: 10 }),
      fetchPopularBoards({ boardType: 'stock', range: 'weekly', limit: 10 }),
    ])
      .then(([freeBoards, stockBoards]) => {
        if (!isActive) return;
        setRealtimeFree(Array.isArray(freeBoards) ? freeBoards : []);
        setWeeklyStock(Array.isArray(stockBoards) ? stockBoards : []);
      })
      .catch((error) => {
        console.error('인기 게시글 조회 실패', error);
        if (!isActive) return;
        setRealtimeFree([]);
        setWeeklyStock([]);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const renderList = (items) => {
    if (loading) return <div className={styles.empty}>불러오는 중...</div>;
    if (!items || items.length === 0) return <div className={styles.empty}>데이터가 없습니다.</div>;

    return (
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={item.boardId ?? `${item.boardTitle ?? 'board'}-${item.createDate ?? index}`} className={styles.item}>
            <button
              type="button"
              className={styles.row}
              onClick={() => navigate(`/board/${item.boardId}`)}
              title={item.boardTitle}
            >
              <span className={styles.rank}>{item.dataRank ?? index + 1}</span>
              <span className={styles.title}>{item.boardTitle ?? '(제목 없음)'}</span>
              <span className={styles.meta}>
                <span className={styles.writerWrap}>
                  {item.userTitleImgUrl && (
                    <span className={styles.titleBadge}>
                      <img src={getImageUrl(item.userTitleImgUrl)} alt="칭호" className={styles.titleIcon} />
                    </span>
                  )}
                  <span className={styles.writer}>{item.userId ?? '-'}</span>
                </span>
                <span className={styles.date}>{toDateString(item.modifyDate ?? item.createDate)}</span>
                {item.viewCount !== undefined && <span className={styles.views}>조회 {item.viewCount}</span>}
                {item.stockName && <span className={styles.stock}>{item.stockName}</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <section className={styles.section}>
          <div className={styles.header}>
            <h4 className={styles.heading}>실시간 인기 게시글</h4>
          </div>
          {renderList(realtimeFree)}
        </section>

        <section className={styles.section}>
          <div className={styles.header}>
            <h4 className={styles.heading}>주간 인기 게시글</h4>
          </div>
          {renderList(weeklyStock)}
        </section>
      </div>
    </div>
  );
};

export default PopularBoardsPanel;
