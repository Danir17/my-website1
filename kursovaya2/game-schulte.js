(() => {
  const board = document.getElementById("schulteBoard");
  const startBtn = document.getElementById("schulteStart");
  const msgEl = document.getElementById("schulteMessage");
  const nextEl = document.getElementById("schulteNext");
  const timerEl = document.getElementById("schulteTimer");
  if (!board || !startBtn || !msgEl || !nextEl || !timerEl) return;

  const SIZE = 25;
  let next = 1;
  let t0 = null;
  let timerId = null;
  let active = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function formatElapsed() {
    if (t0 == null) return 0;
    return (performance.now() - t0) / 1000;
  }

  function updateTimerDisplay() {
    timerEl.textContent = "Время: " + formatElapsed().toFixed(1) + " с";
  }

  function scoreFromSeconds(sec) {
    return Math.max(15, Math.min(100, Math.round(100 - sec * 1.65)));
  }

  function pulseVictoryMessage(text) {
    msgEl.textContent = text;
    msgEl.classList.remove("victory-pulse");
    void msgEl.offsetWidth;
    msgEl.classList.add("victory-pulse");
  }

  function buildBoard() {
    stopTimer();
    board.innerHTML = "";
    msgEl.textContent = "";
    msgEl.classList.remove("victory-pulse");
    next = 1;
    t0 = null;
    active = true;
    nextEl.textContent = "Следующее: 1";
    timerEl.textContent = "Время: 0.0 с";

    const nums = shuffle(Array.from({ length: SIZE }, (_, i) => i + 1));
    nums.forEach((n) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "schulte-cell";
      btn.textContent = String(n);
      btn.dataset.value = String(n);
      btn.addEventListener("click", () => onCellClick(btn, n));
      board.appendChild(btn);
    });
  }

  function onCellClick(cell, value) {
    if (!active || cell.disabled) return;

    if (value !== next) {
      cell.classList.remove("schulte-wrong");
      void cell.offsetWidth;
      cell.classList.add("schulte-wrong");
      setTimeout(() => cell.classList.remove("schulte-wrong"), 420);
      return;
    }

    if (next === 1) {
      t0 = performance.now();
      timerId = setInterval(updateTimerDisplay, 100);
    }

    cell.disabled = true;
    cell.classList.add("schulte-done");
    next += 1;

    if (next > SIZE) {
      active = false;
      stopTimer();
      const sec = formatElapsed();
      updateTimerDisplay();
      const score = scoreFromSeconds(sec);
      pulseVictoryMessage("Готово! Время: " + sec.toFixed(1) + " с. Балл: " + score);
      nextEl.textContent = "Следующее: —";
      if (window.App) {
        window.App.saveGameResult("schulte", score);
        if (window.App.celebrateVictory) window.App.celebrateVictory();
      }
      return;
    }

    nextEl.textContent = "Следующее: " + next;
  }

  startBtn.addEventListener("click", buildBoard);
})();
