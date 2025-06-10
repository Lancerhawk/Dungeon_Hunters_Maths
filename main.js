// Screen Management
class ScreenManager {
  constructor() {
    this.currentScreen = 'start-menu';
    this.setupScreenTransitions();
  }

  setupScreenTransitions() {
    // Start menu buttons
    document.getElementById('start-game-btn').addEventListener('click', () => {
      this.showScreen('game-screen');
      if (window.gameInstance) {
        window.gameInstance.startNewGame();
      } else {
        window.gameInstance = new GameState();
      }
    });

    document.getElementById('instructions-btn').addEventListener('click', () => {
      this.showScreen('instructions-screen');
    });

    document.getElementById('credits-btn').addEventListener('click', () => {
      this.showScreen('credits-screen');
    });

    // Back to menu buttons
    document.getElementById('back-to-menu').addEventListener('click', () => {
      this.showScreen('start-menu');
    });

    document.getElementById('back-to-menu-credits').addEventListener('click', () => {
      this.showScreen('start-menu');
    });

    // Start from other screens
    document.getElementById('start-from-instructions').addEventListener('click', () => {
      this.showScreen('game-screen');
      if (window.gameInstance) {
        window.gameInstance.startNewGame();
      } else {
        window.gameInstance = new GameState();
      }
    });

    document.getElementById('start-from-credits').addEventListener('click', () => {
      this.showScreen('game-screen');
      if (window.gameInstance) {
        window.gameInstance.startNewGame();
      } else {
        window.gameInstance = new GameState();
      }
    });

    // Game over screen buttons
    document.getElementById('play-again-btn').addEventListener('click', () => {
      this.showScreen('game-screen');
      window.gameInstance = new GameState();
    });

    document.getElementById('back-to-main-menu').addEventListener('click', () => {
      this.showScreen('start-menu');
    });

    // Pause menu
    document.getElementById('pause-menu-btn').addEventListener('click', () => {
      this.showPauseMenu();
    });

    document.getElementById('resume-game').addEventListener('click', () => {
      this.hidePauseMenu();
    });

    document.getElementById('restart-game').addEventListener('click', () => {
      this.hidePauseMenu();
      window.gameInstance = new GameState();
    });

    document.getElementById('quit-to-menu').addEventListener('click', () => {
      this.hidePauseMenu();
      this.showScreen('start-menu');
    });

    // Close pause menu with Escape key
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
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });

    // Show target screen
    document.getElementById(screenId).classList.remove('hidden');
    this.currentScreen = screenId;
  }

  showPauseMenu() {
    document.getElementById('pause-overlay').classList.remove('hidden');
  }

  hidePauseMenu() {
    document.getElementById('pause-overlay').classList.add('hidden');
  }

  showGameOver(stats) {
    // Update final statistics
    document.getElementById('final-score').textContent = stats.score;
    document.getElementById('final-level').textContent = stats.level;
    document.getElementById('rooms-explored').textContent = stats.roomsExplored;
    document.getElementById('monsters-defeated').textContent = stats.monstersDefeated;
    document.getElementById('puzzles-solved').textContent = stats.puzzlesSolved;

    // Set performance message based on score
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

// Game State Management
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
    
    // Statistics tracking
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
    // Ensure starting position is empty
    this.grid[0][0] = { type: 'empty' };
  }

  generateRoomContent(x, y) {
    // Don't place anything at starting position
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
    // Remove existing listeners to prevent duplicates
    document.removeEventListener('keydown', this.keydownHandler);
    
    // Keyboard controls
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

    // Button controls
    document.querySelectorAll('.move-btn').forEach(btn => {
      btn.replaceWith(btn.cloneNode(true)); // Remove existing listeners
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

    // Combat actions
    document.querySelectorAll('.combat-btn').forEach(btn => {
      btn.replaceWith(btn.cloneNode(true)); // Remove existing listeners
    });
    
    document.querySelectorAll('.combat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleCombatAction(action);
      });
    });

    // Puzzle submission
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

    // Potion usage
    document.getElementById('use-potion').addEventListener('click', () => {
      this.usePotion();
    });

    // Grid cell clicks for movement
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('grid-cell')) {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        this.movePlayerTo(x, y);
      }
    });

    // Enter key for puzzle answers
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
    // Allow movement to adjacent cells only
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

  gameOver() {
    this.logMessage(`💀 Game Over! Your final score: ${this.player.score}`);
    
    // Show game over screen with statistics
    const finalStats = {
      score: this.player.score,
      level: this.player.level,
      roomsExplored: this.stats.roomsExplored,
      monstersDefeated: this.stats.monstersDefeated,
      puzzlesSolved: this.stats.puzzlesSolved
    };
    
    setTimeout(() => {
      window.screenManager.showGameOver(finalStats);
    }, 2000);
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
  }

  updatePlayerStats() {
    const healthPercent = (this.player.health / this.player.maxHealth) * 100;
    document.getElementById('health-fill').style.width = `${healthPercent}%`;
    document.getElementById('health-text').textContent = `${this.player.health}/${this.player.maxHealth}`;
    document.getElementById('score').textContent = this.player.score;
    document.getElementById('level').textContent = this.player.level;
    document.getElementById('position').textContent = `(${this.player.x}, ${this.player.y})`;
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
    logContent.appendChild(p);
    logContent.scrollTop = logContent.scrollHeight;

    // Keep only last 10 messages
    while (logContent.children.length > 10) {
      logContent.removeChild(logContent.firstChild);
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
});