// game.js - 核心遊戲主控循環
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const keys = { left: false, right: false, up: false, down: false, fire: false };
let cameraX = 0;

const weaponMgr = new WeaponManager();
const player = new Player(80, 250);

// 三重國中關卡示範平台
const platforms = [
  { x: 0, y: 380, w: 4500, h: 70, color: "#4b6584" },
  { x: 220, y: 280, w: 140, h: 16, color: "#778ca3" },
  { x: 450, y: 210, w: 160, h: 16, color: "#778ca3" },
  { x: 740, y: 270, w: 140, h: 16, color: "#778ca3" }
];

// 放置兩個武器箱供測試：H (重機槍) 與 S (散彈槍)
weaponMgr.spawnDropBadge(480, 160, "HEAVY_MACHINE");
weaponMgr.spawnDropBadge(780, 220, "SHOTGUN");

// 鍵盤操作監聽 (PC測試用)
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key === "a" || e.key === "ArrowLeft") keys.left = true;
  if (e.key === "d" || e.key === "ArrowRight") keys.right = true;
  if (e.key === "w" || e.key === "ArrowUp") keys.up = true;
  if (e.key === "s" || e.key === "ArrowDown") keys.down = true;
  if (e.key === "k" || e.key === " ") player.jump();
  if (e.key === "Shift") player.dash();
  if (e.key === "j") keys.fire = true;

  if (e.key === "1") weaponMgr.equip("PISTOL");
  if (e.key === "2") weaponMgr.equip("HEAVY_MACHINE");
  if (e.key === "3") weaponMgr.equip("SHOTGUN");
  if (e.key === "4") weaponMgr.equip("ROCKET");
});

window.addEventListener("keyup", (e) => {
  if (e.key === "a" || e.key === "ArrowLeft") keys.left = false;
  if (e.key === "d" || e.key === "ArrowRight") keys.right = false;
  if (e.key === "w" || e.key === "ArrowUp") keys.up = false;
  if (e.key === "s" || e.key === "ArrowDown") keys.down = false;
  if (e.key === "j") keys.fire = false;
});

// 手機觸控按鈕專屬綁定
function attachTouch(id, onStart, onEnd) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("touchstart", (e) => { e.preventDefault(); onStart(); }, { passive: false });
  el.addEventListener("touchend", (e) => { e.preventDefault(); if (onEnd) onEnd(); }, { passive: false });
}

attachTouch("btn-left", () => keys.left = true, () => keys.left = false);
attachTouch("btn-right", () => keys.right = true, () => keys.right = false);
attachTouch("btn-up", () => keys.up = true, () => keys.up = false);
attachTouch("btn-down", () => keys.down = true, () => keys.down = false);
attachTouch("btn-fire", () => keys.fire = true, () => keys.fire = false);
attachTouch("btn-jump", () => player.jump());
attachTouch("btn-dash", () => player.dash());

function closeDialogue() {
  document.getElementById("dialog-box").style.display = "none";
}

// 主循環
function loop() {
  player.handleInput(keys);
  if (keys.fire) player.fire(weaponMgr);

  player.update(platforms);
  weaponMgr.update(cameraX, player);

  // 鏡頭跟隨
  cameraX += (player.x - 280 - cameraX) * 0.1;
  if (cameraX < 0) cameraX = 0;

  // 繪製
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-cameraX, 0);

  // 繪製教室背景走廊地圖
  for (const p of platforms) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }

  weaponMgr.draw(ctx);
  player.draw(ctx);

  ctx.restore();
  requestAnimationFrame(loop);
}

loop();