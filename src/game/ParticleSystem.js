export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    spawn(x, y, type) {
        if (type === 'jump') {
            // Spawn feathers/dust
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2 + 1,
                    life: 1.0,
                    color: 'rgba(255, 255, 255, 0.8)',
                    size: Math.random() * 3 + 1,
                    type: 'feather'
                });
            }
        } else if (type === 'collision') {
            // Explosion
            for (let i = 0; i < 20; i++) {
                this.particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    life: 1.0,
                    color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`, // Orange/Yellow fire
                    size: Math.random() * 5 + 2,
                    type: 'spark'
                });
            }
        }
    }

    update(deltaTime) {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= deltaTime / 1000 * 2; // Fade out speed

            if (p.type === 'feather') {
                p.vy += 0.1; // Gravity for feathers
            }
        });

        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw(ctx) {
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }

    reset() {
        this.particles = [];
    }
}
