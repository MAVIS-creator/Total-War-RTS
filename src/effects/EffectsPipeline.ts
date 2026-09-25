/**
 * Total War RTS - Advanced Military Sci-Fi Visual Effects (VFX) Pipeline
 * Implements high-performance procedural rendering for projectiles, muzzle flashes,
 * tracers, ballistic shells, missile contrails, multi-stage explosions, shield bubbles,
 * repair/welding beams, smoke plumes, and holographic research beacons.
 */

import { TeamColorPipeline } from '../rendering/team/TeamColorPipeline';

export interface CameraView {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  drag: number;
  gravity?: number;
  rotation?: number;
  vRot?: number;
}

interface MuzzleFlash {
  x: number;
  y: number;
  angle: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Tracer {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  x: number;
  y: number;
  speed: number;
  progress: number;
  color: string;
  coreColor: string;
  length: number;
  width: number;
  dead: boolean;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

interface ShellProjectile {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  x: number;
  y: number;
  progress: number;
  speed: number;
  arcHeight: number;
  dead: boolean;
  smokeTimer: number;
}

interface MissileProjectile {
  x: number;
  y: number;
  target: { x: number; y: number; dead?: boolean };
  speed: number;
  angle: number;
  dead: boolean;
  smokeTimer: number;
  team: number;
}

interface Explosion {
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
  isLarge: boolean;
  shockwaveRadius: number;
  maxShockwave: number;
  color: string;
}

interface ShieldHitEffect {
  x: number;
  y: number;
  radius: number;
  hitAngle: number;
  life: number;
  maxLife: number;
  color: string;
}

interface RepairBeamEffect {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  life: number;
  maxLife: number;
  color: string;
}

interface ResearchBeaconEffect {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
}

export class EffectsPipeline {
  // Particle pools & active lists
  private static particles: Particle[] = [];
  private static muzzleFlashes: MuzzleFlash[] = [];
  private static tracers: Tracer[] = [];
  private static shells: ShellProjectile[] = [];
  private static missiles: MissileProjectile[] = [];
  private static explosions: Explosion[] = [];
  private static shieldHits: ShieldHitEffect[] = [];
  private static repairBeams: RepairBeamEffect[] = [];
  private static researchBeacons: ResearchBeaconEffect[] = [];

  // Performance caps
  private static readonly MAX_PARTICLES = 650;
  private static readonly MAX_EXPLOSIONS = 40;

  /**
   * Spawns a high-emissive directional muzzle flash
   */
  static spawnMuzzleFlash(
    x: number,
    y: number,
    angle: number,
    size = 18,
    color = '#ffaa33'
  ): void {
    this.muzzleFlashes.push({
      x,
      y,
      angle,
      size,
      color,
      life: 0.08,
      maxLife: 0.08,
    });

    // Muzzle smoke puff
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let i = 0; i < 3; i++) {
      this.spawnSmoke(
        x + cos * (size * 0.5),
        y + sin * (size * 0.5),
        cos * 40 + (Math.random() - 0.5) * 20,
        sin * 40 + (Math.random() - 0.5) * 20,
        size * 0.4,
        0.35,
        'rgba(180, 190, 200, 0.4)'
      );
    }
  }

  /**
   * Spawns a high-speed laser tracer
   */
  static spawnTracer(
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    speed = 650,
    color = '#00d2ff',
    width = 2.5
  ): void {
    const dist = Math.hypot(tx - sx, ty - sy);
    if (dist <= 0) return;

    this.tracers.push({
      sx,
      sy,
      tx,
      ty,
      x: sx,
      y: sy,
      speed,
      progress: 0,
      color,
      coreColor: '#ffffff',
      length: Math.min(36, dist * 0.4),
      width,
      dead: false,
      trail: [],
    });
  }

  /**
   * Spawns a parabolic ballistic artillery shell with smoke trail
   */
  static spawnBallisticShell(
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    speed = 360,
    arcHeight = 70
  ): void {
    this.shells.push({
      sx,
      sy,
      tx,
      ty,
      x: sx,
      y: sy,
      progress: 0,
      speed,
      arcHeight,
      dead: false,
      smokeTimer: 0,
    });
  }

  /**
   * Spawns a guided rocket/missile with billowing exhaust contrail
   */
  static spawnMissile(
    x: number,
    y: number,
    target: { x: number; y: number; dead?: boolean },
    speed = 400,
    team = 0
  ): void {
    const angle = Math.atan2(target.y - y, target.x - x);
    this.missiles.push({
      x,
      y,
      target,
      speed,
      angle,
      dead: false,
      smokeTimer: 0,
      team,
    });
  }

  /**
   * Spawns high-velocity ricochet / armor impact sparks
   */
  static spawnImpactSparks(
    x: number,
    y: number,
    normalAngle?: number,
    count = 14,
    color = '#ffd166'
  ): void {
    const baseAngle = normalAngle ?? Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.MAX_PARTICLES) break;
      const angle = baseAngle + (Math.random() - 0.5) * 1.6;
      const speed = 70 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2,
        maxSize: 3,
        color,
        alpha: 1,
        life: 0.2 + Math.random() * 0.35,
        maxLife: 0.5,
        drag: 0.92,
        gravity: 60,
      });
    }
  }

  /**
   * Spawns a multi-stage explosion: flash -> shockwave -> fireballs -> debris -> smoke
   */
  static spawnExplosion(x: number, y: number, size = 30, isLarge = false): void {
    if (this.explosions.length >= this.MAX_EXPLOSIONS) {
      this.explosions.shift();
    }

    const duration = isLarge ? 0.95 : 0.55;
    this.explosions.push({
      x,
      y,
      size,
      life: duration,
      maxLife: duration,
      isLarge,
      shockwaveRadius: 0,
      maxShockwave: size * (isLarge ? 2.4 : 1.7),
      color: isLarge ? '#ff5522' : '#ffaa33',
    });

    // 1. Shrapnel Debris Sparks
    const shrapnelCount = isLarge ? 24 : 10;
    for (let i = 0; i < shrapnelCount; i++) {
      if (this.particles.length >= this.MAX_PARTICLES) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = (isLarge ? 90 : 50) + Math.random() * (isLarge ? 240 : 120);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        maxSize: 4,
        color: Math.random() > 0.4 ? '#ffdd66' : '#ff4411',
        alpha: 1,
        life: 0.4 + Math.random() * (isLarge ? 0.6 : 0.3),
        maxLife: 1.0,
        drag: 0.91,
        gravity: 40,
      });
    }

    // 2. Lingering Volumetric Smoke Puffs
    const smokeCount = isLarge ? 16 : 6;
    for (let i = 0; i < smokeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (size * 0.45);
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      const smokeSpeed = 10 + Math.random() * 30;
      this.spawnSmoke(
        px,
        py,
        Math.cos(angle) * smokeSpeed,
        Math.sin(angle) * smokeSpeed - 18,
        (size * 0.3) + Math.random() * (size * 0.4),
        isLarge ? 1.4 : 0.8,
        Math.random() > 0.5 ? 'rgba(30, 36, 42, 0.7)' : 'rgba(50, 58, 68, 0.6)'
      );
    }
  }

  /**
   * Spawns localized volumetric smoke particle
   */
  static spawnSmoke(
    x: number,
    y: number,
    vx: number,
    vy: number,
    size = 12,
    duration = 0.8,
    color = 'rgba(40, 48, 56, 0.6)'
  ): void {
    if (this.particles.length >= this.MAX_PARTICLES) return;
    this.particles.push({
      x,
      y,
      vx,
      vy,
      size,
      maxSize: size * 1.8,
      color,
      alpha: 0.8,
      life: duration,
      maxLife: duration,
      drag: 0.96,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 1.5,
    });
  }

  /**
   * Spawns a shield impact ripple wave
   */
  static spawnShieldHit(x: number, y: number, radius: number, hitAngle: number, color = '#00d2ff'): void {
    this.shieldHits.push({
      x,
      y,
      radius,
      hitAngle,
      life: 0.35,
      maxLife: 0.35,
      color,
    });
  }

  /**
   * Spawns an articulated nanite repair or construction welding beam
   */
  static spawnRepairBeam(sx: number, sy: number, tx: number, ty: number, color = '#00d2ff'): void {
    this.repairBeams.push({
      sx,
      sy,
      tx,
      ty,
      life: 0.12,
      maxLife: 0.12,
      color,
    });

    // Welding sparks shower at contact point
    this.spawnImpactSparks(tx, ty, undefined, 4, '#63e2ff');
  }

  /**
   * Spawns holographic research or tech promotion beacon
   */
  static spawnResearchBeacon(x: number, y: number, maxRadius = 90): void {
    this.researchBeacons.push({
      x,
      y,
      radius: 5,
      maxRadius,
      life: 1.2,
      maxLife: 1.2,
    });
  }

  /**
   * Updates all active VFX simulation states
   */
  static update(dt: number): void {
    // 1. Muzzle Flashes
    for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
      const mf = this.muzzleFlashes[i];
      if (!mf) continue;
      mf.life -= dt;
      if (mf.life <= 0) {
        this.muzzleFlashes.splice(i, 1);
      }
    }

    // 2. Laser Tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      if (!t) continue;
      const dx = t.tx - t.sx;
      const dy = t.ty - t.sy;
      const totalDist = Math.hypot(dx, dy);
      const step = (t.speed * dt) / totalDist;
      t.progress += step;

      t.x = t.sx + dx * t.progress;
      t.y = t.sy + dy * t.progress;

      t.trail.push({ x: t.x, y: t.y, alpha: 1.0 });
      if (t.trail.length > 5) t.trail.shift();

      if (t.progress >= 1.0) {
        t.dead = true;
        this.spawnImpactSparks(t.tx, t.ty, Math.atan2(dy, dx) + Math.PI, 6, t.color);
        this.tracers.splice(i, 1);
      }
    }

    // 3. Artillery Shells
    for (let i = this.shells.length - 1; i >= 0; i--) {
      const s = this.shells[i];
      if (!s) continue;
      const dx = s.tx - s.sx;
      const dy = s.ty - s.sy;
      const totalDist = Math.hypot(dx, dy);
      const step = (s.speed * dt) / Math.max(1, totalDist);
      s.progress += step;

      s.x = s.sx + dx * s.progress;
      s.y = s.sy + dy * s.progress;

      s.smokeTimer += dt;
      if (s.smokeTimer >= 0.04) {
        s.smokeTimer = 0;
        const arcY = Math.sin(s.progress * Math.PI) * s.arcHeight;
        this.spawnSmoke(s.x, s.y - arcY, 0, -5, 8, 0.45, 'rgba(160, 170, 180, 0.4)');
      }

      if (s.progress >= 1.0) {
        s.dead = true;
        this.spawnExplosion(s.tx, s.ty, 38, true);
        this.shells.splice(i, 1);
      }
    }

    // 4. Guided Missiles
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      if (!m) continue;
      if (m.target && !m.target.dead) {
        const targetAngle = Math.atan2(m.target.y - m.y, m.target.x - m.x);
        let diff = targetAngle - m.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        m.angle += diff * Math.min(1, dt * 6);
      }

      const vx = Math.cos(m.angle) * m.speed;
      const vy = Math.sin(m.angle) * m.speed;
      m.x += vx * dt;
      m.y += vy * dt;

      m.smokeTimer += dt;
      if (m.smokeTimer >= 0.035) {
        m.smokeTimer = 0;
        const tailX = m.x - Math.cos(m.angle) * 12;
        const tailY = m.y - Math.sin(m.angle) * 12;
        this.spawnSmoke(tailX, tailY, -vx * 0.15, -vy * 0.15, 6, 0.5, 'rgba(230, 235, 240, 0.65)');
      }

      if (m.target) {
        const d = Math.hypot(m.target.x - m.x, m.target.y - m.y);
        if (d < 16) {
          m.dead = true;
          this.spawnExplosion(m.x, m.y, 42, true);
          this.missiles.splice(i, 1);
        }
      }
    }

    // 5. Explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      if (!exp) continue;
      exp.life -= dt;
      const p = 1 - exp.life / exp.maxLife;
      exp.shockwaveRadius = exp.maxShockwave * Math.sin(p * Math.PI * 0.5);

      if (exp.life <= 0) {
        this.explosions.splice(i, 1);
      }
    }

    // 6. Shield Hits
    for (let i = this.shieldHits.length - 1; i >= 0; i--) {
      const sh = this.shieldHits[i];
      if (!sh) continue;
      sh.life -= dt;
      if (sh.life <= 0) {
        this.shieldHits.splice(i, 1);
      }
    }

    // 7. Repair Beams
    for (let i = this.repairBeams.length - 1; i >= 0; i--) {
      const rb = this.repairBeams[i];
      if (!rb) continue;
      rb.life -= dt;
      if (rb.life <= 0) {
        this.repairBeams.splice(i, 1);
      }
    }

    // 8. Research Beacons
    for (let i = this.researchBeacons.length - 1; i >= 0; i--) {
      const b = this.researchBeacons[i];
      if (!b) continue;
      b.life -= dt;
      const p = 1 - b.life / b.maxLife;
      b.radius = b.maxRadius * p;
      if (b.life <= 0) {
        this.researchBeacons.splice(i, 1);
      }
    }

    // 9. Standard Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= p.drag;
      p.vy *= p.drag;
      if (p.gravity) p.vy += p.gravity * dt;
      if (p.rotation !== undefined && p.vRot) p.rotation += p.vRot * dt;

      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, Math.min(1, progress));
      p.size += (p.maxSize - p.size) * (1 - progress) * 0.1;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Main rendering pass for all VFX in world space with camera transform
   */
  static render(ctx: CanvasRenderingContext2D, camera: CameraView): void {
    const zoom = camera.zoom;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    const toScreen = (wx: number, wy: number) => ({
      x: (wx - camera.x) * zoom + viewW / 2,
      y: (wy - camera.y) * zoom + viewH / 2,
    });

    const isVisible = (sx: number, sy: number, pad = 80) =>
      sx >= -pad && sx <= viewW + pad && sy >= -pad && sy <= viewH + pad;

    ctx.save();

    // 1. Repair Beams
    for (const rb of this.repairBeams) {
      const s = toScreen(rb.sx, rb.sy);
      const e = toScreen(rb.tx, rb.ty);
      const alpha = rb.life / rb.maxLife;

      ctx.strokeStyle = rb.color;
      ctx.lineWidth = Math.max(1.5, 3 * zoom);
      ctx.globalAlpha = alpha * 0.8;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();

      // Inner intense core beam
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(0.8, 1.2 * zoom);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
    }

    // 2. Laser Tracers
    for (const t of this.tracers) {
      const p = toScreen(t.x, t.y);
      if (!isVisible(p.x, p.y, 40)) continue;

      const angle = Math.atan2(t.ty - t.sy, t.tx - t.sx);
      const len = t.length * zoom;

      const tailX = p.x - Math.cos(angle) * len;
      const tailY = p.y - Math.sin(angle) * len;

      // Glow halo
      ctx.strokeStyle = t.color;
      ctx.lineWidth = Math.max(2, t.width * 2 * zoom);
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Sharp white laser core
      ctx.strokeStyle = t.coreColor;
      ctx.lineWidth = Math.max(1, t.width * zoom);
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // 3. Artillery Shells
    for (const s of this.shells) {
      const arcY = Math.sin(s.progress * Math.PI) * s.arcHeight;
      const p = toScreen(s.x, s.y - arcY);
      if (!isVisible(p.x, p.y, 30)) continue;

      ctx.fillStyle = '#ffaa22';
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, 3.5 * zoom), 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Missiles
    for (const m of this.missiles) {
      const p = toScreen(m.x, m.y);
      if (!isVisible(p.x, p.y, 30)) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(m.angle);

      // Rocket flame jet
      ctx.fillStyle = '#ffaa00';
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(-10 * zoom, 0);
      ctx.lineTo(-16 * zoom, -2 * zoom);
      ctx.lineTo(-20 * zoom, 0);
      ctx.lineTo(-16 * zoom, 2 * zoom);
      ctx.closePath();
      ctx.fill();

      // Missile hull
      ctx.fillStyle = '#e0e6ed';
      ctx.fillRect(-8 * zoom, -2 * zoom, 14 * zoom, 4 * zoom);
      ctx.fillStyle = TeamColorPipeline.getPalette(m.team).primary;
      ctx.fillRect(-2 * zoom, -2 * zoom, 4 * zoom, 4 * zoom);

      ctx.restore();
    }

    // 5. Muzzle Flashes
    for (const mf of this.muzzleFlashes) {
      const p = toScreen(mf.x, mf.y);
      if (!isVisible(p.x, p.y, 30)) continue;

      const alpha = mf.life / mf.maxLife;
      const s = mf.size * zoom * (0.8 + 0.4 * (1 - alpha));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(mf.angle);

      // Diamond blast petals
      ctx.fillStyle = mf.color;
      ctx.globalAlpha = alpha * 0.85;
      ctx.beginPath();
      ctx.moveTo(s * 1.5, 0);
      ctx.lineTo(s * 0.4, -s * 0.6);
      ctx.lineTo(0, 0);
      ctx.lineTo(s * 0.4, s * 0.6);
      ctx.closePath();
      ctx.fill();

      // High-emissive white core
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s * 0.3, 0, s * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 6. Particles (Sparks & Smoke)
    for (const p of this.particles) {
      const s = toScreen(p.x, p.y);
      if (!isVisible(s.x, s.y, 20)) continue;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.rotation !== undefined) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(p.rotation);
        const sz = p.size * zoom;
        ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      } else {
        const sz = Math.max(1, p.size * zoom);
        ctx.beginPath();
        ctx.arc(s.x, s.y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 7. Explosions (Shockwaves & Fireballs)
    for (const exp of this.explosions) {
      const p = toScreen(exp.x, exp.y);
      if (!isVisible(p.x, p.y, exp.maxShockwave * zoom)) continue;

      const progress = 1 - exp.life / exp.maxLife;
      const alpha = 1 - progress;

      // Shockwave ring
      if (exp.shockwaveRadius > 0) {
        ctx.strokeStyle = exp.color;
        ctx.lineWidth = Math.max(1.5, 3 * zoom * alpha);
        ctx.globalAlpha = alpha * 0.75;
        ctx.beginPath();
        ctx.arc(p.x, p.y, exp.shockwaveRadius * zoom, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Fireball core
      const coreR = exp.size * zoom * Math.sin(progress * Math.PI) * 0.85;
      if (coreR > 1) {
        // Outer flame
        ctx.fillStyle = exp.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, coreR, 0, Math.PI * 2);
        ctx.fill();

        // Inner searing white core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha * 0.95;
        ctx.beginPath();
        ctx.arc(p.x, p.y, coreR * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 8. Shield Hits
    for (const sh of this.shieldHits) {
      const p = toScreen(sh.x, sh.y);
      if (!isVisible(p.x, p.y, sh.radius * zoom)) continue;

      const alpha = sh.life / sh.maxLife;
      const r = sh.radius * zoom;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.strokeStyle = sh.color;
      ctx.lineWidth = Math.max(2, 4 * zoom * alpha);
      ctx.globalAlpha = alpha * 0.9;

      // Ripple arc centered at hitAngle
      ctx.beginPath();
      ctx.arc(0, 0, r, sh.hitAngle - 0.6, sh.hitAngle + 0.6);
      ctx.stroke();

      ctx.restore();
    }

    // 9. Research Holographic Beacon
    for (const b of this.researchBeacons) {
      const p = toScreen(b.x, b.y);
      if (!isVisible(p.x, p.y, b.radius * zoom)) continue;

      const alpha = b.life / b.maxLife;
      const r = b.radius * zoom;

      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = Math.max(1.5, 2.5 * zoom);
      ctx.globalAlpha = alpha * 0.8;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Clear all active visual effects
   */
  static clear(): void {
    this.particles = [];
    this.muzzleFlashes = [];
    this.tracers = [];
    this.shells = [];
    this.missiles = [];
    this.explosions = [];
    this.shieldHits = [];
    this.repairBeams = [];
    this.researchBeacons = [];
  }
}
