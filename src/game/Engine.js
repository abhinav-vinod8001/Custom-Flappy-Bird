import { Bird } from './Bird.js';
import { PipeManager } from './PipeManager.js';
import { ParticleSystem } from './ParticleSystem.js';

export class Engine {
    constructor(canvasId, assetManager) {
        this.canvas = document.getElementById(canvasId);
        this.assetManager = assetManager;
        this.uiManager = null;
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.lastTime = 0;
        this.isRunning = false;
        this.isMenuRunning = false;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.difficulty = localStorage.getItem('difficulty') || 'medium';

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.bird = new Bird(this.canvas.width, this.canvas.height);
        this.pipeManager = new PipeManager(this.canvas.width, this.canvas.height);
        this.particleSystem = new ParticleSystem();
        this.score = 0;
        this.scrollOffset = 0; // For parallax
        this.lastGamepadButtonState = false; // To prevent rapid firing

        // Input handling
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                this.bird.jump();
                this.particleSystem.spawn(this.bird.position.x, this.bird.position.y + this.bird.height, 'jump');
                this.playJumpSound();
            }
        });
        this.canvas.addEventListener('mousedown', () => {
            this.bird.jump();
            this.particleSystem.spawn(this.bird.position.x, this.bird.position.y + this.bird.height, 'jump');
            this.playJumpSound();
        });

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            this.bird.jump();
            this.particleSystem.spawn(this.bird.position.x, this.bird.position.y + this.bird.height, 'jump');
            this.playJumpSound();
        }, { passive: false });
    }

    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }

    playJumpSound() {
        if (this.assetManager.assets.jumpSound) {
            this.assetManager.assets.jumpSound.currentTime = 0;
            this.assetManager.assets.jumpSound.play().catch(e => console.log("Audio play failed", e));
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.bird) {
            this.bird.gameWidth = this.canvas.width;
            this.bird.gameHeight = this.canvas.height;
        }
        if (this.pipeManager) {
            this.pipeManager.gameWidth = this.canvas.width;
            this.pipeManager.gameHeight = this.canvas.height;
        }
    }

    start() {
        this.stopMenuLoop();
        if (!this.isRunning) {
            this.isRunning = true;
            this.score = 0;
            this.pipeManager.reset();
            this.particleSystem.reset();

            // Update assets
            this.bird.image = this.assetManager.assets.birdImage;
            this.pipeManager.image = this.assetManager.assets.pipeImage;

            // Apply difficulty
            this.difficulty = localStorage.getItem('difficulty') || 'medium';
            this.pipeManager.setDifficulty(this.difficulty);

            this.bird.position.y = this.canvas.height / 2;
            this.bird.velocity = 0;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop.bind(this));
        }
    }

    stop() {
        this.isRunning = false;
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    startMenuLoop() {
        if (this.isMenuRunning) return;
        this.isMenuRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.menuLoop.bind(this));
    }

    stopMenuLoop() {
        this.isMenuRunning = false;
    }

    menuLoop(timestamp) {
        if (!this.isMenuRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Update parallax only
        this.scrollOffset += this.pipeManager.speed * (deltaTime / 16);

        // Draw Background only
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.assetManager.assets.backgroundImage) {
            this.ctx.drawImage(this.assetManager.assets.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.drawDefaultBackground();
        }

        requestAnimationFrame(this.menuLoop.bind(this));
    }

    update(deltaTime) {
        this.bird.update(deltaTime);
        this.pipeManager.update(deltaTime);
        this.particleSystem.update(deltaTime);
        this.checkCollisions();

        // Update scroll offset for parallax
        this.scrollOffset += this.pipeManager.speed * (deltaTime / 16); // Approximate frame scaling

        // Gamepad Polling
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        if (gamepads[0]) {
            const gp = gamepads[0];
            const buttonPressed = gp.buttons[0].pressed; // Button A / X
            if (buttonPressed && !this.lastGamepadButtonState) {
                this.bird.jump();
                this.particleSystem.spawn(this.bird.position.x, this.bird.position.y + this.bird.height, 'jump');
                this.playJumpSound();
            }
            this.lastGamepadButtonState = buttonPressed;
        }
    }

    checkCollisions() {
        const bird = this.bird;
        const pipes = this.pipeManager.pipes;

        // Check pipe collisions
        for (const pipe of pipes) {
            // Horizontal overlap
            if (bird.position.x + bird.width > pipe.x && bird.position.x < pipe.x + this.pipeManager.pipeWidth) {
                // Vertical overlap (hit top or bottom pipe)
                if (bird.position.y < pipe.topHeight || bird.position.y + bird.height > pipe.bottomY) {
                    this.gameOver();
                }
            }

            // Score update
            if (!pipe.passed && bird.position.x > pipe.x + this.pipeManager.pipeWidth) {
                this.score++;
                pipe.passed = true;
            }
        }

        // Check floor/ceiling collision (already in Bird but we might want to trigger game over)
        if (bird.position.y + bird.height >= this.canvas.height || bird.position.y <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.stop();

        this.particleSystem.spawn(this.bird.position.x + this.bird.width / 2, this.bird.position.y + this.bird.height / 2, 'collision');

        // Check High Score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }

        if (this.assetManager.assets.gameOverSound) {
            this.assetManager.assets.gameOverSound.currentTime = 0;
            this.assetManager.assets.gameOverSound.play().catch(e => console.log("Audio play failed", e));
        }
        if (this.uiManager) {
            this.uiManager.showGameOver(this.score, this.highScore, () => this.start());
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Background
        if (this.assetManager.assets.backgroundImage) {
            this.ctx.drawImage(this.assetManager.assets.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Default Background (Clouds and Mountains)
            this.drawDefaultBackground();
        }

        this.pipeManager.draw(this.ctx);
        this.bird.draw(this.ctx);
        this.particleSystem.draw(this.ctx);

        // Draw Score
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.score, this.canvas.width / 2, 100);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(this.score, this.canvas.width / 2, 100);
    }

    drawDefaultBackground() {
        // Day/Night Cycle based on score
        let skyColor = '#70c5ce'; // Day
        if (this.score > 10 && this.score <= 20) {
            skyColor = '#ff9966'; // Sunset
        } else if (this.score > 20) {
            skyColor = '#2c3e50'; // Night
        }

        // Sky
        this.ctx.fillStyle = skyColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Clouds (Parallax: Slow)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const cloudOffset = (this.scrollOffset * 0.2) % 800;
        for (let i = 0; i < 5; i++) {
            let x = (100 + i * 300) - cloudOffset;
            if (x < -200) x += 1500; // Wrap around

            this.ctx.beginPath();
            this.ctx.arc(x, 100 + (i % 2) * 50, 40, 0, Math.PI * 2);
            this.ctx.arc(x + 40, 100 + (i % 2) * 50, 50, 0, Math.PI * 2);
            this.ctx.arc(x + 80, 100 + (i % 2) * 50, 40, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Mountains (Parallax: Medium)
        this.ctx.fillStyle = '#86ce86'; // Light green for distant mountains
        if (this.score > 20) this.ctx.fillStyle = '#4a6b4a'; // Darker at night

        const mountainOffset = (this.scrollOffset * 0.5) % 1000;
        this.ctx.save();
        this.ctx.translate(-mountainOffset, 0);

        // Draw mountains twice for seamless loop
        for (let j = 0; j < 2; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0 + j * 1000, this.canvas.height);
            this.ctx.lineTo(200 + j * 1000, this.canvas.height - 200);
            this.ctx.lineTo(400 + j * 1000, this.canvas.height);
            this.ctx.lineTo(600 + j * 1000, this.canvas.height - 250);
            this.ctx.lineTo(800 + j * 1000, this.canvas.height);
            this.ctx.lineTo(1000 + j * 1000, this.canvas.height - 180);
            this.ctx.lineTo(1200 + j * 1000, this.canvas.height);
            this.ctx.fill();
        }
        this.ctx.restore();

        // Ground Strip (Cityscape silhouette or just bushes)
        this.ctx.fillStyle = '#ded895'; // Sand/Ground
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
        this.ctx.fillStyle = '#73bf2e'; // Grass top
        this.ctx.fillRect(0, this.canvas.height - 25, this.canvas.width, 5);
    }
}
