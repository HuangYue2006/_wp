<div align="center">
  <h1>⌨️ TypeRush</h1>
  <p><strong>Typing Speed Game — built with FastAPI + Vanilla JS</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Python-3.12+-blue?logo=python" alt="Python">
    <img src="https://img.shields.io/badge/FastAPI-0.110+-teal?logo=fastapi" alt="FastAPI">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  </p>
</div>

---

## ✨ Features

- **4 difficulty levels** — Easy (quotes), Medium (paragraphs), Hard (code), Expert (tech articles)
- **30-second rounds** with real-time WPM and accuracy tracking
- **Account system** — register, login, track your progress
- **Global leaderboard** — filter by difficulty, paginated
- **Personal stats** — WPM progress chart, game history
- **Dark theme** — modern UI with smooth animations
- **No frameworks** — pure HTML/CSS/JS frontend

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USER/typerush.git
cd typerush

# 2. Install
pip install -r requirements.txt

# 3. Run
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Or use the startup script:

```bash
chmod +x run.sh && ./run.sh
```

Open **http://localhost:8000** in your browser.

## 🎮 How to Play

1. Choose a difficulty (Easy / Medium / Hard / Expert)
2. Press **Start Game** (or press any key)
3. Wait for the **3-2-1-GO!** countdown
4. Type the displayed text as fast and accurately as you can
5. When time runs out (30s), see your results
6. **Login** to save scores and appear on the leaderboard

## 📡 API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | - |
| POST | `/api/auth/login` | Log in | - |
| GET | `/api/auth/me` | Current user | ✓ |
| GET | `/api/game/text?difficulty=` | Random typing text | - |
| POST | `/api/game/submit` | Submit score | ✓ |
| GET | `/api/game/history` | Personal history | ✓ |
| GET | `/api/leaderboard` | Global leaderboard | - |

Interactive docs at **http://localhost:8000/docs**.

## 🗄️ Database

SQLite (file: `typerush.db`). Tables:
- **users** — accounts with bcrypt-hashed passwords
- **game_texts** — typing passages organized by difficulty
- **scores** — game results linked to users

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + SQLAlchemy + SQLite |
| Auth | JWT (python-jose) + bcrypt |
| Frontend | HTML5 + CSS3 + Vanilla JS |
| Charts | Chart.js (CDN) |
| Server | Uvicorn |

## 🐳 Docker (Optional)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

PRs welcome! Try adding:
- [ ] Real-time multiplayer (WebSocket)
- [ ] Achievement system
- [ ] Custom text submission
- [ ] Light theme toggle
- [ ] Chinese / Japanese typing support

## 📄 License

MIT
