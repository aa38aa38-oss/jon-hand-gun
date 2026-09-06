// player.js - 主角小江控制器
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 52;
    this.h = 80;
    this.standH = 80;
    this.crouchH = 46;

    this.vx = 0;
    this.vy = 0;
    this.speed = 5.2;
    this.jumpForce = 12.8;
    this.grounded = false;
    this.jumpCount = 0;
    this.facingLeft = false;

    this.isCrouching = false;
    this.dashTimer = 0;
    this.aimDir = { x: 1, y: 0 };

    this.hp = 100;
    this.maxHp = 100;
    this.invincibleTimer = 0;
    this.score = 0;
  }

  handleInput(keys) {
    if (this.dashTimer > 0) {
      this.dashTimer--;
      this.vx = (this.facingLeft ? -1 : 1) * 12.5;
      return;
    }

    if (keys.left) {
      this.vx = -this.speed;
      this.facingLeft = true;
    } else if (keys.right) {
      this.vx = this.speed;
      this.facingLeft = false;
    } else {
      this.vx = 0;
    }

    // 趴下掩蔽判定
    if (keys.down && this.grounded) {
      if (!this.isCrouching) {
        this.isCrouching = true;
        this.y += (this.standH - this.crouchH);
        this.h = this.crouchH;
      }
    } else {
      if (this.isCrouching) {
        this.isCrouching = false;
        this.y -= (this.standH - this.crouchH);
        this.h = this.standH;
      }
    }

    // 越南大戰經典 8 方向瞄準運算
    let dx = this.facingLeft ? -1 : 1;
    let dy = 0;

    if (keys.up) dy = -1;
    if (keys.down && !this.grounded) dy = 1; // 空中向下開火壓制
    if (keys.left || keys.right) {
      dx = keys.left ? -1 : 1;
    } else if (keys.up) {
      dx = 0; // 原地朝正上方射擊
    }

    const len = Math.hypot(dx, dy) || 1;
    this.aimDir = { x: dx / len, y: dy / len };
  }

  jump() {
    if (this.jumpCount < 2) {
      this.vy = -this.jumpForce;
      this.jumpCount++;
      this.grounded = false;
    }
  }

  dash() {
    if (this.dashTimer <= 0 && !this.isCrouching) {
      this.dashTimer = 14;
    }
  }

  fire(weaponMgr) {
    const muzzleX = this.x + (this.facingLeft ? 4 : this.w - 4);
    const muzzleY = this.y + (this.isCrouching ? this.h * 0.45 : this.h * 0.35);

    const recoil = weaponMgr.triggerFire(muzzleX, muzzleY, this.aimDir.x, this.aimDir.y);
    if (recoil > 0 && this.grounded && !this.isCrouching) {
      this.vx -= this.aimDir.x * recoil; // 後座力推移
    }
  }

  takeDamage(dmg) {
    if (this.invincibleTimer > 0) return;
    this.hp -= dmg;
    this.invincibleTimer = 60;
    this.vy = -4.5;
    const lifeBar = document.getElementById("life-fill");
    if (lifeBar) lifeBar.style.width = `${Math.max(0, (this.hp / this.maxHp) * 100)}%`;
  }

  update(platforms) {
    if (this.invincibleTimer > 0) this.invincibleTimer--;

    this.vy += 0.65;
    this.x += this.vx;
    this.y += this.vy;

    // 平台踏板碰撞判定
    this.grounded = false;
    for (const p of platforms) {
      if (this.x + this.w * 0.7 > p.x && this.x + this.w * 0.3 < p.x + p.w &&
          this.y + this.h >= p.y && this.y + this.h <= p.y + this.vy + 16 && this.vy >= 0) {
        this.y = p.y - this.h;
        this.vy = 0;
        this.grounded = true;
        this.jumpCount = 0;
      }
    }

    // 預設地板安全邊界
    if (this.y > 380 - this.h) {
      this.y = 380 - this.h;
      this.vy = 0;
      this.grounded = true;
      this.jumpCount = 0;
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.invincibleTimer % 4 >= 2) {
      ctx.restore();
      return;
    }

    ctx.translate(this.x, this.y);
    if (this.facingLeft) {
      ctx.translate(this.w, 0);
      ctx.scale(-1, 1);
    }

    // 小江身體占位原型（藍夾克風格）
    ctx.fillStyle = this.dashTimer > 0 ? "#9b59b6" : "#2980b9";
    ctx.fillRect(0, 0, this.w, this.h);

    // 頭部與特徵
    ctx.fillStyle = "#f39c12";
    ctx.fillRect(8, 6, this.w - 16, 20);

    // 槍枝火線方向標記
    ctx.strokeStyle = "#e74c3c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.w / 2, this.h * 0.35);
    ctx.lineTo(this.w / 2 + this.aimDir.x * (this.facingLeft ? -26 : 26), this.h * 0.35 + this.aimDir.y * 26);
    ctx.stroke();

    ctx.restore();
  }
}