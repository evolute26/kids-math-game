let currentAnswer;
let score = 0;
let questionCount = 0;
let maxQuestions = 20;
let maxNumber = 10;
let wrongQuestions = []; // 儲存錯題
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

// 開始按鈕
document.getElementById('start-btn').onclick = () => startRound(false);
document.getElementById('restart-btn').onclick = () => location.reload();
reviewBtn.onclick = () => startRound(true);

function startRound(review) {
    isReviewMode = review;
    score = 0;
    questionCount = 0;
    if (!review) {
        wrongQuestions = [];
        const range = document.querySelector('input[name="range"]:checked').value;
        maxNumber = parseInt(range);
    } else {
        maxQuestions = wrongQuestions.length;
        wrongQuestions = [...wrongQuestions]; // 複製一份來練習
        const tempPool = [...wrongQuestions];
        wrongQuestions = []; // 清空，準備記錄練習時又錯的
    }

    setupArea.style.display = 'none';
    resultArea.style.display = 'none';
    gameArea.style.display = 'block';
    scoreEl.innerText = score;
    nextQuestion();
}

function nextQuestion() {
    if (questionCount >= (isReviewMode ? maxQuestions : 20)) {
        showResult();
        return;
    }

    questionCount++;
    progressEl.innerText = questionCount;
    messageEl.innerText = "";
    answerInput.value = "";

    let n1, n2, symbol;
    if (isReviewMode) {
        // 從錯題池抽取
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
    
    // 暫存當前題目，以防答錯
    window.currentQ = { n1, n2, symbol, ans: currentAnswer };
    questionEl.innerText = `${n1} ${symbol} ${n2}`;
    answerInput.focus();
}

// 記錄錯題池
let wrongQuestions_Pool = [];

answerInput.oninput = () => {
    const val = parseInt(answerInput.value);
    if (isNaN(val)) return;

    if (val === currentAnswer) {
        score++;
        scoreEl.innerText = score;
        messageEl.innerText = "太棒了！🎇";
        messageEl.className = "correct";
        createFirework();
        setTimeout(nextQuestion, 800);
    } else if (answerInput.value.length >= String(currentAnswer).length) {
        // 答錯邏輯
        messageEl.innerText = "答錯了，再試試！";
        messageEl.className = "wrong";
        
        // 如果還沒記錄過這題，就加入錯題本
        const alreadyIn = wrongQuestions.some(q => q.n1 === window.currentQ.n1 && q.n2 === window.currentQ.n2 && q.symbol === window.currentQ.symbol);
        if (!alreadyIn) {
            wrongQuestions.push(window.currentQ);
        }
    }
};

function showResult() {
    gameArea.style.display = 'none';
    resultArea.style.display = 'block';
    const total = isReviewMode ? maxQuestions : 20;
    resultStats.innerHTML = `本次挑戰 ${total} 題<br>答對：${score} 題<br>錯題：${wrongQuestions.length} 題`;
    
    if (wrongQuestions.length > 0) {
        reviewBtn.style.display = 'inline-block';
        wrongQuestions_Pool = [...wrongQuestions]; // 把錯題交給練習池
    } else {
        reviewBtn.style.display = 'none';
        resultStats.innerHTML += "<br>🎉 全對！你太厲害了！";
    }
}

// --- 煙火粒子特效 ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.onresize = resize;
resize();

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
        this.alpha = 1;
    }
    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill();
    }
    update() {
        this.x += this.velocity.x; this.y += this.velocity.y;
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
    ctx.fillStyle = 'rgba(240, 249, 255, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        if (p.alpha > 0) p.update(), p.draw();
        else particles.splice(i, 1);
    });
}
animate();
