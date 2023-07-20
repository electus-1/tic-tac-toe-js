const initPlayer = function (mark) {
  let _mark = mark;
  const setMark = (mark) => {
    _mark = mark;
  };
  const getMark = () => {
    return _mark;
  };
  return { setMark, getMark };
};

// [ ] TODO if its computers turn make move if not wait for player input
const game = function (gameMode, player = null) {
  const gameBoard = (function () {
    let board = [];
    for (let i = 0; i < 9; i++) {
      board[i] = "*";
    }

    const setTile = (mark, index) => {
      board[index] = mark;
    };
    return { board, setTile };
  })();

  // create players and assign turn
  const playerX = initPlayer("X");
  const playerY = initPlayer("O");
  let turn = playerX;

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
      // get index of tile
      const index = Number(tile.classList.toString().split("-")[1]) - 1;
      // disallow tile to be remarked
      tile.classList.add("marked");
      // update board array
      gameBoard.setTile(turn.getMark(), index);
      // update ui
      tile.textContent = turn.getMark();
      // change player
      turn = turn === playerX ? playerY : playerX;
    })
  );
};

function gameLoop() {}

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

// make player choose x or o and start the game on screen load
// make player choose 1p vs cmp or 2p on start before letting them choose, if 1p let them choose x or o if not they will assign it themselves

async function onLoad() {
  let player;
  let gameMode;
  const modal = document.querySelector(".modal");
  modal.style.display = "flex";
  gameMode = await chooseGameMode();
  console.log(gameMode);
  if (gameMode === "vsCPU") {
    player = await choosePlayer();
  }
  if (gameMode != undefined) {
    modal.style.display = "none";
    game(gameMode, player);
  }
}

onLoad();
