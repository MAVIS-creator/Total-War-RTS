/**
 * Building Component Renderer
 * High-fidelity isometric 2.5D procedural renderer for military sci-fi structures.
 * Features hard-surface volumetric geometry, kinetic features, construction states,
 * dynamic damage fire/smoke, and team-color integration.
 */

import type {
  BuildingVisualProfile,
  IsometricPrism,
  IsometricCylinder,
} from './BuildingVisualProfile';
import { TeamColorPipeline } from '../team/TeamColorPipeline';

export interface BuildingRenderState {
  readonly id?: string;
  readonly type: string;
  readonly team: number;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly level: number;
  readonly isDead?: boolean;
  readonly buildProgress?: number; // 0.0 to 1.0 (if under construction)
  readonly isUnderConstruction?: boolean;
  readonly queue?: Array<{ type: string; progress: number; time: number }>;
  readonly target?: { x: number; y: number; dead?: boolean } | null;
  readonly cooldown?: number;
  turretAngle?: number;
}

export interface BuildingRenderContext {
  readonly ctx: CanvasRenderingContext2D;
  readonly camera: { x: number; y: number; zoom: number };
  readonly screenPos: { x: number; y: number };
  readonly isSelected: boolean;
  readonly time: number;
  readonly isGhost?: boolean;
  readonly ghostValid?: boolean;
}

const ISO_Y_SCALE = 0.68; // 2.5D isometric pitch factor

export class BuildingComponentRenderer {
  /**
   * Main render dispatch for a building
   */
  static render(
    profile: BuildingVisualProfile,
    state: BuildingRenderState,
    rc: BuildingRenderContext
  ): void {
    const { ctx, camera, screenPos, isSelected, time, isGhost, ghostValid } = rc;
    const zoom = camera.zoom;
    const teamPalette = TeamColorPipeline.getPalette(state.team);

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);

    // 1. Ghost / Placement Blueprint Mode
    if (isGhost) {
      this.drawPlacementGhost(ctx, profile, zoom, ghostValid !== false, time);
      ctx.restore();
      return;
    }

    // 2. Destroyed / Wreck State
    if (state.isDead || state.hp <= 0) {
      this.drawDestroyedWreck(ctx, profile, zoom, teamPalette.primary, time);
      ctx.restore();
      return;
    }

    // 3. Ambient Occlusion Ground Drop-Shadow
    this.drawGroundShadow(ctx, profile, zoom);

    // 4. Foundation Sub-base & Hazard Trim
    this.drawFoundation(ctx, profile, zoom);

    // 5. Under-Construction Holographic State
    const isConstructing = state.isUnderConstruction || (state.buildProgress !== undefined && state.buildProgress < 1.0);
    if (isConstructing) {
      const progress = state.buildProgress ?? 0.5;
      this.drawConstructionState(ctx, profile, zoom, progress, teamPalette.primary, time);
      this.drawOverheadHUD(ctx, profile, state, zoom, isSelected, teamPalette.primary);
      ctx.restore();
      return;
    }

    // 6. Volumetric Isometric Prisms (superstructure tiers)
    for (const prism of profile.prisms) {
      this.drawIsoPrism(ctx, prism, zoom, teamPalette);
    }

    // 7. Volumetric Cylinders (silos, domes, masts)
    if (profile.cylinders) {
      for (const cyl of profile.cylinders) {
        this.drawIsoCylinder(ctx, cyl, zoom, teamPalette);
      }
    }

    // 8. Kinetic Animated Features (radars, drills, plasma cores, gantries, defense turrets)
    this.drawKineticFeatures(ctx, profile, state, zoom, teamPalette, time);

    // 9. Lighting Strips & Telemetry Beacons
    this.drawLighting(ctx, profile, zoom, time);

    // 10. Damage Decals, Fire & Smoke Plumes
    if (state.hp < state.maxHp * 0.75) {
      this.drawDamageEffects(ctx, profile, state, zoom, time);
    }

    // 11. Tactical Overhead HUD (Health bar, level chevrons, factory queue)
    this.drawOverheadHUD(ctx, profile, state, zoom, isSelected, teamPalette.primary);

    ctx.restore();
  }

  /**
   * Project 3D coordinate (x, y, z) into 2.5D isometric screen coordinates
   */
  private static iso(xRel: number, yRel: number, zRel: number, zoom: number): { x: number; y: number } {
    return {
      x: xRel * zoom,
      y: (yRel * ISO_Y_SCALE - zRel) * zoom,
    };
  }

  /**
   * Ambient Occlusion drop-shadow on the terrain beneath the foundation
   */
  private static drawGroundShadow(
    ctx: CanvasRenderingContext2D,
    profile: BuildingVisualProfile,
    zoom: number
  ): void {
    const s = profile.baseSize * zoom;
    ctx.save();
    ctx.fillStyle = 'rgba(5, 10, 8, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 4 * zoom, s * 0.56, s * 0.56 * ISO_Y_SCALE + 4 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Reinforced concrete foundation slab with perimeter bevels and hazard stripes
   */
  private static drawFoundation(
    ctx: CanvasRenderingContext2D,
    profile: BuildingVisualProfile,
    zoom: number
  ): void {
    const s = profile.baseSize * zoom;
    const w = s * 0.52;
    const h = s * 0.52 * ISO_Y_SCALE;
    const chamf = profile.foundationShape === 'octagonal' ? Math.max(4, 10 * zoom) : (profile.foundationShape === 'circular' ? w : 3 * zoom);

    ctx.save();

    // Bottom foundation lip (dark titanium-concrete)
    ctx.fillStyle = '#11171f';
    ctx.strokeStyle = '#080c10';
    ctx.lineWidth = Math.max(1, 1.5 * zoom);

    if (profile.foundationShape === 'circular') {
      ctx.beginPath();
      ctx.ellipse(0, 3 * zoom, w, h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1d2734';
      ctx.beginPath();
      ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Octagonal or chamfered foundation
      this.drawChamferedRect(ctx, -w, -h + 3 * zoom, w * 2, h * 2, chamf);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e2938';
      this.drawChamferedRect(ctx, -w, -h, w * 2, h * 2, chamf);
      ctx.fill();
      ctx.stroke();

      // Top face rim highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      this.drawChamferedRect(ctx, -w + 1, -h + 1, (w - 1) * 2, (h - 1) * 2, chamf);
      ctx.stroke();
    }

    // Hazard warning stripes along corners if enabled
    if (profile.hazardTrim && profile.foundationShape !== 'circular') {
      ctx.save();
      ctx.strokeStyle = '#d49b13';
      ctx.lineWidth = Math.max(1.5, 2.2 * zoom);
      const stripeSpan = 8 * zoom;
      ctx.beginPath();
      // Draw small diagonal hazard notches on the front apron
      for (let x = -w + chamf; x <= w - chamf; x += stripeSpan) {
        ctx.moveTo(x, h - 2 * zoom);
        ctx.lineTo(x + 4 * zoom, h + 2 * zoom);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draw volumetric isometric box/prism with shaded faces
   */
  private static drawIsoPrism(
    ctx: CanvasRenderingContext2D,
    prism: IsometricPrism,
    zoom: number,
    teamPalette: { primary: string; glow: string; dark: string }
  ): void {
    const { xRel, yRel, zRel, width, depth, height, chamfer } = prism;
    const hw = width / 2;
    const hd = depth / 2;
    const ch = chamfer ? Math.min(chamfer, Math.min(hw, hd) * 0.8) : 0;

    // Visible base bottom corners (at zRel)
    const b3 = this.iso(xRel + hw, yRel + hd - ch, zRel, zoom);
    const b4 = this.iso(xRel + hw - ch, yRel + hd, zRel, zoom);
    const b5 = this.iso(xRel - hw + ch, yRel + hd, zRel, zoom);
    const b6 = this.iso(xRel - hw, yRel + hd - ch, zRel, zoom);

    // 8 top corners (at zRel + height)
    const t0 = this.iso(xRel - hw + ch, yRel - hd, zRel + height, zoom);
    const t1 = this.iso(xRel + hw - ch, yRel - hd, zRel + height, zoom);
    const t2 = this.iso(xRel + hw, yRel - hd + ch, zRel + height, zoom);
    const t3 = this.iso(xRel + hw, yRel + hd - ch, zRel + height, zoom);
    const t4 = this.iso(xRel + hw - ch, yRel + hd, zRel + height, zoom);
    const t5 = this.iso(xRel - hw + ch, yRel + hd, zRel + height, zoom);
    const t6 = this.iso(xRel - hw, yRel + hd - ch, zRel + height, zoom);
    const t7 = this.iso(xRel - hw, yRel - hd + ch, zRel + height, zoom);

    ctx.save();
    ctx.lineWidth = Math.max(1, 1.2 * zoom);
    ctx.strokeStyle = '#090e14';

    // Face Colors
    const isTeam = prism.isTeamColor;
    const topCol = isTeam ? teamPalette.primary : (prism.topColor || '#364c66');
    const frontCol = isTeam ? teamPalette.dark : (prism.leftColor || '#243447');
    const sideCol = isTeam ? '#0c1a29' : (prism.rightColor || '#182330');

    // 1. South / Front Wall
    ctx.fillStyle = frontCol;
    ctx.beginPath();
    ctx.moveTo(t5.x, t5.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.lineTo(b4.x, b4.y);
    ctx.lineTo(b5.x, b5.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. East / Right Wall
    ctx.fillStyle = sideCol;
    ctx.beginPath();
    ctx.moveTo(t4.x, t4.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.lineTo(b3.x, b3.y);
    ctx.lineTo(b4.x, b4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. West / Left Wall (if chamfered)
    if (ch > 0) {
      ctx.fillStyle = frontCol;
      ctx.beginPath();
      ctx.moveTo(t6.x, t6.y);
      ctx.lineTo(t5.x, t5.y);
      ctx.lineTo(b5.x, b5.y);
      ctx.lineTo(b6.x, b6.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 4. Top Face
    ctx.fillStyle = topCol;
    ctx.beginPath();
    ctx.moveTo(t0.x, t0.y);
    ctx.lineTo(t1.x, t1.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.lineTo(t5.x, t5.y);
    ctx.lineTo(t6.x, t6.y);
    ctx.lineTo(t7.x, t7.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Specular highlight line along top ridge
    ctx.strokeStyle = isTeam ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(t0.x, t0.y);
    ctx.lineTo(t1.x, t1.y);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw volumetric cylinder in 2.5D isometric view
   */
  private static drawIsoCylinder(
    ctx: CanvasRenderingContext2D,
    cyl: IsometricCylinder,
    zoom: number,
    teamPalette: { primary: string; glow: string; dark: string }
  ): void {
    const { xRel, yRel, zRel, radius, height } = cyl;
    const r = radius * zoom;
    const ry = r * ISO_Y_SCALE;

    const baseCenter = this.iso(xRel, yRel, zRel, zoom);
    const topCenter = this.iso(xRel, yRel, zRel + height, zoom);

    ctx.save();
    ctx.lineWidth = Math.max(1, 1.2 * zoom);
    ctx.strokeStyle = '#090e14';

    const isTeam = cyl.isTeamColor;
    const topCol = isTeam ? teamPalette.primary : (cyl.topColor || '#334860');
    const sideCol = isTeam ? teamPalette.dark : (cyl.sideColor || '#223244');

    // Cylinder side barrel
    ctx.fillStyle = sideCol;
    ctx.beginPath();
    ctx.moveTo(baseCenter.x - r, baseCenter.y);
    ctx.lineTo(topCenter.x - r, topCenter.y);
    ctx.ellipse(topCenter.x, topCenter.y, r, ry, 0, Math.PI, 0, true);
    ctx.lineTo(baseCenter.x + r, baseCenter.y);
    ctx.ellipse(baseCenter.x, baseCenter.y, r, ry, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top face cap
    ctx.fillStyle = topCol;
    ctx.beginPath();
    ctx.ellipse(topCenter.x, topCenter.y, r, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Specular highlight rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(topCenter.x, topCenter.y, r * 0.85, ry * 0.85, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw dynamic kinetic elements (radars, drills, plasma cores, cranes, rotating defense turrets)
   */
  private static drawKineticFeatures(
    ctx: CanvasRenderingContext2D,
    profile: BuildingVisualProfile,
    state: BuildingRenderState,
    zoom: number,
    teamPalette: { primary: string; glow: string; dark: string },
    time: number
  ): void {
    for (const kinetic of profile.kinetics) {
      const pos = this.iso(kinetic.xRel, kinetic.yRel, kinetic.zRel, zoom);

      ctx.save();
      ctx.translate(pos.x, pos.y);

      switch (kinetic.type) {
        case 'radar_dish': {
          const rate = kinetic.speed || 2.0;
          const angle = (time / 1000) * rate;
          const r = (kinetic.size || 8) * zoom;
          const ry = r * ISO_Y_SCALE;

          // Mast mount
          ctx.fillStyle = '#172230';
          ctx.fillRect(-1.5 * zoom, 0, 3 * zoom, 4 * zoom);

          // Rotating dish ellipse
          ctx.save();
          ctx.rotate(angle);
          ctx.fillStyle = kinetic.color || '#dcecff';
          ctx.strokeStyle = '#1b2838';
          ctx.lineWidth = Math.max(1, 1.2 * zoom);
          ctx.beginPath();
          ctx.ellipse(0, 0, r, ry * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Center feed horn
          ctx.fillStyle = '#ff4d4f';
          ctx.beginPath();
          ctx.arc(0, -ry * 0.4, Math.max(1, 1.8 * zoom), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case 'plasma_core': {
          const rate = kinetic.speed || 3.0;
          const pulse = Math.sin((time / 1000) * rate);
          const baseR = (kinetic.size || 8) * zoom;
          const r = baseR + pulse * 1.5 * zoom;
          const col = kinetic.color || '#67e8b5';

          // Outer plasma containment glow
          const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.6);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, col);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 1.6, r * 1.6 * ISO_Y_SCALE, 0, 0, Math.PI * 2);
          ctx.fill();

          // Central brilliant plasma sphere
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 0.45, r * 0.45 * ISO_Y_SCALE, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'reciprocating_drill': {
          const rate = kinetic.speed || 3.0;
          const stroke = Math.sin((time / 1000) * rate);
          const drillWidth = (kinetic.size || 5) * zoom;
          const strokeLen = (kinetic.secondarySize || 12) * zoom;
          const currentY = (stroke * 0.5 + 0.5) * strokeLen;

          // Hydraulic piston shaft
          ctx.fillStyle = '#4c555e';
          ctx.strokeStyle = '#1b1e22';
          ctx.lineWidth = Math.max(1, 1.2 * zoom);
          ctx.fillRect(-drillWidth * 0.4, -strokeLen * 0.4, drillWidth * 0.8, strokeLen);
          ctx.strokeRect(-drillWidth * 0.4, -strokeLen * 0.4, drillWidth * 0.8, strokeLen);

          // Heavy carbide drill bit
          ctx.fillStyle = '#d49b13';
          ctx.beginPath();
          ctx.moveTo(-drillWidth, currentY);
          ctx.lineTo(drillWidth, currentY);
          ctx.lineTo(0, currentY + 8 * zoom);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Ore dust & steam puffs when drill is plunging down
          if (stroke > 0.4) {
            ctx.fillStyle = 'rgba(212, 155, 19, 0.4)';
            ctx.beginPath();
            ctx.arc(-drillWidth * 1.2, currentY + 4 * zoom, 4 * zoom, 0, Math.PI * 2);
            ctx.arc(drillWidth * 1.2, currentY + 4 * zoom, 4 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'gantry_crane': {
          const rate = kinetic.speed || 1.2;
          const span = (kinetic.size || 24) * zoom;
          const gantryX = Math.sin((time / 1000) * rate) * (span * 0.4);
          const isProducing = state.queue && state.queue.length > 0;

          // Overhead cross-rail
          ctx.strokeStyle = '#1d2630';
          ctx.lineWidth = Math.max(2, 3 * zoom);
          ctx.beginPath();
          ctx.moveTo(-span * 0.5, 0);
          ctx.lineTo(span * 0.5, 0);
          ctx.stroke();

          // Traveling yellow robotic trolley
          ctx.fillStyle = '#ffc83b';
          ctx.strokeStyle = '#1a1f26';
          ctx.lineWidth = 1;
          ctx.fillRect(gantryX - 4 * zoom, -2 * zoom, 8 * zoom, 5 * zoom);
          ctx.strokeRect(gantryX - 4 * zoom, -2 * zoom, 8 * zoom, 5 * zoom);

          // Articulated robotic welding arm extending down
          ctx.strokeStyle = '#7c8b9b';
          ctx.lineWidth = Math.max(1, 1.8 * zoom);
          ctx.beginPath();
          ctx.moveTo(gantryX, 3 * zoom);
          ctx.lineTo(gantryX + 2 * zoom, 10 * zoom);
          ctx.stroke();

          // Intermittent welding spark flash when fabricating units
          if (isProducing && Math.sin((time / 100) * 17) > 0.3) {
            ctx.fillStyle = 'rgba(103, 183, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(gantryX + 2 * zoom, 10 * zoom, 5 * zoom, 0, Math.PI * 2);
            ctx.fill();

            // Welding sparks
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(gantryX + (Math.random() - 0.5) * 12 * zoom, 10 * zoom + (Math.random() - 0.5) * 8 * zoom, 2, 2);
          }
          break;
        }

        case 'turret_head': {
          const turretSize = (kinetic.size || 16) * zoom;
          const barrelLen = (kinetic.secondarySize || 18) * zoom;

          // Smooth tracking angle towards target unit
          let targetAngle = state.turretAngle ?? 0;
          if (state.target && !state.target.dead) {
            targetAngle = Math.atan2(state.target.y - state.y, state.target.x - state.x);
          }
          // Smooth angular interpolation
          if (state.turretAngle === undefined) {
            state.turretAngle = targetAngle;
          } else {
            let diff = targetAngle - state.turretAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            state.turretAngle += diff * 0.2;
          }

          const curAngle = state.turretAngle;
          const isFiring = state.cooldown !== undefined && state.cooldown <= 0.1 && !!state.target;
          const recoil = isFiring ? 4 * zoom : 0;

          ctx.save();
          // Adjust rotation for 2.5D perspective
          ctx.rotate(curAngle);

          // Twin heavy railgun barrels
          const barrelOffset = 3.5 * zoom;
          ctx.fillStyle = '#1c242e';
          ctx.strokeStyle = '#0e1318';
          ctx.lineWidth = 1;

          // Left barrel
          ctx.fillRect(-recoil, -barrelOffset - 1.5 * zoom, barrelLen - recoil, 3 * zoom);
          ctx.strokeRect(-recoil, -barrelOffset - 1.5 * zoom, barrelLen - recoil, 3 * zoom);

          // Right barrel
          ctx.fillRect(-recoil, barrelOffset - 1.5 * zoom, barrelLen - recoil, 3 * zoom);
          ctx.strokeRect(-recoil, barrelOffset - 1.5 * zoom, barrelLen - recoil, 3 * zoom);

          // Armored turret cap (faceted hexagonal bunker housing)
          ctx.fillStyle = '#324152';
          ctx.strokeStyle = '#182029';
          ctx.lineWidth = Math.max(1, 1.4 * zoom);
          ctx.beginPath();
          const r = turretSize * 0.5;
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Team color chevron stripe on turret roof
          ctx.fillStyle = teamPalette.primary;
          ctx.beginPath();
          ctx.moveTo(-r * 0.3, -r * 0.4);
          ctx.lineTo(r * 0.3, 0);
          ctx.lineTo(-r * 0.3, r * 0.4);
          ctx.lineTo(-r * 0.5, r * 0.2);
          ctx.lineTo(0, 0);
          ctx.lineTo(-r * 0.5, -r * 0.2);
          ctx.closePath();
          ctx.fill();

          // Glowing blue targeting sensor optic
          ctx.fillStyle = '#67e8b5';
          ctx.beginPath();
          ctx.arc(r * 0.3, 0, Math.max(1.2, 2 * zoom), 0, Math.PI * 2);
          ctx.fill();

          // Muzzle flash on recoil
          if (isFiring) {
            ctx.fillStyle = 'rgba(255, 212, 59, 0.9)';
            ctx.beginPath();
            ctx.arc(barrelLen + 4 * zoom, -barrelOffset, 5 * zoom, 0, Math.PI * 2);
            ctx.arc(barrelLen + 4 * zoom, barrelOffset, 5 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
          break;
        }

        case 'wind_rotor': {
          const rate = kinetic.speed || 2.2;
          const bladeAngle = (time / 1000) * rate;
          const bladeLen = (kinetic.size || 26) * zoom;

          // Central aerodynamic hub
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, 0, 3 * zoom, 3 * zoom * ISO_Y_SCALE, 0, 0, Math.PI * 2);
          ctx.fill();

          // 3 tapered composite blades
          ctx.strokeStyle = kinetic.color || '#e4f0ff';
          ctx.lineWidth = Math.max(1.5, 2.4 * zoom);
          for (let i = 0; i < 3; i++) {
            const a = bladeAngle + (i * Math.PI * 2) / 3;
            const bx = Math.cos(a) * bladeLen;
            const by = Math.sin(a) * bladeLen * ISO_Y_SCALE;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
          break;
        }

        case 'shield_conduit': {
          const pulse = Math.sin((time / 1000) * 2.0);
          const r = (kinetic.size || 16) * zoom + pulse * 2 * zoom;

          // Oscillating cyan energy toroid
          ctx.strokeStyle = teamPalette.primary;
          ctx.lineWidth = Math.max(1.5, 2.2 * zoom);
          ctx.globalAlpha = 0.5 + pulse * 0.3;
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * ISO_Y_SCALE, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Faint spherical bubble preview
          ctx.fillStyle = teamPalette.glow;
          ctx.globalAlpha = 0.12;
          ctx.beginPath();
          ctx.arc(0, -6 * zoom, r * 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
          break;
        }

        case 'cooling_vent': {
          // Vent steam puffs
          const steamPhase = (time / 1000) * 1.5;
          const puffY = -((steamPhase % 1) * 12 * zoom);
          const puffAlpha = 1 - (steamPhase % 1);
          ctx.fillStyle = `rgba(220, 236, 255, ${puffAlpha * 0.45})`;
          ctx.beginPath();
          ctx.arc(0, puffY, 3 * zoom + (steamPhase % 1) * 3 * zoom, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.restore();
    }
  }

  /**
   * Draw illuminated window bands and blinking telemetry beacons
   */
  private static drawLighting(
    ctx: CanvasRenderingContext2D,
    profile: BuildingVisualProfile,
    zoom: number,
    time: number
  ): void {
    const { windowStrips, beaconLights } = profile.lighting;

    // Window strips
    if (windowStrips) {
      for (const strip of windowStrips) {
        const pos = this.iso(strip.xRel, strip.yRel, strip.zRel, zoom);
        const len = strip.length * zoom;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(strip.angle);
        ctx.strokeStyle = strip.color;
        ctx.lineWidth = Math.max(1, 1.8 * zoom);
        ctx.shadowColor = strip.color;
        ctx.shadowBlur = 4 * zoom;
        ctx.beginPath();
        ctx.moveTo(-len / 2, 0);
        ctx.lineTo(len / 2, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Blinking telemetry beacons
    if (beaconLights) {
      for (const beacon of beaconLights) {
        const pos = this.iso(beacon.xRel, beacon.yRel, beacon.zRel, zoom);
        const isLit = Math.sin((time / 1000) * Math.PI * 2 * beacon.blinkHz) > 0;
        if (isLit) {
          ctx.save();
          ctx.fillStyle = beacon.color;
          ctx.shadowColor = beacon.color;
          ctx.shadowBlur = 6 * zoom;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, Math.max(1.2, 2 * zoom), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }
  }

  /**
   * Draw procedural damage FX (armor scorches, sparks, fire & smoke plumes)
   */
  private static drawDamageEffects(
    ctx: CanvasRenderingContext2D,
    profile: BuildingVisualProfile,
    state: BuildingRenderState,
    zoom: number,
    time: number
  ): void {
    const hpRatio = state.hp / state.maxHp;
    const s = profile.baseSize * zoom;

    ctx.save();

    // 1. Scorch Decals
    ctx.fillStyle = 'rgba(10, 12, 14, 0.7)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, -s * 0.15, 6 * zoom, 4 * zoom, 0.4, 0, Math.PI * 2);
    ctx.ellipse(s * 0.25, -s * 0.05, 8 * zoom, 5 * zoom, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 2. Heavy Fire & Smoke Plumes (HP < 40%)
    if (hpRatio < 0.4) {
      const smokeOffset = (time / 1000) * 20 * zoom;
      const flameFlicker = Math.sin((time / 1000) * 14);

      // Flickering orange fire core
      ctx.fillStyle = '#ff7b00';
      ctx.beginPath();
      ctx.ellipse(-s * 0.15, -s * 0.2, (4 + flameFlicker * 1.5) * zoom, (7 + flameFlicker * 2) * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.ellipse(-s * 0.15, -s * 0.2, 2.5 * zoom, 4.5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rising volumetric smoke puff
      const puffY = -s * 0.25 - (smokeOffset % (24 * zoom));
      const puffScale = 1 + (smokeOffset % (24 * zoom)) / (12 * zoom);
      ctx.fillStyle = 'rgba(30, 35, 40, 0.65)';
      ctx.beginPath();
      ctx.arc(-s * 0.15, puffY, 5 * zoom * puffScale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Under-Construction Holographic State (Nanite Scaffold Lattice & Laser Scan)
   */
  private static drawConstructionState(
    ctx: CanvasRenderingContext2D,
    profile: BuildingVisualProfile,
    zoom: number,
    progress: number,
    teamColor: string,
    time: number
  ): void {
    const s = profile.baseSize * zoom;
    const h = s * 0.65;

    ctx.save();

    // 1. Holographic wireframe grid
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    this.drawChamferedRect(ctx, -s * 0.45, -h * 0.5, s * 0.9, h, 6 * zoom);
    ctx.stroke();

    // Scaffold diagonal struts
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, -h * 0.5);
    ctx.lineTo(s * 0.45, h * 0.5);
    ctx.moveTo(s * 0.45, -h * 0.5);
    ctx.lineTo(-s * 0.45, h * 0.5);
    ctx.stroke();

    // 2. Ascending nanite construction beam line
    const scanY = h * 0.5 - progress * h;
    ctx.strokeStyle = '#67e8b5';
    ctx.lineWidth = Math.max(1.5, 2.5 * zoom);
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = '#67e8b5';
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-s * 0.48, scanY);
    ctx.lineTo(s * 0.48, scanY);
    ctx.stroke();

    // Welding sparks at scan line
    if (Math.sin((time / 100) * 12) > 0) {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(
          (Math.random() - 0.5) * s * 0.8,
          scanY + (Math.random() - 0.5) * 6 * zoom,
          2,
          2
        );
      }
    }

    // 3. Construction progress percentage readout
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#67e8b5';
    ctx.font = `bold ${Math.max(9, 10 * zoom)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(progress * 100)}%`, 0, -h * 0.55);

    ctx.restore();
  }

  /**
   * Blueprint Ghost Mode (placement preview)
   */
  private static drawPlacementGhost(
    ctx: CanvasRenderingContext2D,
    profile: BuildingVisualProfile,
    zoom: number,
    isValid: boolean,
    time: number
  ): void {
    const s = profile.baseSize * zoom;
    const pulse = Math.sin((time / 1000) * 4) * 0.15;
    const color = isValid ? '#67e8b5' : '#ff6b6b';
    const fillAlpha = (isValid ? 0.2 : 0.25) + pulse;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = isValid ? `rgba(103, 232, 181, ${fillAlpha})` : `rgba(255, 107, 107, ${fillAlpha})`;
    ctx.lineWidth = Math.max(1.5, 2 * zoom);

    // Footprint preview
    this.drawChamferedRect(ctx, -s * 0.5, -s * 0.5 * ISO_Y_SCALE, s, s * ISO_Y_SCALE, 6 * zoom);
    ctx.fill();
    ctx.stroke();

    // Center crosshair
    ctx.beginPath();
    ctx.moveTo(-6 * zoom, 0);
    ctx.lineTo(6 * zoom, 0);
    ctx.moveTo(0, -6 * zoom * ISO_Y_SCALE);
    ctx.lineTo(0, 6 * zoom * ISO_Y_SCALE);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Destroyed Scorched Wreck State
   */
  private static drawDestroyedWreck(
    ctx: CanvasRenderingContext2D,
    profile: BuildingVisualProfile,
    zoom: number,
    _teamColor: string,
    time: number
  ): void {
    const s = profile.baseSize * zoom;

    ctx.save();

    // Scorched blast crater
    ctx.fillStyle = 'rgba(12, 15, 18, 0.75)';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.55, s * 0.55 * ISO_Y_SCALE, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shattered concrete slabs & bent steel rebar
    ctx.fillStyle = '#1c2128';
    ctx.strokeStyle = '#0e1115';
    ctx.lineWidth = Math.max(1, 1.2 * zoom);

    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.1);
    ctx.lineTo(-s * 0.1, -s * 0.25);
    ctx.lineTo(s * 0.2, -s * 0.15);
    ctx.lineTo(s * 0.35, s * 0.1);
    ctx.lineTo(s * 0.05, s * 0.2);
    ctx.lineTo(-s * 0.3, s * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dying smoke wisps
    const smokeY = -((time / 1000) * 8 * zoom) % (16 * zoom);
    ctx.fillStyle = 'rgba(50, 55, 60, 0.4)';
    ctx.beginPath();
    ctx.arc(0, smokeY, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Tactical Overhead HUD (segmented health bar, upgrade level stars, production queue)
   */
  private static drawOverheadHUD(
    ctx: CanvasRenderingContext2D,
    profile: BuildingVisualProfile,
    state: BuildingRenderState,
    zoom: number,
    isSelected: boolean,
    teamColor: string
  ): void {
    const s = profile.baseSize * zoom;
    const barWidth = Math.max(32 * zoom, s * 0.7);
    const barHeight = Math.max(3.5, 4.5 * zoom);
    const hudY = -s * 0.65;

    // Selection bracket overlay
    if (isSelected) {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1.2, 1.8 * zoom);
      const selPad = 6 * zoom;
      const sw = s * 0.55 + selPad;
      const sh = (s * 0.55 * ISO_Y_SCALE) + selPad;
      const bracketLen = 8 * zoom;

      // 4 corner tactical brackets
      ctx.beginPath();
      // Top-left
      ctx.moveTo(-sw, -sh + bracketLen);
      ctx.lineTo(-sw, -sh);
      ctx.lineTo(-sw + bracketLen, -sh);
      // Top-right
      ctx.moveTo(sw - bracketLen, -sh);
      ctx.lineTo(sw, -sh);
      ctx.lineTo(sw, -sh + bracketLen);
      // Bottom-right
      ctx.moveTo(sw, sh - bracketLen);
      ctx.lineTo(sw, sh);
      ctx.lineTo(sw - bracketLen, sh);
      // Bottom-left
      ctx.moveTo(-sw + bracketLen, sh);
      ctx.lineTo(-sw, sh);
      ctx.lineTo(-sw, sh - bracketLen);
      ctx.stroke();

      ctx.restore();
    }

    // Health Bar (show if damaged, hovered or selected)
    if (state.hp < state.maxHp || isSelected) {
      const pct = Math.max(0, Math.min(1, state.hp / state.maxHp));
      const hpColor = pct > 0.5 ? '#67e8b5' : (pct > 0.25 ? '#ffd166' : '#ff6b6b');

      ctx.save();
      // Background tray
      ctx.fillStyle = 'rgba(10, 16, 22, 0.85)';
      ctx.strokeStyle = '#1a2634';
      ctx.lineWidth = 1;
      ctx.fillRect(-barWidth / 2 - 1, hudY - 1, barWidth + 2, barHeight + 2);
      ctx.strokeRect(-barWidth / 2 - 1, hudY - 1, barWidth + 2, barHeight + 2);

      // Active health fill
      ctx.fillStyle = hpColor;
      ctx.fillRect(-barWidth / 2, hudY, barWidth * pct, barHeight);

      // Level stars / indicator
      if (state.level > 1 && zoom > 0.45) {
        ctx.fillStyle = '#ffd166';
        ctx.font = `bold ${Math.max(8, 9 * zoom)}px system-ui`;
        ctx.textAlign = 'right';
        ctx.fillText('★'.repeat(state.level), barWidth / 2, hudY - 3);
      }

      ctx.restore();
    }

    // Factory Production Queue Bar
    if (state.queue && state.queue.length > 0 && state.queue[0]) {
      const activeItem = state.queue[0];
      const prog = Math.max(0, Math.min(1, activeItem.progress / activeItem.time));
      const queueY = hudY + barHeight + 3 * zoom;

      ctx.save();
      ctx.fillStyle = 'rgba(10, 16, 22, 0.85)';
      ctx.fillRect(-barWidth / 2, queueY, barWidth, 3 * zoom);
      ctx.fillStyle = teamColor;
      ctx.fillRect(-barWidth / 2, queueY, barWidth * prog, 3 * zoom);
      ctx.restore();
    }
  }

  /**
   * Helper: Draw chamfered (cut-corner) rectangle
   */
  private static drawChamferedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    ch: number
  ): void {
    const c = Math.min(ch, Math.min(w, h) * 0.45);
    ctx.beginPath();
    ctx.moveTo(x + c, y);
    ctx.lineTo(x + w - c, y);
    ctx.lineTo(x + w, y + c);
    ctx.lineTo(x + w, y + h - c);
    ctx.lineTo(x + w - c, y + h);
    ctx.lineTo(x + c, y + h);
    ctx.lineTo(x, y + h - c);
    ctx.lineTo(x, y + c);
    ctx.closePath();
  }
}
