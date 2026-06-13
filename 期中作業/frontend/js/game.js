let gameState = {
  active: false,
  finished: false,
  text: '',
  chars: [],
  currentIndex: 0,
  correctChars: 0,
  totalKeystrokes: 0,
  startTime: null,
  timerInterval: null,
  elapsed: 0,
  difficulty: 'easy',
  textId: null,
  countdownActive: false,
};

const GAME_DURATION = 30;

const game = {
  async loadText(difficulty) {
    try {
      const data = await api.game.getText(difficulty);
      gameState.text = data.content;
      gameState.textId = data.id;
      gameState.difficulty = data.difficulty;
      return data;
    } catch (err) {
      showNotification('Failed to load text', 'error');
      return null;
    }
  },

  renderText() {
    const display = document.getElementById('textDisplay');
    display.innerHTML = '';
    gameState.chars = [];
    for (let i = 0; i < gameState.text.length; i++) {
      const span = document.createElement('span');
      span.className = 'char';
      if (gameState.text[i] === ' ') {
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = gameState.text[i];
      }
      if (i === 0) span.classList.add('current');
      display.appendChild(span);
      gameState.chars.push(span);
    }
  },

  startCountdown() {
    return new Promise((resolve) => {
      gameState.countdownActive = true;
      const overlay = document.getElementById('countdownOverlay');
      const number = document.getElementById('countdownNumber');
      overlay.classList.add('show');
      let count = 3;
      number.textContent = count;

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          number.textContent = count;
          number.style.animation = 'none';
          void number.offsetHeight;
          number.style.animation = 'countPop 1s ease-out';
        } else if (count === 0) {
          number.textContent = 'GO!';
          number.style.color = 'var(--accent)';
          number.style.animation = 'none';
          void number.offsetHeight;
          number.style.animation = 'countPop 1s ease-out';
        } else {
          clearInterval(interval);
          overlay.classList.remove('show');
          gameState.countdownActive = false;
          resolve();
        }
      }, 1000);
    });
  },

  start() {
    gameState.active = true;
    gameState.finished = false;
    gameState.currentIndex = 0;
    gameState.correctChars = 0;
    gameState.totalKeystrokes = 0;
    gameState.elapsed = 0;
    gameState.startTime = Date.now();

    document.getElementById('gameInput').value = '';
    document.getElementById('gameInput').focus();

    // Reset char styles
    gameState.chars.forEach(c => {
      c.className = 'char';
    });
    if (gameState.chars[0]) gameState.chars[0].classList.add('current');

    // Start timer
    this.updateTimer();
    gameState.timerInterval = setInterval(() => {
      gameState.elapsed = (Date.now() - gameState.startTime) / 1000;
      this.updateTimer();
      this.updateStats();

      if (gameState.elapsed >= GAME_DURATION) {
        this.end();
      }
    }, 100);

    document.getElementById('startBtn').disabled = true;
    document.getElementById('resetBtn').disabled = false;
  },

  updateTimer() {
    const remaining = Math.max(0, GAME_DURATION - gameState.elapsed);
    document.getElementById('timer').textContent = remaining.toFixed(1);
  },

  updateStats() {
    const elapsed = gameState.elapsed / 60;
    const wpm = elapsed > 0 ? Math.round((gameState.correctChars / 5) / elapsed) : 0;
    document.getElementById('wpm').textContent = wpm;
    document.getElementById('accuracy').textContent =
      gameState.totalKeystrokes > 0
        ? Math.round((gameState.correctChars / gameState.totalKeystrokes) * 100)
        : 100;
  },

  handleInput(e) {
    if (!gameState.active || gameState.finished || gameState.countdownActive) return;

    const input = e.target;
    const value = input.value;

    if (value.length === 0) {
      // Reset
      gameState.currentIndex = 0;
      gameState.totalKeystrokes = 0;
      gameState.correctChars = 0;
      gameState.chars.forEach(c => (c.className = 'char'));
      if (gameState.chars[0]) gameState.chars[0].classList.add('current');
      return;
    }

    const lastChar = value[value.length - 1];
    gameState.totalKeystrokes++;

    if (gameState.currentIndex < gameState.chars.length) {
      const expected = gameState.text[gameState.currentIndex];
      const charEl = gameState.chars[gameState.currentIndex];

      if (lastChar === expected) {
        charEl.classList.remove('current');
        charEl.classList.add('correct');
        gameState.correctChars++;
        gameState.currentIndex++;
      } else {
        charEl.classList.remove('current');
        charEl.classList.add('incorrect');
        gameState.currentIndex++;
      }

      // Move cursor
      if (gameState.currentIndex < gameState.chars.length) {
        gameState.chars[gameState.currentIndex].classList.add('current');
      }

      // Auto-scroll
      if (gameState.currentIndex > 0 && gameState.currentIndex % 5 === 0) {
        const display = document.getElementById('textDisplay');
        const current = gameState.chars[gameState.currentIndex];
        if (current) {
          current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }

      // Check completion
      if (gameState.currentIndex >= gameState.chars.length) {
        this.end();
      }
    }

    // Clear input buffer (we only need the last char for comparison)
    input.value = '';
  },

  end() {
    if (gameState.finished) return;
    gameState.finished = true;
    gameState.active = false;
    clearInterval(gameState.timerInterval);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('resetBtn').disabled = true;

    const elapsed = Math.max(0.1, gameState.elapsed) / 60;
    const wpm = Math.round((gameState.correctChars / 5) / elapsed);
    const accuracy = gameState.totalKeystrokes > 0
      ? Math.round((gameState.correctChars / gameState.totalKeystrokes) * 100)
      : 0;

    // Show results
    document.getElementById('resultWpm').textContent = wpm;
    document.getElementById('resultAccuracy').textContent = `${accuracy}%`;
    document.getElementById('resultChars').textContent = `${gameState.correctChars}/${gameState.totalKeystrokes}`;
    document.getElementById('resultTime').textContent = `${Math.round(gameState.elapsed)}s`;

    // Submit score if logged in
    if (isLoggedIn()) {
      api.game.submit({
        wpm,
        accuracy,
        difficulty: gameState.difficulty,
        total_chars: gameState.totalKeystrokes,
        correct_chars: gameState.correctChars,
        duration_seconds: Math.round(gameState.elapsed),
      }).catch(() => {});
    }

    document.getElementById('resultsOverlay').classList.add('show');
  },

  reset() {
    gameState.active = false;
    gameState.finished = false;
    clearInterval(gameState.timerInterval);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('resetBtn').disabled = true;
    document.getElementById('resultsOverlay').classList.remove('show');
    document.getElementById('gameInput').value = '';
    document.getElementById('timer').textContent = GAME_DURATION.toFixed(1);
    document.getElementById('wpm').textContent = '0';
    document.getElementById('accuracy').textContent = '100';
    this.renderText();
  },

  async init() {
    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (gameState.active) return;
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.difficulty = btn.dataset.diff;
        await this.loadText(gameState.difficulty);
        this.renderText();
        this.reset();
      });
    });

    // Start button
    document.getElementById('startBtn').addEventListener('click', async () => {
      if (gameState.active) return;
      await this.loadText(gameState.difficulty);
      this.renderText();
      await this.startCountdown();
      this.start();
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.reset();
    });

    // Game input
    const gameInput = document.getElementById('gameInput');
    gameInput.addEventListener('input', (e) => this.handleInput(e));

    // Keyboard shortcut: any key starts the game
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!gameState.active && !gameState.finished && !gameState.countdownActive) {
        document.getElementById('startBtn').click();
        // Focus input after starting
        setTimeout(() => document.getElementById('gameInput').focus(), 3500);
      }
    });

    // Focus input when game starts
    document.addEventListener('click', () => {
      if (gameState.active) {
        document.getElementById('gameInput').focus();
      }
    });

    // Results buttons
    document.getElementById('playAgainBtn').addEventListener('click', () => {
      document.getElementById('resultsOverlay').classList.remove('show');
      this.reset();
      document.getElementById('startBtn').click();
    });

    document.getElementById('newTextBtn').addEventListener('click', () => {
      document.getElementById('resultsOverlay').classList.remove('show');
      this.loadText(gameState.difficulty).then(() => {
        this.renderText();
        this.reset();
      });
    });

    // Initial load
    await this.loadText('easy');
    this.renderText();
  },
};

document.addEventListener('DOMContentLoaded', () => game.init());
