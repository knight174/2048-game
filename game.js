class Game2048 {
    constructor() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameBoard = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartButton = document.getElementById('restart-button');
        this.init();
    }

    init() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.addRandomTile();
        this.addRandomTile();
        this.renderBoard();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameOverModal.classList.contains('show')) {
                switch(e.key) {
                    case 'ArrowUp': this.move('up'); break;
                    case 'ArrowDown': this.move('down'); break;
                    case 'ArrowLeft': this.move('left'); break;
                    case 'ArrowRight': this.move('right'); break;
                }
            }
        });

        this.restartButton.addEventListener('click', () => {
            this.gameOverModal.classList.remove('show');
            this.init();
        });
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] === 0) {
                    emptyCells.push({r, c});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                
                if (this.board[r][c] !== 0) {
                    tile.textContent = this.board[r][c];
                    tile.classList.add(`tile-${this.board[r][c]}`);
                    tile.classList.add('tile-new');
                }
                
                this.gameBoard.appendChild(tile);
            }
        }
        this.scoreElement.textContent = this.score;
    }

    move(direction) {
        let moved = false;
        const rotatedBoard = this.rotateBoard(direction);

        for (let r = 0; r < 4; r++) {
            const row = rotatedBoard[r].filter(val => val !== 0);
            
            for (let c = 0; c < row.length - 1; c++) {
                if (row[c] === row[c + 1]) {
                    row[c] *= 2;
                    this.score += row[c];
                    row.splice(c + 1, 1);
                    moved = true;
                }
            }

            while (row.length < 4) {
                row.push(0);
            }

            rotatedBoard[r] = row;
        }

        const newBoard = this.unrotateBoard(rotatedBoard, direction);

        if (this.isBoardChanged(newBoard)) {
            this.board = newBoard;
            this.addRandomTile();
            this.renderBoard();
            moved = true;

            // Check for game over after each move
            if (this.isGameOver()) {
                this.showGameOver();
            }
        }

        return moved;
    }

    rotateBoard(direction) {
        let rotated = JSON.parse(JSON.stringify(this.board));
        
        switch(direction) {
            case 'left': 
                return rotated;
            case 'right':
                return rotated.map(row => row.reverse());
            case 'up':
                return rotated[0].map((_, colIndex) => rotated.map(row => row[colIndex]).reverse());
            case 'down':
                return rotated[0].map((_, colIndex) => rotated.map(row => row[colIndex]));
        }
    }

    unrotateBoard(board, direction) {
        switch(direction) {
            case 'left': 
                return board;
            case 'right':
                return board.map(row => row.reverse());
            case 'up':
                return board[0].map((_, colIndex) => board.map(row => row[colIndex]));
            case 'down':
                return board[0].map((_, colIndex) => board.map(row => row[colIndex]).reverse());
        }
    }

    isBoardChanged(newBoard) {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] !== newBoard[r][c]) {
                    return true;
                }
            }
        }
        return false;
    }

    isGameOver() {
        // Check if no moves are possible
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] === 0) return false;
                
                // Check adjacent cells for possible merges
                const directions = [
                    {dr: 0, dc: 1}, {dr: 0, dc: -1}, 
                    {dr: 1, dc: 0}, {dr: -1, dc: 0}
                ];
                
                for (let {dr, dc} of directions) {
                    const newR = r + dr;
                    const newC = c + dc;
                    
                    if (newR >= 0 && newR < 4 && newC >= 0 && newC < 4) {
                        if (this.board[r][c] === this.board[newR][newC]) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    showGameOver() {
        this.finalScoreElement.textContent = this.score;
        this.gameOverModal.classList.add('show');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game2048();
});
