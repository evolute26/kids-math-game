let currentAnswer;
let score = 0;
let timeLeft = 30;
let timerInterval = null;
let maxNumber = 10;

const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');
const timerBox = document.getElementById('timer-box');
const timeLeftEl = document.getElementById('time-left');
const timerToggle = document.getElementById('timer-toggle');
const rangeRadios = document.getElementsByName('range');

function initGame() {
    score = 0;
    scoreEl.innerText = score;
    generateQuestion();
}

function generateQuestion() {
    rangeRadios.forEach(r => { if(r.checked) maxNumber = parseInt(r.value); });
    const isAddition = Math.random() > 0.5;
    let n1, n2;
    if (isAddition) {
        n1 = Math.floor(Math.random() * (maxNumber + 1));
        n2 = Math.floor(Math.random() * (maxNumber - n1 + 1));
        currentAnswer = n1 + n2;
        questionEl.innerText = `${n1} + ${n2}`;
    } else {
        n1 = Math.floor(Math.random() * (maxNumber + 1));
        n2 = Math.floor(Math.random() * (n1 + 1));
        currentAnswer = n1 - n2;
        questionEl.innerText = `${n1} - ${n2}`;
    }
    answerInput.value = '';
    answerInput.focus();
}

answerInput.addEventListener('input', () => {
    const val = parseInt(answerInput.value);
    if (val === currentAnswer) {
        score++;
        scoreEl.innerText = score;
        messageEl.innerText = "答對了！太棒了 🎇";
        messageEl.className = "correct";
        createFirework();
        if (timerToggle.checked && !timerInterval) startTimer();
        setTimeout(() => {
            messageEl.innerText = "";
            generateQuestion();
        }, 700);
    } else if (answerInput.value.length >= 2 && val !== currentAnswer) {
        messageEl.innerText = "再想一下下...";
        messageEl.className = "wrong";
    }
});

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    timeLeftEl.innerText = timeLeft;
    timerBox.style.visibility = 'visible';
    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert(`時間到！\n難度：${maxNumber}以內\n你的得分是：${score} 分！🌟`);
            resetGameState();
        }
    }, 1000);
}

function resetGameState() {
    clearInterval(timerInterval);
    timerInterval = null;
    score = 0;
    scoreEl.innerText = score;
    timerBox.style.visibility = timerToggle.checked ? 'visible' : 'hidden';
    timeLeftEl.innerText = "30";
    messageEl.innerText = "";
    generateQuestion();
}

timerToggle.addEventListener('change', resetGameState);
rangeRadios.forEach(r => r.addEventListener('change', resetGameState));

// --- 煙火特效 ---
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
        this.friction = 0.95;
    }
    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.015;
    }
}

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height / 2) + 100;
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FFBE0B', '#FF006E', '#8338EC'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 40; i++) particles.push(new Particle(x, y, color));
}

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(240, 249, 255, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        if (p.alpha > 0) { p.update(); p.draw(); }
        else { particles.splice(i, 1); }
    });
}

initGame();
animate();D