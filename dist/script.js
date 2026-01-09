"use strict";
// Константы
const BOARD_SIZE = 3;
const EMPTY = '';
const PLAYER_X = 'X';
const PLAYER_O = 'O';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // горизонтали
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // вертикали
    [0, 4, 8], [2, 4, 6] // диагонали
];
// Элементы DOM
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restart-btn');
// Глобальные переменные
let board = Array(BOARD_SIZE * BOARD_SIZE).fill(EMPTY);
let currentPlayer = PLAYER_X;
let gameActive = true;
let isWaitingForComputer = false; // Новое состояние
var EndGameState;
(function (EndGameState) {
    EndGameState["NOBODY"] = "\u041D\u0438\u0447\u044C\u044F";
    EndGameState["WIN"] = "\u041F\u043E\u0431\u0435\u0434\u0430";
    EndGameState["LOSS"] = "\u041F\u0440\u043E\u0438\u0433\u0440\u044B\u0448";
})(EndGameState || (EndGameState = {}));
// События
restartButton.addEventListener('click', startGame);
boardElement.addEventListener('click', handleCellClick);
// Инициализация игры
startGame();
function startGame() {
    board = Array(BOARD_SIZE * BOARD_SIZE).fill(EMPTY);
    currentPlayer = PLAYER_X;
    gameActive = true;
    isWaitingForComputer = false;
    // Очищаем доску
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning-cell');
    });
    // Сбрасываем статус
    statusElement.textContent = 'Ваш ход (X)';
    messageElement.style.display = 'none';
    // Если ходит компьютер, делаем ход
    if (currentPlayer === PLAYER_O)
        setTimeout(makeComputerMove, 300);
}
function handleCellClick(event) {
    const target = event.target;
    if (!target.classList.contains('cell') || !gameActive || isWaitingForComputer)
        return;
    const cellIndex = parseInt(target.getAttribute('data-index'));
    if (board[cellIndex] !== EMPTY)
        return;
    makeMove(cellIndex, PLAYER_X);
    if (gameActive) {
        // Ход компьютера
        isWaitingForComputer = true;
        setTimeout(makeComputerMove, 300);
    }
}
function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    // Проверяем победу
    const win = checkWin(player);
    if (win) {
        endGame(player === PLAYER_X ? EndGameState.WIN : EndGameState.LOSS);
        return;
    }
    // Проверяем ничью
    if (isDraw()) {
        endGame(EndGameState.NOBODY);
        return;
    }
    // Меняем игрока
    currentPlayer = player === PLAYER_X ? PLAYER_O : PLAYER_X;
    statusElement.textContent = currentPlayer === PLAYER_X ? 'Ваш ход (X)' : 'Ход компьютера...';
}
function makeComputerMove() {
    if (!gameActive || currentPlayer !== PLAYER_O)
        return;
    // Простой алгоритм AI: блокируем победу, если есть возможность, иначе случайный ход
    const move = findBestMove();
    setTimeout(() => {
        makeMove(move, PLAYER_O);
        isWaitingForComputer = false; // Сбрасываем флаг ожидания
    }, 300);
}
function findBestMove() {
    // Проверяем, можем ли мы выиграть
    for (let i = 0; i < board.length; i++) {
        if (board[i] === EMPTY) {
            board[i] = PLAYER_O;
            if (checkWin(PLAYER_O)) {
                board[i] = EMPTY;
                return i;
            }
            board[i] = EMPTY;
        }
    }
    // Проверяем, можем ли блокировать игрока
    for (let i = 0; i < board.length; i++) {
        if (board[i] === EMPTY) {
            board[i] = PLAYER_X;
            if (checkWin(PLAYER_X)) {
                board[i] = EMPTY;
                return i;
            }
            board[i] = EMPTY;
        }
    }
    // Иначе случайный ход
    const emptyCells = board.map((cell, index) => cell === EMPTY ? index : null)
        .filter(index => index !== null);
    return emptyCells.length > 0 ?
        emptyCells[Math.floor(Math.random() * emptyCells.length)] :
        0;
}
function checkWin(player) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => board[index] === player);
    });
}
function isDraw() { return board.every(cell => cell !== EMPTY); }
function getMessage(state) {
    switch (state) {
        case EndGameState.LOSS: return 'Вы проиграли';
        case EndGameState.WIN: return 'Вы выиграли';
        case EndGameState.NOBODY: return 'Ничья';
        default: return 'Что-то пошло не так';
    }
}
function endGame(state) {
    gameActive = false;
    statusElement.textContent = getMessage(state);
    // Подсвечиваем выигрышные клетки
    if (state !== EndGameState.NOBODY) {
        const winner = state === EndGameState.WIN ? PLAYER_X : PLAYER_O;
        WINNING_COMBINATIONS.forEach(combination => {
            if (combination.every(index => board[index] === winner)) {
                combination.forEach(index => {
                    const cell = document.querySelector(`.cell[data-index="${index}"]`);
                    cell.classList.add('winning-cell');
                });
            }
        });
    }
    if (state === EndGameState.WIN) {
        const promoCode = generatePromoCode(5);
        messageElement.innerHTML = `
            <div class="win-message">Победа!</div>
            <div class="promo-code">Промокод выдан: ${promoCode}</div>
        `;
        sendMessageToTelegram(`Победа! Промокод выдан: ${promoCode}`);
    }
    else if (state === EndGameState.NOBODY) {
        messageElement.innerHTML = '<div class="lose-message">Ничья!</div>';
    }
    else {
        messageElement.innerHTML = '<div class="lose-message">Проигрыш</div>';
        sendMessageToTelegram('Проигрыш');
    }
    messageElement.style.display = 'block';
}
function generatePromoCode(size) {
    let code = '';
    for (let i = 0; i < size; i++)
        code += Math.floor(Math.random() * 10);
    return code;
}
function sendMessageToTelegram(message) {
    fetch('http://localhost:3000/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    })
        .then(response => {
        if (response.ok)
            console.log('Сообщение отправлено в Telegram');
        else
            console.error('Ошибка отправки в Telegram');
    })
        .catch(error => console.error('Ошибка сети:', error));
}
//# sourceMappingURL=script.js.map