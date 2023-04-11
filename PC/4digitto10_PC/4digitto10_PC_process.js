const digitsElem = document.getElementById('digits');
const timerElem = document.getElementById('timer');
const scoreElem = document.getElementById('score');
const resultElem = document.getElementById('result');
const answerInput = document.getElementById('answer');
const gameForm = document.getElementById('game-form');

let digits = [];
let score = 0;

function checkValidCombination(digits) {
    const operators = ['+', '-', '*'];

    const withinRange = (num) => num >= 0 && num <= 9;

    for (let a = 0; a < 4; a++) {
        for (let b = 0; b < 4; b++) {
            if (b === a) continue;
            for (let c = 0; c < 4; c++) {
                if (c === a || c === b) continue;
                for (let d = 0; d < 4; d++) {
                    if (d === a || d === b || d === c) continue;
                    for (const op1 of operators) {
                        const temp1 = eval(`${digits[a]}${op1}${digits[b]}`);
                        if (!withinRange(temp1)) continue;

                        for (const op2 of operators) {
                            const temp2 = eval(`${temp1}${op2}${digits[c]}`);
                            if (!withinRange(temp2)) continue;

                            for (const op3 of operators) {
                                const expression = `${temp2}${op3}${digits[d]}`;
                                try {
                                    const result = eval(expression);
                                    if (result === 10) {
                                        return true;
                                    }
                                } catch (error) {
                                    // 無視する
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return false;
}

function generateDigits() {
    let newDigits = [];
    do {
        newDigits = [];
        for (let i = 0; i < 4; i++) {
            newDigits.push(Math.floor(Math.random() * 10));
        }
    } while (!checkValidCombination(newDigits));

    digitsElem.textContent = newDigits.join('');
    return newDigits;
}

function evaluateAnswer(answer) {
    const digitPattern = new RegExp(`[${digits.join('')}]`, 'g');
    const matchedDigits = (answer.match(digitPattern) || []).map((digit) => parseInt(digit));

    if (matchedDigits.length !== digits.length) {
        return false;
    }

    for (let i = 0; i < digits.length; i++) {
        const index = matchedDigits.indexOf(digits[i]);
        if (index === -1) {
            return false;
        }
        matchedDigits.splice(index, 1);
    }

    try {
        const result = eval(answer);
        return result === 10;
    } catch (error) {
        return false;
    }
}

function updateScore() {
    score += 1;
    scoreElem.textContent = score;
}

function resetDigits() {
    digits = generateDigits();
    answerInput.value = '';
}

function onCorrectAnswer() {
    updateScore();
    resetDigits();
}

function onFormSubmit(event) {
    event.preventDefault();
    const answer = answerInput.value.trim();
    if (evaluateAnswer(answer)) {
        resultElem.textContent = '正解です！';
        onCorrectAnswer();
    } else {
        resultElem.textContent = '不正解です。もう一度試してください。';
        answerInput.value = '';
    }
}

gameForm.addEventListener('submit', onFormSubmit);

function startTimer(duration) {
    let timeRemaining = duration;
    timerElem.textContent = timeRemaining;

    const timerInterval = setInterval(() => {
        timeRemaining--;
        timerElem.textContent = timeRemaining;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerElem.textContent = '終了';
            gameForm.removeEventListener('submit', onFormSubmit);
            gameForm.querySelector('button[type="submit"]').disabled = true;
        }
    }, 1000);
}

startTimer(60);
digits = generateDigits();