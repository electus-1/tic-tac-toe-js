let isAPIavailable = true;

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

function initPlayer(mark) {
  let _mark = mark;

  const getMark = () => {
    return _mark;
  };
  return { getMark };
}

function initGameBoard() {
  let board = [];
  for (let i = 0; i < 9; i++) {
    board[i] = "*";
  }

  const setTile = (mark, index) => {
    board[index] = mark;
  };
  return { board, setTile };
}

// [ ] TODO if its computers turn make move if not wait for player input
function game(gameMode, player = null) {
  // initialize the game board
  const gameBoard = initGameBoard();

  // create players and assign turn
  const playerX = initPlayer("X");
  const playerY = initPlayer("O");
  let turn = playerX;
  let hasPlayedBefore = false;

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
      putMarkWithIndex(Math.floor(Math.random() * 9), gameBoard, turn);
      //   change turn
      turn = turn === playerX ? playerY : playerX;
      hasPlayedBefore = true;
    }

  //handle click on tile
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) =>
    tile.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (
        tile.classList.contains("marked") ||
        (gameMode === "vsCPU" && turn.getMark() !== player) ||
        tile.classList.contains("disabled")
      ) {
        return;
      }
      disableClick();
      putMark(tile, turn, gameBoard);
      // if it's 2P
      if (gameMode === "2P") {
        // check if the game is over
        if (actionOnGameEnd(turn, gameBoard)) return;
        // change player
        turn = turn === playerX ? playerY : playerX;
      }
      if (gameMode === "vsCPU") {
        if (actionOnGameEnd(turn, gameBoard)) return;
        turn = turn === playerX ? playerY : playerX;
        if (!hasPlayedBefore) {
          putMarkWithIndex(Math.floor(Math.random() * 9), gameBoard, turn);
          hasPlayedBefore = true;
        } else {
          playTurn(turn, gameBoard);
        }
        turn = turn === playerX ? playerY : playerX;
      }
      enableClick();
    })
  );
}

function putMark(tile, turn, gameBoard) {
  // get index of tile
  const index =
    Number(tile.classList.toString().split(" ")[1].split("-")[1]) - 1;
  putMarkWithIndex(index, gameBoard, turn);
}

function disableClick() {
  document
    .querySelectorAll(".tile")
    .forEach((tile) => tile.classList.add("disabled"));
}

function enableClick() {
  document
    .querySelectorAll(".tile")
    .forEach((tile) => tile.classList.remove("disabled"));
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
    return true;
  } else if (isBoardFull(gameBoard)) {
    declareTie();
    return true;
  }
  return false;
}

function declareWinner(mark) {
  // [ ] TODO
  displayGameEnd(`PLAYER ${mark} WINS!`);
}

function declareTie() {
  // [ ] TODO
  displayGameEnd(`IT'S A TIE!`);
}

function displayGameEnd(message) {
  const modal = document.querySelector(".modal");
  modal.style.display = "flex";
  const gameEndScreen = document.querySelector(".game-end");
  gameEndScreen.style.display = "flex";
  gameEndScreen.firstChild.textContent = message;
  document
    .querySelector(".game-end > button")
    .addEventListener("click", (e) => {
      gameEndScreen.style.display = "none";
      modal.style.display = "none";
      location.reload();
    });
}

async function playTurn(turn, gameBoard) {
  // [ ] TODO
  if (isAPIavailable) {
    const apiURL = "http://localhost:5235/move";
    await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createRequestObject(turn, gameBoard)),
    })
      .then((response) => response.json())
      .then((data) => putMarkWithIndex(data.index, gameBoard, turn))
      .catch((error) => {
        console.log(error);
        isAPIavailable = false;
        putMarkWithIndex(chooseRandomIndex(gameBoard), gameBoard, turn);
      });
  } else {
    putMarkWithIndex(chooseRandomIndex(gameBoard), gameBoard, turn);
  }

  actionOnGameEnd(turn, gameBoard);
}

function createRequestObject(turn, gameBoard) {
  const board = gameBoard.board;
  return { table: board.toString().split(",").join(""), mark: turn.getMark() };
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

function chooseRandomIndex(gameBoard) {
  const emptyTileIndexes = [];
  for (let i = 0; i < 9; i++) {
    if (gameBoard.board[i] === "*") {
      emptyTileIndexes.push(i);
    }
  }
  return emptyTileIndexes[Math.floor(Math.random() * emptyTileIndexes.length)];
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
    const choosePlayerWindow = document.querySelector(
      ".modal > .choose-player"
    );
    choosePlayerWindow.style.display = "flex";
    document
      .querySelectorAll(".modal > .choose-player > button")
      .forEach((button) =>
        button.addEventListener("click", (e) => {
          choosePlayerWindow.style.display = "none";
          resolve(button.textContent);
        })
      );
  });
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
