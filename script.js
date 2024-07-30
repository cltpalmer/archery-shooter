const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const targetImage = new Image();
targetImage.src = 'https://i.imgur.com/ivm90b4.png';

const bossImage = new Image();
bossImage.src = 'https://i.imgur.com/ZkvAql8.png';

const targets = [
    { x: 650, y: 100, points: 300, vx: 2, vy: 1 },
    { x: 700, y: 250, points: 200, vx: -2, vy: -1 },
    { x: 750, y: 400, points: 100, vx: 1, vy: -2 }
];

let score = 0;
let balls = 5;
let time = 0;
let shooting = false;
let angle = 0;
let velocity = 0;
let ball = { x: 100, y: 500, vx: 0, vy: 0 };

let boss = { x: 100, y: 50, width: 150, height: 150, vx: 2, vy: 1, active: false };

const scoreDisplay = document.getElementById('score');
const ballsDisplay = document.getElementById('balls');
const timeDisplay = document.getElementById('time');

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the arch aim
    ctx.beginPath();
    ctx.moveTo(100, 500);
    ctx.lineTo(ball.x, ball.y);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw the ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Draw targets
    targets.forEach(target => {
        ctx.drawImage(targetImage, target.x, target.y, 50, 50);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(target.points, target.x + 15, target.y - 10);

        // Move targets
        target.x += target.vx;
        target.y += target.vy;

        // Check for boundaries and reverse direction if needed
        if (target.x < 0 || target.x + 50 > canvas.width) target.vx *= -1;
        if (target.y < 0 || target.y + 50 > canvas.height) target.vy *= -1;
    });

    // Draw boss if active
    if (boss.active) {
        ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);
        
        // Update boss position
        boss.x += boss.vx;
        boss.y += boss.vy;
        if (boss.x + boss.width > canvas.width || boss.x < 0) boss.vx *= -1;
        if (boss.y + boss.height > canvas.height || boss.y < 0) boss.vy *= -1;
    }

    // Update the ball position if shooting
    if (shooting) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += 0.1; // gravity
    }

    // Check for collisions with targets
    targets.forEach((target, index) => {
        if (ball.x > target.x && ball.x < target.x + 50 &&
            ball.y > target.y && ball.y < target.y + 50) {
            score += target.points;
            targets.splice(index, 1);
            resetBall();
        }
    });

    // Check for collisions with boss
    if (boss.active && ball.x > boss.x && ball.x < boss.x + boss.width &&
        ball.y > boss.y && ball.y < boss.y + boss.height) {
        resetBall();
    }

    // Check for out of bounds
    if (ball.y > canvas.height || ball.x > canvas.width || ball.x < 0) {
        resetBall();
    }

    scoreDisplay.textContent = `Score: ${score}`;
    ballsDisplay.textContent = `Balls: ${balls}`;
    timeDisplay.textContent = `Time: ${time}`;

    requestAnimationFrame(draw);
}

function resetBall() {
    ball.x = 100;
    ball.y = 500;
    ball.vx = 0;
    ball.vy = 0;
    shooting = false;
    if (balls === 0 || score >= 600) {
        alert(`Game Over! Your Score: ${score}`);
        score = 0;
        balls = 5;
        time = 0;
        targets.push(
            { x: 650, y: 100, points: 300, vx: 2, vy: 1 },
            { x: 700, y: 250, points: 200, vx: -2, vy: -1 },
            { x: 750, y: 400, points: 100, vx: 1, vy: -2 }
        );
        boss.active = false;
    }
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    angle = Math.atan2(mouseY - 500, mouseX - 100);
    velocity = Math.sqrt(Math.pow(mouseX - 100, 2) + Math.pow(mouseY - 500, 2)) / 10;
    ball.vx = velocity * Math.cos(angle);
    ball.vy = velocity * Math.sin(angle);
    shooting = true;
    balls--;

    // Activate boss as soon as the first ball is shot
    if (!boss.active) {
        boss.active = true;
    }
});

setInterval(() => {
    if (!shooting) return;
    time++;
}, 1000);

draw();
