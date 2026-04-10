const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let money = 200;
let lives = 10;
let towers = [];
let enemies = [];
let projectiles = [];
let isBuilding = false;
let gameRunning = false;

// Initialize
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- Objects ---
class Enemy {
    constructor() {
        this.x = Math.random() * (canvas.width - 250) + 220;
        this.y = -30;
        this.speed = 1.5 + (Math.random() * 1);
        this.hp = 3;
    }
    update() { this.y += this.speed; }
    draw() {
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(this.x, this.y, 20, 20);
    }
}

class Tower {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.range = 150;
        this.cooldown = 0;
    }
    draw() {
        ctx.fillStyle = '#00f2ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI*2);
        ctx.fill();
        // Range Circle
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI*2);
        ctx.stroke();
    }
    fire() {
        if (this.cooldown > 0) { this.cooldown--; return; }
        let target = enemies.find(e => Math.hypot(e.x - this.x, e.y - this.y) < this.range);
        if (target) {
            projectiles.push({x: this.x, y: this.y, target: target, speed: 5});
            this.cooldown = 30; // fire rate
        }
    }
}

// --- Interaction ---
canvas.addEventListener('mousedown', (e) => {
    if (isBuilding && money >= 50) {
        towers.push(new Tower(e.clientX, e.clientY));
        money -= 50;
        document.getElementById('money').innerText = money;
        isBuilding = false;
        document.getElementById('build-tower').classList.remove('active');
    }
});

document.getElementById('build-tower').onclick = () => {
    isBuilding = !isBuilding;
    document.getElementById('build-tower').classList.toggle('active', isBuilding);
};

// --- Game Loop ---
function animate() {
    if (!gameRunning) return;
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Spawn
    if (Math.random() < 0.02) enemies.push(new Enemy());

    // Update Towers
    towers.forEach(t => { t.draw(); t.fire(); });

    // Update Projectiles
    projectiles.forEach((p, i) => {
        let dx = p.target.x - p.x;
        let dy = p.target.y - p.y;
        let dist = Math.hypot(dx, dy);
        p.x += (dx/dist) * p.speed;
        p.y += (dy/dist) * p.speed;
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(p.x, p.y, 4, 4);

        if (dist < 5) {
            p.target.hp--;
            projectiles.splice(i, 1);
        }
    });

    // Update Enemies
    enemies.forEach((e, i) => {
        e.update();
        e.draw();
        if (e.hp <= 0) {
            enemies.splice(i, 1);
            money += 10;
            document.getElementById('money').innerText = money;
        }
        if (e.y > canvas.height) {
            enemies.splice(i, 1);
            lives--;
            document.getElementById('lives').innerText = lives;
            if (lives <= 0) endGame();
        }
    });

    requestAnimationFrame(animate);
}

function endGame() {
    gameRunning = false;
    document.getElementById('game-over').classList.remove('hidden');
}

document.getElementById('start-btn').onclick = () => {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');
    gameRunning = true;
    animate();
};
