const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let snake, food, direction, game, score, speed;
let timerInterval, timeElapsed = 0;
let isPaused = false;
let aiMode = false;

const eatSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.wav");
const gameOverSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.wav");

eatSound.volume = 0.5;
gameOverSound.volume = 0.5;

function initGame() {
    snake = [{x: 200, y: 200}];
    food = randomFood();
    direction = "RIGHT";
    score = 0;
    speed = parseInt(document.getElementById("difficulty").value);
    timeElapsed = 0;
    document.getElementById("score").innerText = score;
    document.getElementById("timer").innerText = timeElapsed;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeElapsed++;
        document.getElementById("timer").innerText = timeElapsed;
    }, 1000);
}

function randomFood() {
    return {
        x: Math.floor(Math.random()*20)*box,
        y: Math.floor(Math.random()*20)*box
    };
}

document.addEventListener("keydown", e => {
    if(e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if(e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if(e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if(e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

function changeDirection(dir) {
    if(dir === "up" && direction !== "DOWN") direction = "UP";
    if(dir === "down" && direction !== "UP") direction = "DOWN";
    if(dir === "left" && direction !== "RIGHT") direction = "LEFT";
    if(dir === "right" && direction !== "LEFT") direction = "RIGHT";
}

function draw() {
    ctx.clearRect(0,0,400,400);

    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#00ffcc" : "#00aa88";
        ctx.fillRect(part.x, part.y, box, box);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    let headX = snake[0].x;
    let headY = snake[0].y;

    if(aiMode) {
        if(headX < food.x) direction = "RIGHT";
        else if(headX > food.x) direction = "LEFT";
        else if(headY < food.y) direction = "DOWN";
        else if(headY > food.y) direction = "UP";
    }

    if(direction === "LEFT") headX -= box;
    if(direction === "UP") headY -= box;
    if(direction === "RIGHT") headX += box;
    if(direction === "DOWN") headY += box;

    if(headX === food.x && headY === food.y) {
        score++;
        eatSound.play();
        document.getElementById("score").innerText = score;
        food = randomFood();

        if(speed > 50) speed -= 2; // increase speed gradually
        clearInterval(game);
        game = setInterval(draw, speed);
    } else {
        snake.pop();
    }

    const newHead = {x: headX, y: headY};

    if(headX < 0 || headY < 0 || headX >= 400 || headY >= 400 || collision(newHead, snake)) {
        endGame();
    }

    snake.unshift(newHead);
}

function collision(head, body) {
    return body.some(part => part.x === head.x && part.y === head.y);
}

function startGame() {
    document.getElementById("gameOverModal").classList.add("hidden");
    initGame();
    clearInterval(game);
    game = setInterval(draw, speed);
}

function pauseGame() {
    if(isPaused) {
        game = setInterval(draw, speed);
        document.getElementById("pauseBtn").innerText = "Pause";
    } else {
        clearInterval(game);
        document.getElementById("pauseBtn").innerText = "Resume";
    }
    isPaused = !isPaused;
}

function endGame() {
    clearInterval(game);
    clearInterval(timerInterval);
    gameOverSound.play();
    document.getElementById("finalScore").innerText = score;
    document.getElementById("gameOverModal").classList.remove("hidden");
}

document.getElementById("startBtn").onclick = startGame;
document.getElementById("pauseBtn").onclick = pauseGame;
document.getElementById("aiBtn").onclick = () => aiMode = !aiMode;

document.getElementById("saveScoreBtn").onclick = function() {
    const name = document.getElementById("playerName").value;
    if(name) {
        let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        leaderboard.push({name, score});
        leaderboard.sort((a,b)=>b.score-a.score);
        leaderboard = leaderboard.slice(0,10);
        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    }
    document.getElementById("gameOverModal").classList.add("hidden");
};

document.getElementById("exitBtn").onclick = function() {
    document.getElementById("gameOverModal").classList.add("hidden");
};

document.getElementById("leaderboardBtn").onclick = function() {
    showLeaderboard();
};

function showLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const list = document.getElementById("leaderboardList");
    list.innerHTML = "";
    leaderboard.forEach((player,i)=>{
        const li = document.createElement("li");
        li.innerText = `${i+1}. ${player.name} - ${player.score}`;
        list.appendChild(li);
    });
    document.getElementById("leaderboardModal").classList.remove("hidden");
}

function closeLeaderboard() {
    document.getElementById("leaderboardModal").classList.add("hidden");
}