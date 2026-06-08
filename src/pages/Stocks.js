import React, { useState, useEffect } from 'react';
import './Stocks.css';

const periods = ['1 個月', '3 個月', '1 年'];
const periodKeys = { '1 個月': '1m', '3 個月': '3m', '1 年': '1y' };

function Stocks() {
  const [activePeriod, setActivePeriod] = useState('1 個月');
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/stock-intelligence-web/data/weekly.json')
      .then(res => res.json())
      .then(json => {
        setAllData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('讀取資料失敗:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>載入中...</div>;
  if (!allData) return <div style={{ padding: '2rem' }}>資料載入失敗</div>;

  const data = allData.periods[periodKeys[activePeriod]] || [];
  return (
    <div className="stocks">

      <div className="stocks-hero">
        <div className="date">2026 · 06 · 01 更新</div>
        <div className="stocks-title">每週選股推薦</div>
        <div className="stocks-sub">五維度評分選出產業，再從產業內篩選通過回測門檻的個股</div>
      </div>

      <div className="period-tabs">
        {periods.map(p => (
          <button key={p} className={`ptab ${activePeriod === p ? 'active' : ''}`} onClick={() => setActivePeriod(p)}>
            {p}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div style={{ padding: '2rem 1.5rem', color: '#555', fontSize: '14px' }}>此週期資料尚未產生，請等待每週一早上 8:00 更新。</div>
      ) : (
        data.map(ind => (
          <div className="ind-sec" key={ind.rank}>
            <div className="ind-header">
              <div className="ind-rank">#{ind.rank}</div>
              <div className="ind-name">{ind.ind}</div>
              <div className="ind-score-wrap">
                <div className="ind-score-bar"><div className="ind-score-fill" style={{ width: `${ind.score}%` }}></div></div>
              </div>
              <div className="ind-score-num">綜合分 {ind.score}</div>
            </div>

            <div className="ind-scores">
              {[
                { lbl: '資金', val: ind.scores.capital },
                { lbl: '情緒', val: ind.scores.sentiment },
                { lbl: '相對強度', val: ind.scores.rs },
                { lbl: '美國連動', val: ind.scores.us },
                { lbl: '基本面', val: ind.scores.fund },
              ].map(s => (
                <div className="score-chip" key={s.lbl}>
                  <span className="score-chip-lbl">{s.lbl}</span>
                  <span className={`score-chip-val ${s.val >= 80 ? 'score-high' : s.val <= 10 ? 'score-low' : ''}`}>{s.val}</span>
                </div>
              ))}
            </div>

            <div className="stock-cards">
              {ind.stocks.map(s => (
                <div className="stock-card" key={s.code}>
                  <div className="card-top">
                    <div>
                      <div className="card-name">{s.name}</div>
                      <div className="card-code">{s.code}</div>
                      {s.isLow && <div className="price-low-badge">💰 低價推薦</div>}
                    </div>
                    <div>
                      <div className="card-price-val">{s.price}</div>
                      <div className="card-price-lbl">收盤價</div>
                    </div>
                  </div>
                  <div className="card-backtest">
                    <div className="bt-item"><span className="bt-lbl">{activePeriod}勝率</span><span className="bt-val bt-good">{s.winRate}</span></div>
                    <div className="bt-item"><span className="bt-lbl">均報</span><span className="bt-val bt-good">{s.avgReturn}</span></div>
                    <div className="bt-item"><span className="bt-lbl">樣本數</span><span className="bt-val">{s.samples}</span></div>
                  </div>
                  <div className="card-logic-tags">
                    {s.tags.map(t => <span key={t.text} className={`logic-tag ${t.type}`}>{t.text}</span>)}
                  </div>
                  <div className="card-logic">{s.logic}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Stocks;