/**
 * SERVER NOT CONNECTED — Interactive Controller
 * Features: Connection Retry Simulator, Live Diagnostic Terminal,
 * Ambient Circuit Canvas, Audio Synthesizer FX, and Offline Arcade Game.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Web Audio API Sound Synthesizer (Zero Dependencies)
     ========================================================================== */
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.15, gain = 0.1) {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context policy
    }
  }

  // Audio Toggle
  const audioToggle = document.getElementById('audioToggle');
  const soundIcon = document.getElementById('soundIcon');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundIcon.className = soundEnabled ? 'ph ph-speaker-high' : 'ph ph-speaker-slash';
      showToast(soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted');
    });
  }

  /* ==========================================================================
     2. Cursor Glow Follower
     ========================================================================== */
  const cursorGlow = document.getElementById('cursorGlow');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderCursor() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    if (cursorGlow) {
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
    }
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  /* ==========================================================================
     3. Ambient Digital Dropped-Packet Background Canvas
     ========================================================================== */
  const matrixCanvas = document.getElementById('matrix-canvas');
  const mCtx = matrixCanvas.getContext('2d');
  let mWidth = (matrixCanvas.width = window.innerWidth);
  let mHeight = (matrixCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    mWidth = matrixCanvas.width = window.innerWidth;
    mHeight = matrixCanvas.height = window.innerHeight;
  });

  const packetParticles = [];
  for (let i = 0; i < 45; i++) {
    packetParticles.push({
      x: Math.random() * mWidth,
      y: Math.random() * mHeight,
      speed: Math.random() * 0.8 + 0.3,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.4 + 0.1,
      length: Math.random() * 40 + 10
    });
  }

  function drawMatrixBackground() {
    mCtx.clearRect(0, 0, mWidth, mHeight);

    // Subtle dark grid
    mCtx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    mCtx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < mWidth; x += gridSize) {
      mCtx.beginPath();
      mCtx.moveTo(x, 0);
      mCtx.lineTo(x, mHeight);
      mCtx.stroke();
    }
    for (let y = 0; y < mHeight; y += gridSize) {
      mCtx.beginPath();
      mCtx.moveTo(0, y);
      mCtx.lineTo(mWidth, y);
      mCtx.stroke();
    }

    // Dropped packet streaks
    packetParticles.forEach(p => {
      p.y += p.speed;
      if (p.y > mHeight) {
        p.y = -20;
        p.x = Math.random() * mWidth;
      }

      const grad = mCtx.createLinearGradient(p.x, p.y - p.length, p.x, p.y);
      grad.addColorStop(0, 'rgba(244, 63, 94, 0)');
      grad.addColorStop(1, `rgba(244, 63, 94, ${p.alpha})`);

      mCtx.beginPath();
      mCtx.strokeStyle = grad;
      mCtx.lineWidth = p.size;
      mCtx.moveTo(p.x, p.y - p.length);
      mCtx.lineTo(p.x, p.y);
      mCtx.stroke();
    });

    requestAnimationFrame(drawMatrixBackground);
  }
  drawMatrixBackground();

  /* ==========================================================================
     4. Retry Connection & Diagnostics Simulation
     ========================================================================== */
  const reconnectBtn = document.getElementById('reconnectBtn');
  const retryBtnText = document.getElementById('retryBtnText');
  const terminalOutput = document.getElementById('terminalOutput');
  const pingValue = document.getElementById('pingValue');
  const serverCore = document.getElementById('serverCore');
  let retryCount = 0;
  let isReconnecting = false;

  function appendLog(text, type = 'text-muted') {
    if (!terminalOutput) return;
    const p = document.createElement('p');
    p.className = `log-line ${type}`;
    const timestamp = new Date().toTimeString().split(' ')[0];
    p.textContent = `[${timestamp}] ${text}`;
    terminalOutput.appendChild(p);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function simulateReconnect() {
    if (isReconnecting) return;
    isReconnecting = true;
    retryCount++;

    playTone(440, 'triangle', 0.2);
    reconnectBtn.classList.add('connecting');
    retryBtnText.textContent = 'Pinging Cluster...';

    appendLog('----------------------------------------');
    appendLog(`[PROBE #${retryCount}] Broadcasting TCP Handshake (SYN)...`, 'text-accent');

    setTimeout(() => {
      playTone(320, 'sine', 0.15);
      appendLog('Local Interface: en0 (192.168.1.105) -> UP', 'text-muted');
    }, 600);

    setTimeout(() => {
      playTone(280, 'sine', 0.15);
      appendLog('Gateway DNS Lookup: cluster-primary.internal -> 104.21.72.19', 'text-muted');
    }, 1200);

    setTimeout(() => {
      isReconnecting = false;
      reconnectBtn.classList.remove('connecting');
      retryBtnText.textContent = 'Retry Connection';

      // Failure audio effect
      playTone(180, 'sawtooth', 0.35, 0.15);

      appendLog('[FAIL] Host responded: 503 Service Unavailable (Connection Refused)', 'text-danger');
      showToast('Connection failed: Server is still unreachable', 'error');

      // Visual jitter on core
      if (serverCore) {
        serverCore.style.transform = 'scale(0.95)';
        setTimeout(() => serverCore.style.transform = '', 200);
      }

      resetCountdown();
    }, 2200);
  }

  if (reconnectBtn) {
    reconnectBtn.addEventListener('click', simulateReconnect);
  }

  /* ==========================================================================
     5. Auto-Retry Countdown Timer (15s)
     ========================================================================== */
  const countdownTimer = document.getElementById('countdownTimer');
  const autoRetryProgress = document.getElementById('autoRetryProgress');
  const AUTO_RETRY_SEC = 15;
  let timeLeft = AUTO_RETRY_SEC;

  function updateCountdown() {
    timeLeft--;
    if (countdownTimer) countdownTimer.textContent = timeLeft;
    if (autoRetryProgress) {
      const pct = (timeLeft / AUTO_RETRY_SEC) * 100;
      autoRetryProgress.style.width = `${pct}%`;
    }

    if (timeLeft <= 0) {
      simulateReconnect();
      resetCountdown();
    }
  }

  function resetCountdown() {
    timeLeft = AUTO_RETRY_SEC;
    if (countdownTimer) countdownTimer.textContent = timeLeft;
    if (autoRetryProgress) autoRetryProgress.style.width = '100%';
  }

  setInterval(updateCountdown, 1000);

  /* ==========================================================================
     6. Terminal Controls (Run Diagnostics & Copy Logs)
     ========================================================================== */
  const toggleTerminalBtn = document.getElementById('toggleTerminalBtn');
  const terminalPanel = document.getElementById('terminalPanel');
  const runDiagBtn = document.getElementById('runDiagBtn');
  const copyLogsBtn = document.getElementById('copyLogsBtn');

  if (toggleTerminalBtn) {
    toggleTerminalBtn.addEventListener('click', () => {
      playTone(520, 'sine', 0.1);
      if (terminalPanel.style.display === 'none') {
        terminalPanel.style.display = 'block';
        showToast('Live diagnostics opened');
      } else {
        terminalPanel.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (runDiagBtn) {
    runDiagBtn.addEventListener('click', () => {
      playTone(600, 'sine', 0.15);
      appendLog('>>> Manual Traceroute initiated...');
      setTimeout(() => appendLog('Hop 1: 192.168.1.1 (0.84ms)', 'text-muted'), 300);
      setTimeout(() => appendLog('Hop 2: 10.240.0.1 (12.4ms)', 'text-muted'), 600);
      setTimeout(() => appendLog('Hop 3: * * * Request timed out.', 'text-warning'), 900);
      setTimeout(() => appendLog('Trace complete: Route severed at border router.', 'text-danger'), 1200);
    });
  }

  if (copyLogsBtn) {
    copyLogsBtn.addEventListener('click', () => {
      const text = terminalOutput.innerText;
      navigator.clipboard.writeText(text).then(() => {
        playTone(680, 'sine', 0.1);
        showToast('Diagnostic log copied to clipboard');
      });
    });
  }

  /* ==========================================================================
     7. Interactive Offline Arcade Game ("Packet Dodger")
     ========================================================================== */
  const toggleGameBtn = document.getElementById('toggleGameBtn');
  const gamePanel = document.getElementById('gamePanel');
  const closeGameBtn = document.getElementById('closeGameBtn');
  const gameCanvas = document.getElementById('gameCanvas');
  const gCtx = gameCanvas ? gameCanvas.getContext('2d') : null;
  const gameScoreEl = document.getElementById('gameScore');
  const finalScoreEl = document.getElementById('finalScore');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const restartGameBtn = document.getElementById('restartGameBtn');

  let gameRunning = false;
  let gameScore = 0;
  let gameAnimId = null;

  // Player state
  const player = {
    x: 300,
    y: 200,
    width: 38,
    height: 18,
    speed: 7,
    color: '#06b6d4'
  };

  // Falling hazards & green recovery packets
  let hazards = [];
  let pickups = [];

  function resizeGameCanvas() {
    if (!gameCanvas) return;
    const rect = gameCanvas.parentElement.getBoundingClientRect();
    gameCanvas.width = rect.width;
    gameCanvas.height = 240;
    player.y = gameCanvas.height - 35;
    player.x = gameCanvas.width / 2 - player.width / 2;
  }

  // Keyboard controls
  const keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };
  window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
  });
  window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
  });

  // Mouse / Touch drag controls
  if (gameCanvas) {
    gameCanvas.addEventListener('mousemove', (e) => {
      if (!gameRunning) return;
      const rect = gameCanvas.getBoundingClientRect();
      const mouseCanvasX = e.clientX - rect.left;
      player.x = mouseCanvasX - player.width / 2;
    });

    gameCanvas.addEventListener('touchmove', (e) => {
      if (!gameRunning) return;
      const rect = gameCanvas.getBoundingClientRect();
      const touchCanvasX = e.touches[0].clientX - rect.left;
      player.x = touchCanvasX - player.width / 2;
    });
  }

  function startOfflineGame() {
    resizeGameCanvas();
    gameRunning = true;
    gameScore = 0;
    hazards = [];
    pickups = [];
    gameScoreEl.textContent = '0';
    gameOverOverlay.classList.remove('show');
    gamePanel.classList.add('active');
    gamePanel.scrollIntoView({ behavior: 'smooth' });

    playTone(523.25, 'sine', 0.2);
    lastSpawn = Date.now();
    gameLoop();
  }

  function stopOfflineGame() {
    gameRunning = false;
    cancelAnimationFrame(gameAnimId);
  }

  let lastSpawn = Date.now();

  function gameLoop() {
    if (!gameRunning) return;

    gCtx.fillStyle = '#090c14';
    gCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Player Movement
    if (keys.ArrowLeft || keys.a) player.x -= player.speed;
    if (keys.ArrowRight || keys.d) player.x += player.speed;

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > gameCanvas.width) player.x = gameCanvas.width - player.width;

    // Draw Player (Glowing Data Receiver)
    gCtx.fillStyle = player.color;
    gCtx.shadowColor = '#06b6d4';
    gCtx.shadowBlur = 12;
    gCtx.beginPath();
    gCtx.roundRect(player.x, player.y, player.width, player.height, 6);
    gCtx.fill();
    gCtx.shadowBlur = 0;

    // Draw Player Signal Antennas
    gCtx.strokeStyle = '#ffffff';
    gCtx.lineWidth = 2;
    gCtx.beginPath();
    gCtx.moveTo(player.x + 8, player.y);
    gCtx.lineTo(player.x + 8, player.y - 6);
    gCtx.moveTo(player.x + player.width - 8, player.y);
    gCtx.lineTo(player.x + player.width - 8, player.y - 6);
    gCtx.stroke();

    // Spawn falling entities
    const now = Date.now();
    if (now - lastSpawn > 450) {
      lastSpawn = now;
      // 80% hazard (corrupt packet), 20% healthy packet
      if (Math.random() > 0.3) {
        hazards.push({
          x: Math.random() * (gameCanvas.width - 24),
          y: -20,
          size: 20,
          speed: Math.random() * 2.5 + 2.5,
          text: '503'
        });
      } else {
        pickups.push({
          x: Math.random() * (gameCanvas.width - 20),
          y: -20,
          size: 16,
          speed: Math.random() * 2 + 2
        });
      }
    }

    // Update & Render Hazards (Corrupt Packets)
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i];
      h.y += h.speed;

      gCtx.fillStyle = '#f43f5e';
      gCtx.shadowColor = '#f43f5e';
      gCtx.shadowBlur = 8;
      gCtx.beginPath();
      gCtx.roundRect(h.x, h.y, h.size, h.size, 4);
      gCtx.fill();
      gCtx.shadowBlur = 0;

      // Label inside hazard
      gCtx.fillStyle = '#ffffff';
      gCtx.font = '9px monospace';
      gCtx.fillText(h.text, h.x + 3, h.y + 13);

      // Collision Check
      if (
        player.x < h.x + h.size &&
        player.x + player.width > h.x &&
        player.y < h.y + h.size &&
        player.y + player.height > h.y
      ) {
        // Game Over!
        endGame();
        return;
      }

      // Remove offscreen
      if (h.y > gameCanvas.height + 30) {
        hazards.splice(i, 1);
        gameScore += 1;
        gameScoreEl.textContent = gameScore;
      }
    }

    // Update & Render Pickups (Green Packets)
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      p.y += p.speed;

      gCtx.fillStyle = '#10b981';
      gCtx.shadowColor = '#10b981';
      gCtx.shadowBlur = 10;
      gCtx.beginPath();
      gCtx.arc(p.x + p.size / 2, p.y + p.size / 2, p.size / 2, 0, Math.PI * 2);
      gCtx.fill();
      gCtx.shadowBlur = 0;

      // Pickup Collision
      if (
        player.x < p.x + p.size &&
        player.x + player.width > p.x &&
        player.y < p.y + p.size &&
        player.y + player.height > p.y
      ) {
        pickups.splice(i, 1);
        gameScore += 10;
        gameScoreEl.textContent = gameScore;
        playTone(750, 'sine', 0.1);
        continue;
      }

      if (p.y > gameCanvas.height + 30) {
        pickups.splice(i, 1);
      }
    }

    gameAnimId = requestAnimationFrame(gameLoop);
  }

  function endGame() {
    stopOfflineGame();
    playTone(150, 'sawtooth', 0.4);
    finalScoreEl.textContent = gameScore;
    gameOverOverlay.classList.add('show');
  }

  if (toggleGameBtn) {
    toggleGameBtn.addEventListener('click', () => {
      startOfflineGame();
    });
  }

  if (closeGameBtn) {
    closeGameBtn.addEventListener('click', () => {
      stopOfflineGame();
      gamePanel.classList.remove('active');
    });
  }

  if (restartGameBtn) {
    restartGameBtn.addEventListener('click', () => {
      startOfflineGame();
    });
  }

  /* ==========================================================================
     8. Toast Notification Utility
     ========================================================================== */
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;

  function showToast(message, type = 'info') {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Random Ray ID generation
  const rayId = document.getElementById('rayId');
  if (rayId) {
    const randomHex = Math.random().toString(16).substring(2, 16);
    rayId.textContent = randomHex;
  }

});
