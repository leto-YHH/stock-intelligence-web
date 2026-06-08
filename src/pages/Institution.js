import React, { useState, useEffect } from 'react';
import './Institution.css';

function Institution() {
  const [activeTab, setActiveTab] = useState('buy');
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/stock-intelligence-web/data/institution.json')
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

  const data = activeTab === 'buy' ? allData.buy : allData.sell;
  const isBuy = activeTab === 'buy';

  return (
    <div className="institution">

      <div className="inst-hero">
        <div className="date">{allData.updatedAt} · 收盤後更新</div>
        <div className="inst-title">三大法人共識清單</div>
        <div className="inst-desc">
          僅列出外資、投信、自營商<strong>同時買超</strong>或<strong>同時賣超</strong>的個股，代表法人之間有共同方向，訊號可信度較高。若三大法人方向分歧，不列入此清單。
        </div>
      </div>

      <div className="inst-tabs">
        <button
          className={`itab ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => setActiveTab('buy')}
        >
          同時買超 <span className="badge badge-buy">{allData.buy.length} 檔</span>
        </button>
        <button
          className={`itab ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveTab('sell')}
        >
          同時賣超 <span className="badge badge-sell">{allData.sell.length} 檔</span>
        </button>
      </div>

      <div className="inst-sec">
        <div className="inst-sec-title">
          三大法人{isBuy ? '同時買超' : '同時賣超'}（今日）
        </div>
        <table className="inst-table">
          <thead>
            <tr>
              <th>個股</th>
              <th>外資</th>
              <th>投信</th>
              <th>自營商</th>
              <th>合計</th>
              <th>共識</th>
            </tr>
          </thead>
          <tbody>
            {data.map(s => (
              <tr key={s.code}>
                <td>
                  <div className="stock-name">{s.name}</div>
                  <div className="stock-code">{s.code}</div>
                  <div className="ind-tag">{s.ind}</div>
                </td>
                <td className={isBuy ? 'buy' : 'sell'}>{s.foreign}</td>
                <td className={isBuy ? 'buy' : 'sell'}>{s.trust}</td>
                <td className={isBuy ? 'buy' : 'sell'}>{s.dealer}</td>
                <td className={isBuy ? 'buy' : 'sell'}>{s.total}</td>
                <td>
                  <span className={`consensus-badge ${isBuy ? 'consensus-buy' : 'consensus-sell'}`}>
                    {isBuy ? '三方買超' : '三方賣超'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="inst-note">
        ⚠️ 本清單僅反映當日三大法人籌碼方向，不代表股價一定上漲或下跌，僅供參考。法人買賣超資料來源：FinMind API。
      </div>

    </div>
  );
}

export default Institution;