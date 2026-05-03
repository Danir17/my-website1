(() => {
  const startBtn = document.getElementById("logicStart");
  const qEl = document.getElementById("logicQuestion");
  const answersEl = document.getElementById("logicAnswers");
  const msgEl = document.getElementById("logicMessage");
  if (!startBtn || !qEl || !answersEl || !msgEl) return;

  const questions = [
    { q: "2, 4, 8, 16, ?", options: ["20", "24", "32"], correct: "32" },
    { q: "Какое число лишнее: 3, 5, 9, 11", options: ["3", "9", "11"], correct: "9" },
    { q: "Если A=1, B=2, C=3, то CAB = ?", options: ["312", "321", "231"], correct: "312" },
    { q: "Продолжите: 1, 1, 2, 3, 5, ?", options: ["6", "8", "9"], correct: "8" },
    { q: "Утро:завтрак = вечер: ?", options: ["обед", "ужин", "сон"], correct: "ужин" }
  ];

  let index = 0;
  let score = 0;
  let started = false;

  function showQuestion() {
    const item = questions[index];
    qEl.textContent = item.q;
    answersEl.innerHTML = "";
    item.options.forEach((option) => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = option;
      btn.addEventListener("click", () => answer(option));
      answersEl.appendChild(btn);
    });
  }

  function answer(option) {
    const item = questions[index];
    if (option === item.correct) score += 20;
    index += 1;
    if (index >= questions.length) {
      qEl.textContent = "Тест завершен";
      answersEl.innerHTML = "";
      msgEl.textContent = "Ваш итоговый балл: " + score;
      msgEl.classList.remove("victory-pulse");
      void msgEl.offsetWidth;
      msgEl.classList.add("victory-pulse");
      if (window.App) {
        window.App.saveGameResult("logic", score);
        if (window.App.celebrateVictory) window.App.celebrateVictory();
      }
      started = false;
      return;
    }
    showQuestion();
  }

  startBtn.addEventListener("click", () => {
    if (started) return;
    started = true;
    index = 0;
    score = 0;
    msgEl.textContent = "";
    msgEl.classList.remove("victory-pulse");
    showQuestion();
  });
})();
