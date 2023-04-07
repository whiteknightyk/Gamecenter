/// Set up canvas
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Set up game variables
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballRadius = 2;
let ballDx = 2;
let ballDy = -2;

let paddleWidth = 25;
let paddleHeight = 5;
let paddleX = (canvas.width - paddleWidth) / 2;

let brickRowCount = 5;
let brickColumnCount = 12;
let brickWidth = 20;
let brickHeight = 6;
let brickPadding = 2;
let brickOffsetTop = 30;
let brickOffsetLeft = 20;

let score = 0;
let lives = 3;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// Draw ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.closePath();
}

// Draw paddle
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.closePath();
}

// Draw bricks
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// Detect collision with bricks
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status == 1) {
        if (
          ballX > b.x &&
          ballX < b.x + brickWidth &&
          ballY > b.y &&
          ballY < b.y + brickHeight
        ) {
          ballDy = -ballDy;
          b.status = 0;
          score++;
          if (score == brickRowCount * brickColumnCount) {
            alert("You win!");
            document.location.reload();
          }
        }
      }
    }
  }
}

// Draw score
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#000000";
  ctx.fillText("Score: " + score, 8, 20);
}

// Draw lives
function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#000000";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

// Function to move paddle
function movePaddle(e) {
  let relativeX = e.changedTouches[0].pageX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

// Event listeners for paddle movement
canvas.addEventListener("touchstart", function(e) {
  isFlicking = true;
  lastX = e.changedTouches[0].pageX;
});

canvas.addEventListener("touchmove", function(e) {
  e.preventDefault();
  if (isFlicking) {
    let currentX = e.changedTouches[0].pageX;
    let deltaX = currentX - lastX;
    lastX = currentX;
    paddleX += deltaX;
    if (paddleX < 0) {
      paddleX = 0;
    } else if (paddleX + paddleWidth > canvas.width) {
      paddleX = canvas.width - paddleWidth;
    }
  }
});

canvas.addEventListener("touchend", function(e) {
  isFlicking = false;
});

// Update game
function update() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw game elements
  drawBall();
  drawPaddle();
  drawBricks();
  drawScore();
  drawLives();

  // Detect collision with walls
  if (ballX + ballDx > canvas.width - ballRadius || ballX + ballDx < ballRadius) {
    ballDx = -ballDx;
  }
  if (ballY + ballDy < ballRadius) {
    ballDy = -ballDy;
  } else if (ballY + ballDy > canvas.height - ballRadius - paddleHeight) {
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      ballDy = -ballDy;
    } else {
      lives--;
      if (!lives) {
        alert("Game over!");
        document.location.reload();
      } else {
        ballX = canvas.width / 2;
        ballY = canvas.height - 30;
        ballDx = 2;
        ballDy = -2;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  // Move ball
  ballX += ballDx;
  ballY += ballDy;

  // Detect collision with bricks
  collisionDetection();

  // Request animation frame
  requestAnimationFrame(update);
}

// Start game
update();