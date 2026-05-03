(function () {
  const STORAGE_USERS = "memoryflow_users";
  const STORAGE_CURRENT_USER = "memoryflow_current_user";
  const STORAGE_THEME = "memoryflow_theme";
  const LEGACY = {
    users: "mindtrain_users",
    current: "mindtrain_current_user",
    theme: "mindtrain_theme"
  };

  function migrateLegacyStorage() {
    if (!localStorage.getItem(STORAGE_USERS) && localStorage.getItem(LEGACY.users)) {
      localStorage.setItem(STORAGE_USERS, localStorage.getItem(LEGACY.users));
    }
    if (!localStorage.getItem(STORAGE_CURRENT_USER) && localStorage.getItem(LEGACY.current)) {
      localStorage.setItem(STORAGE_CURRENT_USER, localStorage.getItem(LEGACY.current));
    }
    if (!localStorage.getItem(STORAGE_THEME) && localStorage.getItem(LEGACY.theme)) {
      localStorage.setItem(STORAGE_THEME, localStorage.getItem(LEGACY.theme));
    }
  }

  migrateLegacyStorage();

  function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_CURRENT_USER) || "null");
  }

  function setCurrentUser(user) {
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
  }

  function requireAuth() {
    const protectedPages = [
      "trainers.html",
      "profile.html",
      "game-attention.html",
      "game-logic.html",
      "game-memory.html",
      "game-schulte.html"
    ];
    const current = location.pathname.split("/").pop();
    if (protectedPages.includes(current) && !getCurrentUser()) {
      location.href = "login.html";
    }
  }

  function applyTheme() {
    const saved = localStorage.getItem(STORAGE_THEME) || "light";
    document.body.classList.toggle("dark", saved === "dark");
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem(STORAGE_THEME, isDark ? "light" : "dark");
    applyTheme();
  }

  function initThemeButton() {
    const btn = document.getElementById("themeToggle");
    if (btn) {
      btn.addEventListener("click", toggleTheme);
    }
  }

  function upsertUser(updated) {
    const users = getUsers();
    const next = users.map((u) => (u.email === updated.email ? updated : u));
    saveUsers(next);
  }

  function ensureProgressShape(user) {
    if (!user.progress) {
      user.progress = {};
    }
    if (!user.progress.attention) user.progress.attention = { attempts: 0, best: 0 };
    if (!user.progress.logic) user.progress.logic = { attempts: 0, best: 0 };
    if (!user.progress.memory) user.progress.memory = { attempts: 0, best: 0 };
    if (!user.progress.schulte) user.progress.schulte = { attempts: 0, best: 0 };
    if (!user.progress.totalSessions) user.progress.totalSessions = 0;
    return user;
  }

  function register(email, password, name) {
    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      return { ok: false, error: "Пользователь с таким email уже существует." };
    }
    const user = ensureProgressShape({ name, email, password, progress: {} });
    users.push(user);
    saveUsers(users);
    setCurrentUser(user);
    return { ok: true };
  }

  function login(email, password) {
    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return { ok: false, error: "Неверный email или пароль." };
    }
    const normalized = ensureProgressShape(user);
    setCurrentUser(normalized);
    upsertUser(normalized);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(STORAGE_CURRENT_USER);
    location.href = "index.html";
  }

  function saveGameResult(game, score) {
    const user = getCurrentUser();
    if (!user) return;
    ensureProgressShape(user);
    const block = user.progress[game];
    block.attempts += 1;
    block.best = Math.max(block.best, score);
    user.progress.totalSessions += 1;
    setCurrentUser(user);
    upsertUser(user);
  }

  function renderProfile() {
    const user = getCurrentUser();
    if (!user) return;
    ensureProgressShape(user);

    const nameEl = document.getElementById("profileName");
    const totalSessionsEl = document.getElementById("totalSessions");
    const totalBestEl = document.getElementById("totalBest");
    const progressEl = document.getElementById("progressList");
    if (!nameEl || !totalSessionsEl || !totalBestEl || !progressEl) return;

    nameEl.textContent = user.name;
    totalSessionsEl.textContent = String(user.progress.totalSessions);
    const totalBest =
      user.progress.attention.best +
      user.progress.logic.best +
      user.progress.memory.best +
      user.progress.schulte.best;
    totalBestEl.textContent = String(totalBest);

    const games = [
      { key: "attention", title: "Внимание" },
      { key: "logic", title: "Логика" },
      { key: "memory", title: "Память" },
      { key: "schulte", title: "Таблица Шульте" }
    ];
    progressEl.innerHTML = "";
    games.forEach((g) => {
      const item = document.createElement("article");
      item.className = "progress-item";
      const data = user.progress[g.key];
      const width = Math.min(100, data.best);
      item.innerHTML =
        "<h4>" + g.title + "</h4>" +
        "<p>Попыток: " + data.attempts + " | Лучший балл: " + data.best + "</p>" +
        "<div class='bar'><span style='width:" + width + "%'></span></div>";
      progressEl.appendChild(item);
    });
  }

  function initRegisterPage() {
    const form = document.getElementById("registerForm");
    const msg = document.getElementById("registerMessage");
    if (!form || !msg) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value.trim();
      const result = register(email, password, name);
      if (!result.ok) {
        msg.textContent = result.error;
        return;
      }
      msg.textContent = "Регистрация успешна. Переход в тренажеры...";
      setTimeout(() => {
        location.href = "trainers.html";
      }, 700);
    });
  }

  function initLoginPage() {
    const form = document.getElementById("loginForm");
    const msg = document.getElementById("loginMessage");
    if (!form || !msg) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const result = login(email, password);
      if (!result.ok) {
        msg.textContent = result.error;
        return;
      }
      msg.textContent = "Авторизация успешна. Переход в тренажеры...";
      setTimeout(() => {
        location.href = "trainers.html";
      }, 700);
    });
  }

  function initProfileButtons() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }
  }

  function celebrateVictory() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("victory-glow");
      setTimeout(() => document.body.classList.remove("victory-glow"), 400);
      return;
    }
    const layer = document.createElement("div");
    layer.className = "celebration-layer";
    layer.setAttribute("aria-hidden", "true");
    const colors = ["#6750a4", "#d0bcff", "#006c4c", "#eaddff", "#ffc107", "#7c4dff", "#18ffff"];
    const n = 52;
    for (let i = 0; i < n; i += 1) {
      const p = document.createElement("div");
      p.className = "confetti-piece";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.35 + "s";
      p.style.animationDuration = 1.7 + Math.random() * 1.4 + "s";
      if (Math.random() > 0.5) p.classList.add("confetti-piece--wide");
      p.style.setProperty("--confetti-drift", String(Math.random()));
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    document.body.classList.add("victory-glow");
    setTimeout(() => document.body.classList.remove("victory-glow"), 700);
    setTimeout(() => layer.remove(), 3200);
  }

  window.App = {
    saveGameResult,
    getCurrentUser,
    logout,
    celebrateVictory
  };

  applyTheme();
  initThemeButton();
  requireAuth();
  initRegisterPage();
  initLoginPage();
  renderProfile();
  initProfileButtons();
})();
