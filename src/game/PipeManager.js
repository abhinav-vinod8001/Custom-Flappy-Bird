export class PipeManager {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // ms
        this.speed = 3;

        this.image = null; // Custom pipe image
    }

    setDifficulty(level) {
        switch (level) {
            case 'easy':
                this.speed = 2;
                this.pipeGap = 200;
                this.spawnInterval = 2500;
                break;
            case 'hard':
                this.speed = 5;
                this.pipeGap = 130;
                this.spawnInterval = 1500;
                break;
            case 'medium':
            default:
                this.speed = 3;
                this.pipeGap = 150;
                this.spawnInterval = 2000;
                break;
        }
    }

    update(deltaTime) {
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnPipe();
            this.spawnTimer = 0;
        }

        this.pipes.forEach(pipe => {
            pipe.x -= this.speed;
        });

        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);
    }

    spawnPipe() {
        const minHeight = 50;
        const maxHeight = this.gameHeight - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        this.pipes.push({
            x: this.gameWidth,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            passed: false
        });
    }

    draw(ctx) {
        ctx.fillStyle = '#228B22'; // Forest Green

        this.pipes.forEach(pipe => {
            // Top Pipe
            if (this.image) {
                // Draw custom image (tiled or stretched)
                ctx.drawImage(this.image, pipe.x, 0, this.pipeWidth, pipe.topHeight);
                ctx.drawImage(this.image, pipe.x, pipe.bottomY, this.pipeWidth, this.gameHeight - pipe.bottomY);
            } else {
                // Gradient for 3D look
                const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
                gradient.addColorStop(0, '#55a049'); // Darker green edge
                gradient.addColorStop(0.1, '#83bf77'); // Lighter highlight
                gradient.addColorStop(0.5, '#55a049'); // Main green
                gradient.addColorStop(1, '#2e5c2b'); // Dark shadow edge

                ctx.fillStyle = gradient;

                // Draw Top Pipe
                ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
                // Cap for Top Pipe
                ctx.fillStyle = '#2e5c2b'; // Darker cap border
                ctx.fillRect(pipe.x - 2, pipe.topHeight - 20, this.pipeWidth + 4, 20);
                ctx.fillStyle = gradient;
                ctx.fillRect(pipe.x, pipe.topHeight - 18, this.pipeWidth, 16);

                // Draw Bottom Pipe
                ctx.fillStyle = gradient;
                ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.gameHeight - pipe.bottomY);
                // Cap for Bottom Pipe
                ctx.fillStyle = '#2e5c2b';
                ctx.fillRect(pipe.x - 2, pipe.bottomY, this.pipeWidth + 4, 20);
                ctx.fillStyle = gradient;
                ctx.fillRect(pipe.x, pipe.bottomY + 2, this.pipeWidth, 16);

                // Border
                ctx.strokeStyle = '#2e5c2b';
                ctx.lineWidth = 2;
                ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
                ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, this.gameHeight - pipe.bottomY);
            }
        });
    }

    reset() {
        this.pipes = [];
        this.spawnTimer = 0;
    }
}
