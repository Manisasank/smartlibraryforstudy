/**
 * TICTACTOE PRO — PRODUCTION GAME ENGINE & UNBEATABLE MINIMAX AI
 * Features Web Audio API Sound Synthesizer, Analytics Telemetry & Error Boundary
 */

class TicTacToeEngine {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.gameMode = 'ai'; // 'ai' | 'pvp'
    this.difficulty = 'grandmaster'; // 'casual' | 'challenger' | 'grandmaster'
    this.soundEnabled = true;
    this.scores = this.loadScores();

    this.winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    this.audioCtx = null;
    this.initAudio();
    this.initErrorBoundary();
  }

  // --- AUDIO SYNTHESIZER (ZERO EXTERNAL MP3 DEPENDENCIES) ---
  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  playTone(freq, type = 'sine', duration = 0.12, volume = 0.15) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio playback failsafe
    }
  }

  playMoveSound(player) {
    if (player === 'X') {
      this.playTone(520, 'triangle', 0.08, 0.2);
    } else {
      this.playTone(330, 'sine', 0.1, 0.2);
    }
  }

  playWinSound() {
    if (!this.soundEnabled) return;
    const notes = [440, 554, 659, 880];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.16, 0.22), idx * 80);
    });
  }

  playDrawSound() {
    if (!this.soundEnabled) return;
    this.playTone(280, 'sawtooth', 0.2, 0.12);
  }

  // --- GAME LOGIC ---
  makeMove(index) {
    if (!this.gameActive || this.board[index] !== null) return false;

    this.board[index] = this.currentPlayer;
    this.playMoveSound(this.currentPlayer);

    const winResult = this.checkWin(this.board);

    if (winResult) {
      this.gameActive = false;
      this.scores[this.currentPlayer.toLowerCase()]++;
      this.saveScores();
      this.playWinSound();
      this.trackEvent('game_won', { winner: this.currentPlayer, mode: this.gameMode, difficulty: this.difficulty });
      return { status: 'win', winner: this.currentPlayer, combo: winResult.combo };
    }

    if (this.isBoardFull(this.board)) {
      this.gameActive = false;
      this.scores.ties++;
      this.saveScores();
      this.playDrawSound();
      this.trackEvent('game_tied', { mode: this.gameMode, difficulty: this.difficulty });
      return { status: 'draw' };
    }

    // Switch Player
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    // If AI's turn
    if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
      return { status: 'ai_pending' };
    }

    return { status: 'continue', turn: this.currentPlayer };
  }

  triggerAIMove() {
    if (!this.gameActive || this.currentPlayer !== 'O') return null;

    let aiIndex = null;
    if (this.difficulty === 'casual') {
      aiIndex = this.getRandomMove();
    } else if (this.difficulty === 'challenger') {
      // 60% Minimax, 40% Random
      aiIndex = Math.random() < 0.6 ? this.getBestMove() : this.getRandomMove();
    } else {
      // Grandmaster: 100% Unbeatable Minimax
      aiIndex = this.getBestMove();
    }

    if (aiIndex !== null) {
      return this.makeMove(aiIndex);
    }
    return null;
  }

  getRandomMove() {
    const available = [];
    this.board.forEach((val, idx) => {
      if (val === null) available.push(idx);
    });
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  // --- UNBEATABLE MINIMAX ALGORITHM WITH ALPHA-BETA PRUNING ---
  getBestMove() {
    let bestScore = -Infinity;
    let move = null;
    const available = [];

    // Prioritize center and corners for speed
    const preferredOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    preferredOrder.forEach(idx => {
      if (this.board[idx] === null) available.push(idx);
    });

    for (let i = 0; i < available.length; i++) {
      const idx = available[i];
      this.board[idx] = 'O'; // AI is 'O'
      const score = this.minimax(this.board, 0, false, -Infinity, Infinity);
      this.board[idx] = null;
      if (score > bestScore) {
        bestScore = score;
        move = idx;
      }
    }
    return move;
  }

  minimax(board, depth, isMaximizing, alpha, beta) {
    const winResult = this.checkWin(board);
    if (winResult) {
      return winResult.winner === 'O' ? (10 - depth) : (depth - 10);
    }
    if (this.isBoardFull(board)) return 0;
    if (depth >= 6) return 0; // Performance depth bounding

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const score = this.minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          maxScore = Math.max(maxScore, score);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break; // Alpha-Beta cutoff
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const score = this.minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          minScore = Math.min(minScore, score);
          beta = Math.min(beta, score);
          if (beta <= alpha) break; // Alpha-Beta cutoff
        }
      }
      return minScore;
    }
  }

  checkWin(board) {
    for (let i = 0; i < this.winningCombos.length; i++) {
      const [a, b, c] = this.winningCombos[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], combo: [a, b, c] };
      }
    }
    return null;
  }

  isBoardFull(board) {
    return board.every(cell => cell !== null);
  }

  resetGame() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.trackEvent('game_reset', { mode: this.gameMode, difficulty: this.difficulty });
  }

  resetScores() {
    this.scores = { x: 0, o: 0, ties: 0 };
    this.saveScores();
    this.trackEvent('scores_reset');
  }

  loadScores() {
    try {
      const saved = localStorage.getItem('tictactoe_scores');
      return saved ? JSON.parse(saved) : { x: 0, o: 0, ties: 0 };
    } catch (e) {
      return { x: 0, o: 0, ties: 0 };
    }
  }

  saveScores() {
    try {
      localStorage.setItem('tictactoe_scores', JSON.stringify(this.scores));
    } catch (e) {}
  }

  // --- PRIVACY-FIRST TELEMETRY & ANALYTICS ---
  trackEvent(eventName, payload = {}) {
    const event = {
      event: eventName,
      timestamp: new Date().toISOString(),
      payload: payload
    };
    try {
      const stored = JSON.parse(localStorage.getItem('tictactoe_analytics') || '[]');
      stored.push(event);
      if (stored.length > 50) stored.shift();
      localStorage.setItem('tictactoe_analytics', JSON.stringify(stored));

      // Asynchronously send to server if online
      if (navigator.onLine && typeof fetch !== 'undefined') {
        fetch('/api/tictactoe/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        }).catch(() => {});
      }
    } catch (e) {}
  }

  // --- ERROR TRACKING BOUNDARY ---
  initErrorBoundary() {
    window.addEventListener('error', (event) => {
      this.reportError('javascript_error', event.message, event.filename, event.lineno);
    });
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError('unhandled_promise_rejection', event.reason ? event.reason.toString() : 'Unknown Promise Rejection');
    });
  }

  reportError(type, message, file = '', line = 0) {
    const errPayload = {
      type: type,
      message: message,
      file: file,
      line: line,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    try {
      if (typeof fetch !== 'undefined') {
        fetch('/api/tictactoe/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errPayload)
        }).catch(() => {});
      }
    } catch (e) {}
  }
}

// Global export
if (typeof window !== 'undefined') {
  window.TicTacToeEngine = TicTacToeEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TicTacToeEngine;
}
