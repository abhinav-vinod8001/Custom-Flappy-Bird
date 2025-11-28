export class UIManager {
    constructor(engine, assetManager) {
        this.engine = engine;
        this.assetManager = assetManager;
        this.uiLayer = document.getElementById('ui-layer');

        this.renderMainMenu();
    }

    renderMainMenu() {
        this.uiLayer.innerHTML = `
            <div class="menu-container">
                <h1 class="title">Custom Flappy</h1>
                <p class="title-quote">"Fly, Create, and Conquer!"</p>
                <button id="start-btn" class="btn primary">Start Game</button>
                <button id="settings-btn" class="btn secondary">Settings</button>
            </div>
        `;

        document.getElementById('start-btn').addEventListener('click', () => {
            this.uiLayer.innerHTML = ''; // Clear UI
            this.engine.start();
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.renderSettingsMenu();
        });
    }

    renderSettingsMenu() {
        this.uiLayer.innerHTML = `
            <div class="menu-container settings-menu">
                <h2>Settings</h2>
                <button id="difficulty-btn" class="btn secondary">Difficulty</button>
                <button id="images-btn" class="btn secondary">Custom Images</button>
                <button id="sounds-btn" class="btn secondary">Custom Sounds</button>
                <button id="about-btn" class="btn secondary">About</button>
                <button id="back-btn" class="btn secondary" style="margin-top: 2rem;">Back</button>
            </div>
        `;

        document.getElementById('difficulty-btn').addEventListener('click', () => this.renderDifficultyMenu());
        document.getElementById('images-btn').addEventListener('click', () => this.renderImagesMenu());
        document.getElementById('sounds-btn').addEventListener('click', () => this.renderSoundsMenu());
        document.getElementById('about-btn').addEventListener('click', () => this.renderAboutPage());
        document.getElementById('back-btn').addEventListener('click', () => this.renderMainMenu());
    }

    renderImagesMenu() {
        this.uiLayer.innerHTML = `
            <div class="menu-container settings-menu">
                <h2>Custom Images</h2>
                
                <div class="setting-item">
                    <label>Bird (JPEG/PNG)</label>
                    <p class="setting-description">The character you control. Best size: 40x30px.</p>
                    <input type="file" id="bird-upload" accept="image/*,.heic">
                    <button id="clear-bird" class="btn-small">Reset</button>
                </div>

                <div class="setting-item">
                    <label>Pipe (Sticker)</label>
                    <p class="setting-description">The obstacle texture. Will be tiled vertically.</p>
                    <input type="file" id="pipe-upload" accept="image/*,.heic">
                    <button id="clear-pipe" class="btn-small">Reset</button>
                </div>

                <div class="setting-item">
                    <label>Background (JPEG/PNG)</label>
                    <p class="setting-description">The main game background image.</p>
                    <input type="file" id="bg-upload" accept="image/*,.heic">
                    <button id="clear-bg" class="btn-small">Reset</button>
                </div>

                <div class="setting-item">
                    <label>Game Over Meme (JPEG/PNG)</label>
                    <p class="setting-description">A funny image to show when you crash.</p>
                    <input type="file" id="meme-upload" accept="image/*,.heic">
                    <button id="clear-meme" class="btn-small">Reset</button>
                </div>

                <button id="back-settings-btn" class="btn secondary">Back</button>
            </div>
            `;

        this.setupImageListeners();
    }

    renderDifficultyMenu() {
        const currentDiff = localStorage.getItem('difficulty') || 'medium';
        this.uiLayer.innerHTML = `
            <div class="menu-container settings-menu">
                <h2>Difficulty</h2>
                <p class="setting-description" style="margin-bottom: 1.5rem;">Controls the speed of pipes and the size of the gap.</p>
                <div class="difficulty-options">
                    <button class="btn ${currentDiff === 'easy' ? 'primary' : 'secondary'}" data-diff="easy">Easy</button>
                    <button class="btn ${currentDiff === 'medium' ? 'primary' : 'secondary'}" data-diff="medium">Medium</button>
                    <button class="btn ${currentDiff === 'hard' ? 'primary' : 'secondary'}" data-diff="hard">Hard</button>
                </div>
                <div id="diff-desc" class="setting-description" style="margin-top: 1rem; font-style: italic;">
                    ${this.getDifficultyDescription(currentDiff)}
                </div>
                <button id="back-settings-btn" class="btn secondary" style="margin-top: 2rem;">Back</button>
            </div>
            `;

        document.getElementById('back-settings-btn').addEventListener('click', () => this.renderSettingsMenu());

        document.querySelectorAll('.difficulty-options .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const diff = e.target.dataset.diff;
                localStorage.setItem('difficulty', diff);
                document.getElementById('diff-desc').innerText = this.getDifficultyDescription(diff);
                this.renderDifficultyMenu(); // Re-render to update active state
            });
        });
    }

    getDifficultyDescription(diff) {
        switch (diff) {
            case 'easy': return "Slow speed, wide gaps. Good for beginners.";
            case 'hard': return "Fast speed, tight gaps. For experts only!";
            case 'medium': default: return "Balanced speed and gaps. The standard experience.";
        }
    }

    renderSoundsMenu() {
        this.uiLayer.innerHTML = `
            <div class="menu-container settings-menu">
                <h2>Custom Sounds</h2>
                
                <div class="setting-item">
                    <label>Jump Sound (MP3)</label>
                    <p class="setting-description">Plays when you flap your wings.</p>
                    <input type="file" id="sound-upload" accept="audio/*">
                    <button id="clear-sound" class="btn-small">Reset</button>
                </div>

                <div class="setting-item">
                    <label>Game Over Sound (MP3)</label>
                    <p class="setting-description">Plays when you hit a pipe or the ground.</p>
                    <input type="file" id="gameover-upload" accept="audio/*">
                    <button id="clear-gameover" class="btn-small">Reset</button>
                </div>

                <button id="back-settings-btn" class="btn secondary">Back</button>
            </div>
            `;

        this.setupSoundListeners();
    }

    renderAboutPage() {
        // Use static image from public folder
        let creatorHtml = `<img src="creator.jpg" class="profile-pic" alt="Creator" />`;

        this.uiLayer.innerHTML = `
            <div class="menu-container about-container">
                <h2>About the Creator</h2>
                ${creatorHtml}
                <h3 class="creator-name">Abhinav Vinod</h3>
                <p class="bio-text">
                    Computer Science Engineering student at<br>
                    Mar Athanasius College of Engineering
                </p>
                <div class="game-desc">
                    <p>Custom Flappy is a highly customizable, web-based reimagining of the classic game.</p>
                    <p>Built with modern web technologies, it features dynamic visuals, extensive personalization, and a vibrant design.</p>
                </div>
                <button id="back-settings-btn" class="btn secondary" style="margin-top: 2rem;">Back</button>
            </div>
        `;

        document.getElementById('back-settings-btn').addEventListener('click', () => this.renderSettingsMenu());
    }

    setupImageListeners() {
        document.getElementById('back-settings-btn').addEventListener('click', () => this.renderSettingsMenu());

        this.setupUpload('bird-upload', 'bird');
        this.setupUpload('pipe-upload', 'pipe');
        this.setupUpload('bg-upload', 'bg');
        this.setupUpload('meme-upload', 'meme');

        this.setupReset('clear-bird', 'bird', 'birdImage');
        this.setupReset('clear-pipe', 'pipe', 'pipeImage');
        this.setupReset('clear-bg', 'bg', 'backgroundImage');
        this.setupReset('clear-meme', 'meme', 'gameOverMeme');
    }

    setupSoundListeners() {
        document.getElementById('back-settings-btn').addEventListener('click', () => this.renderSettingsMenu());

        this.setupUpload('sound-upload', 'jump');
        this.setupUpload('gameover-upload', 'gameover');

        this.setupReset('clear-sound', 'jump', 'jumpSound');
        this.setupReset('clear-gameover', 'gameover', 'gameOverSound');
    }

    setupUpload(id, type) {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.assetManager.saveAsset(type, e.target.files[0])
                    .then(() => alert(`${type} updated!`))
                    .catch(() => alert('Failed to save asset. File might be too large.'));
            }
        });
    }

    setupReset(btnId, storageKeySuffix, assetKey) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', async () => {
            // We need to import 'del' from idb-keyval here or expose a method in AssetManager
            // Better to use a specific method in AssetManager, but for now we'll just clear the specific asset via AssetManager if we add a method, 
            // OR we can just use the key since we know it.
            // Actually, AssetManager doesn't have a 'clearSingleAsset' method yet.
            // Let's assume we want to clear just one. 
            // We should probably add a deleteAsset method to AssetManager.
            // For now, let's just use the key directly if we can, but we can't import here easily without refactoring.
            // Let's add a deleteAsset method to AssetManager in the next step.

            // Wait, I can't edit AssetManager in this tool call anymore.
            // I will implement a generic delete in AssetManager in a separate call if needed, 
            // but for now let's just use the fact that I can't easily call 'del' here without importing it.
            // I'll update AssetManager to have a deleteAsset method in the next turn or re-edit it now if I can.
            // Actually, I can just use the AssetManager instance.

            if (this.assetManager.deleteAsset) {
                await this.assetManager.deleteAsset(storageKeySuffix);
                this.assetManager.assets[assetKey] = null;
                alert(`${storageKeySuffix} reset`);
            } else {
                // Fallback if method doesn't exist yet (I will add it)
                console.error("deleteAsset method missing");
            }
        });
    }

    showGameOver(score, highScore, restartCallback) {
        let memeHtml = '';
        if (this.assetManager.assets.gameOverMeme) {
            memeHtml = `<img src="${this.assetManager.assets.gameOverMeme.src}" class="game-over-meme" alt="Game Over Meme" />`;
        }

        this.uiLayer.innerHTML = `
            <div class="menu-container">
                <h1 class="game-over">Game Over</h1>
                ${memeHtml}
                <div class="score-display">Score: ${score}</div>
                <div class="highscore-display">Best: ${highScore}</div>
                <button id="restart-btn" class="btn primary">Play Again</button>
                <button id="menu-btn" class="btn secondary">Main Menu</button>
            </div>
            `;

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.uiLayer.innerHTML = '';
            restartCallback();
        });

        document.getElementById('menu-btn').addEventListener('click', () => {
            this.renderMainMenu();
        });
    }
}
