const levels = [
  { name: "Stereo Madness", difficulty: "Easy", speed: 3.6, jump: 12, obstacles: 18, color: "#38bdf8" },
  { name: "Back On Track", difficulty: "Easy", speed: 3.7, jump: 12, obstacles: 20, color: "#22d3ee" },
  { name: "Polargeist", difficulty: "Normal", speed: 4.0, jump: 12, obstacles: 22, color: "#34d399" },
  { name: "Dry Out", difficulty: "Normal", speed: 4.1, jump: 12, obstacles: 24, color: "#4ade80" },
  { name: "Base After Base", difficulty: "Hard", speed: 4.25, jump: 12.5, obstacles: 25, color: "#facc15" },
  { name: "Can't Let Go", difficulty: "Hard", speed: 4.4, jump: 12.6, obstacles: 27, color: "#fb923c" },
  { name: "Jumper", difficulty: "Hard", speed: 4.6, jump: 12.8, obstacles: 28, color: "#f97316" },
  { name: "Time Machine", difficulty: "Harder", speed: 4.8, jump: 13.1, obstacles: 30, color: "#f472b6" },
  { name: "Cycles", difficulty: "Harder", speed: 4.85, jump: 13.2, obstacles: 31, color: "#a78bfa" },
  { name: "xStep", difficulty: "Harder", speed: 4.9, jump: 13.2, obstacles: 32, color: "#818cf8" },
  { name: "Clutterfunk", difficulty: "Insane", speed: 5.0, jump: 13.4, obstacles: 34, color: "#60a5fa" },
  { name: "Theory of Everything", difficulty: "Insane", speed: 5.1, jump: 13.5, obstacles: 35, color: "#38bdf8" },
  { name: "Electroman Adventures", difficulty: "Insane", speed: 5.2, jump: 13.5, obstacles: 36, color: "#22d3ee" },
  { name: "Clubstep", difficulty: "Demon", speed: 5.3, jump: 13.8, obstacles: 37, color: "#f43f5e" },
  { name: "Electrodynamix", difficulty: "Insane", speed: 5.4, jump: 13.6, obstacles: 38, color: "#f87171" },
  { name: "Hexagon Force", difficulty: "Insane", speed: 5.45, jump: 13.7, obstacles: 39, color: "#c084fc" },
  { name: "Blast Processing", difficulty: "Harder", speed: 5.1, jump: 13.4, obstacles: 36, color: "#2dd4bf" },
  { name: "Theory of Everything 2", difficulty: "Demon", speed: 5.55, jump: 13.9, obstacles: 40, color: "#e879f9" },
  { name: "Geometrical Dominator", difficulty: "Harder", speed: 5.2, jump: 13.5, obstacles: 37, color: "#06b6d4" },
  { name: "Deadlocked", difficulty: "Demon", speed: 5.7, jump: 14.0, obstacles: 42, color: "#ef4444" },
  { name: "Fingerdash", difficulty: "Insane", speed: 5.35, jump: 13.6, obstacles: 38, color: "#f59e0b" },
  { name: "Sunshine", difficulty: "Custom", speed: 5.0, jump: 13.8, obstacles: 36, color: "#fde047" }
];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const levelGrid = document.getElementById("levelGrid");
const levelName = document.getElementById("levelName");
const progressText = document.getElementById("progressText");
const attemptsText = document.getElementById("attemptsText");
const restartBtn = document.getElementById("restartBtn");

const state = {
  levelIndex: 0,
  player: { x: 120, y: 0, vy: 0, size: 28, onGround: true, rot: 0 },
  gravity: 0.62,
  groundY: canvas.height - 48,
  distance: 0,
  attempts: 0,
  obstacles: [],
  completeDistance: 2600,
  running: true
};

function buildObstacles(level) {
  const result = [];
  const segment = state.completeDistance / level.obstacles;
  for (let i = 3; i <= level.obstacles; i++) {
    const x = Math.floor(i * segment + (Math.random() * 90 - 45));
    const tall = Math.random() > 0.65;
    result.push({
      x,
      width: tall ? 26 : 22,
      height: tall ? 58 : 36
    });
  }
  return result;
}

function selectLevel(index) {
  state.levelIndex = index;
  const level = levels[index];
  levelName.textContent = level.name;
  state.completeDistance = 2200 + level.obstacles * 28;
  state.obstacles = buildObstacles(level);
  resetPlayer(false);
  renderLevelCards();
}

function resetPlayer(incrementAttempts = true) {
  state.player.y = state.groundY - state.player.size;
  state.player.vy = 0;
  state.player.onGround = true;
  state.player.rot = 0;
  state.distance = 0;
  state.running = true;
  if (incrementAttempts) state.attempts += 1;
  attemptsText.textContent = state.attempts;
}

function jump() {
  const level = levels[state.levelIndex];
  if (state.player.onGround) {
    state.player.vy = -level.jump;
    state.player.onGround = false;
  }
}

function update() {
  if (!state.running) return;
  const level = levels[state.levelIndex];
  state.distance += level.speed;
  state.player.vy += state.gravity;
  state.player.y += state.player.vy;

  if (!state.player.onGround) state.player.rot += 0.16;

  if (state.player.y >= state.groundY - state.player.size) {
    state.player.y = state.groundY - state.player.size;
    state.player.vy = 0;
    state.player.onGround = true;
    state.player.rot = 0;
  }

  for (const obs of state.obstacles) {
    const screenX = obs.x - state.distance + state.player.x;
    const hit =
      screenX < state.player.x + state.player.size &&
      screenX + obs.width > state.player.x &&
      state.player.y + state.player.size > state.groundY - obs.height;

    if (hit) {
      state.running = false;
      setTimeout(() => resetPlayer(true), 700);
      break;
    }
  }

  const pct = Math.min(100, Math.floor((state.distance / state.completeDistance) * 100));
  progressText.textContent = `${pct}%`;

  if (pct >= 100) {
    state.running = false;
    progressText.textContent = "100% ✅";
    setTimeout(() => {
      const next = (state.levelIndex + 1) % levels.length;
      selectLevel(next);
    }, 1000);
  }
}

function draw() {
  const level = levels[state.levelIndex];
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#0a1022");
  gradient.addColorStop(1, level.color + "22");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#334155";
  ctx.fillRect(0, state.groundY, canvas.width, canvas.height - state.groundY);

  for (const obs of state.obstacles) {
    const x = obs.x - state.distance + state.player.x;
    if (x < -100 || x > canvas.width + 20) continue;
    ctx.fillStyle = level.color;
    ctx.fillRect(x, state.groundY - obs.height, obs.width, obs.height);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x + 5, state.groundY - obs.height + 8, obs.width - 10, 8);
  }

  ctx.save();
  ctx.translate(state.player.x + state.player.size / 2, state.player.y + state.player.size / 2);
  ctx.rotate(state.player.rot);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(-state.player.size / 2, -state.player.size / 2, state.player.size, state.player.size);
  ctx.fillStyle = level.color;
  ctx.fillRect(-8, -8, 16, 16);
  ctx.restore();

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "16px sans-serif";
  ctx.fillText(level.name, 20, 28);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function renderLevelCards() {
  levelGrid.innerHTML = "";
  levels.forEach((level, idx) => {
    const card = document.createElement("button");
    card.className = "level-card" + (idx === state.levelIndex ? " active" : "");
    card.innerHTML = `<strong>${level.name}</strong><div class="difficulty">${level.difficulty}</div>`;
    card.addEventListener("click", () => selectLevel(idx));
    levelGrid.appendChild(card);
  });
}

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault();
    jump();
  }
});

canvas.addEventListener("pointerdown", jump);
restartBtn.addEventListener("click", () => resetPlayer(true));

selectLevel(0);
loop();
