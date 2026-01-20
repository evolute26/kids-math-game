let currentAnswer;
let score = 0;
let questionCount = 0;
let maxQuestions = 20;
let maxNumber = 10;
let wrongQuestions = []; 
let wrongQuestions_Pool = [];
let isReviewMode = false;

// DOM 元素
const setupArea = document.getElementById('setup-area');
const gameArea = document.getElementById('game-area');
const resultArea = document.getElementById('result-area');
const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer');
const scoreEl = document.getElementById('score');
const progressEl = document.getElementById('progress');
const messageEl = document.getElementById('message');
const resultStats = document.getElementById('result-stats');
const reviewBtn = document.getElementById('review-btn');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// --- 修正後的事件綁定 (適合 Safari/iOS) ---
if (startBtn) {
    startBtn.addEventListener('click', function() {
        startRound(false);
    }, false);
}

if (restartBtn) {
    restartBtn.addEventListener('click', function() {
        window.location.reload();
    }, false);
}

if (reviewBtn) {
    reviewBtn.addEventListener('click', function() {
        startRound(true);
    }, false);
}

function startRound(review) {
    isReviewMode = review;
    score = 0;
    questionCount = 0;
    
    if (!review) {
        wrongQuestions = [];
        const rangeObj = document.querySelector('input[name="range"]:checked');
        maxNumber = rangeObj ? parseInt(rangeObj.value) : 10;
        maxQuestions = 20;
    } else {
        maxQuestions = wrongQuestions_Pool.length;
        // 練習模式下，我們從 Pool 裡面抓題
    }

    setupArea.style.display = 'none';
    resultArea.style.display = 'none';
    gameArea.style.display = 'block';
    
    scoreEl.innerText = score;
    nextQuestion();
}

function nextQuestion() {
    if (questionCount >= maxQuestions) {
        showResult();
        return;
    }

    questionCount++;
    progressEl.innerText = questionCount;
    messageEl.innerText = "";
    answerInput.value = "";

    let n1, n2, symbol;
    if (isReviewMode) {
        const q = wrongQuestions_Pool[questionCount - 1];
        n1 = q.n1; n2 = q.n2; symbol = q.symbol; currentAnswer = q.ans;
    } else {
        const isAddition = Math.random() > 0.5;
        if (isAddition) {
            n1 = Math.floor(Math.random() * (maxNumber + 1));
            n2 = Math.floor(Math.random() * (maxNumber - n1 + 1));
            currentAnswer = n1 + n2;
            symbol = "+";
        } else {
            n1 = Math.floor(Math.random() * (maxNumber + 1));
            n2 = Math.floor(Math.random() * (n1 + 1));
            currentAnswer = n1 - n2;
            symbol = "-";
        }
    }
    
    window.currentQ = { n1, n2, symbol, ans: currentAnswer };
    questionEl.innerText = `${n1} ${symbol} ${n2} =`;
    
    // 延遲一點點時間讓 Safari 完成 DOM 渲染再 focus
    setTimeout(() => {
        answerInput.focus();
        answerInput.click(); // 強制觸發點擊以喚起手機鍵盤
    }, 100);
}

answerInput.addEventListener('input', function() {
    const val = parseInt(answerInput.value);
    if (isNaN(val)) return;

    if (val === currentAnswer) {
        score++;
        scoreEl.innerText = score;
        messageEl.innerText = "太棒了！🎇";
        messageEl.className = "correct";
        createFirework();
        setTimeout(nextQuestion, 800);
    } else {
        // 當輸入位數達到或超過正確答案長度時才判斷答錯
        if (answerInput.value.length >= String(currentAnswer).length) {
            messageEl.innerText = "答錯了，再試試！";
            messageEl.className = "wrong";
            
            const alreadyIn = wrongQuestions.some(q => q.n1 === window.currentQ.n1 && q.n2 === window.currentQ.n2 && q.symbol === window.currentQ.symbol);
            if (!alreadyIn) {
                wrongQuestions.push(window.currentQ);
            }
        }
    }
});

function showResult() {
    gameArea.style.display = 'none';
    resultArea.style.display = 'block';
    resultStats.innerHTML = `本次挑戰 ${maxQuestions} 題<br>答對：${score} 題<br>錯題：${wrongQuestions.length} 題`;
    
    if (wrongQuestions.length > 0) {
        reviewBtn.style.display = 'inline-block';
        wrongQuestions_Pool = [...wrongQuestions]; 
        wrongQuestions = []; // 重置記錄，準備練習
    } else {
        reviewBtn.style.display = 'none';
        resultStats.innerHTML += "<br>🎉 全對！你太厲害了！";
    }
}

// --- 粒子特效 (已針對 Safari 優化) ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
        this.alpha = 1;
    }
    draw() {
        ctx.save(); // Safari 安全繪製
        ctx.globalAlpha = this.alpha;
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color; 
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.x += this.velocity.x; 
        this.y += this.velocity.y;
        this.alpha -= 0.02;
    }
}

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height / 2) + 100;
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#8338EC'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 30; i++) particles.push(new Particle(x, y, color));
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 改用 clearRect 在 Safari 效能較好
    particles.forEach((p, i) => {
        if (p.alpha > 0) {
            p.update();
            p.draw();
        } else {
            particles.splice(i, 1);
        }
    });
}
animate();
