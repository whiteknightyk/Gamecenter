const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const cellSize = 40;
const cols = width / cellSize;
const rows = height / cellSize;

let board = [];
let score = 0;
let currentTetrimino = null;
let nextTetrimino = null;
let isGameOver = false;

const Tetriminos = [
  {
    // I
    shape: [
      [1, 1, 1, 1]
    ],
    color: "cyan"
  },
  {
    // J
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: "blue"
  },
  {
    // L
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: "orange"
  },
  {
    // O
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: "yellow"
  },
  {
    // S
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: "green"
  },
  {
    // T
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: "purple"
  },
  {
    // Z
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: "red"
  }
];

function createBoard() {
  for (let row = 0; row < rows; row++) {
    board[row] = [];
    for (let col = 0; col < cols; col++) {
      board[row][col] = "";
    }
  }
}

function drawCell(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  context.strokeStyle = "#D3D3D3";
  context.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const color = board[row][col];
      if (color) {
        drawCell(col, row, color);
      } else {
        drawCell(col, row, "white");
      }
    }
  }
}

function drawTetrimino(tetrimino) {
  tetrimino.shape.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value) {
        drawCell(tetrimino.x + colIndex, tetrimino.y + rowIndex, tetrimino.color);
      }
    });
  });
}

function getRandomTetrimino() {
  const index = Math.floor(Math.random() * Tetriminos.length);
  const tetrimino = Tetriminos[index];
  return {
    shape: tetrimino.shape,
    color: tetrimino.color,
    x: Math.floor(cols / 2) - Math.ceil(tetrimino.shape[0].length / 2),
    y: 0
  };
}

function moveTetriminoDown() {
  currentTetrimino.y++;
  if (isColliding(currentTetrimino)) {
    currentTetrimino.y--;
    lockTetrimino(currentTetrimino);
    currentTetrimino = nextTetrimino;
    nextTetrimino = getRandomTetrimino();
    if (isColliding(currentTetrimino)) {
      isGameOver = true;
    }
  }
}

function moveTetriminoLeft() {
  currentTetrimino.x--;
  if (isColliding(currentTetrimino)) {
    currentTetrimino.x++;
  }
}

function moveTetriminoRight() {
  currentTetrimino.x++;
  if (isColliding(currentTetrimino)) {
    currentTetrimino.x--;
  }
}

function rotateTetrimino() {
  const originalShape = currentTetrimino.shape;
  const rotatedShape = [];
  for (let row = 0; row < originalShape[0].length; row++) {
    rotatedShape[row] = [];
    for (let col = 0; col < originalShape.length; col++) {
      rotatedShape[row][col] = originalShape[originalShape.length - 1 - col][row];
    }
  }
  currentTetrimino.shape = rotatedShape;
  if (isColliding(currentTetrimino)) {
    currentTetrimino.shape = originalShape;
  }
}

function isColliding(tetrimino) {
  for (let row = 0; row < tetrimino.shape.length; row++) {
    for (let col = 0; col < tetrimino.shape[row].length; col++) {
      if (tetrimino.shape[row][col]) {
        const newX = tetrimino.x + col;
        const newY = tetrimino.y + row;
        if (newX < 0 || newX >= cols || newY >= rows || board[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

function lockTetrimino(tetrimino) {
  tetrimino.shape.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value) {
        const x = tetrimino.x + colIndex;
        const y = tetrimino.y + rowIndex;
        board[y][x] = tetrimino.color;
      }
    });
  });
  clearCompletedRows();
}

function clearCompletedRows() {
  let completedRows = 0;
  for (let row = rows - 1; row >= 0; row--) {
    if (board[row].every(cell => cell)) {
      completedRows++;
      board.splice(row, 1);
      board.unshift(new Array(cols).fill(""));
      row++;
    }
  }
  score += completedRows ** 2;
}

function drawScore() {
  context.fillStyle = "black";
  context.font = "16px Arial";
  context.fillText(`Score: ${score}`, 250, height - 690);
}

function drawGameOver() {
  context.fillStyle = "black";
  context.font = "32px Arial";
  context.fillText("GAME OVER", 85, height / 2);
}

function draw() {
  context.clearRect(0, 0, width, height);
  drawBoard();
  drawTetrimino(currentTetrimino);
  drawTetrimino(nextTetrimino);
  drawScore();
  if (isGameOver) {
    drawGameOver();
  }
}

createBoard();
currentTetrimino = getRandomTetrimino();
nextTetrimino = getRandomTetrimino();

setInterval(() => {
  if (!isGameOver) {
    moveTetriminoDown();
    draw();
  }
}, 500);

document.addEventListener("keydown", event => {
  if (event.code === "ArrowLeft") {
    moveTetriminoLeft();
    draw();
  } else if (event.code === "ArrowRight") {
    moveTetriminoRight();
    draw();
  } else if (event.code === "ArrowDown") {
    moveTetriminoDown();
    draw();
  } else if (event.code === "ArrowUp") {
    rotateTetrimino();
    draw();
  }
});