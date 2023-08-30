var score = 0;
var currentNumber = 0;
var results = []; // "number", "correctSpelling", "yourAnswer", "score"
const gameTime = 60; 
var difficulty = 3;

if (document.readyState !== 'loading') {
    start();
} else {
    document.addEventListener('DOMContentLoaded', start);
}

function start() {
    document.querySelectorAll('.startButton').forEach(item => {
        item.addEventListener('click', event => {
            const menu = document.getElementById('menu');
            const game = document.getElementById('game');
            menu.style.display = 'none';
            game.style.display = 'flex';
            difficulty = item.value;
            frenchInit();
            updateTimer();
            const input = document.getElementById('inputField');
            input.addEventListener("keypress", function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    document.getElementById("submitButton").click();
                }
            });
        })
    })
    const closeModalButton = document.getElementById('closeModalButton');
    closeModalButton.addEventListener('click', closeModal);
}

function numberToFrenchSpelling(number) {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
    
    if (number == 0) {
        return 'zéro';
    } else if (number >= 0 && number <= 16) {
        return units[number];
    } else if (number >= 17 && number <= 19) {
        return 'dix-' + units[number - 10];
    } else if (number >= 20 && number <= 69) {
        const ten = Math.floor(number / 10);
        const unit = number % 10;
        let spelling = tens[ten];
        
        if (unit === 1 || unit === 11) {
            spelling += ' et ' + units[unit];
        } else if (unit !== 0) {
            spelling += '-' + units[unit];
        }
      
        return spelling;
    } else if (number >= 70 && number <= 79) {
        return 'soixante-' + numberToFrenchSpelling(number - 60);
    } else if (number >= 80 && number <= 99) {
        if (number == 80) return 'quatre-vingt';
        return 'quatre-vingt-' + numberToFrenchSpelling(number - 80);
    } else if (number >= 100 && number <= 999) {
        const hundred = Math.floor(number / 100);
        const remainder = number % 100;
        let spelling = '';
  
        if (hundred === 1) {
            spelling += 'cent';
        } else {
            spelling += units[hundred] + ' cent';
        }
        
        if (remainder !== 0) {
            spelling += ' ' + numberToFrenchSpelling(remainder);
        }
        
        return spelling;
    } else if (number >= 1000 && number <= 999999) {
        const thousand = Math.floor(number / 1000);
        const remainder = number % 1000;
        let spelling = numberToFrenchSpelling(thousand) + ' mille';
    
        if (remainder !== 0) {
            spelling += ' ' + numberToFrenchSpelling(remainder);
        }
      
        return spelling;
    } else if (number >= 1000000 && number <= 999999999) {
        const million = Math.floor(number / 1000000);
        const remainder = number % 1000000;
        let spelling = numberToFrenchSpelling(million) + ' million';

        if (remainder !== 0) {
            spelling += ' ' + numberToFrenchSpelling(remainder);
        }
        return spelling;
    } else {
        return 'Number out of range';
    }
}

function cleanString(inputString) {
// Use a regular expression to match non-letter characters and replace them with an empty string
const cleanedString = inputString.replace(/[^a-zA-ZÀ-ÿ]/g, '');
return cleanedString.toLowerCase();
}

function countDigits(number) {
    if (number === 0) {
      return 1; // Special case for 0
    }
    return Math.floor(Math.log10(Math.abs(number)) + 1);
}

function generateRandomInt(min, max) {
    digits = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(digits, min, max);
    return Math.floor(Math.random() * (10 ** (digits) - 10 ** (digits - 1) + 1)) + 10 ** (digits - 2);
}

function frenchInit() {
    const dynamicContainer = document.getElementById('dynamicContainer');
    const submitButton = document.getElementById('submitButton');

    currentNumber = generateRandomInt(2, difficulty);
    dynamicContainer.textContent = `${currentNumber}`;
    
    submitButton.addEventListener('click', checkAnswer);
}

function checkAnswer() {
    const inputField = document.getElementById('inputField');
    const scoreField = document.getElementById('score');
    const userInput = cleanString(inputField.value);
    const frenchSpelling = numberToFrenchSpelling(currentNumber)
    const cleanedFrench = cleanString(frenchSpelling);
    const submitButton = document.getElementById('submitButton');
    let qScore = 0;
    if (userInput === cleanedFrench) {
        flashBackground("green");
        qScore = countDigits(currentNumber);
        score += qScore;
        scoreField.textContent = `${score}`
    } else {
        flashBackground("red");
    }
    console.log('hi');
    results.push({
        "number": currentNumber,
        "correctSpelling": frenchSpelling,
        "yourAnswer": inputField.value,
        "score": qScore
    });
    submitButton.removeEventListener('click', checkAnswer);
    inputField.value = '';
    frenchInit();
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    let seconds = gameTime;
    function tick() {
        timerElement.textContent = `${seconds}s`;
        seconds--;

        if (seconds < 0) {
            clearInterval(interval);
            timerElement.textContent = 'Time\'s up!';

            checkAnswer();
            openModal();
        }
    }
    tick()
    const interval = setInterval(tick, 1000);
}

function populateTable() {
    modalTableBody.innerHTML = '';
    results.forEach(result => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${result.number}</td>
        <td>${result.correctSpelling}</td>
        <td>${result.yourAnswer}</td>
        <td>${result.score}</td>
      `;
      modalTableBody.appendChild(row);
    });
}

function closeModal() {
    modal.style.display = 'none';
    const closeModalButton = document.getElementById('closeModalButton');
    closeModalButton.removeEventListener('click', closeModal);
}

function openModal() {
    modal.style.display = 'block';
    populateTable();
}

function flashBackground(color) {
    
    // Store the original background color
    const body = document.querySelector('body');

    body.classList.add('flash-animation-'+color);
    
    setTimeout(function() {
        body.classList.remove('flash-animation-'+color);
    }, 300);
}
