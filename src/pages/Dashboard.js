import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/leto-YHH/stock-intelligence-web/main/public/data/dashboard.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('讀取資料失敗:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>載入中...</div>;
  if (!data) return <div style={{ padding: '2rem' }}>資料載入失敗</div>;

  const { indices, news, impacts, dailySummary } = data;
  const portfolio = data.portfolio || [];

  return (
    <div className="dashboard">

      {/* 市場摘要 */}
      <div className="hero">
        <div className="hero-top">
          <div>
            <div className="date">{data.date} · 台股收盤後</div>
            <div className="hero-title">每日市場摘要</div>
          </div>
          <div className="sentiment">{data.sentiment}</div>
        </div>
        <div className="summary-box">{data.summary}</div>
      </div>

      {/* 六大指數 */}
      <div className="indices">
        {indices.map(idx => (
          <div className="idx" key={idx.label}>
            <div className="idx-label">{idx.label}</div>
            <div className={`idx-val ${idx.dir}`}>{idx.value}</div>
            <div className={`idx-chg ${idx.dir}`}>{idx.chg}</div>
            <div className="idx-vol">{idx.vol}</div>
          </div>
        ))}
      </div>

      {/* 持股追蹤 */}
      <div className="sec">
        <div className="sec-hd">
          <div className="sec-title">持股追蹤</div>
          <Link to="/portfolio" className="sec-more">管理持股 →</Link>
        </div>
        {portfolio.length === 0 ? (
          <div style={{ padding: '1rem', color: '#555', fontSize: '14px' }}>
            尚無持股資料，請至<Link to="/portfolio">持股管理</Link>新增。
          </div>
        ) : (
          portfolio.map(s => (
            <div className="port-row" key={s.code}>
              <div className="port-top">
                <div>
                  <div className="sname">{s.name}</div>
                  <div className="scode">{s.code} · {s.shares} · 成本 {s.cost}</div>
                </div>
                {s.inst && (
                  <div className="inst">
                    <div className="inst-chip"><span className="inst-lbl">外資</span><span className={s.instDir?.foreign}>{s.inst.foreign}</span></div>
                    <div className="inst-chip"><span className="inst-lbl">投信</span><span className={s.instDir?.trust}>{s.inst.trust}</span></div>
                    <div className="inst-chip"><span className="inst-lbl">自營商</span><span className={s.instDir?.dealer}>{s.inst.dealer}</span></div>
                    <div className="inst-chip"><span className="inst-lbl">合計</span><span className={s.instDir?.total}>{s.inst.total}</span></div>
                  </div>
                )}
                <div className="port-right">
                  <div className={`price ${s.priceDir}`}>{s.price}</div>
                  <div className={`pnl ${s.priceDir}`}>{s.pnl} {s.pnlPct}</div>
                  {s.signal && (
                    <span className={`signal signal-${s.signal}`}>{s.signalText}</span>
                  )}
                </div>
              </div>
              {s.tags && s.tags.length > 0 && (
                <div className="logic-tags">
                  {s.tags.map(t => (
                    <span key={t.text} className={`logic-tag ${t.type}`}>{t.text}</span>
                  ))}
                </div>
              )}
              {s.reason && (
                <div className="reason">{s.reason}</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 今日新聞 */}
      <div className="sec">
        <div className="sec-hd"><div className="sec-title">今日財經新聞</div></div>
        {news.map(n => (
          <div className="news-item" key={n.title}>
            <div className="news-title">{n.title}</div>
            <div className="news-summary">{n.summary}</div>
            <div className="news-meta">
              <span className="news-source">{n.source}</span>
              <a className="news-link" href={n.url} target="_blank" rel="noreferrer">閱讀原文 →</a>
            </div>
          </div>
        ))}
        {impacts && impacts.length > 0 && (
          <table className="impact-table">
            <thead><tr><th>主題</th><th>方向</th><th>台股影響</th></tr></thead>
            <tbody>
              {impacts.map(i => (
                <tr key={i.topic}>
                  <td>{i.topic}</td>
                  <td><span className={`tag tag-${i.dir}`}>{i.dirText}</span></td>
                  <td>{i.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 本日重點 */}
      <div className="sec">
        <div className="sec-hd"><div className="sec-title">本日重點</div></div>
        <div className="daily-summary">
          <div className="ds-title">今日市場深度分析</div>
          <div className="ds-body">{dailySummary}</div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;