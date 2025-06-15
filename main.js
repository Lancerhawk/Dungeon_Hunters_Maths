
function showTransitionSpinner() {
  const spinner = document.getElementById('transition-loading-spinner');
  if (spinner) spinner.classList.add('active');
}
function hideTransitionSpinner() {
  const spinner = document.getElementById('transition-loading-spinner');
  if (spinner) spinner.classList.remove('active');
}

const audioManager = {
  bgm: null,
  gameOverMusic: null,
  fadeInterval: null,
  fadeDuration: 1000, 
  audioLoaded: false,
  isMuted: false,
  previousVolume: 0.5,

  init() {
    this.bgm = document.getElementById('bgm');
    this.gameOverMusic = document.getElementById('game-over-music');
    
    this.bgm.volume = 0;
    this.gameOverMusic.volume = 0;

    this.setupMuteButton();

    return Promise.all([
      this.preloadAudio(this.bgm),
      this.preloadAudio(this.gameOverMusic)
    ]).then(() => {
      this.audioLoaded = true;
      document.addEventListener('click', () => {
        if (this.bgm.paused) {
          this.bgm.play();
          this.fadeIn(this.bgm);
        }
      }, { once: true });
    });
  },

  setupMuteButton() {
    const muteButton = document.getElementById('mute-button');
    const muteIcon = muteButton.querySelector('.mute-icon');
    
    muteButton.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      
      if (this.isMuted) {
        this.previousVolume = this.bgm.volume;
        this.bgm.volume = 0;
        this.gameOverMusic.volume = 0;
        muteIcon.textContent = '🔇';
        muteButton.classList.add('muted');
      } else {
        this.bgm.volume = this.previousVolume;
        this.gameOverMusic.volume = this.previousVolume;
        muteIcon.textContent = '🔊';
        muteButton.classList.remove('muted');
      }
    });
  },

  preloadAudio(audio) {
    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => {
        resolve();
      }, { once: true });
      
      audio.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        reject(e);
      }, { once: true });

      audio.load();
    });
  },

  fadeIn(audio) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    
    const targetVolume = this.isMuted ? 0 : this.previousVolume;
    const steps = 20;
    const stepDuration = this.fadeDuration / steps;
    const volumeStep = targetVolume / steps;
    
    audio.volume = 0;
    this.fadeInterval = setInterval(() => {
      if (audio.volume < targetVolume) {
        audio.volume = Math.min(audio.volume + volumeStep, targetVolume);
      } else {
        clearInterval(this.fadeInterval);
      }
    }, stepDuration);
  },

  fadeOut(audio, callback) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    
    const steps = 20;
    const stepDuration = this.fadeDuration / steps;
    const volumeStep = audio.volume / steps;
    
    this.fadeInterval = setInterval(() => {
      if (audio.volume > 0) {
        audio.volume = Math.max(audio.volume - volumeStep, 0);
      } else {
        clearInterval(this.fadeInterval);
        audio.pause();
        if (callback) callback();
      }
    }, stepDuration);
  },

  switchToGameOverMusic() {
    this.fadeOut(this.bgm, () => {
      this.gameOverMusic.currentTime = 0;
      this.gameOverMusic.play();
      this.fadeIn(this.gameOverMusic);
    });
  },

  switchToBackgroundMusic() {
    this.fadeOut(this.gameOverMusic, () => {
      this.bgm.currentTime = 0;
      this.bgm.play();
      this.fadeIn(this.bgm);
    });
  }
};

class ScreenManager {
  constructor() {
    this.currentScreen = 'start-menu';
    this.setupScreenTransitions();
  }

  setupScreenTransitions() {
    document.getElementById('start-game-btn').addEventListener('click', async () => {
      showTransitionSpinner();
      await new Promise(r => setTimeout(r, 900));
      this.showScreen('game-screen');
      hideTransitionSpinner();
      if (window.gameInstance) {
        window.gameInstance.startNewGame();
      } else {
        window.gameInstance = new GameState();
      }
    });

    document.getElementById('instructions-btn').addEventListener('click', async () => {
      showTransitionSpinner();
      await new Promise(r => setTimeout(r, 900));
      this.showScreen('instructions-screen');
      hideTransitionSpinner();
    });

    document.getElementById('credits-btn').addEventListener('click', async () => {
      showTransitionSpinner();
      await new Promise(r => setTimeout(r, 900));
      this.showScreen('credits-screen');
      hideTransitionSpinner();
    });

    document.getElementById('back-to-menu').addEventListener('click', async () => {
      showTransitionSpinner();
      await new Promise(r => setTimeout(r, 900));
      this.showScreen('start-menu');
      hideTransitionSpinner();
      const instructionsContent = document.querySelector('.instructions-content');
      if (instructionsContent) instructionsContent.scrollTop = 0;
    });

    document.getElementById('back-to-menu-credits').addEventListener('click', async () => {
      showTransitionSpinner();
      await new Promise(r => setTimeout(r, 900));
      this.showScreen('start-menu');
      hideTransitionSpinner();
      const creditsContent = document.querySelector('.credits-content');
      if (creditsContent) creditsContent.scrollTop = 0;
    });

    document.getElementById('start-from-instructions').addEventListener('click', async () => {
      showTransitionSpinner();
      await new Promise(r => setTimeout(r, 900));
      this.showScreen('game-screen');
      hideTransitionSpinner();
      if (window.gameInstance) {
        window.gameInstance.startNewGame();
      } else {
        window.gameInstance = new GameState();
      }
    });

    document.getElementById('start-from-credits').addEventListener('click', async () => {
      showTransitionSpinner();
      await new Promise(r => setTimeout(r, 900));
      this.showScreen('game-screen');
      hideTransitionSpinner();
      if (window.gameInstance) {
        window.gameInstance.startNewGame();
      } else {
        window.gameInstance = new GameState();
      }
    });

    document.getElementById('play-again-btn').addEventListener('click', async () => {
      showTransitionSpinner();
      audioManager.switchToBackgroundMusic();
      await new Promise(r => setTimeout(r, 900));
      this.showScreen('game-screen');
      hideTransitionSpinner();
      window.gameInstance = new GameState();
    });

    document.getElementById('back-to-main-menu').addEventListener('click', async () => {
      showTransitionSpinner();
      audioManager.switchToBackgroundMusic();
      await new Promise(r => setTimeout(r, 900));
      this.showScreen('start-menu');
      hideTransitionSpinner();
    });

    document.getElementById('pause-menu-btn').addEventListener('click', () => {
      this.showPauseMenu();
    });

    document.getElementById('resume-game').addEventListener('click', () => {
      this.hidePauseMenu();
    });

    document.getElementById('restart-game').addEventListener('click', () => {
      this.hidePauseMenu();
      location.reload();
    });

    document.getElementById('quit-to-menu').addEventListener('click', () => {
      this.hidePauseMenu();
      location.reload();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentScreen === 'game-screen') {
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay.classList.contains('hidden')) {
          this.showPauseMenu();
        } else {
          this.hidePauseMenu();
        }
      }
    });
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });

    document.getElementById(screenId).classList.remove('hidden');
    this.currentScreen = screenId;

    if (screenId === 'instructions-screen') {
      const instructionsContent = document.querySelector('.instructions-content');
      if (instructionsContent) instructionsContent.scrollTop = 0;
    } else if (screenId === 'credits-screen') {
      const creditsContent = document.querySelector('.credits-content');
      if (creditsContent) creditsContent.scrollTop = 0;
    }
  }

  showPauseMenu() {
    document.getElementById('pause-overlay').classList.remove('hidden');
  }

  hidePauseMenu() {
    document.getElementById('pause-overlay').classList.add('hidden');
  }

  showGameOver(stats) {
    document.getElementById('final-score').textContent = stats.score;
    document.getElementById('final-level').textContent = stats.level;
    document.getElementById('rooms-explored').textContent = stats.roomsExplored;
    document.getElementById('monsters-defeated').textContent = stats.monstersDefeated;
    document.getElementById('puzzles-solved').textContent = stats.puzzlesSolved;

    const performanceTitle = document.getElementById('performance-title');
    const performanceText = document.getElementById('performance-text');

    if (stats.score >= 500) {
      performanceTitle.textContent = '🏆 Legendary Explorer!';
      performanceText.textContent = 'Outstanding performance! You\'ve mastered the mathematical arts and conquered the dungeon with exceptional skill.';
    } else if (stats.score >= 300) {
      performanceTitle.textContent = '⭐ Skilled Adventurer!';
      performanceText.textContent = 'Excellent work! Your mathematical prowess served you well in the depths of the dungeon.';
    } else if (stats.score >= 150) {
      performanceTitle.textContent = '🎯 Promising Scholar!';
      performanceText.textContent = 'Good effort! You\'re developing strong problem-solving skills. Keep practicing to reach even greater heights!';
    } else {
      performanceTitle.textContent = '📚 Brave Beginner!';
      performanceText.textContent = 'Every expert was once a beginner! Learn from this adventure and return stronger than before.';
    }

    this.showScreen('game-over-screen');
  }
}

class GameState {
  constructor() {
    this.startNewGame();
  }

  startNewGame() {
    this.player = {
      x: 0,
      y: 0,
      health: 100,
      maxHealth: 100,
      score: 0,
      level: 1,
      potions: 3
    };
    
    this.gridSize = 8;
    this.currentMonster = null;
    this.currentPuzzle = null;
    this.gameLog = [];
    this.visitedCells = new Set();
    
    this.stats = {
      monstersDefeated: 0,
      puzzlesSolved: 0,
      roomsExplored: 0
    };
    
    this.initializeGrid();
    this.setupEventListeners();
    this.updateDisplay();
    this.logMessage("Game started! Navigate the dungeon and face the challenges ahead!");
  }

  initializeGrid() {
    this.grid = [];
    for (let y = 0; y < this.gridSize; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        this.grid[y][x] = this.generateRoomContent(x, y);
      }
    }
    this.grid[0][0] = { type: 'empty' };
  }

  generateRoomContent(x, y) {
    if (x === 0 && y === 0) return { type: 'empty' };
    
    const random = Math.random();
    
    if (random < 0.3) {
      return { type: 'monster', ...generateMonster() };
    } else if (random < 0.5) {
      return { type: 'door', ...generatePuzzle() };
    } else if (random < 0.65) {
      return { type: 'treasure', ...generateTreasure() };
    } else {
      return { type: 'empty' };
    }
  }

  setupEventListeners() {
    document.removeEventListener('keydown', this.keydownHandler);
    
    this.keydownHandler = (e) => {
      if (this.currentMonster || this.currentPuzzle) return;
      
      switch(e.key) {
        case 'ArrowUp': this.movePlayer(0, -1); break;
        case 'ArrowDown': this.movePlayer(0, 1); break;
        case 'ArrowLeft': this.movePlayer(-1, 0); break;
        case 'ArrowRight': this.movePlayer(1, 0); break;
      }
    };
    
    document.addEventListener('keydown', this.keydownHandler);

    document.querySelectorAll('.move-btn').forEach(btn => {
      btn.replaceWith(btn.cloneNode(true)); 
    });
    
    document.querySelectorAll('.move-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentMonster || this.currentPuzzle) return;
        
        const direction = btn.dataset.direction;
        switch(direction) {
          case 'up': this.movePlayer(0, -1); break;
          case 'down': this.movePlayer(0, 1); break;
          case 'left': this.movePlayer(-1, 0); break;
          case 'right': this.movePlayer(1, 0); break;
        }
      });
    });

    document.querySelectorAll('.combat-btn').forEach(btn => {
      btn.replaceWith(btn.cloneNode(true));
    });
    
    document.querySelectorAll('.combat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleCombatAction(action);
      });
    });

    const submitBtn = document.getElementById('submit-answer');
    const skipBtn = document.getElementById('skip-puzzle');
    const potionBtn = document.getElementById('use-potion');
    
    submitBtn.replaceWith(submitBtn.cloneNode(true));
    skipBtn.replaceWith(skipBtn.cloneNode(true));
    potionBtn.replaceWith(potionBtn.cloneNode(true));
    
    document.getElementById('submit-answer').addEventListener('click', () => {
      this.submitPuzzleAnswer();
    });

    document.getElementById('skip-puzzle').addEventListener('click', () => {
      this.skipPuzzle();
    });

    document.getElementById('use-potion').addEventListener('click', () => {
      this.usePotion();
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('grid-cell')) {
        if (this.currentMonster || this.currentPuzzle) return;
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        this.movePlayerTo(x, y);
      }
    });

    const puzzleInput = document.getElementById('puzzle-answer');
    puzzleInput.replaceWith(puzzleInput.cloneNode(true));
    
    document.getElementById('puzzle-answer').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.submitPuzzleAnswer();
      }
    });
  }

  movePlayer(dx, dy) {
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;
    
    if (this.isValidPosition(newX, newY)) {
      this.player.x = newX;
      this.player.y = newY;
      this.handleRoomEncounter();
      this.updateDisplay();
    }
  }

  movePlayerTo(x, y) {
    const dx = Math.abs(x - this.player.x);
    const dy = Math.abs(y - this.player.y);
    
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      this.movePlayer(x - this.player.x, y - this.player.y);
    }
  }

  isValidPosition(x, y) {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }

  handleRoomEncounter() {
    const room = this.grid[this.player.y][this.player.x];
    const cellKey = `${this.player.x},${this.player.y}`;
    
    if (this.visitedCells.has(cellKey)) {
      this.logMessage(`You return to a familiar location (${this.player.x}, ${this.player.y}).`);
      return;
    }
    
    this.visitedCells.add(cellKey);
    this.stats.roomsExplored++;
    
    switch(room.type) {
      case 'monster':
        this.startCombat(room);
        break;
      case 'door':
        this.startPuzzle(room);
        break;
      case 'treasure':
        this.collectTreasure(room);
        break;
      case 'empty':
        this.logMessage(`You enter an empty room. The silence is unsettling...`);
        break;
    }
  }

  startCombat(monster) {
    this.currentMonster = { ...monster };
    this.logMessage(`A wild ${monster.name} appears! Prepare for battle!`);
    this.showCombatInterface();
    this.updateMonsterDisplay();
  }

  handleCombatAction(action) {
    if (!this.currentMonster) return;

    let playerDamage = 0;
    let actionDescription = '';

    // Calculate player damage based on action
    switch(action) {
      case 'add':
        playerDamage = this.player.level * 5 + Math.floor(Math.random() * 10);
        actionDescription = `You strike with calculated precision!`;
        break;
      case 'subtract':
        playerDamage = this.player.level * 4 + Math.floor(Math.random() * 12);
        actionDescription = `You slash with mathematical fury!`;
        break;
      case 'multiply':
        playerDamage = this.player.level * 3 + Math.floor(Math.random() * 15);
        actionDescription = `You unleash a powerful multiplication attack!`;
        break;
      case 'divide':
        playerDamage = this.player.level * 6 + Math.floor(Math.random() * 8);
        actionDescription = `You pierce through with division precision!`;
        break;
      case 'defend':
        playerDamage = 0;
        actionDescription = `You defend yourself, reducing incoming damage!`;
        break;
    }

    // Apply damage to monster
    this.currentMonster.health -= playerDamage;
    this.logMessage(`${actionDescription} You deal ${playerDamage} damage!`);

    // Check if monster is defeated
    if (this.currentMonster.health <= 0) {
      this.defeatMonster();
      return;
    }

    // Monster attacks back
    const monsterDamage = action === 'defend' 
      ? Math.max(1, Math.floor(this.currentMonster.damage / 2))
      : this.currentMonster.damage + Math.floor(Math.random() * 5);
    
    this.player.health -= monsterDamage;
    this.logMessage(`${this.currentMonster.name} attacks for ${monsterDamage} damage!`);

    // Check if player is defeated
    if (this.player.health <= 0) {
      this.gameOver();
      return;
    }

    this.updateDisplay();
    this.updateMonsterDisplay();
  }

  defeatMonster() {
    const scoreGain = this.currentMonster.scoreValue;
    this.player.score += scoreGain;
    this.stats.monstersDefeated++;
    this.logMessage(`Victory! You defeated the ${this.currentMonster.name} and gained ${scoreGain} points!`);
    
    // Chance for level up
    if (this.player.score >= this.player.level * 100) {
      this.levelUp();
    }

    this.currentMonster = null;
    this.hideCombatInterface();
    
    // Clear the monster from the grid
    this.grid[this.player.y][this.player.x] = { type: 'empty' };
    this.updateDisplay();
  }

  levelUp() {
    this.player.level++;
    this.player.maxHealth += 20;
    this.player.health = this.player.maxHealth; // Full heal on level up
    this.player.potions += 2;
    this.logMessage(`🎉 Level Up! You are now level ${this.player.level}! Health restored and potions replenished!`);
  }

  startPuzzle(door) {
    this.currentPuzzle = { ...door };
    this.logMessage(`You encounter a magical door with a math puzzle!`);
    this.showPuzzleInterface();
  }

  submitPuzzleAnswer() {
    const userAnswer = parseInt(document.getElementById('puzzle-answer').value);
    
    if (userAnswer === this.currentPuzzle.answer) {
      this.solvePuzzle();
    } else {
      this.logMessage(`❌ Incorrect answer! The door remains locked.`);
      this.player.health -= 5; // Small penalty for wrong answer
      this.logMessage(`You lose 5 health from the magical backlash.`);
      
      if (this.player.health <= 0) {
        this.gameOver();
        return;
      }
      
      this.updateDisplay();
    }
  }

  solvePuzzle() {
    const scoreGain = this.currentPuzzle.scoreValue;
    this.player.score += scoreGain;
    this.stats.puzzlesSolved++;
    this.logMessage(`✅ Correct! The door opens and you gain ${scoreGain} points!`);
    
    this.currentPuzzle = null;
    this.hidePuzzleInterface();
    
    // Clear the door from the grid and possibly place treasure
    const treasure = Math.random() < 0.7 ? generateTreasure() : { type: 'empty' };
    this.grid[this.player.y][this.player.x] = treasure;
    
    if (treasure.type === 'treasure') {
      this.collectTreasure(treasure);
    }
    
    this.updateDisplay();
  }

  skipPuzzle() {
    this.player.health -= 10;
    this.logMessage(`You force the door open, losing 10 health in the process.`);
    
    if (this.player.health <= 0) {
      this.gameOver();
      return;
    }

    this.currentPuzzle = null;
    this.hidePuzzleInterface();
    this.grid[this.player.y][this.player.x] = { type: 'empty' };
    this.updateDisplay();
  }

  collectTreasure(treasure) {
    this.player.score += treasure.scoreValue;
    
    if (treasure.item === 'potion') {
      this.player.potions += treasure.amount;
      this.logMessage(`💎 You found ${treasure.amount} health potion(s)! Gained ${treasure.scoreValue} points.`);
    } else if (treasure.item === 'health') {
      this.player.health = Math.min(this.player.maxHealth, this.player.health + treasure.amount);
      this.logMessage(`❤️ You found a health crystal! Restored ${treasure.amount} health and gained ${treasure.scoreValue} points.`);
    } else {
      this.logMessage(`💰 You found treasure! Gained ${treasure.scoreValue} points.`);
    }
    
    // Clear treasure from grid
    this.grid[this.player.y][this.player.x] = { type: 'empty' };
    this.updateDisplay();
  }

  usePotion() {
    if (this.player.potions > 0 && this.player.health < this.player.maxHealth) {
      this.player.potions--;
      const healAmount = 30 + Math.floor(Math.random() * 20);
      this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
      this.logMessage(`🧪 You used a health potion and restored ${healAmount} health!`);
      this.updateDisplay();
    } else if (this.player.potions === 0) {
      this.logMessage(`No potions remaining!`);
    } else {
      this.logMessage(`Your health is already full!`);
    }
  }

  async gameOver() {
    this.logMessage(`💀 Game Over! Your final score: ${this.player.score}`);
    const finalStats = {
      score: this.player.score,
      level: this.player.level,
      roomsExplored: this.stats.roomsExplored,
      monstersDefeated: this.stats.monstersDefeated,
      puzzlesSolved: this.stats.puzzlesSolved
    };
    showTransitionSpinner();
    audioManager.switchToGameOverMusic();
    await new Promise(r => setTimeout(r, 1200));
    hideTransitionSpinner();
    setTimeout(() => {
      window.screenManager.showGameOver(finalStats);
    }, 800);
  }

  showCombatInterface() {
    document.getElementById('combat-interface').classList.remove('hidden');
    document.getElementById('puzzle-interface').classList.add('hidden');
  }

  hideCombatInterface() {
    document.getElementById('combat-interface').classList.add('hidden');
  }

  showPuzzleInterface() {
    document.getElementById('puzzle-interface').classList.remove('hidden');
    document.getElementById('combat-interface').classList.add('hidden');
    
    document.getElementById('puzzle-question').textContent = this.currentPuzzle.question;
    document.getElementById('puzzle-answer').value = '';
    document.getElementById('puzzle-answer').focus();
  }

  hidePuzzleInterface() {
    document.getElementById('puzzle-interface').classList.add('hidden');
  }

  updateDisplay() {
    this.updatePlayerStats();
    this.updateGrid();
    this.updateInventory();
    this.updateMobilePanels();
  }

  updatePlayerStats() {
    const healthPercent = (this.player.health / this.player.maxHealth) * 100;
    document.getElementById('health-fill').style.width = `${healthPercent}%`;
    document.getElementById('health-text').textContent = `${this.player.health}/${this.player.maxHealth}`;
    document.getElementById('score').textContent = this.player.score;
    document.getElementById('level').textContent = this.player.level;
    document.getElementById('position').textContent = `(${this.player.x}, ${this.player.y})`;
    this.updateMobilePanels();
  }

  updateGrid() {
    const gridElement = document.getElementById('dungeon-grid');
    gridElement.innerHTML = '';

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;

        const room = this.grid[y][x];
        const cellKey = `${x},${y}`;

        if (x === this.player.x && y === this.player.y) {
          cell.classList.add('player');
          cell.textContent = '🧙‍♂️';
        } else if (this.visitedCells.has(cellKey)) {
          cell.classList.add('visited');
          cell.textContent = '·';
        } else {
          cell.classList.add(room.type);
          switch(room.type) {
            case 'monster': cell.textContent = '👹'; break;
            case 'door': cell.textContent = '🚪'; break;
            case 'treasure': cell.textContent = '💎'; break;
            case 'empty': cell.textContent = ''; break;
          }
        }

        gridElement.appendChild(cell);
      }
    }
  }

  updateInventory() {
    document.getElementById('potions').textContent = this.player.potions;
    this.updateMobilePanels();
  }

  updateMonsterDisplay() {
    if (!this.currentMonster) return;
    
    document.getElementById('monster-name').textContent = this.currentMonster.name;
    const healthPercent = (this.currentMonster.health / this.currentMonster.maxHealth) * 100;
    document.getElementById('monster-health-fill').style.width = `${healthPercent}%`;
    document.getElementById('monster-health-text').textContent = 
      `${Math.max(0, this.currentMonster.health)}/${this.currentMonster.maxHealth}`;
  }

  logMessage(message) {
    const logContent = document.getElementById('log-content');
    const p = document.createElement('p');
    p.textContent = message;
    logContent.insertBefore(p, logContent.firstChild);
    logContent.scrollTop = 0;

    // Keep only last 10 messages
    while (logContent.children.length > 10) {
      logContent.removeChild(logContent.lastChild);
    }
    this.updateMobilePanels();
  }

  updateMobilePanels() {
    if (window.innerWidth > 900) return;
    // Left sidebar: player stats + inventory
    const statsPanel = document.querySelector('.player-stats');
    const inventory = document.querySelector('.inventory');
    const leftSidebarContent = document.getElementById('mobile-left-sidebar-content');
    if (statsPanel && inventory && leftSidebarContent) {
      leftSidebarContent.innerHTML = statsPanel.outerHTML + inventory.outerHTML;
      // Re-attach use potion button event
      const potionBtn = leftSidebarContent.querySelector('#use-potion');
      if (potionBtn) {
        potionBtn.addEventListener('click', () => this.usePotion());
      }
    }
    // Right sidebar: game log
    const logPanel = document.getElementById('game-log');
    const rightSidebarContent = document.getElementById('mobile-right-sidebar-content');
    if (logPanel && rightSidebarContent) {
      rightSidebarContent.innerHTML = logPanel.outerHTML;
    }
    // Bottom panel: controls and combat/quiz
    const controls = document.querySelector('.controls');
    const combat = document.getElementById('combat-interface');
    const puzzle = document.getElementById('puzzle-interface');
    const bottomControls = document.getElementById('mobile-bottom-controls');
    const bottomCombat = document.getElementById('mobile-bottom-combat');
    if (controls && bottomControls) {
      bottomControls.innerHTML = controls.outerHTML;
    }
    if (bottomCombat) {
      if (combat && !combat.classList.contains('hidden')) {
        bottomCombat.innerHTML = combat.outerHTML;
      } else if (puzzle && !puzzle.classList.contains('hidden')) {
        bottomCombat.innerHTML = puzzle.outerHTML;
      } else {
        bottomCombat.innerHTML = '';
      }
    }
    this.attachMobilePanelListeners();
  }

  attachMobilePanelListeners() {
    // Movement controls
    document.querySelectorAll('#mobile-bottom-controls .move-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentMonster || this.currentPuzzle) return;
        const direction = btn.dataset.direction;
        switch(direction) {
          case 'up': this.movePlayer(0, -1); break;
          case 'down': this.movePlayer(0, 1); break;
          case 'left': this.movePlayer(-1, 0); break;
          case 'right': this.movePlayer(1, 0); break;
        }
      });
    });
    // Combat actions
    document.querySelectorAll('#mobile-bottom-combat .combat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleCombatAction(action);
      });
    });
    // Puzzle actions
    const submitBtn = document.querySelector('#mobile-bottom-combat #submit-answer');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitPuzzleAnswer());
    }
    const skipBtn = document.querySelector('#mobile-bottom-combat #skip-puzzle');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.skipPuzzle());
    }
    const puzzleInput = document.querySelector('#mobile-bottom-combat #puzzle-answer');
    if (puzzleInput) {
      puzzleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.submitPuzzleAnswer();
        }
      });
    }
  }
}

// Monster Generation
function generateMonster() {
  const monsters = [
    { name: 'Goblin Mathematician', baseHealth: 30, baseDamage: 8 },
    { name: 'Algebra Orc', baseHealth: 45, baseDamage: 12 },
    { name: 'Calculus Dragon', baseHealth: 80, baseDamage: 20 },
    { name: 'Geometry Ghost', baseHealth: 35, baseDamage: 10 },
    { name: 'Statistics Skeleton', baseHealth: 40, baseDamage: 14 },
    { name: 'Trigonometry Troll', baseHealth: 60, baseDamage: 16 }
  ];

  const monster = monsters[Math.floor(Math.random() * monsters.length)];
  const level = Math.floor(Math.random() * 3) + 1;
  
  return {
    type: 'monster',
    name: monster.name,
    health: monster.baseHealth + (level * 10),
    maxHealth: monster.baseHealth + (level * 10),
    damage: monster.baseDamage + (level * 3),
    scoreValue: monster.baseHealth + (level * 5)
  };
}

// Puzzle Generation
function generatePuzzle() {
  const puzzleTypes = [
    () => {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      return {
        question: `What is ${a} + ${b}?`,
        answer: a + b
      };
    },
    () => {
      const a = Math.floor(Math.random() * 15) + 5;
      const b = Math.floor(Math.random() * 10) + 1;
      return {
        question: `What is ${a} - ${b}?`,
        answer: a - b
      };
    },
    () => {
      const a = Math.floor(Math.random() * 10) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      return {
        question: `What is ${a} × ${b}?`,
        answer: a * b
      };
    },
    () => {
      const divisor = Math.floor(Math.random() * 8) + 2;
      const quotient = Math.floor(Math.random() * 10) + 2;
      const dividend = divisor * quotient;
      return {
        question: `What is ${dividend} ÷ ${divisor}?`,
        answer: quotient
      };
    },
    () => {
      const n = Math.floor(Math.random() * 20) + 5;
      const remainder = Math.floor(Math.random() * 4) + 1;
      return {
        question: `What is ${n} mod ${remainder + 1}?`,
        answer: n % (remainder + 1)
      };
    }
  ];

  const puzzle = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)]();
  
  return {
    type: 'door',
    question: puzzle.question,
    answer: puzzle.answer,
    scoreValue: 25 + Math.floor(Math.random() * 15)
  };
}

// Treasure Generation
function generateTreasure() {
  const treasures = [
    { item: 'potion', amount: 2, scoreValue: 20 },
    { item: 'potion', amount: 1, scoreValue: 15 },
    { item: 'health', amount: 25, scoreValue: 30 },
    { item: 'gold', amount: 0, scoreValue: 50 }
  ];

  return {
    type: 'treasure',
    ...treasures[Math.floor(Math.random() * treasures.length)]
  };
}

// Initialize application when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.screenManager = new ScreenManager();
  
  // Loading screen animation
  const loadingScreen = document.getElementById('loading-screen');
  const startMenu = document.getElementById('start-menu');
  
  // First load the audio
  audioManager.init().then(() => {
    // Then show the loading animation
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          // Show main menu (if hidden)
          if (startMenu) startMenu.classList.remove('hidden');
        }, 700); // match CSS transition
      }
    }, 2800);
  }).catch(error => {
    console.error('Failed to load audio:', error);
    // Still show the menu even if audio fails
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        if (startMenu) startMenu.classList.remove('hidden');
      }, 700);
    }
  });

  // Sidebar toggle logic for mobile/tablet
  const leftSidebar = document.getElementById('mobile-left-sidebar');
  const rightSidebar = document.getElementById('mobile-right-sidebar');
  const leftBtn = document.getElementById('toggle-left-sidebar');
  const rightBtn = document.getElementById('toggle-right-sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');

  function closeSidebars() {
    leftSidebar.classList.remove('active');
    leftSidebar.classList.add('hidden');
    rightSidebar.classList.remove('active');
    rightSidebar.classList.add('hidden');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }

  function openSidebar(side) {
    closeSidebars();
    if (side === 'left') {
      leftSidebar.classList.add('active');
      leftSidebar.classList.remove('hidden');
    } else if (side === 'right') {
      rightSidebar.classList.add('active');
      rightSidebar.classList.remove('hidden');
    }
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  }

  if (leftBtn && leftSidebar) {
    leftBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (leftSidebar.classList.contains('active')) {
        closeSidebars();
      } else {
        openSidebar('left');
      }
    });
  }
  if (rightBtn && rightSidebar) {
    rightBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (rightSidebar.classList.contains('active')) {
        closeSidebars();
      } else {
        openSidebar('right');
      }
    });
  }
  // Close sidebars when clicking outside or on backdrop
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 900) return;
    if (!e.target.closest('.mobile-sidebar') && !e.target.classList.contains('sidebar-toggle')) {
      closeSidebars();
    }
  });
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeSidebars);
  }
});