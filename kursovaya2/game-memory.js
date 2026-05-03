(() => {
  const startBtn = document.getElementById("memoryStart");
  const seqEl = document.getElementById("memorySequence");
  const input = document.getElementById("memoryInput");
  const checkBtn = document.getElementById("memoryCheck");
  const msgEl = document.getElementById("memoryMessage");
  if (!startBtn || !seqEl || !input || !checkBtn || !msgEl) return;

  let sequence = "";
  let length = 5;

  function randomDigits(count) {
    let result = "";
    for (let i = 0; i < count; i += 1) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  startBtn.addEventListener("click", () => {
    sequence = randomDigits(length);
    seqEl.classList.remove("is-hiding");
    seqEl.textContent = sequence;
    msgEl.classList.remove("victory-pulse");
    msgEl.textContent = "Запомните последовательность";
    input.value = "";
    setTimeout(() => {
      seqEl.classList.add("is-hiding");
      seqEl.textContent = "* * * * *";
      msgEl.textContent = "Введите последовательность";
    }, 1800);
  });

  checkBtn.addEventListener("click", () => {
    if (!sequence) {
      msgEl.textContent = "Сначала нажмите кнопку показа последовательности.";
      return;
    }
    const value = input.value.trim();
    if (value === sequence) {
      const score = Math.min(100, length * 15);
      msgEl.textContent = "Верно! Балл: " + score;
      msgEl.classList.remove("victory-pulse");
      void msgEl.offsetWidth;
      msgEl.classList.add("victory-pulse");
      length += 1;
      if (window.App) {
        window.App.saveGameResult("memory", score);
        if (window.App.celebrateVictory) window.App.celebrateVictory();
      }
    } else {
      msgEl.textContent = "Неверно. Правильный ответ: " + sequence;
      length = Math.max(5, length - 1);
    }
  });
})();
