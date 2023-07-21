const winningPositions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const initPlayer = function (mark) {
  let _mark = mark;

  const getMark = () => {
    return _mark;
  };
  return { getMark };
};

function initGameBoard() {
  let board = [];
  for (let i = 0; i < 9; i++) {
    board[i] = "*";
  }
  // score will be calculated by winning * 2 + draw * 1 - losing * 3
  let score = 0;
  let parent = null;
  let children = [];

  const setTile = (mark, index) => {
    board[index] = mark;
  };
  return { board, setTile, parent, children, score };
}

// [ ] TODO if its computers turn make move if not wait for player input
const game = function (gameMode, player = null) {
  // initialize the game board
  const gameBoard = initGameBoard();

  // create players and assign turn
  const playerX = initPlayer("X");
  const playerY = initPlayer("O");
  let turn = playerX;

  // if it's 2P
  //   it will work based on user click
  //   ui and game board is already updated on user click
  //   check if the game ended
  //   if game ends give feedback
  //   if game did not end and change players

  // if it's 1P
  //   if first turn is computer's make a random move
  //   if it's player's turn change turn on user click
  //   now it's computer's turn
  //     make a move and update the ui
  //   if game ended give feedback
  //   change turn

  // if it's 1P
  if (gameMode === "vsCPU")
    if (turn.getMark() !== player) {
      //   if first turn is computer's make a random move
      putMarkWithIndex(Math.round(Math.random() * 9), gameBoard, turn);
      //   change turn
      turn = turn === playerX ? playerY : playerX;
    }

  //handle click on tile
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) =>
    tile.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (
        tile.classList.contains("marked") ||
        (gameMode === "vsCPU" && turn.getMark() !== player)
      ) {
        return;
      }
      putMark(tile, turn, gameBoard);
      // if it's 2P
      if (gameMode === "2P") {
        // check if the game is over
        actionOnGameEnd(turn, gameBoard);
        // change player
        turn = turn === playerX ? playerY : playerX;
      }
      if (gameMode === "vsCPU") {
        if (turn.getMark() === player) {
          turn = turn === playerX ? playerY : playerX;
          actionOnGameEnd(turn, gameBoard);
          return;
        }
        playTurn(gameMode, turn, player, gameBoard);
        turn = turn === playerX ? playerY : playerX;
      }
    })
  );
};

function putMark(tile, turn, gameBoard) {
  // get index of tile
  const index = Number(tile.classList.toString().split("-")[1]) - 1;
  putMarkWithIndex(index, gameBoard, turn);
}

function putMarkWithIndex(index, gameBoard, turn) {
  const tileSelector = `.tile-${index + 1}`;
  const tile = document.querySelector(tileSelector);
  // disallow tile to be remarked
  tile.classList.add("marked");
  // update board array
  gameBoard.setTile(turn.getMark(), index);
  // update ui
  tile.textContent = turn.getMark();
}

function actionOnGameEnd(turn, gameBoard) {
  if (isWinner(turn.getMark(), gameBoard)) {
    declareWinner(turn.getMark());
  } else if (isBoardFull(gameBoard)) {
    declareTie();
  }
}

function declareWinner(mark) {
  // [ ] TODO
  console.log(`Player ${mark} wins`);
}

function declareTie() {
  // [ ] TODO
  console.log("It's a tie!");
}

async function playTurn(gameMode, turn, player, gameBoard) {
  // [ ] TODO
  const index = await decideComputerMove(gameBoard, turn.getMark());
  putMarkWithIndex(index, gameBoard, turn);
  actionOnGameEnd(turn, gameBoard);
}

function addUpScores(gameBoard, score) {
  let board = Object.assign(gameBoard);
  while (board.parent != null) {
    board = board.parent;
    board.score += score;
  }
}

async function decideComputerMove(gameBoard, computerMark) {
  return new Promise((resolve, reject) => {
    computeAllPossibleGames(gameBoard, computerMark, computerMark);
    if (gameBoard.children.length < 1) {
      reject(null);
    }
    let bestBoard = gameBoard.children[0];
    let score = gameBoard.children[0].score;
    gameBoard.children.forEach((board) => {
      if (board.score > score) {
        score = board.score;
        bestBoard = board;
      }
    });
    gameBoard.board.forEach(tile, (index) => {
      if (tile !== bestBoard.board[index]) {
        resolve(index);
      }
    });
    reject(null);
  });
}

function computeAllPossibleGames(gameBoard, initialMark, currentMark) {
  let parent = gameBoard;
  gameBoard.board.forEach((tile, index) => {
    // for each available tile put the mark
    if (tile === "*") {
      let child = cloneBoard(gameBoard);
      child.setTile(currentMark);
      parent.children += child;
      if (isWinner(initialMark)) {
        child.score += 2;
        addUpScores(child, child.score);
        return;
      } else if (isWinner(initialMark === "X" ? "O" : "X")) {
        child.score -= 3;
        addUpScores(child, child.score);
        return;
      } else if (isBoardFull(gameBoard)) {
        child.score += 1;
        addUpScores(child, child.score);
        return;
      } else {
        evaluateBestMove(child, initialMark, currentMark === "X" ? "O" : "X");
      }
    }
  });

  // see the winning and losing moves and draws
  // evaluate score
  // a score of a parent will be evaluated by summing the score of children
}

function isBoardFull(gameBoard) {
  // [x] TODO
  const board = gameBoard.board;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "*") return false;
  }
  return true;
}

function isWinner(mark, gameBoard) {
  // [x] TODO
  const board = gameBoard.board;
  let indexList;
  for (let i = 0; i < 8; i++) {
    indexList = winningPositions[i];
    if (
      board[indexList[0]] === board[indexList[1]] &&
      board[indexList[2]] === board[indexList[1]] &&
      board[indexList[0]] === mark
    ) {
      return true;
    }
  }
  return false;
}

function chooseGameMode() {
  return new Promise((resolve, reject) => {
    const chooseGameModeWindow = document.querySelector(
      ".modal > .choose-game-mode"
    );
    chooseGameModeWindow.style.display = "flex";
    document
      .querySelectorAll(".modal > .choose-game-mode > button")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          chooseGameModeWindow.style.display = "none";
          button.classList.add("clicked");
          resolve(
            document.querySelector(".clicked").getAttribute("data-gameMode")
          );
        });
      });
  });
}

function choosePlayer() {
  return new Promise((resolve, reject) => {
    document.querySelector(".modal > .choose-player").style.display = "flex";
    document
      .querySelectorAll(".modal > .choose-player > button")
      .forEach((button) =>
        button.addEventListener("click", (e) => {
          resolve(button.textContent);
        })
      );
  });
}

function cloneBoard(board) {
  let newBoard = Object.assign(board);
  newBoard.parent = board;
  return newBoard;
}

// make player choose x or o and start the game on screen load
// make player choose 1p vs cmp or 2p on start before letting them choose, if 1p let them choose x or o if not they will assign it themselves

async function onLoad() {
  let player;
  let gameMode;
  const modal = document.querySelector(".modal");
  modal.style.display = "flex";
  gameMode = await chooseGameMode();
  if (gameMode === "vsCPU") {
    player = await choosePlayer();
  }
  if (gameMode != undefined) {
    modal.style.display = "none";
    game(gameMode, player);
  }
}

onLoad();
