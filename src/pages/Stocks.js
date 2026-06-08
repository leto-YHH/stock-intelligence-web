import React, { useState, useEffect } from 'react';
import './Stocks.css';

const periods = ['1 個月', '3 個月', '1 年'];
const periodKeys = { '1 個月': '1m', '3 個月': '3m', '1 年': '1y' };

function Stocks() {
  const [activePeriod, setActivePeriod] = useState('1 個月');
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/leto-YHH/stock-intelligence-web/main/public/data/weekly.json')
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
        <div className="date">{allData.updatedAt?.replace(/-/g, ' · ')} 更新</div>
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

      {/* 選股邏輯說明 */}
      <div className="explain-sec">
        <div className="explain-title">📖 選股邏輯說明</div>

        <div className="explain-block">
          <div className="explain-block-title">🔍 整體流程：三層篩選</div>
          <div className="explain-block-body">
            系統每週一自動執行，分三個階段從台股 8 大產業中篩選出值得關注的個股：
            <ol>
              <li><b>產業評分：</b>用五個維度為每個產業打分，選出前 5 名產業</li>
              <li><b>個股回測：</b>對入選產業的每一檔個股執行歷史回測，計算過去持有的勝率與報酬</li>
              <li><b>達標篩選：</b>只有勝率與平均報酬同時達標的個股才會出現在推薦名單</li>
            </ol>
          </div>
        </div>

        <div className="explain-block">
          <div className="explain-block-title">🏭 第一層：五維度產業評分（各 0–100 分）</div>
          <div className="explain-block-body">
            <div className="explain-dim">
              <div className="explain-dim-name">💰 資金流向（法人買超）</div>
              <div className="explain-dim-desc">統計外資與投信在過去 15 個交易日內，對各產業個股的合計買超張數。買超張數越多，代表法人正在大量布局該產業，短期推動力越強。此維度在 1 個月週期權重最高（35%），因法人買超對短期股價影響最直接。</div>
            </div>
            <div className="explain-dim">
              <div className="explain-dim-name">📰 新聞情緒（AI 分析）</div>
              <div className="explain-dim-desc">每日抓取財經新聞，交由 Claude AI 判斷每則新聞對各產業的正負面程度（-1 到 +1）。分數越高代表近期新聞對該產業越有利。此維度在 1 個月週期權重高（30%），因市場情緒短期內對股價影響顯著。</div>
            </div>
            <div className="explain-dim">
              <div className="explain-dim-name">📈 相對強度</div>
              <div className="explain-dim-desc">計算各產業過去 90 天的股價漲幅，與大盤（加權指數）相比較。若一個產業漲得比大盤多，代表資金正在流入，屬於強勢族群，適合追強不追弱的趨勢策略。此維度在 3 個月週期權重最高（30%）。</div>
            </div>
            <div className="explain-dim">
              <div className="explain-dim-name">🌐 美國連動</div>
              <div className="explain-dim-desc">台灣各產業與對應的美國指數高度連動。例如半導體對應費城半導體指數（SOX），航運對應波羅的海乾散貨指數（BDI）。若美國相關指數近期強勢，台灣對應產業通常跟漲。此維度在各週期均有 15–20% 的權重。</div>
            </div>
            <div className="explain-dim">
              <div className="explain-dim-name">📊 基本面（月營收趨勢）</div>
              <div className="explain-dim-desc">分析各產業個股近 18 個月的月營收年增率（YoY）是否持續加速成長。若一個產業的營收成長動能持續擴大，代表基本面支撐強，適合中長期持有。此維度在 1 年週期權重最高（50%），短期幾乎不考慮（1 個月為 0%）。</div>
            </div>
          </div>
        </div>

        <div className="explain-block">
          <div className="explain-block-title">✅ 第二層：個股回測指標</div>
          <div className="explain-block-body">
            <div className="explain-dim">
              <div className="explain-dim-name">🎯 勝率</div>
              <div className="explain-dim-desc">統計過去每一個進場時間點，持有 N 天後獲利的比例。例如 1 個月勝率 80% 代表：過去每次買入、持有 22 個交易日後，有 80% 的機率是獲利的。門檻：1 個月和 3 個月需 ≥ 55%，1 年需 ≥ 60%。</div>
            </div>
            <div className="explain-dim">
              <div className="explain-dim-name">💹 平均報酬</div>
              <div className="explain-dim-desc">統計過去所有持有期間的平均報酬率。例如 3 個月均報 +10% 代表：過去每次持有 66 個交易日，平均獲利約 10%。門檻：1 個月需 ≥ +3%，3 個月需 ≥ +3%，1 年需 ≥ +6%。</div>
            </div>
            <div className="explain-dim">
              <div className="explain-dim-name">📐 穩定度</div>
              <div className="explain-dim-desc">衡量每次持有結果的一致性。穩定度高代表報酬集中、不飄移，每次進場結果相對可預期；穩定度低代表有時大賺、有時大虧，風險較高。計算方式為：1 - 標準差 / 平均絕對報酬，數值介於 0–100%。</div>
            </div>
            <div className="explain-dim">
              <div className="explain-dim-name">🔢 樣本數</div>
              <div className="explain-dim-desc">回測使用的歷史進場次數。樣本數越多，統計結果越可信。本系統使用最近一年的每日滾動回測，1 個月週期約有 238 個樣本，1 年週期樣本數較少（約 10 個），請以較長週期結果作為參考而非絕對依據。</div>
            </div>
          </div>
        </div>

        <div className="explain-block">
          <div className="explain-block-title">⚠️ 免責聲明</div>
          <div className="explain-block-body" style={{ color: '#888', fontSize: '13px' }}>
            本系統所有數據均來自歷史回測與公開市場資料，不代表未來表現。選股結果僅供參考，不構成任何投資建議。市場有風險，投資前請審慎評估，並自行承擔投資風險。
          </div>
        </div>
      </div>

    </div>
  );
}

export default Stocks;