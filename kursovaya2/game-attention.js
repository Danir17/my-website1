(() => {
  const board = document.getElementById("attentionBoard");
  const startBtn = document.getElementById("attentionStart");
  const message = document.getElementById("attentionMessage");
  if (!board || !startBtn || !message) return;

  let targets = new Set();
  let found = 0;
  let active = false;

  function setupBoard() {
    board.innerHTML = "";
    message.classList.remove("victory-pulse");
    targets = new Set();
    found = 0;
    active = true;

    const targetIndexes = new Set();
    while (targetIndexes.size < 5) {
      targetIndexes.add(Math.floor(Math.random() * 16));
    }
    targets = targetIndexes;

    for (let i = 0; i < 16; i += 1) {
      const btn = document.createElement("button");
      btn.className = "cell";
      if (targets.has(i)) btn.classList.add("target");
      btn.addEventListener("click", () => onCellClick(btn, i));
      board.appendChild(btn);
    }

    setTimeout(() => {
      Array.from(board.children).forEach((el) => el.classList.remove("target"));
      message.textContent = "Ищите цели и нажимайте клетки.";
    }, 1500);
  }

  function onCellClick(cell, index) {
    if (!active || cell.disabled) return;
    cell.disabled = true;
    if (targets.has(index)) {
      cell.classList.add("cell-hit");
      found += 1;
    } else {
      cell.classList.add("cell-miss");
    }
    if (found === targets.size) {
      active = false;
      const score = 100;
      message.textContent = "Отлично! Вы нашли все цели. Балл: " + score;
      message.classList.remove("victory-pulse");
      void message.offsetWidth;
      message.classList.add("victory-pulse");
      if (window.App) {
        window.App.saveGameResult("attention", score);
        if (window.App.celebrateVictory) window.App.celebrateVictory();
      }
    }
  }

  startBtn.addEventListener("click", setupBoard);
})();
