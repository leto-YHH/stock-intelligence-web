# Stock Intelligence — 待處理事項

## ✅ 已完成
- [x] dashboard.json 未推到前端（已修：改推 main branch + git add -f）
- [x] 漲跌顏色反了（已修：後端 dir 邏輯修正）
- [x] AI 摘要太簡短（已修：Claude prompt 納入大盤數據）
- [x] 偏多偏空邏輯不準（已修：情緒分數改以大盤漲跌為主要依據）
- [x] weekly.json 推送錯誤（已修：改推 main branch，路徑改為 public/data）
- [x] 收盤價顯示 0（已修：改從歷史資料取最後有效非零收盤價）

## 🟠 重要
- [ ] 新聞連結跳首頁 — 後端抓到的 URL 全部是 https://news.cnyes.com，需抓個別文章連結

## 🟡 中期
- [ ] 選股市值篩選 — 1個月只推中小型股（市值 < 500億），1年才推大型股
- [ ] 法人共識頁面串接真實資料
- [ ] 1年回測樣本不足（目前只有10筆）— 改用5年歷史資料或縮短持有天數
- [ ] 每週選股日期顯示舊日期 — 確認 weekly.json 的 updatedAt 有正確更新

## 🔵 長期
- [ ] 持股管理加入即時損益 — 串接現價 API 計算損益
- [ ] 今日市場頁面下方選股區塊 — 來源改為 weekly.json
- [ ] Telegram 通知修復 — MarkdownV2 格式錯誤（400 Bad Request）
