    // --- 設定と変数 ---
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    
    // UI要素
    const startScreen = document.getElementById("startScreen");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const resultTitle = document.getElementById("resultTitle");
    const resultMessage = document.getElementById("resultMessage");
    const scoreBoard = document.getElementById("scoreBoard");
    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");

    // ゲーム定数
    const BALL_RADIUS = 10;
    const PADDLE_HEIGHT = 20; // スマホでも触れやすく少し太め
    const PADDLE_WIDTH = 120; // スマホ用にやや広め
    const BRICK_ROW_COUNT = 6;
    const BRICK_COLUMN_COUNT = 8; // スマホの横幅に合わせて減らす
    const BRICK_PADDING = 8;
    const BRICK_OFFSET_TOP = 50;
    const BRICK_OFFSET_LEFT = 20;
    const BRICK_HEIGHT = 25;
    
    // 計算: スマホ/PC両方に対応するようにパーセンテージではなく固定値で調整
    // canvasの論理幅800pxに基づく計算
    const BRICK_WIDTH = (800 - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;

    // ゲーム状態変数
    let x, y, dx, dy;
    let paddleX;
    let score = 0;
    let lives = 3;
    let animationId;
    let isGameRunning = false;
    
    let bricks = [];
    let particles = []; 
    
    // 操作用変数 (キーボード)
    let rightPressed = false;
    let leftPressed = false;

    // 初期化関数
    function initGame() {
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 5; 
        dy = -5; 
        paddleX = (canvas.width - PADDLE_WIDTH) / 2;
        score = 0;
        lives = 3;
        particles = [];
        
        rightPressed = false;
        leftPressed = false;

        bricks = [];
        for(let c=0; c<BRICK_COLUMN_COUNT; c++) {
            bricks[c] = [];
            for(let r=0; r<BRICK_ROW_COUNT; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }

        updateScoreBoard();
    }

    // --- イベントリスナー (キーボード) ---
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    function keyDownHandler(e) {
        if(e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
            rightPressed = true;
        }
        else if(e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
            leftPressed = true;
        }
    }

    function keyUpHandler(e) {
        if(e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
            rightPressed = false;
        }
        else if(e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
            leftPressed = false;
        }
    }

    // --- イベントリスナー (タッチ操作 - スマートフォン用) ---
    
    // ゲーム開始前にタッチした場合の処理を防ぐため、isGameRunningで判定
    canvas.addEventListener("touchstart", handleTouch, {passive: false});
    canvas.addEventListener("touchmove", handleTouch, {passive: false});

    function handleTouch(e) {
        if (!isGameRunning) return;
        
        // 複数タッチ対応のため、最初の指の位置を取得
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        
        // canvas内の相対座標を計算
        // canvasの表示サイズ( CSSで縮小されている可能性あり )と論理サイズ(800px)の比率を考慮
        const scaleX = canvas.width / rect.width;
        const touchX = (touch.clientX - rect.left) * scaleX;

        // パドルの中心が指の位置に来るように移動
        paddleX = touchX - PADDLE_WIDTH / 2;

        // 画面外に出ないように制限
        if (paddleX < 0) paddleX = 0;
        if (paddleX + PADDLE_WIDTH > canvas.width) paddleX = canvas.width - PADDLE_WIDTH;

        e.preventDefault(); // スクロール防止
    }

    startBtn.addEventListener("click", () => {
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        initGame();
        isGameRunning = true;
        
        // タッチ操作を有効にするため、スコアボードを表示
        scoreBoard.style.display = 'block';
        
        draw();
    });

    restartBtn.addEventListener("click", () => {
        gameOverScreen.classList.add('hidden');
        initGame();
        isGameRunning = true;
        draw();
    });

    // --- 描画関数 ---

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, BALL_RADIUS, 0, Math.PI*2);
        ctx.fillStyle = "#e74c3c";
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = "#3498db";
        ctx.fill();
        // パドルに光沢感を出す
        let gradient = ctx.createLinearGradient(paddleX, canvas.height - PADDLE_HEIGHT, paddleX, canvas.height);
        gradient.addColorStop(0, "#5dade2");
        gradient.addColorStop(1, "#2874a6");
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke(); 
        ctx.closePath();
    }

    function drawBricks() {
        for(let c=0; c<BRICK_COLUMN_COUNT; c++) {
            for(let r=0; r<BRICK_ROW_COUNT; r++) {
                if(bricks[c][r].status === 1) {
                    const brickX = (c*(BRICK_WIDTH+BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                    const brickY = (r*(BRICK_HEIGHT+BRICK_PADDING)) + BRICK_OFFSET_TOP;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                    
                    const colors = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6"];
                    ctx.fillStyle = colors[r];
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                radius: Math.random() * 4,
                color: color,
                life: 1.0
            });
        }
    }

    function drawParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.closePath();

            p.x += p.dx;
            p.y += p.dy;
            p.life -= 0.03;

            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    function collisionDetection() {
        for(let c=0; c<BRICK_COLUMN_COUNT; c++) {
            for(let r=0; r<BRICK_ROW_COUNT; r++) {
                let b = bricks[c][r];
                if(b.status === 1) {
                    if(x > b.x && x < b.x+BRICK_WIDTH && y > b.y && y < b.y+BRICK_HEIGHT) {
                        dy = -dy;
                        b.status = 0;
                        score += 10;
                        updateScoreBoard();
                        
                        const colors = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6"];
                        createParticles(b.x + BRICK_WIDTH/2, b.y + BRICK_HEIGHT/2, colors[r]);

                        if(score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10) {
                            gameOver(true);
                        }
                    }
                }
            }
        }
    }

    function updateScoreBoard() {
        scoreBoard.innerText = `Score: ${score} | Lives: ${lives}`;
    }

    // --- メインループ ---

    function draw() {
        if (!isGameRunning) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBricks();
        drawBall();
        drawPaddle();
        drawParticles();
        collisionDetection();

        // 壁への跳ね返り (左右)
        if(x + dx > canvas.width - BALL_RADIUS || x + dx < BALL_RADIUS) {
            dx = -dx;
        }
        
        // 天井
        if(y + dy < BALL_RADIUS) {
            dy = -dy;
        } 
        // 底面
        else if(y + dy > canvas.height - BALL_RADIUS - PADDLE_HEIGHT) {
            if(x > paddleX && x < paddleX + PADDLE_WIDTH) {
                let hitPoint = x - (paddleX + PADDLE_WIDTH / 2);
                dx = hitPoint * 0.15; 
                
                dy = -dy;
                // スピードアップ制限
                if (Math.abs(dy) < 9) dy *= 1.03;
            } 
            else if (y + dy > canvas.height - BALL_RADIUS) {
                lives--;
                updateScoreBoard();
                if(!lives) {
                    gameOver(false);
                    return;
                } else {
                    x = canvas.width/2;
                    y = canvas.height-30;
                    dx = 5;
                    dy = -5;
                    paddleX = (canvas.width-PADDLE_WIDTH)/2;
                }
            }
        }

        // パドルのキーボード移動処理
        if(rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
            paddleX += 7; // キーボード操作は少し速め
        }
        else if(leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        x += dx;
        y += dy;

        animationId = requestAnimationFrame(draw);
    }

    function gameOver(isWin) {
        isGameRunning = false;
        cancelAnimationFrame(animationId);
        
        resultTitle.innerText = isWin ? "YOU WIN!" : "GAME OVER";
        resultTitle.style.color = isWin ? "#2ecc71" : "#e74c3c";
        resultMessage.innerHTML = `最終スコア: <strong>${score}</strong> 点<br><span style="font-size:0.8em">おめでとうございます！</span>`;
        
        gameOverScreen.classList.remove('hidden');
    }

    // 初回描画（背景だけ）
    ctx.fillStyle = "#eee";
    ctx.fillRect(0,0,canvas.width, canvas.height);
