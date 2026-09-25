"use strict";

const $ = (id) => document.getElementById(id);
const canvas = $("game");
const ctx = canvas.getContext("2d");
const mini = $("minimap");
const mctx = mini.getContext("2d");
const TEAM_COLORS = ["#67b7ff", "#ff6b6b", "#ffd43b", "#b197fc"];
const TEAM_NAMES = ["YOU", "AI RED", "AI GOLD", "AI PURPLE"];
const MAPS = {
  small: [2500, 1700],
  medium: [3600, 2400],
  large: [4600, 3100],
  huge: [5600, 3700],
};
let WORLD = { w: 3600, h: 2400 };

const BUILDINGS = {
  hq: {
    name: "Headquarters",
    cost: 0,
    hp: 9000,
    size: 70,
    powerGen: 0,
    powerUse: 0,
    ore: 1000,
    tech: 1,
    upgradeable: true,
  },
  powercell: {
    name: "Power Cell",
    cost: 500,
    hp: 1900,
    size: 34,
    powerGen: 12000,
    powerUse: 0,
    ore: 50,
    tech: 1,
    upgradeable: true,
  },
  extractor: {
    name: "Extractor",
    cost: 900,
    hp: 2500,
    size: 40,
    powerGen: 0,
    powerUse: 350,
    ore: 100,
    tech: 1,
    upgradeable: true,
  },
  factory: {
    name: "Vehicle Factory",
    cost: 2400,
    hp: 5600,
    size: 60,
    powerGen: 0,
    powerUse: 1500,
    ore: 0,
    tech: 1,
    upgradeable: true,
  },
  wind: {
    name: "Wind Turbine",
    cost: 850,
    hp: 2300,
    size: 40,
    powerGen: 20000,
    powerUse: 0,
    ore: 100,
    tech: 2,
    upgradeable: true,
  },
  reactor: {
    name: "Reactor",
    cost: 2100,
    hp: 4300,
    size: 48,
    powerGen: 35000,
    powerUse: 0,
    ore: 200,
    tech: 2,
    upgradeable: true,
  },
  fusion: {
    name: "Fusion Plant",
    cost: 5200,
    hp: 6900,
    size: 54,
    powerGen: 90000,
    powerUse: 0,
    ore: 450,
    tech: 3,
    upgradeable: true,
  },
  turret: {
    name: "Cannon Turret",
    cost: 1400,
    hp: 3300,
    size: 36,
    powerGen: 0,
    powerUse: 550,
    ore: 0,
    tech: 1,
    defense: true,
    range: 280,
    damage: 55,
    reload: 1.0,
    projectileSpeed: 520,
  },
  artilleryTurret: {
    name: "Artillery Defense",
    cost: 3200,
    hp: 4600,
    size: 42,
    powerGen: 0,
    powerUse: 1200,
    ore: 0,
    tech: 2,
    defense: true,
    range: 520,
    damage: 130,
    reload: 2.2,
    projectileSpeed: 430,
  },
  shield: {
    name: "Shield Node",
    cost: 4800,
    hp: 6200,
    size: 46,
    powerGen: 0,
    powerUse: 2600,
    ore: 0,
    tech: 3,
    defense: true,
    range: 220,
    damage: 0,
    reload: 0,
  },
};

const UNIT_TYPES = {
  scout: {
    name: "Scout",
    cost: 300,
    tech: 1,
    hp: 180,
    speed: 125,
    range: 145,
    damage: 22,
    reload: 0.55,
    projectileSpeed: 520,
    radius: 7,
    pop: 1,
    role: "Fast recon",
  },
  tank: {
    name: "Assault Tank",
    cost: 550,
    tech: 1,
    hp: 360,
    speed: 82,
    range: 180,
    damage: 46,
    reload: 0.95,
    projectileSpeed: 450,
    radius: 9,
    pop: 2,
    role: "Balanced armor",
  },
  heavy: {
    name: "Heavy Tank",
    cost: 1050,
    tech: 2,
    hp: 760,
    speed: 58,
    range: 205,
    damage: 90,
    reload: 1.3,
    projectileSpeed: 430,
    radius: 12,
    pop: 3,
    role: "Frontline armor",
  },
  artillery: {
    name: "Artillery",
    cost: 1250,
    tech: 2,
    hp: 310,
    speed: 48,
    range: 430,
    damage: 135,
    reload: 2.25,
    projectileSpeed: 360,
    radius: 10,
    pop: 3,
    role: "Long range",
  },
  juggernaut: {
    name: "Juggernaut",
    cost: 2600,
    tech: 3,
    hp: 1750,
    speed: 42,
    range: 245,
    damage: 180,
    reload: 1.6,
    projectileSpeed: 470,
    radius: 16,
    pop: 6,
    role: "Experimental armor",
  },
};

const TECH = {
  2: {
    cost: 12000,
    time: 12,
    name: "Tech 2",
    desc: "Heavy armor, artillery, reactors, L2 upgrades",
  },
  3: {
    cost: 26000,
    time: 20,
    name: "Tech 3",
    desc: "Fusion power, Juggernaut, shields, L3 upgrades",
  },
};

let dpr = Math.max(1, Math.min(2, devicePixelRatio || 1));
let camera = { x: 500, y: 500, zoom: 0.9 };
let buildings = [],
  units = [],
  bullets = [],
  particles = [];
let resources = [0, 0, 0, 0],
  tech = [1, 1, 1, 1],
  techProgress = [null, null, null, null];
let playerCount = 4,
  popLimit = 1000,
  aiPopLimit = 1000;
let buildMode = null,
  selectedUnits = new Set(),
  selectedBuilding = null;
let activeTab = "build",
  formation = "box";
let running = false,
  last = performance.now(),
  incomeClock = 0,
  aiClock = 0,
  messageTimer = 0;
let pointer = {
  x: 0,
  y: 0,
  down: false,
  startX: 0,
  startY: 0,
  drag: false,
  button: 0,
  touch: false,
};
let keys = new Set();

function resize() {
  const w = innerWidth,
    h = innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const alive = (o) => o && !o.dead && o.hp > 0;
function worldToScreen(x, y) {
  return {
    x: (x - camera.x) * camera.zoom + innerWidth / 2,
    y: (y - camera.y) * camera.zoom + innerHeight / 2,
  };
}
function screenToWorld(x, y) {
  return {
    x: (x - innerWidth / 2) / camera.zoom + camera.x,
    y: (y - innerHeight / 2) / camera.zoom + camera.y,
  };
}
function bar(x, y, w, h, p, c) {
  ctx.fillStyle = "#121821";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w * clamp(p, 0, 1), h);
}
function burst(x, y, n, c) {
  for (let i = 0; i < Math.min(26, n); i++)
    particles.push({
      x,
      y,
      vx: rand(-100, 100),
      vy: rand(-100, 100),
      t: rand(0.3, 0.9),
      c,
    });
}
function showMsg(t, secs = 2.2) {
  $("message").textContent = t;
  $("message").style.display = "block";
  messageTimer = secs;
}

class Building {
  constructor(type, team, x, y) {
    const d = BUILDINGS[type];
    Object.assign(this, d);
    this.base = structuredClone(d);
    this.type = type;
    this.team = team;
    this.x = x;
    this.y = y;
    this.level = 1;
    this.maxHp = this.hp;
    this.dead = false;
    this.queue = [];
    this.buildProgress = 0;
    this.target = null;
    this.cooldown = rand(0, 0.5);
    if (type === "hq" && team !== 0) this.ore = 40;
    if (team !== 0 && ["powercell", "wind", "reactor", "fusion"].includes(type))
      this.ore = 0;
  }
  stats() {
    const mult = 1 + (this.level - 1) * 0.28;
    return {
      ore: (this.ore || 0) * mult,
      powerGen: (this.powerGen || 0) * mult,
      powerUse: this.powerUse || 0,
      hp: this.maxHp,
    };
  }
  upgradeCost() {
    return Math.round(
      (this.cost || 1600) * (this.level === 1 ? 1.25 : 1.8) + 900,
    );
  }
  canUpgrade() {
    return this.upgradeable && this.level < Math.min(3, tech[this.team]);
  }
  upgrade() {
    if (!this.canUpgrade()) return false;
    const c = this.upgradeCost();
    if (resources[this.team] < c) return false;
    resources[this.team] -= c;
    this.level++;
    const oldMax = this.maxHp;
    this.maxHp = Math.round(this.base.hp * (1 + (this.level - 1) * 0.35));
    this.hp += this.maxHp - oldMax;
    return true;
  }
  takeDamage(v) {
    this.hp -= v;
    if (typeof window !== "undefined" && window.__ANTIGRAVITY_EFFECTS__) {
      window.__ANTIGRAVITY_EFFECTS__.spawnImpactSparks(
        this.x + rand(-12, 12),
        this.y + rand(-12, 12),
        undefined,
        6,
      );
    }
    if (this.hp <= 0) {
      this.dead = true;
      if (selectedBuilding === this) selectedBuilding = null;
      burst(this.x, this.y, this.size, TEAM_COLORS[this.team]);
      if (typeof window !== "undefined" && window.__ANTIGRAVITY_EFFECTS__) {
        window.__ANTIGRAVITY_EFFECTS__.spawnExplosion(
          this.x,
          this.y,
          this.size * 1.25,
          true,
        );
      }
      if (typeof window !== "undefined" && window.__ANTIGRAVITY_SOUND__) {
        window.__ANTIGRAVITY_SOUND__.playSpatial(
          "explosionLarge",
          this.x,
          this.y,
          camera.x,
          camera.y,
        );
      }
    }
  }
  acquire() {
    if (!this.defense || !this.damage) return;
    let best = null,
      bd = this.range;
    for (const u of units) {
      if (u.team !== this.team && alive(u)) {
        const d = dist(this, u);
        if (d < bd) {
          bd = d;
          best = u;
        }
      }
    }
    this.target = best;
  }
  update(dt) {
    if (this.dead) return;
    this.cooldown -= dt;
    if (this.defense && this.damage) {
      if (!alive(this.target) || dist(this, this.target) > this.range)
        this.target = null;
      if (!this.target && Math.random() < dt * 3) this.acquire();
      if (
        this.target &&
        this.cooldown <= 0 &&
        teamPowerAvailable(this.team) >= 0
      ) {
        this.cooldown = this.reload;
        bullets.push(
          new Bullet(
            this.team,
            this.x,
            this.y,
            this.target,
            this.damage,
            this.projectileSpeed,
            true,
          ),
        );
        if (typeof window !== "undefined" && window.__ANTIGRAVITY_EFFECTS__) {
          const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
          window.__ANTIGRAVITY_EFFECTS__.spawnMuzzleFlash(
            this.x + Math.cos(angle) * (this.size * 0.45),
            this.y + Math.sin(angle) * (this.size * 0.45),
            angle,
            this.type === "artilleryTurret" ? 28 : 20,
            "#ffd166",
          );
        }
        if (typeof window !== "undefined" && window.__ANTIGRAVITY_SOUND__) {
          window.__ANTIGRAVITY_SOUND__.playSpatial(
            this.type === "artilleryTurret" ? "artillery" : "cannon",
            this.x,
            this.y,
            camera.x,
            camera.y,
          );
        }
      }
    }
    if (this.type === "factory" && this.queue.length) {
      const item = this.queue[0],
        u = UNIT_TYPES[item.type];
      let rate = 1 + (this.level - 1) * 0.28;
      if (teamPowerAvailable(this.team) < 0) rate *= 0.3;
      item.progress += dt * rate;
      if (item.progress >= item.time) {
        this.queue.shift();
        spawnUnit(
          item.type,
          this.team,
          this.x + this.size + 20,
          this.y + rand(-30, 30),
        );
        if (this.team === 0 && typeof window !== "undefined" && window.__ANTIGRAVITY_SOUND__) {
          window.__ANTIGRAVITY_SOUND__.playProductionComplete();
        }
      }
    }
    if (this.type === "shield" && teamPowerAvailable(this.team) >= 0) {
      for (const b of buildings) {
        if (
          b.team === this.team &&
          alive(b) &&
          dist(this, b) < this.range &&
          b.hp < b.maxHp
        ) {
          b.hp = Math.min(b.maxHp, b.hp + 8 * dt);
          if (
            typeof window !== "undefined" &&
            window.__ANTIGRAVITY_EFFECTS__ &&
            Math.random() < dt * 3
          ) {
            window.__ANTIGRAVITY_EFFECTS__.spawnRepairBeam(
              this.x,
              this.y,
              b.x,
              b.y,
              "#48dbfb",
            );
          }
        }
      }
    }
  }
  draw() {
    const p = worldToScreen(this.x, this.y);
    if (
      typeof window !== "undefined" &&
      window.__ANTIGRAVITY_BUILDING_RENDERER__
    ) {
      window.__ANTIGRAVITY_BUILDING_RENDERER__.drawBuilding(
        ctx,
        this,
        p,
        camera,
        selectedBuilding === this,
      );
      return;
    }
    const s = this.size * camera.zoom;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = "#101820";
    ctx.strokeStyle = TEAM_COLORS[this.team];
    ctx.lineWidth = Math.max(1, 2 * camera.zoom);
    ctx.beginPath();
    ctx.roundRect(-s / 2, -s / 2, s, s, Math.max(3, 7 * camera.zoom));
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = TEAM_COLORS[this.team];
    ctx.globalAlpha = 0.14;
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.globalAlpha = 1;
    if (this.type === "wind") {
      ctx.strokeStyle = "#dcecff";
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate(performance.now() / 900 + (i * Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -s * 0.42);
        ctx.stroke();
        ctx.restore();
      }
    }
    if (this.type === "reactor" || this.type === "fusion") {
      ctx.fillStyle = this.type === "fusion" ? "#bde0ff" : "#ffd166";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.defense) {
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s * 0.32, 0);
      ctx.stroke();
    }
    if (camera.zoom > 0.42) {
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.max(9, 10 * camera.zoom)}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(this.name, 0, 4);
      ctx.fillStyle = "#ffd166";
      ctx.font = `${Math.max(8, 9 * camera.zoom)}px system-ui`;
      ctx.fillText("L" + this.level, 0, s / 2 - 4);
    }
    if (this.hp < this.maxHp)
      bar(
        -s / 2,
        -s / 2 - 7 * camera.zoom,
        s,
        4 * camera.zoom,
        this.hp / this.maxHp,
        "#67e8b5",
      );
    if (this.type === "factory" && this.queue.length)
      bar(
        -s / 2,
        s / 2 + 5 * camera.zoom,
        s,
        4 * camera.zoom,
        this.queue[0].progress / this.queue[0].time,
        "#63b3ff",
      );
    if (selectedBuilding === this) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-s / 2 - 5, -s / 2 - 5, s + 10, s + 10);
    }
    ctx.restore();
  }
}

class Unit {
  constructor(type, team, x, y) {
    const d = UNIT_TYPES[type];
    Object.assign(this, d);
    this.base = structuredClone(d);
    this.type = type;
    this.team = team;
    this.x = x;
    this.y = y;
    this.tx = x;
    this.ty = y;
    this.maxHp = this.hp;
    this.cooldown = rand(0, 0.6);
    this.target = null;
    this.dead = false;
    this.kills = 0;
    this.rank = 0;
  }
  veterancy() {
    return this.rank === 0
      ? "Recruit"
      : this.rank === 1
        ? "Veteran ★"
        : this.rank === 2
          ? "Elite ★★"
          : "Ace ★★★";
  }
  recalcRank() {
    const nr =
      this.kills >= 8 ? 3 : this.kills >= 4 ? 2 : this.kills >= 2 ? 1 : 0;
    if (nr > this.rank) {
      this.rank = nr;
      this.maxHp = Math.round(this.base.hp * (1 + this.rank * 0.06));
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.12);
      showMsg(`${this.name} promoted to ${this.veterancy()}!`, 1.4);
    }
  }
  takeDamage(v, source) {
    const before = this.hp;
    this.hp -= v;
    if (typeof window !== "undefined" && window.__ANTIGRAVITY_EFFECTS__) {
      window.__ANTIGRAVITY_EFFECTS__.spawnImpactSparks(
        this.x,
        this.y,
        undefined,
        5,
      );
    }
    if (this.hp <= 0 && before > 0) {
      this.dead = true;
      selectedUnits.delete(this);
      burst(this.x, this.y, 20, TEAM_COLORS[this.team]);
      if (typeof window !== "undefined" && window.__ANTIGRAVITY_EFFECTS__) {
        window.__ANTIGRAVITY_EFFECTS__.spawnExplosion(
          this.x,
          this.y,
          this.type === "juggernaut" || this.type === "heavy" ? 44 : 26,
          this.type === "juggernaut",
        );
      }
      if (typeof window !== "undefined" && window.__ANTIGRAVITY_SOUND__) {
        window.__ANTIGRAVITY_SOUND__.playSpatial(
          this.type === "juggernaut" || this.type === "heavy"
            ? "explosionLarge"
            : "explosion",
          this.x,
          this.y,
          camera.x,
          camera.y,
        );
      }
      if (source && source instanceof Unit) {
        source.kills++;
        source.recalcRank();
      }
    }
  }
  acquire() {
    let best = null,
      bd = this.range * 1.35;
    for (const u of units) {
      if (u.team !== this.team && alive(u)) {
        const d = dist(this, u);
        if (d < bd) {
          bd = d;
          best = u;
        }
      }
    }
    for (const b of buildings) {
      if (b.team !== this.team && alive(b)) {
        const d = dist(this, b);
        if (d < bd) {
          bd = d;
          best = b;
        }
      }
    }
    this.target = best;
  }
  update(dt) {
    if (this.dead) return;
    this.cooldown -= dt;
    if (!alive(this.target) || dist(this, this.target) > this.range * 1.7)
      this.target = null;
    if (!this.target && Math.random() < dt * 2.5) this.acquire();
    if (this.target) {
      const d = dist(this, this.target);
      if (d <= this.range) {
        if (this.cooldown <= 0) {
          const rr = Math.max(0.2, this.reload * (1 - this.rank * 0.035));
          this.cooldown = rr;
          bullets.push(
            new Bullet(
              this.team,
              this.x,
              this.y,
              this.target,
              this.damage * (1 + this.rank * 0.04),
              this.projectileSpeed,
              false,
              this,
            ),
          );
          if (typeof window !== "undefined" && window.__ANTIGRAVITY_EFFECTS__) {
            const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            const col =
              this.team === 0
                ? "#00d2ff"
                : this.team === 1
                  ? "#ff3366"
                  : "#ffd166";
            window.__ANTIGRAVITY_EFFECTS__.spawnMuzzleFlash(
              this.x + Math.cos(angle) * (this.radius * 1.4),
              this.y + Math.sin(angle) * (this.radius * 1.4),
              angle,
              this.type === "artillery"
                ? 24
                : this.type === "heavy" || this.type === "juggernaut"
                  ? 20
                  : 14,
              col,
            );
          }
          if (typeof window !== "undefined" && window.__ANTIGRAVITY_SOUND__) {
            const snd =
              this.type === "artillery"
                ? "artillery"
                : this.type === "heavy" || this.type === "juggernaut"
                  ? "cannon"
                  : "bullet";
            window.__ANTIGRAVITY_SOUND__.playSpatial(
              snd,
              this.x,
              this.y,
              camera.x,
              camera.y,
            );
          }
        }
        return;
      }
    }
    const dx = this.tx - this.x,
      dy = this.ty - this.y,
      d = Math.hypot(dx, dy);
    if (d > 4) {
      const sp = this.speed * dt;
      this.x += (dx / d) * Math.min(sp, d);
      this.y += (dy / d) * Math.min(sp, d);
    }
    this.x = clamp(this.x, 15, WORLD.w - 15);
    this.y = clamp(this.y, 15, WORLD.h - 15);
  }
  draw() {
    const p = worldToScreen(this.x, this.y);
    if (typeof window !== "undefined" && window.__ANTIGRAVITY_UNIT_RENDERER__) {
      window.__ANTIGRAVITY_UNIT_RENDERER__.drawUnit(
        ctx,
        this,
        p,
        camera,
        selectedUnits.has(this),
      );
      return;
    }
    const r = this.radius * camera.zoom,
      a = Math.atan2(this.ty - this.y, this.tx - this.x);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(a);
    ctx.fillStyle = TEAM_COLORS[this.team];
    ctx.strokeStyle = "#081017";
    ctx.lineWidth = Math.max(1, camera.zoom);
    if (this.type === "heavy" || this.type === "juggernaut") {
      ctx.fillRect(-r, -r * 0.78, r * 2, r * 1.56);
      ctx.strokeRect(-r, -r * 0.78, r * 2, r * 1.56);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 1.55, 0);
      ctx.stroke();
    } else if (this.type === "artillery") {
      ctx.fillRect(-r, -r * 0.65, r * 2, r * 1.3);
      ctx.strokeRect(-r, -r * 0.65, r * 2, r * 1.3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 2.1, 0);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(r * 1.45, 0);
      ctx.lineTo(-r, -r * 0.82);
      ctx.lineTo(-r, r * 0.82);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (selectedUnits.has(this)) {
      ctx.rotate(-a);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.hp < this.maxHp) {
      ctx.rotate(-a);
      bar(-r * 1.4, -r * 2.15, r * 2.8, 3, this.hp / this.maxHp, "#67e8b5");
    }
    if (this.rank > 0) {
      ctx.rotate(-a);
      ctx.fillStyle = "#ffd166";
      ctx.font = `${Math.max(8, 9 * camera.zoom)}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("★".repeat(this.rank), 0, r * 2.5);
    }
    ctx.restore();
  }
}

class Bullet {
  constructor(
    team,
    x,
    y,
    target,
    damage,
    speed,
    defense = false,
    source = null,
  ) {
    this.team = team;
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.speed = speed;
    this.defense = defense;
    this.source = source;
    this.dead = false;
  }
  update(dt) {
    if (!alive(this.target)) {
      this.dead = true;
      return;
    }
    const dx = this.target.x - this.x,
      dy = this.target.y - this.y,
      d = Math.hypot(dx, dy),
      step = this.speed * dt;
    if (d <= step + 5) {
      this.target.takeDamage(this.damage, this.source);
      if (typeof window !== "undefined" && window.__ANTIGRAVITY_EFFECTS__) {
        window.__ANTIGRAVITY_EFFECTS__.spawnImpactSparks(
          this.target.x,
          this.target.y,
          undefined,
          7,
        );
        if (this.target.type === "shield") {
          window.__ANTIGRAVITY_EFFECTS__.spawnShieldHit(
            this.target.x,
            this.target.y,
            this.target.range || 220,
            Math.atan2(dy, dx),
          );
          if (typeof window !== "undefined" && window.__ANTIGRAVITY_SOUND__) {
            window.__ANTIGRAVITY_SOUND__.playSpatial(
              "shieldHit",
              this.target.x,
              this.target.y,
              camera.x,
              camera.y,
            );
          }
        }
      }
      this.dead = true;
      return;
    }
    this.x += (dx / d) * step;
    this.y += (dy / d) * step;
  }
  draw() {
    const p = worldToScreen(this.x, this.y);
    if (typeof window !== "undefined" && window.__ANTIGRAVITY_EFFECTS__) {
      const dx = this.target ? this.target.x - this.x : 1;
      const dy = this.target ? this.target.y - this.y : 0;
      const angle = Math.atan2(dy, dx);
      const col = this.defense
        ? "#ffd166"
        : this.team === 0
          ? "#00d2ff"
          : this.team === 1
            ? "#ff3366"
            : "#feca57";
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 8 * camera.zoom;
      ctx.fillRect(
        -7 * camera.zoom,
        -1.5 * camera.zoom,
        14 * camera.zoom,
        3 * camera.zoom,
      );
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        -3 * camera.zoom,
        -0.8 * camera.zoom,
        7 * camera.zoom,
        1.6 * camera.zoom,
      );
      ctx.restore();
      return;
    }
    ctx.fillStyle = this.defense ? "#ffd166" : "#f8f9fa";
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(1.5, 2.4 * camera.zoom), 0, Math.PI * 2);
    ctx.fill();
  }
}

function addBuilding(type, team, x, y) {
  const b = new Building(type, team, x, y);
  buildings.push(b);
  return b;
}
function teamPop(t) {
  let n = 0;
  for (const u of units) if (u.team === t && alive(u)) n += u.pop;
  return n;
}
function teamPower(t) {
  let gen = 0,
    use = 0;
  for (const b of buildings)
    if (b.team === t && alive(b)) {
      const s = b.stats();
      gen += s.powerGen;
      use += s.powerUse;
    }
  return { gen: Math.round(gen), use: Math.round(use) };
}
function teamPowerAvailable(t) {
  const p = teamPower(t);
  return p.gen - p.use;
}
function hq(t) {
  return buildings.find((b) => b.team === t && b.type === "hq" && alive(b));
}
function factories(t) {
  return buildings.filter(
    (b) => b.team === t && b.type === "factory" && alive(b),
  );
}
function nearestFactory(t) {
  return factories(t)[0] || null;
}
function spawnUnit(type, team, x, y) {
  const d = UNIT_TYPES[type],
    cap = team === 0 ? popLimit : aiPopLimit;
  if (teamPop(team) + d.pop > cap) return false;
  units.push(new Unit(type, team, x, y));
  return true;
}
function queueUnit(team, type) {
  const u = UNIT_TYPES[type],
    f = nearestFactory(team);
  if (!u || tech[team] < u.tech || !f || resources[team] < u.cost) return false;
  const cap = team === 0 ? popLimit : aiPopLimit;
  if (teamPop(team) + u.pop > cap) return false;
  resources[team] -= u.cost;
  f.queue.push({ type, progress: 0, time: Math.max(2.4, u.cost / 210) });
  return true;
}

function beginResearch(team, next) {
  if (next > 3 || tech[team] >= next || techProgress[team]) return false;
  const t = TECH[next];
  if (resources[team] < t.cost) return false;
  resources[team] -= t.cost;
  techProgress[team] = { next, progress: 0, time: t.time };
  return true;
}
function updateResearch(dt) {
  for (let t = 0; t < playerCount; t++) {
    const r = techProgress[t];
    if (!r) continue;
    let rate = teamPowerAvailable(t) >= 0 ? 1 : 0.35;
    r.progress += dt * rate;
    if (r.progress >= r.time) {
      tech[t] = r.next;
      techProgress[t] = null;
      const base = hq(t);
      if (base && t === 0) {
        base.ore = tech[t] === 2 ? 1250 : 1500;
      }
      if (t === 0) {
        showMsg(
          `${TECH[tech[t]].name} complete — new units, buildings and upgrades unlocked.`,
          3,
        );
        if (
          typeof window !== "undefined" &&
          window.__ANTIGRAVITY_EFFECTS__ &&
          base
        ) {
          window.__ANTIGRAVITY_EFFECTS__.spawnResearchBeacon(
            base.x,
            base.y,
            140,
          );
        }
        if (typeof window !== "undefined" && window.__ANTIGRAVITY_SOUND__) {
          window.__ANTIGRAVITY_SOUND__.playResearchComplete();
        }
      }
    }
  }
}

function updateEconomy() {
  for (let t = 0; t < playerCount; t++) {
    let income = 0;
    for (const b of buildings)
      if (b.team === t && alive(b)) income += b.stats().ore;
    resources[t] += income;
  }
}
function upgradeSelected() {
  if (!selectedBuilding || selectedBuilding.team !== 0) return;
  if (selectedBuilding.canUpgrade()) {
    const c = selectedBuilding.upgradeCost();
    if (selectedBuilding.upgrade())
      showMsg(
        `${selectedBuilding.name} upgraded to Level ${selectedBuilding.level}.`,
      );
    else showMsg(`Need ${c.toLocaleString()} ore.`);
  } else
    showMsg(
      "Research a higher Tech level first, or building is already maxed.",
    );
}

function formationSlots(list, x, y, kind) {
  const n = list.length,
    gap = 30,
    out = [];
  if (!n) return out;
  if (kind === "line") {
    for (let i = 0; i < n; i++) out.push([x + (i - (n - 1) / 2) * gap, y]);
  } else if (kind === "column") {
    for (let i = 0; i < n; i++) out.push([x, y + (i - (n - 1) / 2) * gap]);
  } else if (kind === "wedge") {
    for (let i = 0; i < n; i++) {
      const row = Math.floor(Math.sqrt(i)),
        side = i % 2 ? 1 : -1;
      out.push([x + side * row * gap * 0.8, y + row * gap]);
    }
  } else if (kind === "spread") {
    const cols = Math.ceil(Math.sqrt(n));
    for (let i = 0; i < n; i++) {
      const c = i % cols,
        r = Math.floor(i / cols);
      out.push([
        x + (c - cols / 2) * gap * 1.7,
        y + (r - cols / 2) * gap * 1.7,
      ]);
    }
  } else {
    const cols = Math.ceil(Math.sqrt(n));
    for (let i = 0; i < n; i++) {
      const c = i % cols,
        r = Math.floor(i / cols);
      out.push([x + (c - cols / 2) * gap, y + (r - cols / 2) * gap]);
    }
  }
  return out;
}
function issueMove(list, x, y) {
  const slots = formationSlots(list, x, y, formation);
  list.forEach((u, i) => {
    u.tx = slots[i][0];
    u.ty = slots[i][1];
    u.target = null;
  });
}

function aiStep() {
  for (let t = 1; t < playerCount; t++) {
    const base = hq(t);
    if (!base) continue;
    if (!techProgress[t]) {
      if (tech[t] === 1 && resources[t] > 16000) beginResearch(t, 2);
      else if (tech[t] === 2 && resources[t] > 34000) beginResearch(t, 3);
    }
    const fs = factories(t);
    if (
      resources[t] > BUILDINGS.reactor.cost &&
      tech[t] >= 2 &&
      buildings.filter((b) => b.team === t && b.type === "reactor" && alive(b))
        .length < 2
    ) {
      resources[t] -= BUILDINGS.reactor.cost;
      addBuilding(
        "reactor",
        t,
        base.x + rand(-210, 210),
        base.y + rand(-190, 190),
      );
    }
    if (resources[t] > BUILDINGS.factory.cost && fs.length < 3) {
      resources[t] -= BUILDINGS.factory.cost;
      addBuilding(
        "factory",
        t,
        base.x + rand(-230, 230),
        base.y + rand(-210, 210),
      );
    }
    if (
      resources[t] > BUILDINGS.turret.cost &&
      buildings.filter((b) => b.team === t && b.type === "turret" && alive(b))
        .length < 3
    ) {
      resources[t] -= BUILDINGS.turret.cost;
      addBuilding(
        "turret",
        t,
        base.x + rand(-150, 150),
        base.y + rand(-150, 150),
      );
    }
    const choices =
      tech[t] >= 3
        ? ["tank", "heavy", "artillery", "juggernaut"]
        : tech[t] >= 2
          ? ["tank", "heavy", "artillery"]
          : ["scout", "tank"];
    if (fs.length) {
      for (const f of fs) {
        if (f.queue.length < 4) {
          const pick = choices[Math.floor(Math.random() * choices.length)];
          queueUnit(t, pick);
        }
      }
    }
    const army = units.filter((u) => u.team === t && alive(u));
    if (army.length >= 12) {
      const targets = buildings.filter(
        (b) => b.team !== t && alive(b) && b.type === "hq",
      );
      if (targets.length) {
        targets.sort((a, b) => dist(base, a) - dist(base, b));
        const trg = targets[0];
        const attackers = army.slice(0, Math.min(army.length, 70));
        const old = formation;
        formation = "spread";
        issueMove(attackers, trg.x + rand(-110, 110), trg.y + rand(-110, 110));
        formation = old;
      }
    }
  }
}

function initialWorld() {
  buildings = [];
  units = [];
  bullets = [];
  particles = [];
  selectedUnits.clear();
  selectedBuilding = null;
  resources = [18000, 10000, 10000, 10000];
  tech = [1, 1, 1, 1];
  techProgress = [null, null, null, null];
  const ms = MAPS[$("mapSize").value];
  WORLD = { w: ms[0], h: ms[1] };
  playerCount = Number($("playerCount").value);
  popLimit = Number($("popCap").value);
  aiPopLimit = popLimit;
  const starts = [
    [420, 380],
    [WORLD.w - 420, 380],
    [420, WORLD.h - 380],
    [WORLD.w - 420, WORLD.h - 380],
  ];
  for (let t = 0; t < playerCount; t++) {
    const s = starts[t];
    addBuilding("hq", t, s[0], s[1]);
    addBuilding("factory", t, s[0] + (t % 2 === 0 ? 120 : -120), s[1] + 90);
    addBuilding("powercell", t, s[0], s[1] + 145);
    addBuilding("extractor", t, s[0] + (t % 2 === 0 ? -110 : 110), s[1] - 85);
    for (let i = 0; i < 6; i++)
      spawnUnit(
        i < 2 ? "scout" : "tank",
        t,
        s[0] + rand(-110, 110),
        s[1] + rand(-100, 100),
      );
  }
  camera.x = 420;
  camera.y = 380;
  camera.zoom = 0.9;
  buildMode = null;
  running = true;
  last = performance.now();
  activeTab = "build";
  renderActions();
  updateUI();
}

function update(dt) {
  if (!running) return;
  const pan = (470 * dt) / camera.zoom;
  if (keys.has("w") || keys.has("arrowup")) camera.y -= pan;
  if (keys.has("s") || keys.has("arrowdown")) camera.y += pan;
  if (keys.has("a") || keys.has("arrowleft")) camera.x -= pan;
  if (keys.has("d") || keys.has("arrowright")) camera.x += pan;
  camera.x = clamp(camera.x, 0, WORLD.w);
  camera.y = clamp(camera.y, 0, WORLD.h);
  incomeClock += dt;
  aiClock += dt;
  if (incomeClock >= 1) {
    while (incomeClock >= 1) {
      incomeClock -= 1;
      updateEconomy();
    }
    updateUI();
  }
  if (aiClock >= 1.15) {
    aiClock = 0;
    aiStep();
  }
  updateResearch(dt);
  for (const b of buildings) b.update(dt);
  for (const u of units) u.update(dt);
  for (const b of bullets) b.update(dt);
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.t -= dt;
  }
  units = units.filter((u) => !u.dead);
  buildings = buildings.filter((b) => !b.dead);
  bullets = bullets.filter((b) => !b.dead);
  particles = particles.filter((p) => p.t > 0);
  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) $("message").style.display = "none";
  }
  const playerAlive = !!hq(0),
    enemies = [];
  for (let t = 1; t < playerCount; t++) if (hq(t)) enemies.push(t);
  if (!playerAlive) {
    running = false;
    showMsg("DEFEAT — your Headquarters was destroyed.", 999);
  } else if (!enemies.length) {
    running = false;
    showMsg("VICTORY — all enemy Headquarters destroyed!", 999);
  }
  if (typeof window !== "undefined" && window.__ANTIGRAVITY_EFFECTS__) {
    window.__ANTIGRAVITY_EFFECTS__.update(dt);
  }
  updateUI();
}

function drawGrid() {
  const tl = screenToWorld(0, 0),
    br = screenToWorld(innerWidth, innerHeight),
    step = 100;
  ctx.strokeStyle = "rgba(255,255,255,.04)";
  ctx.lineWidth = 1;
  for (let x = Math.floor(tl.x / step) * step; x < br.x; x += step) {
    const a = worldToScreen(x, tl.y),
      b = worldToScreen(x, br.y);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  for (let y = Math.floor(tl.y / step) * step; y < br.y; y += step) {
    const a = worldToScreen(tl.x, y),
      b = worldToScreen(br.x, y);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  const a = worldToScreen(0, 0),
    b = worldToScreen(WORLD.w, WORLD.h);
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
}
function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = "#17251b";
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  drawGrid();
  for (const b of buildings) b.draw();
  for (const u of units) u.draw();
  for (const b of bullets) b.draw();
  if (typeof window !== "undefined" && window.__ANTIGRAVITY_EFFECTS__) {
    window.__ANTIGRAVITY_EFFECTS__.render(ctx, camera);
  }
  for (const p of particles) {
    const s = worldToScreen(p.x, p.y);
    ctx.globalAlpha = clamp(p.t * 2, 0, 1);
    ctx.fillStyle = p.c;
    ctx.fillRect(s.x, s.y, 3, 3);
  }
  ctx.globalAlpha = 1;
  if (pointer.down && pointer.drag && pointer.button === 0 && !buildMode) {
    ctx.strokeStyle = "#bde0ff";
    ctx.fillStyle = "rgba(88,166,255,.12)";
    const x = Math.min(pointer.startX, pointer.x),
      y = Math.min(pointer.startY, pointer.y),
      w = Math.abs(pointer.x - pointer.startX),
      h = Math.abs(pointer.y - pointer.startY);
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }
  if (buildMode) {
    const w = screenToWorld(pointer.x, pointer.y),
      def = BUILDINGS[buildMode],
      s = worldToScreen(w.x, w.y);
    if (
      typeof window !== "undefined" &&
      window.__ANTIGRAVITY_BUILDING_RENDERER__
    ) {
      window.__ANTIGRAVITY_BUILDING_RENDERER__.drawPlacementGhost(
        ctx,
        buildMode,
        s,
        camera,
        tech[0] >= def.tech,
      );
    } else {
      ctx.strokeStyle = tech[0] >= def.tech ? "#67e8b5" : "#ff7575";
      ctx.fillStyle = "rgba(99,230,190,.10)";
      ctx.strokeRect(
        s.x - (def.size / 2) * camera.zoom,
        s.y - (def.size / 2) * camera.zoom,
        def.size * camera.zoom,
        def.size * camera.zoom,
      );
    }
  }
  drawMinimap();
}

function drawMinimap() {
  const w = mini.width,
    h = mini.height;
  mctx.clearRect(0, 0, w, h);
  mctx.fillStyle = "#0f1913";
  mctx.fillRect(0, 0, w, h);
  for (const b of buildings) {
    if (!alive(b)) continue;
    mctx.fillStyle = TEAM_COLORS[b.team];
    mctx.fillRect((b.x / WORLD.w) * w - 2, (b.y / WORLD.h) * h - 2, 4, 4);
  }
  for (const u of units) {
    if (!alive(u)) continue;
    mctx.fillStyle = TEAM_COLORS[u.team];
    mctx.fillRect((u.x / WORLD.w) * w, (u.y / WORLD.h) * h, 1.6, 1.6);
  }
  const tl = screenToWorld(0, 0),
    br = screenToWorld(innerWidth, innerHeight);
  mctx.strokeStyle = "#fff";
  mctx.lineWidth = 2;
  mctx.strokeRect(
    (tl.x / WORLD.w) * w,
    (tl.y / WORLD.h) * h,
    ((br.x - tl.x) / WORLD.w) * w,
    ((br.y - tl.y) / WORLD.h) * h,
  );
}
function loop(now) {
  const dt = Math.min(0.035, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function selectedSummary() {
  if (selectedBuilding)
    return {
      title: `${selectedBuilding.name} — Level ${selectedBuilding.level}`,
      meta: `HP ${Math.ceil(selectedBuilding.hp).toLocaleString()} / ${selectedBuilding.maxHp.toLocaleString()} · Team ${TEAM_NAMES[selectedBuilding.team]}`,
      hp: selectedBuilding.hp / selectedBuilding.maxHp,
    };
  if (selectedUnits.size) {
    const arr = [...selectedUnits],
      types = {};
    let hp = 0,
      max = 0;
    for (const u of arr) {
      types[u.name] = (types[u.name] || 0) + 1;
      hp += u.hp;
      max += u.maxHp;
    }
    const desc = Object.entries(types)
      .map(([k, v]) => `${v} ${k}`)
      .join(" · ");
    return {
      title: `${arr.length} unit${arr.length === 1 ? "" : "s"} selected`,
      meta: desc,
      hp: max ? hp / max : 0,
    };
  }
  return {
    title: "Nothing selected",
    meta: "Select a unit or building.",
    hp: 0,
  };
}
function updateSelectedPanel() {
  const s = selectedSummary();
  if ($("selTitle")) $("selTitle").textContent = s.title;
  if ($("selMeta")) $("selMeta").textContent = s.meta;
  if ($("selHp")) $("selHp").style.width = s.hp * 100 + "%";
  const box = $("selActions");
  if (box) {
    box.innerHTML = "";
    if (
      selectedBuilding &&
      selectedBuilding.team === 0 &&
      selectedBuilding.upgradeable
    ) {
      const b = document.createElement("button");
      b.textContent = selectedBuilding.canUpgrade()
        ? `Upgrade L${selectedBuilding.level + 1} · ₿${selectedBuilding.upgradeCost().toLocaleString()}`
        : "Upgrade locked/max";
      b.disabled = !selectedBuilding.canUpgrade();
      b.onclick = upgradeSelected;
      box.appendChild(b);
    }
    if (selectedUnits.size === 1) {
      const u = [...selectedUnits][0];
      const t = document.createElement("button");
      t.textContent = u.veterancy();
      t.disabled = true;
      box.appendChild(t);
    }
  }

  // Update Antigravity modern HUD Selection Panel with portrait and telemetry
  if (typeof window !== "undefined" && window.__ANTIGRAVITY_HUD__) {
    if (selectedBuilding && alive(selectedBuilding)) {
      const b = selectedBuilding;
      const portraitMap = {
        hq: "/assets/portraits/headquarters.jpg",
        powercell: "/assets/portraits/power_cell.jpg",
        extractor: "/assets/portraits/extractor.jpg",
        factory: "/assets/portraits/vehicle_factory.jpg",
        turret: "/assets/portraits/defense_turret.jpg",
        wind: "/assets/portraits/power_cell.jpg",
        reactor: "/assets/portraits/power_cell.jpg",
        fusion: "/assets/portraits/power_cell.jpg",
        artilleryTurret: "/assets/portraits/defense_turret.jpg",
        shield: "/assets/portraits/defense_turret.jpg",
      };
      window.__ANTIGRAVITY_HUD__.updateSelection(
        b.name,
        `Level ${b.level} · ${TEAM_NAMES[b.team]}`,
        b.hp / b.maxHp,
        b.level,
        b.tech,
        portraitMap[b.type] || "/assets/portraits/headquarters.jpg",
        {
          atk: b.damage || 0,
          rng: b.range || 0,
          arm: Math.round(b.maxHp / 100),
          spd: 0,
        },
      );
    } else if (selectedUnits.size === 1) {
      const u = [...selectedUnits][0];
      const portraitMap = {
        scout: "/assets/portraits/scout.jpg",
        tank: "/assets/portraits/tank.jpg",
        heavy: "/assets/portraits/heavy_tank.jpg",
        artillery: "/assets/portraits/artillery.jpg",
        juggernaut: "/assets/portraits/juggernaut.jpg",
      };
      window.__ANTIGRAVITY_HUD__.updateSelection(
        u.name,
        `${u.veterancy()} · ${u.role}`,
        u.hp / u.maxHp,
        u.rank,
        u.tech,
        portraitMap[u.type] || "/assets/portraits/tank.jpg",
        {
          atk: Math.round(u.damage * (1 + u.rank * 0.04)),
          rng: u.range,
          arm: Math.round(u.maxHp / 20),
          spd: u.speed,
        },
      );
    } else if (selectedUnits.size > 1) {
      window.__ANTIGRAVITY_HUD__.updateSelection(
        s.title,
        s.meta,
        s.hp,
        0,
        1,
        undefined,
        undefined,
      );
    } else {
      window.__ANTIGRAVITY_HUD__.updateSelection(
        "Tactical Grid",
        "Awaiting entity selection",
        0,
        0,
        1,
        undefined,
        undefined,
      );
    }
  }
}
function updateUI() {
  const p = teamPower(0);
  const ore = Math.floor(resources[0]);
  const powerUse = p.use;
  const powerGen = p.gen;
  const pop = teamPop(0);
  const popCap = popLimit;
  const techStr = techProgress[0]
    ? `${tech[0]} → ${techProgress[0].next}`
    : tech[0];
  const selCount = selectedUnits.size;

  if ($("ore")) $("ore").textContent = ore.toLocaleString();
  if ($("power"))
    $("power").textContent =
      `${powerUse.toLocaleString()} / ${powerGen.toLocaleString()}${powerUse > powerGen ? " ⚠" : ""}`;
  if ($("pop")) $("pop").textContent = `${pop} / ${popCap}`;
  if ($("tech")) $("tech").textContent = techStr;
  if ($("sel")) $("sel").textContent = selCount;

  if (typeof window !== "undefined" && window.__ANTIGRAVITY_HUD__) {
    window.__ANTIGRAVITY_HUD__.updateResources(
      ore,
      powerUse,
      powerGen,
      pop,
      popCap,
      techStr,
      selCount,
    );
  }
  updateSelectedPanel();
}

const TAB_CONTENT = {
  build: ["powercell", "extractor", "factory", "wind", "reactor", "fusion"],
  defense: ["turret", "artilleryTurret", "shield"],
  units: ["scout", "tank", "heavy", "artillery", "juggernaut"],
};
function actionButton(label, sub, disabled, fn, locked = false) {
  const b = document.createElement("button");
  b.innerHTML = `${label}<small>${sub}</small>`;
  b.disabled = disabled;
  b.classList.toggle("locked", locked);
  b.addEventListener("click", fn);
  return b;
}
function renderActions() {
  const box = $("actions");
  box.innerHTML = "";
  document
    .querySelectorAll("#tabs button")
    .forEach((b) => b.classList.toggle("active", b.dataset.tab === activeTab));
  if (activeTab === "build" || activeTab === "defense") {
    for (const type of TAB_CONTENT[activeTab]) {
      const d = BUILDINGS[type],
        locked = tech[0] < d.tech;
      box.appendChild(
        actionButton(
          d.name,
          locked
            ? `Tech ${d.tech} required`
            : `₿${d.cost.toLocaleString()} · T${d.tech}`,
          locked,
          () => {
            buildMode = type;
            selectedBuilding = null;
            selectedUnits.clear();
            showMsg(`Place ${d.name} on the battlefield.`);
          },
          locked,
        ),
      );
    }
  } else if (activeTab === "units") {
    for (const type of TAB_CONTENT.units) {
      const u = UNIT_TYPES[type],
        locked = tech[0] < u.tech;
      box.appendChild(
        actionButton(
          u.name,
          locked
            ? `Tech ${u.tech} required`
            : `₿${u.cost.toLocaleString()} · Pop ${u.pop}`,
          locked,
          () => {
            if (!queueUnit(0, type))
              showMsg("Need a factory, ore, tech level, or population room.");
            else showMsg(`${u.name} added to production queue.`);
          },
          locked,
        ),
      );
    }
  } else if (activeTab === "tech") {
    if (tech[0] === 1) {
      const t = TECH[2];
      box.appendChild(
        actionButton(
          "Research Tech 2",
          `₿${t.cost.toLocaleString()} · ${t.time}s`,
          !!techProgress[0],
          () => {
            if (!beginResearch(0, 2))
              showMsg("Not enough ore or research already running.");
          },
        ),
      );
    } else if (tech[0] === 2) {
      const t = TECH[3];
      box.appendChild(
        actionButton(
          "Research Tech 3",
          `₿${t.cost.toLocaleString()} · ${t.time}s`,
          !!techProgress[0],
          () => {
            if (!beginResearch(0, 3))
              showMsg("Not enough ore or research already running.");
          },
        ),
      );
    } else
      box.appendChild(
        actionButton(
          "Tech 3 Complete",
          "All prototype tech unlocked",
          true,
          () => {},
        ),
      );
    if (techProgress[0]) {
      const r = techProgress[0];
      box.appendChild(
        actionButton(
          "Researching…",
          `${Math.floor((r.progress / r.time) * 100)}%`,
          true,
          () => {},
        ),
      );
    }
  } else if (activeTab === "orders") {
    for (const f of ["box", "line", "wedge", "column", "spread"]) {
      const b = actionButton(
        f[0].toUpperCase() + f.slice(1),
        "Formation",
        false,
        () => {
          formation = f;
          renderActions();
          showMsg(`${f} formation selected.`);
        },
      );
      if (f === formation) b.classList.add("active");
      box.appendChild(b);
    }
    box.appendChild(
      actionButton("Center Selection", "Camera", !selectedUnits.size, () => {
        const arr = [...selectedUnits];
        if (arr.length) {
          camera.x = arr.reduce((s, u) => s + u.x, 0) / arr.length;
          camera.y = arr.reduce((s, u) => s + u.y, 0) / arr.length;
        }
      }),
    );
  }
}

document.querySelectorAll("#tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    activeTab = b.dataset.tab;
    buildMode = null;
    renderActions();
  }),
);
$("startBtn").addEventListener("click", () => {
  $("startOverlay").style.display = "none";
  initialWorld();
});
addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const before = screenToWorld(e.clientX, e.clientY);
    camera.zoom = clamp(camera.zoom * (e.deltaY < 0 ? 1.12 : 0.89), 0.34, 1.9);
    const after = screenToWorld(e.clientX, e.clientY);
    camera.x += before.x - after.x;
    camera.y += before.y - after.y;
  },
  { passive: false },
);
mini.addEventListener("pointerdown", (e) => {
  const r = mini.getBoundingClientRect();
  camera.x = clamp(((e.clientX - r.left) / r.width) * WORLD.w, 0, WORLD.w);
  camera.y = clamp(((e.clientY - r.top) / r.height) * WORLD.h, 0, WORLD.h);
});

function pointerDown(x, y, button, touch = false) {
  pointer.x = x;
  pointer.y = y;
  pointer.startX = x;
  pointer.startY = y;
  pointer.down = true;
  pointer.drag = false;
  pointer.button = button;
  pointer.touch = touch;
}
function pointerMove(x, y) {
  if (pointer.down && Math.hypot(x - pointer.startX, y - pointer.startY) > 8)
    pointer.drag = true;
  pointer.x = x;
  pointer.y = y;
}
function hitBuilding(w, team = 0) {
  let best = null,
    bd = 40 / camera.zoom;
  for (const b of buildings)
    if (b.team === team && alive(b)) {
      const d = Math.hypot(b.x - w.x, b.y - w.y);
      if (d < Math.max(b.size * 0.7, bd)) {
        bd = d;
        best = b;
      }
    }
  return best;
}
function pointerUp(x, y, button, touch = false) {
  pointer.x = x;
  pointer.y = y;
  const w = screenToWorld(x, y);
  if (buildMode && button === 0) {
    const def = BUILDINGS[buildMode];
    if (tech[0] < def.tech) showMsg(`Requires Tech ${def.tech}.`);
    else if (resources[0] < def.cost) showMsg("Not enough ore.");
    else if (
      def.powerUse > 0 &&
      teamPower(0).gen < teamPower(0).use + def.powerUse
    )
      showMsg(
        "Warning: insufficient power capacity. Build more generators first.",
      );
    else {
      resources[0] -= def.cost;
      addBuilding(buildMode, 0, w.x, w.y);
      showMsg(`${def.name} constructed.`);
      if (typeof window !== "undefined" && window.__ANTIGRAVITY_SOUND__) {
        window.__ANTIGRAVITY_SOUND__.playPlacement();
      }
    }
    buildMode = null;
    pointer.down = false;
    return;
  }
  if (
    button === 2 ||
    (touch && !pointer.drag && selectedUnits.size > 0 && !hitBuilding(w, 0))
  ) {
    issueMove([...selectedUnits], w.x, w.y);
    pointer.down = false;
    return;
  }
  if (button === 0) {
    if (pointer.drag) {
      const a = screenToWorld(
          Math.min(pointer.startX, x),
          Math.min(pointer.startY, y),
        ),
        b = screenToWorld(
          Math.max(pointer.startX, x),
          Math.max(pointer.startY, y),
        );
      selectedUnits.clear();
      selectedBuilding = null;
      for (const u of units)
        if (
          u.team === 0 &&
          alive(u) &&
          u.x >= a.x &&
          u.x <= b.x &&
          u.y >= a.y &&
          u.y <= b.y
        )
          selectedUnits.add(u);
    } else {
      let hitU = null,
        bd = 24 / camera.zoom;
      for (const u of units)
        if (u.team === 0 && alive(u)) {
          const d = Math.hypot(u.x - w.x, u.y - w.y);
          if (d < bd) {
            bd = d;
            hitU = u;
          }
        }
      if (hitU) {
        selectedUnits.clear();
        selectedUnits.add(hitU);
        selectedBuilding = null;
      } else {
        const hb = hitBuilding(w, 0);
        selectedUnits.clear();
        selectedBuilding = hb;
        if (!hb && !touch) selectedBuilding = null;
      }
    }
  }
  pointer.down = false;
  updateSelectedPanel();
}
canvas.addEventListener("mousedown", (e) =>
  pointerDown(e.clientX, e.clientY, e.button, false),
);
canvas.addEventListener("mousemove", (e) => pointerMove(e.clientX, e.clientY));
canvas.addEventListener("mouseup", (e) =>
  pointerUp(e.clientX, e.clientY, e.button, false),
);
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    pointerDown(t.clientX, t.clientY, 0, true);
  },
  { passive: false },
);
canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    pointerMove(t.clientX, t.clientY);
  },
  { passive: false },
);
canvas.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    pointerUp(t.clientX, t.clientY, 0, true);
  },
  { passive: false },
);

renderActions();
updateUI();

window.__ANTIGRAVITY_GAME__ = {
  stopUnits: () => {
    for (const u of selectedUnits) {
      u.tx = u.x;
      u.ty = u.y;
      u.target = null;
    }
    showMsg("Units holding position.");
  },
  deselectAll: () => {
    selectedUnits.clear();
    selectedBuilding = null;
    updateSelectedPanel();
  },
  retreatUnits: () => {
    const base = hq(0);
    if (base && selectedUnits.size) {
      issueMove([...selectedUnits], base.x + 80, base.y + 80);
      showMsg("Tactical retreat ordered to Headquarters.");
    }
  },
  setAttackMode: () => {
    showMsg("Attack mode active — select target or ground.");
  },
  setMoveMode: () => {
    showMsg("Move mode active — tap ground destination.");
  },
  upgradeSelectedBuilding: () => {
    upgradeSelected();
  },
  getSelectedUnits: () => [...selectedUnits],
  getSelectedBuilding: () => selectedBuilding,
};

