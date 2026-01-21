let currentAnswer;
let score = 0;
let questionCount = 0;
let maxQuestions = 20;
let maxNumber = 10;
let wrongQuestions = []; 
let wrongQuestions_Pool = [];
let isReviewMode = false;
let isProcessing = false; // 新增：防止重複觸發檢查的鎖

// DOM 元素 (保持不變)
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

// 事件綁定
if (startBtn) startBtn.addEventListener('click', () => startRound(false));
if (restartBtn) restartBtn.addEventListener('click', () => window.location.reload());
if (reviewBtn) reviewBtn.addEventListener('click', () => startRound(true));

// 虛擬鍵盤
document.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (isProcessing) return; // 如果正在跳下一題，禁止點擊

        const action = this.innerText;
        let currentVal = answerInput.value;

        if (action === '重填') {
            answerInput.value = '';
        } else if (action === '←') {
            answerInput.value = currentVal.slice(0, -1);
        } else {
            if (currentVal.length < 2) {
                answerInput.value = currentVal + action;
            }
        }
        checkAnswer();
    });
});

function startRound(review) {
    isReviewMode = review;
    score = 0;
    questionCount = 0; // 重置題數
    isProcessing = false;
    
    if (!review) {
        wrongQuestions = [];
        const rangeObj = document.querySelector('input[name="range"]:checked');
        maxNumber = rangeObj ? parseInt(rangeObj.value) : 10;
        maxQuestions = 20;
    } else {
        maxQuestions = wrongQuestions_Pool.length;
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

    // 只有進入新題目時才增加計數
    questionCount++;
    progressEl.innerText = questionCount;
    messageEl.innerText = "";
    answerInput.value = "";
    isProcessing = false; // 解鎖，允許答題

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
}

function checkAnswer() {
    if (isProcessing) return;

    const inputVal = answerInput.value;
    const val = parseInt(inputVal);
    
    if (isNaN(val)) return;

    // 正確答案判斷
    if (val === currentAnswer) {
        isProcessing = true; // 鎖定：防止在顯示煙火時重複計算
        score++;
        scoreEl.innerText = score;
        messageEl.innerText = "太棒了！👏";
        messageEl.className = "correct";
        
        createFirework();
        setTimeout(nextQuestion, 1000);
    } 
    // 錯誤答案判斷：當輸入長度等於或超過正確答案位數時
    else if (inputVal.length >= String(currentAnswer).length) {
        messageEl.innerText = "再想一下喔！";
        messageEl.className = "wrong";
        
        const alreadyIn = wrongQuestions.some(q => 
            q.n1 === window.currentQ.n1 && 
            q.n2 === window.currentQ.n2 && 
            q.symbol === window.currentQ.symbol
        );
        if (!alreadyIn) {
            wrongQuestions.push(window.currentQ);
        }
    }
}

function showResult() {
    gameArea.style.display = 'none';
    resultArea.style.display = 'flex'; 
    
    // 計算最終結果
    const totalDone = isReviewMode ? maxQuestions : 20;
    resultStats.innerHTML = `挑戰結束！<br>答對：${score} 題<br>錯題：${wrongQuestions.length} 題`;
    
    if (wrongQuestions.length > 0) {
        reviewBtn.style.display = 'block';
        wrongQuestions_Pool = [...wrongQuestions]; 
        wrongQuestions = []; // 清空下次練習的暫存
    } else {
        reviewBtn.style.display = 'none';
        resultStats.innerHTML += "<br>🌟 你是數學小天才！";
    }
}

// --- 特效部分保持不變 ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill();
        ctx.restore();
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        if (p.alpha > 0) { p.update(); p.draw(); }
        else { particles.splice(i, 1); }
    });
}
animate();
