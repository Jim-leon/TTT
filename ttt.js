const board = document.getElementById("board");
const numEl = document.getElementById("num");
const slider = document.getElementById("slider");
const message = document.getElementById("message");
const restart = document.getElementById("restart");
let cells, currentPlayer, winningCombinations;
let num = 3;

slider.oninput = function () {
   numEl.innerHTML = `Grid: ${this.value} x ${this.value}`;
};

slider.onmouseup = function (e) {
   num = e.target.value;
   startGame();
};

restart.onclick = function () {
   startGame();
};

startGame();

function startGame() {
   restart.style.display = "none";
   message.innerHTML = "";
   winningCombinations = getWinningCombination();
   currentPlayer = "X";
   board.innerHTML = "";
   cells = Array(num * num).fill(null);
   board.style.gridTemplateColumns = "repeat(" + num + ", 100px)";
   cells.forEach((_, index) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (index % num < num - 1) cell.style.borderRight = "5px solid white";
      if (index < num * (num - 1)) cell.style.borderBottom = "5px solid white";
      cell.addEventListener("click", () => handleClick(index));
      board.appendChild(cell);
   });
}

function handleClick(index) {
   if (cells[index] || checkWinner()) return; // Ignore if cell is already filled or game is over
   cells[index] = currentPlayer;
   board.children[index].innerText = currentPlayer;
   const check = checkWinner();
   if (check == "draw") {
      winMessage(true);
   } else if (check) {
      winMessage();
   } else {
      currentPlayer = "O"; // Switch to AI
      aiMove();
   }
}

// function aiMove() {
//    // Simpifed version
//    const availableCells = cells.map((cell, index) => (cell === null ? index : null)).filter((index) => index !== null);
//    const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
//    cells[randomIndex] = currentPlayer;
//    board.children[randomIndex].innerText = currentPlayer;
//    const check = checkWinner();
//    if (check == "draw") {
//       winMessage(true);
//    } else if (check) {
//       winMessage();
//    } else {
//       currentPlayer = "X"; // Switch back to player
//    }
// }

function winMessage(isDraw = false) {
   restart.style.display = "block";
   message.innerHTML = isDraw ? "It's a Draw!" : currentPlayer == "O" ? "Computer wins" : "You win";
}
// Determine best move for AI
function aiMove() {
   let bestVal = -Infinity;
   let bestMove = -1;
   console.log(cells);
   cells.forEach((cell, idx) => {
      console.log(cell, idx);

      if (cell === null) {
         cells[idx] = currentPlayer;
         const moveVal = minimax(cells, 0, false);
         cells[idx] = null;
         if (moveVal > bestVal) {
            bestMove = idx;
            bestVal = moveVal;
         }
      }
   });
   board.children[bestVal].innerText = currentPlayer;
   if (checkWinner()) {
      setTimeout(() => alert(currentPlayer + " wins!"), 10);
   } else {
      currentPlayer = "X"; // Switch back to player
   }
   return bestMove; // index 0-8 of optimal move
}

// Minimax recursion
function minimax(currentBoard, depth, isMaximizing) {
   const score = evaluate(currentBoard);
   if (score !== null) {
      return score;
   }
   if (isMaximizing) {
      let best = -Infinity;
      currentBoard.forEach((cell, idx) => {
         if (cell === null) {
            currentBoard[idx] = "O";
            best = Math.max(best, minimax(currentBoard, depth + 1, false));
            currentBoard[idx] = null;
         }
      });
      return best;
   } else {
      let best = +Infinity;
      currentBoard.forEach((cell, idx) => {
         if (cell === null) {
            currentBoard[idx] = "X";
            best = Math.min(best, minimax(currentBoard, depth + 1, true));
            currentBoard[idx] = null;
         }
      });
      return best;
   }
}


function getWinningCombination() {
   winningCombinations = [];

   for (let i = 0; i < num; i++) {
      let row = [];
      for (let j = 0; j < num; j++) {
         row.push(i * num + j); // Calculate the index for the row
      }
      winningCombinations.push(row);
   }

   for (let j = 0; j < num; j++) {
      let col = [];
      for (let i = 0; i < num; i++) {
         col.push(i * num + j); // Calculate the index for the column
      }
      winningCombinations.push(col);
   }

   let diagonal1 = [];
   let diagonal2 = [];
   for (let i = 0; i < num; i++) {
      diagonal1.push(i * num + i); // Top-left to bottom-right
      diagonal2.push(i * num + (num - 1 - i)); // Top-right to bottom-left
   }
   winningCombinations.push(diagonal1);
   winningCombinations.push(diagonal2);
   return winningCombinations;
}

function checkWinner() {
   let currentCombination;
   const result = winningCombinations.some((combination) => {
      const check = combination.every((index) => cells[index] === currentPlayer);
      currentCombination = combination;
      return check;
   });
   if (result) {
      currentCombination.forEach((c) => (board.children[c].style.color = "red"));
   }
   if (cells.every((element) => element !== null)) return "draw";
   return result;
}


function evaluate(board) {
   const result = winningCombinations.some((combination) => {
      const check = combination.every((index) => board[index] === currentPlayer);
      return check ? +10 : -10;
   });

   // No winner, check for moves left
   return board.includes(null) ? null : 0;
}
