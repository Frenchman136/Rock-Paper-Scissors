const choiceButtons = document.querySelectorAll('.choices-btn');
const resultText = document.getElementById('result-text');
const choicesDisplay = document.getElementById('choices-display');
const streakText = document.getElementById('streak-text');
const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const tieScoreEl = document.getElementById('tie-score');
const resetBtn = document.getElementById('reset-btn');
const bestOfSelect = document.getElementById('best-of-select');
const muteBtn = document.getElementById('mute-btn');
const matchStatus = document.getElementById('match-status');

const choices = ['rock', 'paper', 'scissors'];
const labels = {
    rock: '[ROCK]',
    paper: '[PAPER]',
    scissors: '[SCISSORS]'
};

let playerScore = 0;
let computerScore = 0;
let tieScore = 0;
let playerStreak = 0;
let bestOf = Number(bestOfSelect.value);
let targetWins = calculateTargetWins(bestOf);
let isMuted = false;
let isRoundAnimating = false;
let isMatchOver = false;

const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = AudioContextClass ? new AudioContextClass() : null;

function calculateTargetWins(roundCount) {
    return Math.floor(roundCount / 2) + 1;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getComputerChoice() {
    const randomNumber = Math.floor(Math.random() * choices.length);
    return choices[randomNumber];
}

function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'tie';
    }

    if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        return 'player';
    }

    return 'computer';
}

function playTone(frequency, durationMs, type = 'sine', volume = 0.035) {
    if (isMuted || !audioCtx) {
        return;
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.value = volume;
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durationMs / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + durationMs / 1000);
}

function playOutcomeSound(winner) {
    if (winner === 'player') {
        playTone(660, 120, 'triangle');
        setTimeout(() => playTone(880, 160, 'triangle'), 120);
    } else if (winner === 'computer') {
        playTone(240, 170, 'sawtooth', 0.03);
    } else {
        playTone(520, 100, 'square', 0.03);
    }
}

function clearResultClasses() {
    resultText.classList.remove('result-win', 'result-lose', 'result-tie', 'countdown', 'reveal');
}

function refreshScoreUI() {
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
    tieScoreEl.textContent = tieScore;
}

function refreshMatchStatus() {
    matchStatus.textContent = `Best of ${bestOf} - First to ${targetWins} wins`;
}

function refreshStreak(winner) {
    if (winner === 'player') {
        playerStreak += 1;
    } else {
        playerStreak = 0;
    }

    streakText.textContent = `Win Streak: ${playerStreak}`;
}

function setButtonsDisabled(disabled) {
    choiceButtons.forEach((button) => {
        button.disabled = disabled;
    });
}

async function runCountdown() {
    const beats = ['Rock...', 'Paper...', 'Scissors...', 'Shoot!'];
    clearResultClasses();
    resultText.classList.add('countdown');

    for (const beat of beats) {
        resultText.textContent = beat;
        playTone(430, 70, 'square', 0.02);
        await delay(220);
    }

    resultText.classList.remove('countdown');
}

function updateDisplay(playerChoice, computerChoice, winner) {
    clearResultClasses();

    choicesDisplay.textContent = `You: ${labels[playerChoice]} ${playerChoice} | Computer: ${labels[computerChoice]} ${computerChoice}`;

    if (winner === 'tie') {
        resultText.textContent = "It's a tie!";
        resultText.classList.add('result-tie');
        return;
    }

    if (winner === 'player') {
        resultText.textContent = 'You Win This Round!';
        resultText.classList.add('result-win');
    } else {
        resultText.textContent = 'Computer Wins This Round!';
        resultText.classList.add('result-lose');
    }

    resultText.classList.add('reveal');
}

function updateScore(winner) {
    if (winner === 'player') {
        playerScore += 1;
    } else if (winner === 'computer') {
        computerScore += 1;
    } else {
        tieScore += 1;
    }

    refreshScoreUI();
}

function maybeFinishMatch() {
    if (playerScore < targetWins && computerScore < targetWins) {
        return false;
    }

    isMatchOver = true;
    setButtonsDisabled(true);

    clearResultClasses();

    if (playerScore >= targetWins) {
        resultText.textContent = 'Match Won! Great run.';
        resultText.classList.add('result-win', 'reveal');
        playTone(740, 150, 'triangle', 0.04);
        setTimeout(() => playTone(980, 200, 'triangle', 0.04), 160);
    } else {
        resultText.textContent = 'Match Lost. Try again!';
        resultText.classList.add('result-lose', 'reveal');
        playTone(220, 220, 'sawtooth', 0.03);
    }

    choicesDisplay.textContent = `Final score ${playerScore} - ${computerScore} (${tieScore} ties)`;
    return true;
}

async function playGame(playerChoice, selectedButton) {
    if (isRoundAnimating || isMatchOver) {
        return;
    }

    isRoundAnimating = true;
    setButtonsDisabled(true);
    selectedButton.classList.add('is-selected');

    await runCountdown();

    const computerChoice = getComputerChoice();
    const winner = determineWinner(playerChoice, computerChoice);

    updateDisplay(playerChoice, computerChoice, winner);
    updateScore(winner);
    refreshStreak(winner);
    playOutcomeSound(winner);

    const matchFinished = maybeFinishMatch();

    await delay(180);
    selectedButton.classList.remove('is-selected');

    isRoundAnimating = false;

    if (!matchFinished) {
        setButtonsDisabled(false);
    }
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    tieScore = 0;
    playerStreak = 0;
    isRoundAnimating = false;
    isMatchOver = false;

    bestOf = Number(bestOfSelect.value);
    targetWins = calculateTargetWins(bestOf);

    refreshScoreUI();
    refreshMatchStatus();

    clearResultClasses();
    resultText.textContent = 'Make your choice!';
    choicesDisplay.textContent = '';
    streakText.textContent = 'Win Streak: 0';

    setButtonsDisabled(false);
}

choiceButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const playerChoice = button.dataset.choice;
        playGame(playerChoice, button);
    });
});

resetBtn.addEventListener('click', resetGame);

bestOfSelect.addEventListener('change', () => {
    resetGame();
});

muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? 'Sound: Off' : 'Sound: On';
    muteBtn.setAttribute('aria-pressed', String(isMuted));

    if (!isMuted) {
        playTone(620, 90, 'triangle', 0.03);
    }
});

resetGame();
