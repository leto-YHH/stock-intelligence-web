import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const portfolio = [
  {
    name: '英業達', code: '2356', shares: '1張', cost: 75.9,
    price: 85.5, pnl: '+9,600', pnlPct: '▲12.6%', priceDir: 'down',
    inst: { foreign: '−2,466', trust: '+82', dealer: '−2,381', total: '−4,765' },
    instDir: { foreign: 'up', trust: 'down', dealer: 'up', total: 'up' },
    signal: 'hold', signalText: '繼續持有',
    tags: [{ type: 'tag-theme', text: '題材退燒' }, { type: 'tag-chip', text: '籌碼賣超' }],
    reason: 'COMPUTEX 結束題材退燒，外資與自營商同步獲利了結。帳面獲利 +9,600，停損點 81 元未跌破，繼續持有。',
  },
  {
    name: '仁寶', code: '2324', shares: '1張', cost: 47.1,
    price: 42.5, pnl: '−4,600', pnlPct: '▼9.8%', priceDir: 'up',
    inst: { foreign: '−99,951', trust: '+176', dealer: '−3,634', total: '−103,410' },
    instDir: { foreign: 'up', trust: 'down', dealer: 'up', total: 'up' },
    signal: 'sell', signalText: '考慮賣出',
    tags: [{ type: 'tag-chip', text: '法人異常出清' }, { type: 'tag-tech', text: '跌破停損' }],
    reason: '外資單日異常賣超近十萬張，COMPUTEX 結束後法人集中出清。停損點 44.7 早已跌破，建議評估出場。',
  },
  {
    name: '康舒', code: '6282', shares: '1張', cost: 65.8,
    price: 64.4, pnl: '−1,400', pnlPct: '▼2.1%', priceDir: 'up',
    inst: { foreign: '+13,077', trust: '0', dealer: '+1,828', total: '+14,905' },
    instDir: { foreign: 'down', trust: '', dealer: 'down', total: 'down' },
    signal: 'watch', signalText: '觀察中',
    tags: [{ type: 'tag-chip', text: '籌碼轉多' }],
    reason: '外資今日罕見大買轉多 +13,077，籌碼由空轉多。仍在成本下方，觀察 1−2 天確認方向。',
  },
  {
    name: '友達', code: '2409', shares: '1張', cost: 28.8,
    price: 29.25, pnl: '+450', pnlPct: '▲1.7%', priceDir: 'down',
    inst: { foreign: '−8,471', trust: '+156', dealer: '+2,105', total: '−6,210' },
    instDir: { foreign: 'up', trust: 'down', dealer: 'down', total: 'up' },
    signal: 'hold', signalText: '持有觀察',
    tags: [{ type: 'tag-theme', text: '族群輪動' }, { type: 'tag-tech', text: '技術面' }],
    reason: '面板族群逆勢輪動，大盤跌但個股小漲。外資仍在賣，散戶承接為主。新進場，停損點設於 27.3。',
  },
];

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
        {portfolio.map(s => (
          <div className="port-row" key={s.code}>
            <div className="port-top">
              <div>
                <div className="sname">{s.name}</div>
                <div className="scode">{s.code} · {s.shares} · 成本 {s.cost}</div>
              </div>
              <div className="inst">
                <div className="inst-chip"><span className="inst-lbl">外資</span><span className={s.instDir.foreign}>{s.inst.foreign}</span></div>
                <div className="inst-chip"><span className="inst-lbl">投信</span><span className={s.instDir.trust}>{s.inst.trust}</span></div>
                <div className="inst-chip"><span className="inst-lbl">自營商</span><span className={s.instDir.dealer}>{s.inst.dealer}</span></div>
                <div className="inst-chip"><span className="inst-lbl">合計</span><span className={s.instDir.total}>{s.inst.total}</span></div>
              </div>
              <div className="port-right">
                <div className={`price ${s.priceDir}`}>{s.price}</div>
                <div className={`pnl ${s.priceDir}`}>{s.pnl} {s.pnlPct}</div>
                <span className={`signal signal-${s.signal}`}>{s.signalText}</span>
              </div>
            </div>
            <div className="logic-tags">
              {s.tags.map(t => <span key={t.text} className={`logic-tag ${t.type}`}>{t.text}</span>)}
            </div>
            <div className="reason">{s.reason}</div>
          </div>
        ))}
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