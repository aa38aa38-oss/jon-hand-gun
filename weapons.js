// weapons.js - 武器系統與子彈庫
const WEAPONS = {
  PISTOL: {
    code: "PIS",
    name: "初始手槍",
    ammo: Infinity,
    cooldown: 13,
    speed: 14,
    damage: 25,
    color: "#f1c40f",
    w: 10, h: 4,
    recoil: 1.4
  },
  HEAVY_MACHINE: {
    code: "HMG",
    name: "重機槍 [H]",
    ammo: 150,
    cooldown: 6,
    speed: 17,
    damage: 32,
    color: "#e67e22",
    w: 15, h: 5,
    recoil: 2.0
  },
  SHOTGUN: {
    code: "SHT",
    name: "狂暴散彈 [S]",
    ammo: 25,
    cooldown: 34,
    speed: 15,
    damage: 60,
    color: "#e74c3c",
    w: 18, h: 10,
    recoil: 5.2,
    pellets: 5
  },
  ROCKET: {
    code: "RCK",
    name: "火箭砲 [R]",
    ammo: 15,
    cooldown: 40,
    speed: 11,
    damage: 180,
    color: "#9b59b6",
    w: 22, h: 12,
    recoil: 6.0,
    isRocket: true
  }
};

class WeaponManager {
  constructor() {
    this.current = WEAPONS.PISTOL;
    this.ammo = Infinity;
    this.cooldownTimer = 0;
    this.bullets = [];
    this.drops = []; // 掉落的槍械徽章
  }

  equip(typeKey) {
    if (WEAPONS[typeKey]) {
      this.current = WEAPONS[typeKey];
      this.ammo = this.current.ammo;
      this.syncHud();
    }
  }

  syncHud() {
    const el = document.getElementById("weapon-display");
    if (el) el.innerText = `${this.current.code} [${this.ammo === Infinity ? '∞' : this.ammo}]`;
  }

  triggerFire(originX, originY, dirX, dirY) {
    if (this.cooldownTimer > 0) return 0;
    if (this.ammo <= 0) this.equip("PISTOL");

    this.cooldownTimer = this.current.cooldown;
    if (this.ammo !== Infinity) {
      this.ammo--;
      this.syncHud();
    }

    // 散彈槍多重扇面發射
    if (this.current.pellets) {
      const centerAngle = Math.atan2(dirY, dirX);
      for (let i = 0; i < this.current.pellets; i++) {
        const offset = (i - 2) * 0.14;
        const angle = centerAngle + offset;
        this.bullets.push({
          x: originX, y: originY,
          vx: Math.cos(angle) * this.current.speed,
          vy: Math.sin(angle) * this.current.speed,
          w: this.current.w, h: this.current.h,
          dmg: this.current.damage, color: this.current.color,
          life: 45
        });
      }
    } else {
      this.bullets.push({
        x: originX, y: originY,
        vx: dirX * this.current.speed,
        vy: dirY * this.current.speed,
        w: this.current.w, h: this.current.h,
        dmg: this.current.damage, color: this.current.color,
        isRocket: !!this.current.isRocket,
        life: 60
      });
    }

    return this.current.recoil;
  }

  spawnDropBadge(x, y, typeKey) {
    this.drops.push({
      x: x, y: y, w: 32, h: 26,
      typeKey: typeKey,
      letter: WEAPONS[typeKey] ? WEAPONS[typeKey].code[0] : "H",
      floatTimer: 0
    });
  }

  update(cameraX, player) {
    if (this.cooldownTimer > 0) this.cooldownTimer--;

    // 更新子彈
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0 || b.x < cameraX - 80 || b.x > cameraX + 880) {
        this.bullets.splice(i, 1);
      }
    }

    // 檢測小江拾取武器徽章
    for (let j = this.drops.length - 1; j >= 0; j--) {
      const d = this.drops[j];
      d.floatTimer += 0.08;
      if (player.x + player.w > d.x && player.x < d.x + d.w &&
          player.y + player.h > d.y && player.y < d.y + d.h) {
        this.equip(d.typeKey);
        this.drops.splice(j, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    // 繪製子彈
    for (const b of this.bullets) {
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    }

    // 繪製越南大戰風格武器箱 (H, S, R 徽章)
    for (const d of this.drops) {
      const floatY = d.y + Math.sin(d.floatTimer) * 5;
      ctx.fillStyle = "#2d3436";
      ctx.fillRect(d.x, floatY, d.w, d.h);
      ctx.strokeStyle = "#f1c40f";
      ctx.lineWidth = 2;
      ctx.strokeRect(d.x, floatY, d.w, d.h);
      ctx.fillStyle = "#f1c40f";
      ctx.font = "900 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.letter, d.x + d.w / 2, floatY + 19);
    }
    ctx.restore();
  }
}