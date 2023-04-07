const canvas = document.getElementById('gameCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    size: 20,
    speed: 5
};

const bullets = [];
const keys = {};

let bulletCounter = 0;
const gameTime = 60000;
let startTime = Date.now();
let timer;

function drawPlayer() {
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function shoot() {
    bullets.push({
        x: player.x + player.size / 2,
        y: player.y,
        size: 5,
        speed: 5
    });
    bulletCounter++;
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    for (const bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
    }
}

function updateBullets() {
    for (const bullet of bullets) {
        bullet.y -= bullet.speed;
    }
}

function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.size) {
        player.x += player.speed;
    }
}

function drawBulletCounter() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + bulletCounter, 10, 30);
}

function drawTimer() {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, Math.ceil((gameTime - elapsedTime) / 1000));
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('残り: ' + remainingTime + '秒', canvas.width - 110, 30);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayer();
    drawPlayer();
    drawBullets();
    updateBullets();
    drawBulletCounter();
    drawTimer();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    bulletCounter = 0;
    startTime = Date.now();
    timer = setTimeout(endGame, gameTime);
}

function endGame() {
    clearTimeout(timer);
    alert('お疲れ様です。あなたは' + bulletCounter + '発打ちました。');
    resetGame();
}

function getRelativeCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

// Mouse event listeners
canvas.addEventListener('mousemove', (event) => {
    const coords = getRelativeCoordinates(event);
    player.x = coords.x - player.size / 2;
});

canvas.addEventListener('click', () => {
    shoot();
});

// Touch event listeners
canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const coords = getRelativeCoordinates(event.touches[0]);
    player.x = coords.x - player.size / 2;
}, { passive: false });

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    shoot();
}, { passive: false });

gameLoop();
resetGame();