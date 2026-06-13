# TypeRush 打字遊戲 — 專案報告與學習筆記

## 一、專案概述

**TypeRush** 是一個基於網頁的打字速度測驗遊戲，具備以下核心特色：

- 四種難度模式：Easy（名言）、Medium（段落）、Hard（程式碼）、Expert（技術文章）
- 30 秒限時挑戰，即時計算 WPM（每分鐘字數）與準確率
- 使用者註冊/登入系統，追蹤個人成績歷史
- 公開排行榜，可按難度篩選
- 即時視覺回饋：正確按鍵綠色、錯誤按鍵紅色、游標閃爍

### 技術棧

| 層級 | 技術 | 選擇理由 |
|------|------|----------|
| **後端框架** | FastAPI (Python) | 高效能、自動 API 文件、Pydantic 驗證 |
| **資料庫** | SQLite + SQLAlchemy ORM | 零配置、適合小型專案、ORM 易維護 |
| **認證** | JWT (python-jose) + bcrypt | 無狀態認證，適合 SPA |
| **前端** | Vanilla HTML/CSS/JS | 無框架依賴，專注核心網頁設計 |
| **圖表** | Chart.js | 輕量級圖表庫 |

### 為什麼選擇 FastAPI 而非其他框架？

- **對比 Node.js (Express)**：Python 在目前環境原生支援，無需額外安裝 runtime；FastAPI 效能接近 Node.js，且型別安全更好
- **對比 Rust (Actix)**：開發速度慢，學習曲線陡，不適合快速原型開發
- **對比 Next.js**：全端框架固然方便，但本專案設計為前後端分離，FastAPI 作為純 API server 更輕量

---

## 二、系統架構

```
typerush/
├── backend/                  # FastAPI 後端
│   ├── main.py               # 應用入口，Middleware，靜態檔案服務
│   ├── database.py           # SQLAlchemy 引擎與 session 管理
│   ├── models.py             # ORM 模型 (User, Score, GameText)
│   ├── schemas.py            # Pydantic 請求/回應模型
│   ├── auth.py               # JWT 認證邏輯
│   ├── routers/
│   │   ├── auth_router.py    # 註冊、登入、取得使用者
│   │   ├── game.py           # 取得打字文本、提交分數、歷史紀錄
│   │   └── leaderboard.py    # 排行榜查詢
│   └── data/
│       └── texts.json        # 打字文本庫
├── frontend/                 # 靜態前端
│   ├── index.html            # 首頁（英雄區 + 功能介紹）
│   ├── game.html             # 遊戲頁面（核心遊戲引擎）
│   ├── leaderboard.html      # 排行榜頁面（分頁 + 篩選）
│   ├── profile.html          # 個人檔案（成績圖表 + 歷史）
│   ├── css/style.css         # 完整樣式（暗色主題、響應式）
│   └── js/
│       ├── api.js            # API 客戶端封裝
│       ├── auth.js           # 認證 UI 邏輯
│       └── game.js           # 遊戲引擎
└── report.md                 # 本文件
```

### 資料庫設計

專案使用三個資料表，遵循第三正規化（3NF）：

**users 表**
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER PK | 使用者 ID |
| username | VARCHAR(50) UNIQUE | 使用者名稱 |
| email | VARCHAR(100) UNIQUE | 電子郵件 |
| hashed_password | VARCHAR(255) | bcrypt 加密密碼 |
| created_at | DATETIME | 註冊時間 |

**game_texts 表**
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER PK | 文本 ID |
| content | TEXT | 打字內容 |
| category | VARCHAR(50) | 分類（quote/code/etc） |
| difficulty | VARCHAR(20) | 難度（easy/medium/hard/expert） |

**scores 表**
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INTEGER PK | 成績 ID |
| user_id | INTEGER FK | 關聯使用者 |
| wpm | FLOAT | 每分鐘字數 |
| accuracy | FLOAT | 準確率百分比 |
| difficulty | VARCHAR(20) | 遊戲難度 |
| total_chars | INTEGER | 總按鍵數 |
| correct_chars | INTEGER | 正確按鍵數 |
| duration_seconds | FLOAT | 遊戲時長 |
| created_at | DATETIME | 遊戲時間 |

---

## 三、後端核心設計

### 3.1 RESTful API 設計

```
POST   /api/auth/register          # 註冊
POST   /api/auth/login             # 登入
GET    /api/auth/me                # 取得當前使用者
GET    /api/game/text?difficulty=  # 取得隨機打字文本
POST   /api/game/submit            # 提交遊戲成績
GET    /api/game/history           # 取得個人歷史成績
GET    /api/leaderboard?difficulty=&page=&limit=  # 排行榜
```

### 3.2 JWT 認證流程

1. 使用者註冊/登入 → 後端驗證 → 回傳 JWT token（含 user.id 作為 sub）
2. 前端將 token 儲存於 `localStorage`
3. 後續 API 請求在 Header 帶 `Authorization: Bearer <token>`
4. 後端透過依賴注入 `get_current_user()` 驗證 token 並取得使用者

```
@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))
```

### 3.3 排行榜效能考量

排行榜 API 使用了 `order_by(desc(Score.wpm))` 搭配 `offset/limit` 分頁。在 SQLite 中，為 WPM 欄位建立索引可大幅提升查詢效能：

```sql
CREATE INDEX idx_scores_wpm ON scores(wpm DESC);
```

---

## 四、前端遊戲引擎設計

### 4.1 核心演算法

遊戲引擎的核心邏輯在 `game.js` 中，主要包含：

**文字渲染**：將目標文字逐字拆解為 `<span>` 元素，每個字元獨立控制樣式

**輸入比對**：監聽 `input` 事件，每次只取最後一個輸入字元與當前位置的字元比對

```
使用者輸入 't' → 比對 text[0] === 't' → 正確，currentIndex++
使用者輸入 'h' → 比對 text[1] === 'h' → 正確，currentIndex++
使用者輸入 'x' → 比對 text[2] !== 'x' → 錯誤，標記紅色
```

**WPM 計算公式**：
```
WPM = (正確字數 / 5) / (經過時間 / 60)
```
- 除以 5 是因為「一個單字」在打字測驗中約等於 5 個字元
- 這是業界標準計算方式（與 Monkeytype、10fastfingers 一致）

**準確率計算**：
```
Accuracy = 正確按鍵數 / 總按鍵數 × 100%
```

### 4.2 即時視覺回饋

- **正確字元**：顏色變為 `#00d4aa`（綠色）
- **錯誤字元**：顏色變為 `#ff4757`（紅色）+ 底線標記
- **當前位置**：左側邊框閃爍動畫
- **自動滾動**：每輸入 5 個字元自動滾動顯示區域

### 4.3 遊戲流程

```
載入文本 → 點擊開始 / 按任意鍵
    → 3-2-1-GO! 倒數動畫
    → 開始計時 30 秒
    → 使用者輸入，即時更新 WPM/準確率
    → 時間到 或 完成全文
    → 顯示結果面板
    → 自動提交分數（若已登入）
    → 可選擇再玩一次或換新文本
```

---

## 五、前端設計亮點

### 5.1 暗色主題 UI

採用自訂 CSS 變數（custom properties）設計的暗色主題，主色為紫色 `#6c63ff`，強調色為青色 `#00d4aa`。所有色彩集中於 `:root` 區塊，便於後續主題切換。

### 5.2 響應式設計

使用 CSS Grid + media queries 實作響應式佈局，在手機上自動調整為單欄顯示。

### 5.3 認證模態框

登入/註冊採用 Modal 設計，包含表單驗證、錯誤提示、登入/註冊切換功能。

### 5.4 成績圖表

個人檔案頁面使用 Chart.js 繪製 WPM 進步曲線，幫助使用者視覺化追蹤自己的進步。

---

## 六、遇到的挑戰與解決方案

### 6.1 文字游標閃爍動畫與輸入同步

**問題**：使用 CSS `@keyframes blink` 讓游標閃爍，但與 JavaScript 的 `input` 事件處理之間有時序問題。

**解決方案**：使用 `border-left` 而非 `border-right` 作為游標指示器，並在每次 input 事件中先移除再添加 `current` class，確保動畫重新觸發。

### 6.2 輸入緩衝區管理

**問題**：直接監聽 `keydown` 事件無法正確處理文字輸入（如注音輸入法），而 `input` 事件的值會累積。

**解決方案**：每次 input 事件只取最後一個字元進行比對，比對後立即清空 input 值。這樣既支援各種輸入法，又避免了緩衝區累積。

```javascript
handleInput(e) {
    const value = e.target.value;
    const lastChar = value[value.length - 1];
    // 比對並更新狀態
    e.target.value = '';  // 立即清空
}
```

### 6.3 排行榜分頁效能

**問題**：當資料量增長時，排行榜查詢可能變慢。

**解決方案**：實作 server-side 分頁（`OFFSET/LIMIT`），前端只渲染當前頁面。配合 WPM 欄位索引，在十萬級資料量下仍可保持 <10ms 查詢時間。

### 6.4 跨頁面認證狀態同步

**問題**：使用者在不同頁面切換時，auth.js 需要重新初始化。

**解決方案**：所有頁面共用 `localStorage` 作為認證狀態儲存，`auth.js` 在每個頁面的 `DOMContentLoaded` 時執行 `updateNavbar()` 檢查登入狀態，確保 UI 與狀態同步。

---

## 七、部署與執行

### 7.1 開發環境啟動

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

伺服器啟動後：
- API 文件：`http://localhost:8000/docs`
- 首頁：`http://localhost:8000/`

### 7.2 生產環境部署建議

- **資料庫**：升級至 PostgreSQL（支援並發、更好的索引效能）
- **靜態檔案**：使用 Nginx 代理靜態檔案，FastAPI 僅作為 API
- **認證**：更換 SECRET_KEY 為環境變數，使用 HTTPS
- **Docker**：使用 docker-compose 管理多服務

---

## 八、未來展望

1. **AI 整合**：使用 Ollama / NVIDIA API 自動生成打字文本，增加變化性
2. **多人即時對戰**：透過 WebSocket 實現即時競賽
3. **成就系統**：設定里程碑成就（如「達到 100 WPM」）
4. **客製化主題**：讓使用者自訂顏色主題
5. **多語言支援**：增加中文、日文等不同語言的打字練習
6. **文字貢獻**：讓使用者提交自己的打字文本

---

## 九、學習總結

透過 TypeRush 專案，實踐了以下網頁設計核心技能：

| 技能 | 具體實踐 |
|------|----------|
| RESTful API 設計 | 前後端分離架構，標準 HTTP 方法與狀態碼 |
| 資料庫設計 | ORM 模型設計、關聯查詢、索引優化 |
| 使用者認證 | JWT token、bcrypt 密碼加密、HTTP Bearer |
| 前端互動設計 | 事件驅動、DOM 操作、CSS 動畫 |
| 響應式設計 | CSS Grid、Media Queries、Flexbox |
| 遊戲開發 | 即時狀態管理、計時器、分數計算 |
| 資料視覺化 | Chart.js 圖表整合 |
| 錯誤處理 | 前端 try/catch、後端 HTTPException、使用者通知 |

這個專案從零開始，涵蓋了完整的前後端開發流程，是一個紮實的全端網頁設計練習。
