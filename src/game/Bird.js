export class Bird {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.width = 44;
        this.height = 32;

        this.position = {
            x: gameWidth / 4, // Start at 1/4th of the screen
            y: gameHeight / 2 - this.height / 2
        };

        this.velocity = 0;
        this.gravity = 0.25; // Gravity force (Lighter)
        this.jumpStrength = -6; // Jump force (Adjusted for lighter gravity)

        this.image = null; // Will hold the custom image
        this.defaultColor = '#FFD700'; // Gold color as fallback
    }

    jump() {
        this.velocity = this.jumpStrength;
    }

    update(deltaTime) {
        // Apply gravity
        this.velocity += this.gravity;
        this.position.y += this.velocity;

        // Floor collision
        if (this.position.y + this.height > this.gameHeight) {
            this.position.y = this.gameHeight - this.height;
            this.velocity = 0;
        }

        // Ceiling collision (optional)
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity = 0;
        }
    }

    draw(ctx) {
        if (this.image) {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.defaultColor;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

            // Draw eye for direction
            ctx.fillStyle = 'white';
            ctx.fillRect(this.position.x + this.width - 10, this.position.y + 4, 8, 8);
            ctx.fillStyle = 'black';
            ctx.fillRect(this.position.x + this.width - 6, this.position.y + 6, 4, 4);
        }
    }
}
