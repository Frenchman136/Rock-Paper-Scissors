const choiceButtons = document.querySelectorAll('.choices-btn');
const resultText = document.getElementById('result-text');
const choicesDisplay = document.getElementById('choices-display');
const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const tieScoreEl = document.getElementById('tie-score');
const resetBtn = document.getElementById('reset-btn');

let playerScore = 0;
let computerScore = 0;
let tieScore = 0;

const choices = ['rock', 'paper', 'scissors'];

function getComputerChoice () {
    const randomNumber = Math.floor(Math.random() * choices.length);
    return choices[randomNumber]
}

function determineWinner (playerChoice, computerChoice) {
 if (playerChoice === computerChoice) {
    return "tie";
 } else if ((playerChoice === 'rock' && computerChoice === 'scissors') || 
            (playerChoice === 'paper' && computerChoice === 'rock') || 
            (playerChoice === 'scissors' && computerChoice === 'paper')) {
                return "player"
            } else {
                return "computer"
            }
}

function updateDisplay (playerChoice, computerChoice, winner) {
    choicesDisplay.textContent = `You chose ${playerChoice}, Computer chose ${computerChoice}`;
    if (winner === 'tie') {
        resultText.textContent = "It's a tie!"
        resultText.style.color = "#ffa500"
    } else if (winner === "player") {
        resultText.textContent = "You Win!"
        resultText.style.color = "#00ff00"
    } else {
        resultText.textContent = "You lose!"
        resultText.style.color = "#ff0000"
    }
}

function updateScore (winner) {
    if (winner === "player") {
        playerScore++;
        playerScoreEl.textContent = playerScore;
    } else if (winner === "computer") {
        computerScore++;
        computerScoreEl.textContent = computerScore;
    } else {
        tieScore++;
        tieScoreEl.textContent = tieScore;
    }
}

function playGame (playerChoice) {
    //Get computer choice
    const computerChoice = getComputerChoice();
    //Get who won
    const winner = determineWinner(playerChoice, computerChoice);
    // update display
    updateDisplay(playerChoice, computerChoice, winner);
    // update scores
    updateScore(winner);
}

// Add click event to each choice button
choiceButtons.forEach(button => {
    button.addEventListener("click", () => {
        const playerChoice = button.dataset.choice;
        playGame(playerChoice);
    });
});

//Reset button functionality
resetBtn.addEventListener("click", () => {
    playerScore = 0;
    computerScore = 0;
    tieScore = 0;

    playerScoreEl.textContent = '0';
    computerScoreEl.textContent = '0';
    tieScoreEl.textContent = '0';

    resultText.textContent = 'Make your choice!';
    resultText.style.color = '#333';
    choicesDisplay.textContent = '';
})
