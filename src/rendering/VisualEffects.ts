/**
 * High-performance military sci-fi visual rendering effects & reticles
 */

export class VisualEffects {
  /**
   * Draws military angular corner brackets around a selected entity
   */
  static drawSelectionReticle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    zoom: number,
    color = '#00d2d3'
  ): void {
    const s = radius * zoom * 1.5;
    const len = Math.max(4, s * 0.35);

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.5, 2 * zoom);

    // 4 Corner Brackets
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(-s, -s + len);
    ctx.lineTo(-s, -s);
    ctx.lineTo(-s + len, -s);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(s - len, -s);
    ctx.lineTo(s, -s);
    ctx.lineTo(s, -s + len);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(-s, s - len);
    ctx.lineTo(-s, s);
    ctx.lineTo(-s + len, s);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(s - len, s);
    ctx.lineTo(s, s);
    ctx.lineTo(s, s - len);
    ctx.stroke();

    // Subtle inner circular reticle
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 210, 211, 0.25)';
    ctx.lineWidth = 1;
    ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draws a building blueprint placement ghost with valid/invalid state and optional defense range ring
   */
  static drawPlacementGhost(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number,
    size: number,
    zoom: number,
    valid: boolean,
    range?: number
  ): void {
    const s = size * zoom;
    const color = valid ? '#00d2d3' : '#ff6b6b';
    const fillAlpha = valid ? 'rgba(0, 210, 211, 0.15)' : 'rgba(255, 107, 107, 0.18)';

    ctx.save();
    ctx.translate(screenX, screenY);

    // 1. Footprint fill & border
    ctx.fillStyle = fillAlpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.5, 2 * zoom);
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.strokeRect(-s / 2, -s / 2, s, s);

    // 2. Blueprint internal grid lines
    ctx.strokeStyle = valid ? 'rgba(0, 210, 211, 0.35)' : 'rgba(255, 107, 107, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-s / 2, 0);
    ctx.lineTo(s / 2, 0);
    ctx.moveTo(0, -s / 2);
    ctx.lineTo(0, s / 2);
    ctx.stroke();

    // 3. Optional defense engagement range ring
    if (range && range > 0) {
      const r = range * zoom;
      ctx.beginPath();
      ctx.strokeStyle = valid ? 'rgba(0, 210, 211, 0.45)' : 'rgba(255, 107, 107, 0.45)';
      ctx.fillStyle = valid ? 'rgba(0, 210, 211, 0.05)' : 'rgba(255, 107, 107, 0.05)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6 * zoom, 4 * zoom]);
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  /**
   * Draws a crisp, segmented military health bar
   */
  static drawHealthBar(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number,
    width: number,
    height: number,
    percent: number
  ): void {
    const p = Math.max(0, Math.min(1, percent));
    const fillW = width * p;

    ctx.save();
    // Background slot
    ctx.fillStyle = '#0a0f14';
    ctx.strokeStyle = '#293847';
    ctx.lineWidth = 1;
    ctx.fillRect(screenX, screenY, width, height);
    ctx.strokeRect(screenX, screenY, width, height);

    // Tiered color: green -> amber -> red
    let color = '#1dd1a1';
    if (p <= 0.25) {
      color = '#ff6b6b';
    } else if (p <= 0.5) {
      color = '#feca57';
    }

    ctx.fillStyle = color;
    ctx.fillRect(screenX, screenY, fillW, height);
    ctx.restore();
  }

  /**
   * Draws localized shield bubble deflection glow
   */
  static drawShieldBubble(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number,
    radius: number,
    zoom: number
  ): void {
    const r = radius * zoom;
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.strokeStyle = 'rgba(72, 219, 251, 0.7)';
    ctx.fillStyle = 'rgba(72, 219, 251, 0.08)';
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Spawn a directional muzzle flash effect
   */
  static spawnMuzzleFlash(x: number, y: number, angle: number, size?: number, color?: string): void {
    if (typeof window !== 'undefined' && window.__ANTIGRAVITY_EFFECTS__) {
      window.__ANTIGRAVITY_EFFECTS__.spawnMuzzleFlash(x, y, angle, size, color);
    }
  }

  /**
   * Spawn an explosion effect (small or large)
   */
  static spawnExplosion(x: number, y: number, size?: number, isLarge?: boolean): void {
    if (typeof window !== 'undefined' && window.__ANTIGRAVITY_EFFECTS__) {
      window.__ANTIGRAVITY_EFFECTS__.spawnExplosion(x, y, size, isLarge);
    }
  }

  /**
   * Spawn high-velocity impact sparks
   */
  static spawnImpactSparks(x: number, y: number, normalAngle?: number, count?: number, color?: string): void {
    if (typeof window !== 'undefined' && window.__ANTIGRAVITY_EFFECTS__) {
      window.__ANTIGRAVITY_EFFECTS__.spawnImpactSparks(x, y, normalAngle, count, color);
    }
  }

  /**
   * Spawn shield ripple hit effect
   */
  static spawnShieldHit(x: number, y: number, radius: number, hitAngle: number, color?: string): void {
    if (typeof window !== 'undefined' && window.__ANTIGRAVITY_EFFECTS__) {
      window.__ANTIGRAVITY_EFFECTS__.spawnShieldHit(x, y, radius, hitAngle, color);
    }
  }

  /**
   * Spawn articulated nanite repair or construction welding beam
   */
  static spawnRepairBeam(sx: number, sy: number, tx: number, ty: number, color?: string): void {
    if (typeof window !== 'undefined' && window.__ANTIGRAVITY_EFFECTS__) {
      window.__ANTIGRAVITY_EFFECTS__.spawnRepairBeam(sx, sy, tx, ty, color);
    }
  }

  /**
   * Spawn holographic research beacon
   */
  static spawnResearchBeacon(x: number, y: number, maxRadius?: number): void {
    if (typeof window !== 'undefined' && window.__ANTIGRAVITY_EFFECTS__) {
      window.__ANTIGRAVITY_EFFECTS__.spawnResearchBeacon(x, y, maxRadius);
    }
  }
}
