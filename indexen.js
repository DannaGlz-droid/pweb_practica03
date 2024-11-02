let grid = document.getElementById('grid'); 
let cells = [];
let mineLocations = [];
let minesRemaining = 0;
let revealedCells = 0;
let gameOver = false;
let firstClick = true;

const levelSettings = {
    'Personalizado': { rows: 5, cols: 5, mines: 1 },
    'Facil': { rows: 5, cols: 5, mines: 2 },
    'Medio Dificil': { rows: 25, cols: 25, mines: 110 },
    'Muy Dificil': { rows: 40, cols: 40, mines: 350 },
    'Hardcore': { rows: 50, cols: 50, mines: 900 },
    'Leyenda': { rows: 100, cols: 61, mines: 3000 },
};

document.getElementById('nvl').addEventListener('change', function() {
    const selectedLevel = this.value;
    if (levelSettings[selectedLevel]) {
        const { rows, cols, mines } = levelSettings[selectedLevel];
        document.getElementById('rows').value = rows;
        document.getElementById('cols').value = cols;
        document.getElementById('mines').value = mines;
    }
});

// Iniciar el juego
document.getElementById('startGame').addEventListener('click', startGame);

function startGame() {
    const ROWS = parseInt(document.getElementById('rows').value);
    const COLS = parseInt(document.getElementById('cols').value);
    const MINES = parseInt(document.getElementById('mines').value);

    grid.innerHTML = '';
    cells = [];
    mineLocations = [];
    minesRemaining = MINES;
    revealedCells = 0;
    gameOver = false;
    firstClick = true;

    document.getElementById('face').src = 'img/carita_buscaminas.png';
    grid.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;
    initializeGrid(ROWS, COLS);
}

// Inicializar el grid
function initializeGrid(ROWS, COLS) {
    for (let i = 0; i < ROWS; i++) {
        cells[i] = [];
        for (let j = 0; j < COLS; j++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.dataset.state = 'hidden';
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);
            grid.appendChild(cell);
            cells[i][j] = cell;
        }
    }
}

// Manejar el clic derecho para marcar con banderita
function handleRightClick(event) {
    event.preventDefault(); 
    const cell = event.target;

    if (gameOver || cell.dataset.state === 'revealed') return;

    if (cell.dataset.state === 'hidden') {
        cell.dataset.state = 'flagged';
        cell.textContent = '🚩'; 
    } else if (cell.dataset.state === 'flagged') {
        cell.dataset.state = 'hidden';
        cell.textContent = ''; 
    }
}

// Colocar minas en el grid
function placeMines(ROWS, COLS, MINES, startRow, startCol) {
    mineLocations = [];
    let placedMines = 0;

    while (placedMines < MINES) {
        let row = Math.floor(Math.random() * ROWS);
        let col = Math.floor(Math.random() * COLS);

        // Evitar colocar una mina en la celda del primer clic
        if ((row === startRow && col === startCol) || mineLocations.some(loc => loc.row === row && loc.col === col)) {
            continue;
        }

        mineLocations.push({ row, col });
        placedMines++;
    }
}

// Manejar el clic en una celda
function handleCellClick(event) {
    if (gameOver) return;

    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (firstClick) {
        firstClick = false;
        const ROWS = cells.length;
        const COLS = cells[0].length;
        const MINES = parseInt(document.getElementById('mines').value);
        placeMines(ROWS, COLS, MINES, row, col);
    }

    if (cell.dataset.state === 'hidden') {
        cell.dataset.state = 'revealed';
        revealedCells++;

        if (mineLocations.some(loc => loc.row === row && loc.col === col)) {
            cell.textContent = '💣';
            alert('¡Has perdido!');
            gameOver = true;
            revealMines();
            showRestartButton();
            document.getElementById('face').src = 'img/carita_muerto_buscaminas.png';
        } else {
            const count = countAdjacentMines(row, col);
            cell.textContent = count || '';
            if (count === 0) {
                revealEmptyCells(row, col);
            }
        }

        if (revealedCells + minesRemaining === cells.length * cells[0].length) {
            alert('¡Has ganado!');
            gameOver = true;
        }
    }
}

// Contar minas adyacentes
function countAdjacentMines(row, col) {
    let count = 0;
    for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, cells.length - 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, cells[0].length - 1); j++) {
            if (mineLocations.some(loc => loc.row === i && loc.col === j)) {
                count++;
            }
        }
    }
    return count;
}

// Revelar celdas vacías
function revealEmptyCells(row, col) {
    for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, cells.length - 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, cells[0].length - 1); j++) {
            const cell = cells[i][j];
            if (cell.dataset.state === 'hidden' && !mineLocations.some(loc => loc.row === i && loc.col === j)) {
                cell.dataset.state = 'revealed';
                revealedCells++;
                const count = countAdjacentMines(i, j);
                cell.textContent = count || '';
                if (count === 0) {
                    revealEmptyCells(i, j);
                }
            }
        }
    }
}

// Revelar todas las minas
function revealMines() {
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[0].length; j++) {
            const cell = cells[i][j];
            if (mineLocations.some(loc => loc.row === i && loc.col === j)) {
                cell.textContent = '💣';
            }
        }
    }
}

// Mostrar botón de reinicio
function showRestartButton() {
    const existingRestartButton = document.getElementById('restartButton');
    if (!existingRestartButton) {
        const restartButton = document.createElement('button');
        restartButton.id = 'restartButton';
        restartButton.textContent = 'Reiniciar';
        restartButton.addEventListener('click', startGame);
        document.body.appendChild(restartButton);
    }
}
