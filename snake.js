       class SnakeGame {
            constructor() {
                // Game constants
                this.GRID_SIZE = 20;
                this.CELL_SIZE = 20;
                this.CANVAS_SIZE = this.GRID_SIZE * this.CELL_SIZE;
                this.INITIAL_SPEED = 150;
                this.SPEED_DECREASE = 8;
                this.MIN_SPEED = 60;

                // Canvas and context
                this.canvas = document.getElementById('gameCanvas');
                this.ctx = this.canvas.getContext('2d');
                
                // Game state
                this.snake = [{ x: 10, y: 10 }];
                this.food = { x: 5, y: 5 };
                this.direction = 'RIGHT';
                this.gameRunning = false;
                this.gameOver = false;
                this.score = 0;
                this.speed = this.INITIAL_SPEED;
                this.gameLoop = null;
                this.lastDirection = 'RIGHT';

                // Touch handling
                this.touchStartX = null;
                this.touchStartY = null;

                // DOM elements
                this.scoreDisplay = document.getElementById('scoreDisplay');
                this.speedDisplay = document.getElementById('speedDisplay');
                this.startBtn = document.getElementById('startBtn');
                this.pauseBtn = document.getElementById('pauseBtn');
                this.restartBtn = document.getElementById('restartBtn');
                this.gameOverDisplay = document.getElementById('gameOverDisplay');
                this.finalScore = document.getElementById('finalScore');

                this.init();
            }

            init() {
                this.setupCanvas();
                this.setupEventListeners();
                this.draw();
            }

            setupCanvas() {
                // Set canvas size
                this.canvas.width = this.CANVAS_SIZE;
                this.canvas.height = this.CANVAS_SIZE;
                
                // Handle responsive sizing
                const maxSize = Math.min(window.innerWidth - 40, 400);
                this.canvas.style.width = maxSize + 'px';
                this.canvas.style.height = maxSize + 'px';
            }

            setupEventListeners() {
                // Keyboard controls
                document.addEventListener('keydown', (e) => this.handleKeyPress(e));
                
                // Touch controls
                this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
                this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
                
                // Button controls
                this.startBtn.addEventListener('click', () => this.startGame());
                this.pauseBtn.addEventListener('click', () => this.pauseGame());
                this.restartBtn.addEventListener('click', () => this.restartGame());

                // Prevent scrolling when touching the canvas
                this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

                // Handle window resize
                window.addEventListener('resize', () => this.setupCanvas());
            }

            handleKeyPress(e) {
                if (!this.gameRunning) return;

                const key = e.key;
                const currentDirection = this.lastDirection;

                switch (key) {
                    case 'ArrowUp':
                        if (currentDirection !== 'DOWN') {
                            this.direction = 'UP';
                            this.lastDirection = 'UP';
                        }
                        break;
                    case 'ArrowDown':
                        if (currentDirection !== 'UP') {
                            this.direction = 'DOWN';
                            this.lastDirection = 'DOWN';
                        }
                        break;
                    case 'ArrowLeft':
                        if (currentDirection !== 'RIGHT') {
                            this.direction = 'LEFT';
                            this.lastDirection = 'LEFT';
                        }
                        break;
                    case 'ArrowRight':
                        if (currentDirection !== 'LEFT') {
                            this.direction = 'RIGHT';
                            this.lastDirection = 'RIGHT';
                        }
                        break;
                }
                e.preventDefault();
            }

            handleTouchStart(e) {
                const touch = e.touches[0];
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
                e.preventDefault();
            }

            handleTouchEnd(e) {
                if (!this.touchStartX || !this.touchStartY || !this.gameRunning) return;

                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - this.touchStartX;
                const deltaY = touch.clientY - this.touchStartY;
                const currentDirection = this.lastDirection;

                // Minimum swipe distance
                const minSwipeDistance = 30;

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > minSwipeDistance && currentDirection !== 'LEFT') {
                        this.direction = 'RIGHT';
                        this.lastDirection = 'RIGHT';
                    } else if (deltaX < -minSwipeDistance && currentDirection !== 'RIGHT') {
                        this.direction = 'LEFT';
                        this.lastDirection = 'LEFT';
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > minSwipeDistance && currentDirection !== 'UP') {
                        this.direction = 'DOWN';
                        this.lastDirection = 'DOWN';
                    } else if (deltaY < -minSwipeDistance && currentDirection !== 'DOWN') {
                        this.direction = 'UP';
                        this.lastDirection = 'UP';
                    }
                }

                this.touchStartX = null;
                this.touchStartY = null;
                e.preventDefault();
            }

            generateFood() {
                let newFood;
                do {
                    newFood = {
                        x: Math.floor(Math.random() * this.GRID_SIZE),
                        y: Math.floor(Math.random() * this.GRID_SIZE)
                    };
                } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
                return newFood;
            }

            draw() {
                // Clear canvas with dark background
                this.ctx.fillStyle = '#0a0a0a';
                this.ctx.fillRect(0, 0, this.CANVAS_SIZE, this.CANVAS_SIZE);

                // Draw grid
                this.ctx.strokeStyle = '#1a1a1a';
                this.ctx.lineWidth = 1;
                for (let i = 0; i <= this.GRID_SIZE; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(i * this.CELL_SIZE, 0);
                    this.ctx.lineTo(i * this.CELL_SIZE, this.CANVAS_SIZE);
                    this.ctx.stroke();
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, i * this.CELL_SIZE);
                    this.ctx.lineTo(this.CANVAS_SIZE, i * this.CELL_SIZE);
                    this.ctx.stroke();
                }

                // Draw snake
                this.snake.forEach((segment, index) => {
                    if (index === 0) {
                        // Snake head with glow effect
                        this.ctx.fillStyle = '#00ff88';
                        this.ctx.shadowColor = '#00ff88';
                        this.ctx.shadowBlur = 10;
                    } else {
                        // Snake body
                        this.ctx.fillStyle = '#00cc66';
                        this.ctx.shadowBlur = 0;
                    }
                    
                    this.ctx.fillRect(
                        segment.x * this.CELL_SIZE + 1,
                        segment.y * this.CELL_SIZE + 1,
                        this.CELL_SIZE - 2,
                        this.CELL_SIZE - 2
                    );
                });

                // Reset shadow for food
                this.ctx.shadowBlur = 0;

                // Draw food with pulsing effect
                this.ctx.fillStyle = '#ff4444';
                this.ctx.shadowColor = '#ff4444';
                this.ctx.shadowBlur = 15;
                this.ctx.fillRect(
                    this.food.x * this.CELL_SIZE + 2,
                    this.food.y * this.CELL_SIZE + 2,
                    this.CELL_SIZE - 4,
                    this.CELL_SIZE - 4
                );
                
                // Reset shadow
                this.ctx.shadowBlur = 0;
            }

            moveSnake() {
                const head = { ...this.snake[0] };

                // Move head based on direction
                switch (this.lastDirection) {
                    case 'UP':
                        head.y -= 1;
                        break;
                    case 'DOWN':
                        head.y += 1;
                        break;
                    case 'LEFT':
                        head.x -= 1;
                        break;
                    case 'RIGHT':
                        head.x += 1;
                        break;
                }

                // Check wall collision
                if (head.x < 0 || head.x >= this.GRID_SIZE || head.y < 0 || head.y >= this.GRID_SIZE) {
                    this.endGame();
                    return;
                }

                // Check self collision
                if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                    this.endGame();
                    return;
                }

                this.snake.unshift(head);

                // Check food collision
                if (head.x === this.food.x && head.y === this.food.y) {
                    this.score++;
                    this.food = this.generateFood();
                    this.speed = Math.max(this.MIN_SPEED, this.speed - this.SPEED_DECREASE);
                    this.updateDisplay();
                    
                    // Restart game loop with new speed
                    clearInterval(this.gameLoop);
                    this.gameLoop = setInterval(() => this.gameStep(), this.speed);
                } else {
                    this.snake.pop();
                }
            }

            gameStep() {
                this.moveSnake();
                this.draw();
            }

            startGame() {
                this.snake = [{ x: 10, y: 10 }];
                this.food = this.generateFood();
                this.direction = 'RIGHT';
                this.lastDirection = 'RIGHT';
                this.score = 0;
                this.speed = this.INITIAL_SPEED;
                this.gameOver = false;
                this.gameRunning = true;

                this.updateDisplay();
                this.updateButtons();
                this.gameOverDisplay.style.display = 'none';

                this.gameLoop = setInterval(() => this.gameStep(), this.speed);
                this.draw();
            }

            pauseGame() {
                if (this.gameRunning) {
                    this.gameRunning = false;
                    clearInterval(this.gameLoop);
                    this.pauseBtn.textContent = 'Resume';
                } else {
                    this.gameRunning = true;
                    this.gameLoop = setInterval(() => this.gameStep(), this.speed);
                    this.pauseBtn.textContent = 'Pause';
                }
            }

            restartGame() {
                this.gameRunning = false;
                clearInterval(this.gameLoop);
                setTimeout(() => this.startGame(), 100);
            }

            endGame() {
                this.gameRunning = false;
                this.gameOver = true;
                clearInterval(this.gameLoop);
                
                this.finalScore.textContent = `Final Score: ${this.score}`;
                this.gameOverDisplay.style.display = 'block';
                this.updateButtons();
            }

            updateDisplay() {
                this.scoreDisplay.textContent = `Score: ${this.score}`;
                const speedLevel = Math.round((this.INITIAL_SPEED - this.speed) / this.SPEED_DECREASE + 1);
                this.speedDisplay.textContent = `Speed: ${speedLevel}`;
            }

            updateButtons() {
                if (this.gameRunning) {
                    this.startBtn.disabled = true;
                    this.pauseBtn.disabled = false;
                    this.pauseBtn.textContent = 'Pause';
                    this.restartBtn.disabled = false;
                } else if (this.gameOver) {
                    this.startBtn.disabled = false;
                    this.startBtn.textContent = 'Play Again';
                    this.pauseBtn.disabled = true;
                    this.restartBtn.disabled = false;
                } else {
                    this.startBtn.disabled = false;
                    this.startBtn.textContent = 'Start Game';
                    this.pauseBtn.disabled = true;
                    this.pauseBtn.textContent = 'Pause';
                    this.restartBtn.disabled = true;
                }
            }
        }

        // Initialize the game when the page loads
        window.addEventListener('DOMContentLoaded', () => {
            new SnakeGame();
        });