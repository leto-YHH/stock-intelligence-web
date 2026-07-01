import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Portfolio.css';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

function Portfolio() {
  const [stocks, setStocks] = useState([]);
  const [dashData, setDashData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', shares: '', cost: '', entryDate: '' });

  const fetchPortfolio = async () => {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .order('id', { ascending: true });
    if (!error) setStocks(data || []);
  };

  useEffect(() => {
    const init = async () => {
      await fetchPortfolio();
      // 從 dashboard.json 抓即時損益資料
      try {
        const res = await fetch('https://raw.githubusercontent.com/leto-YHH/stock-intelligence-web/main/public/data/dashboard.json');
        const json = await res.json();
        const map = {};
        (json.portfolio || []).forEach(p => { map[p.code] = p; });
        setDashData(map);
      } catch (e) {
        console.error('讀取 dashboard 失敗:', e);
      }
      setLoading(false);
    };
    init();
  }, []);

  const totalInvested = stocks.reduce((sum, s) => sum + s.cost * s.shares, 0);

  // 計算總損益
  const totalPnl = stocks.reduce((sum, s) => {
    const d = dashData[s.code];
    if (!d || !d.price) return sum;
    return sum + (d.price - s.cost) * s.shares;
  }, 0);

  const handlePasswordSubmit = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('密碼錯誤，請再試一次');
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.code || !form.shares || !form.cost) return;
    setSaving(true);
    const { error } = await supabase.from('portfolio').insert([{
      name: form.name,
      code: form.code,
      shares: Number(form.shares),
      cost: Number(form.cost),
      entry_date: form.entryDate ? form.entryDate : null,
    }]);
    if (error) {
      alert('儲存失敗，請稍後再試');
    } else {
      await fetchPortfolio();
      setShowAddModal(false);
      setForm({ name: '', code: '', shares: '', cost: '', entryDate: '' });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除這筆持股嗎？')) return;
    setSaving(true);
    const { error } = await supabase.from('portfolio').delete().eq('id', id);
    if (error) {
      alert('刪除失敗，請稍後再試');
    } else {
      await fetchPortfolio();
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '2rem' }}>載入中...</div>;

  return (
    <div className="portfolio">

      {/* 頁首 */}
      <div className="port-hero">
        <div className="port-hero-left">
          <div className="date">持股追蹤 · 每日更新</div>
          <div className="port-hero-title">持股管理</div>
          <div className="port-hero-sub">追蹤持股損益、法人動向與 AI 買賣建議</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isAdmin ? (
            <button className="btn-add" onClick={() => setShowPasswordModal(true)}>🔒 管理模式</button>
          ) : (
            <>
              <button className="btn-add" onClick={() => setShowAddModal(true)}>＋ 新增持股</button>
              <button className="btn-cancel" onClick={() => setIsAdmin(false)}>離開管理</button>
            </>
          )}
        </div>
      </div>

      {/* 總覽 */}
      <div className="summary-cards">
        <div className="sum-card">
          <div className="sum-label">持股數</div>
          <div className="sum-val">{stocks.length} 檔</div>
          <div className="sum-sub">{stocks.reduce((s, x) => s + x.shares, 0)} 股</div>
        </div>
        <div className="sum-card">
          <div className="sum-label">總投入</div>
          <div className="sum-val">{totalInvested.toLocaleString()}</div>
          <div className="sum-sub">元</div>
        </div>
        <div className="sum-card">
          <div className="sum-label">總損益</div>
          <div className="sum-val" style={{ color: totalPnl >= 0 ? '#e03c3c' : '#16a34a' }}>
            {totalPnl >= 0 ? '+' : ''}{Math.round(totalPnl).toLocaleString()}
          </div>
          <div className="sum-sub" style={{ color: totalPnl >= 0 ? '#e03c3c' : '#16a34a' }}>
            {totalInvested > 0 ? `${totalPnl >= 0 ? '▲' : '▼'}${Math.abs(totalPnl / totalInvested * 100).toFixed(1)}%` : ''}
          </div>
        </div>
      </div>

      {/* 持股清單 */}
      <div className="port-sec">
        <div className="port-sec-title">我的持股</div>
        {saving && <div style={{ padding: '0.5rem', color: '#555', fontSize: '13px' }}>儲存中...</div>}
        {stocks.length === 0 ? (
          <div style={{ padding: '1rem', color: '#555', fontSize: '14px' }}>尚無持股，進入管理模式後可新增。</div>
        ) : (
          stocks.map(s => {
            const d = dashData[s.code];
            const price = d?.price || 0;
            const pnl = price ? Math.round((price - s.cost) * s.shares) : null;
            const pnlPct = price && s.cost ? ((price - s.cost) / s.cost * 100).toFixed(1) : null;
            const priceDir = price >= s.cost ? 'up' : 'down';

            return (
              <div className="port-card" key={s.id}>
                <div className="card-header">
                  <div className="card-info">
                    <div>
                      <div className="stock-name">{s.name}</div>
                      <div className="stock-meta">{s.code} · {s.shares}股 · 入場 {s.entry_date}</div>
                    </div>
                  </div>
                  {price > 0 && (
                    <div className="card-pnl">
                      <div className={`price-now ${priceDir}`}>{price}</div>
                      <div className={`pnl-val ${priceDir}`}>
                        {pnl >= 0 ? '+' : ''}{pnl?.toLocaleString()} {pnl_pct_str(pnlPct, priceDir)}
                      </div>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="card-actions">
                      <button className="btn-del" onClick={() => handleDelete(s.id)}>刪除</button>
                    </div>
                  )}
                </div>

                {/* 法人買賣超 */}
                {d?.inst && (
                  <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.35rem', padding:'0.75rem 1.125rem', borderBottom:'0.5px solid #f0f0f0'}}>
                    <div className="inst-chip"><span className="inst-lbl">外資</span><span className={d.instDir?.foreign}>{d.inst.foreign}</span></div>
                    <div className="inst-chip"><span className="inst-lbl">投信</span><span className={d.instDir?.trust}>{d.inst.trust}</span></div>
                    <div className="inst-chip"><span className="inst-lbl">自營商</span><span className={d.instDir?.dealer}>{d.inst.dealer}</span></div>
                    <div className="inst-chip"><span className="inst-lbl">合計</span><span className={d.instDir?.total}>{d.inst.total}</span></div>
                  </div>
                )}

                {/* AI 分析 */}
                {d?.tags && d.tags.length > 0 && (
                  <div className="logic-tags">
                    {d.tags.map(t => <span key={t.text} className={`logic-tag ${t.type}`}>{t.text}</span>)}
                  </div>
                )}
                {d?.reason && <div className="reason">{d.reason}</div>}

                <div className="card-body">
                  <div className="price-grid">
                    <div className="price-item"><span className="price-lbl">成本</span><span className="price-val">{s.cost}</span></div>
                    <div className="price-item"><span className="price-lbl">股數</span><span className="price-val">{s.shares}</span></div>
                    <div className="price-item"><span className="price-lbl">投入</span><span className="price-val">{(s.cost * s.shares).toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 密碼 Modal */}
      {showPasswordModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-title">🔒 管理模式</div>
            <div className="form-row">
              <label className="form-label">請輸入管理密碼</label>
              <input
                className="form-input"
                type="password"
                placeholder="密碼"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
              />
              {passwordError && <div style={{ color: '#e03c3c', fontSize: '13px', marginTop: '4px' }}>{passwordError}</div>}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setShowPasswordModal(false); setPasswordInput(''); setPasswordError(''); }}>取消</button>
              <button className="btn-save" onClick={handlePasswordSubmit}>確認</button>
            </div>
          </div>
        </div>
      )}

      {/* 新增持股 Modal */}
      {showAddModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-title">新增持股</div>
            <div className="form-row">
              <label className="form-label">股票代碼</label>
              <input className="form-input" placeholder="例：2330" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">股票名稱</label>
              <input className="form-input" placeholder="例：台積電" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label className="form-label">持有股數</label>
                <input className="form-input" type="number" placeholder="例：1" value={form.shares} onChange={e => setForm({ ...form, shares: e.target.value })} />
              </div>
              <div className="form-row">
                <label className="form-label">入場價格</label>
                <input className="form-input" type="number" placeholder="例：75.9" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">入場日期</label>
              <input className="form-input" type="date" value={form.entryDate} onChange={e => setForm({ ...form, entryDate: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>取消</button>
              <button className="btn-save" onClick={handleAdd} disabled={saving}>{saving ? '儲存中...' : '儲存'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// 輔助函數
function pnl_pct_str(pct, dir) {
  if (pct === null) return '';
  return dir === 'up' ? `▲${Math.abs(pct)}%` : `▼${Math.abs(pct)}%`;
}

export default Portfolio;