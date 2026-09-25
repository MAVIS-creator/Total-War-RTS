/**
 * Total War RTS - Team Color Shader & Masking Pipeline
 * Provides unified multi-player palette mappings, WebGL shader source for Phaser,
 * and high-performance Canvas 2D color masking/tinting utilities.
 */

export interface TeamPalette {
  readonly id: number;
  readonly name: string;
  readonly faction: string;
  readonly primary: string;
  readonly bright: string;
  readonly glow: string;
  readonly dark: string;
  readonly trim: string;
  readonly rgb: [number, number, number]; // 0..1 range for GLSL shaders
  readonly swatch: string;
}

export class TeamColorPipeline {
  private static readonly PALETTES: TeamPalette[] = [
    {
      id: 0,
      name: 'Player 1 (Terran Cyan)',
      faction: 'Terran Vanguard',
      primary: '#00d2ff',
      bright: '#63e2ff',
      glow: 'rgba(0, 210, 255, 0.45)',
      dark: '#005f73',
      trim: '#c4f1ff',
      rgb: [0.0, 0.824, 1.0],
      swatch: '#00d2ff',
    },
    {
      id: 1,
      name: 'Player 2 (Crimson Syndicate)',
      faction: 'Crimson Syndicate',
      primary: '#ff3366',
      bright: '#ff6688',
      glow: 'rgba(255, 51, 102, 0.45)',
      dark: '#800020',
      trim: '#ffd1dc',
      rgb: [1.0, 0.2, 0.4],
      swatch: '#ff3366',
    },
    {
      id: 2,
      name: 'Player 3 (Helios Amber)',
      faction: 'Helios Union',
      primary: '#feca57',
      bright: '#ffd266',
      glow: 'rgba(254, 202, 87, 0.45)',
      dark: '#805500',
      trim: '#fff2cc',
      rgb: [0.996, 0.792, 0.341],
      swatch: '#feca57',
    },
    {
      id: 3,
      name: 'Player 4 (Nyx Violet)',
      faction: 'Nyx Directorate',
      primary: '#b197fc',
      bright: '#d0bfff',
      glow: 'rgba(177, 151, 252, 0.45)',
      dark: '#3b2466',
      trim: '#f3e8ff',
      rgb: [0.694, 0.592, 0.988],
      swatch: '#b197fc',
    },
  ];

  // Offscreen canvas cache for color-masked sprites & plates: (cacheKey -> HTMLCanvasElement)
  private static maskCache = new Map<string, HTMLCanvasElement>();

  /**
   * Retrieve the complete palette for a given team index with fallback
   */
  static getPalette(teamIndex: number): TeamPalette {
    return this.PALETTES[teamIndex] ?? (this.PALETTES[0] as TeamPalette);
  }

  /**
   * Retrieve primary hex colors for all registered teams
   */
  static getTeamColors(): string[] {
    return this.PALETTES.map((p) => p.primary);
  }

  /**
   * Retrieve team faction display names
   */
  static getTeamNames(): string[] {
    return this.PALETTES.map((p) => p.name);
  }

  /**
   * WebGL Fragment Shader for Phaser / WebGL Pipelines
   * Uses a grayscale texture mask to dynamically apply team colors while preserving
   * normal highlights and ambient occlusion.
   */
  static getGLSLFragmentShader(): string {
    return `
      precision mediump float;
      uniform sampler2D uSampler;
      uniform sampler2D uMaskSampler;
      uniform vec3 uTeamPrimary;
      uniform vec3 uTeamBright;
      uniform vec3 uTeamDark;
      varying vec2 outTexCoord;

      void main(void) {
        vec4 baseColor = texture2D(uSampler, outTexCoord);
        vec4 maskColor = texture2D(uMaskSampler, outTexCoord);

        // Red channel = primary team color mask
        // Green channel = emissive glow trim
        // Blue channel = dark armor shade
        float primaryFactor = maskColor.r;
        float glowFactor = maskColor.g;
        float darkFactor = maskColor.b;

        vec3 tinted = baseColor.rgb;
        if (primaryFactor > 0.05) {
          tinted = mix(tinted, uTeamPrimary * (baseColor.r * 0.8 + 0.3), primaryFactor);
        }
        if (glowFactor > 0.05) {
          tinted = mix(tinted, uTeamBright, glowFactor);
        }
        if (darkFactor > 0.05) {
          tinted = mix(tinted, uTeamDark * baseColor.rgb, darkFactor);
        }

        gl_FragColor = vec4(tinted, baseColor.a);
      }
    `;
  }

  /**
   * Generates or retrieves an offscreen Canvas tinted by team color
   */
  static getTintedCanvas(
    cacheKey: string,
    width: number,
    height: number,
    renderMask: (ctx: CanvasRenderingContext2D) => void,
    teamIndex: number
  ): HTMLCanvasElement {
    const key = `${cacheKey}_t${teamIndex}_${width}x${height}`;
    const cached = this.maskCache.get(key);
    if (cached) return cached;

    const palette = this.getPalette(teamIndex);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(width));
    canvas.height = Math.max(1, Math.floor(height));
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Draw shape mask
      renderMask(ctx);

      // 2. Tint with team color using source-in
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = palette.primary;
      ctx.fillRect(0, 0, width, height);

      // 3. Optional top highlight gradient
      ctx.globalCompositeOperation = 'source-atop';
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, palette.bright);
      grad.addColorStop(0.4, palette.primary);
      grad.addColorStop(1, palette.dark);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    this.maskCache.set(key, canvas);
    return canvas;
  }

  /**
   * High performance Canvas 2D procedural chevron/plate renderer
   */
  static renderTeamPlate(
    ctx: CanvasRenderingContext2D,
    shape: 'chevron' | 'rect' | 'circle' | 'stripes',
    w: number,
    h: number,
    teamIndex: number
  ): void {
    const palette = this.getPalette(teamIndex);
    ctx.save();
    ctx.fillStyle = palette.primary;
    ctx.strokeStyle = palette.bright;
    ctx.lineWidth = 1;

    switch (shape) {
      case 'chevron':
        ctx.beginPath();
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(w / 4, 0);
        ctx.lineTo(-w / 2, h / 2);
        ctx.lineTo(0, h / 2);
        ctx.lineTo(w / 2, 0);
        ctx.lineTo(0, -h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'rect':
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(w, h) / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'stripes':
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = palette.bright;
        ctx.beginPath();
        ctx.moveTo(-w / 4, -h / 2);
        ctx.lineTo(-w / 4, h / 2);
        ctx.moveTo(w / 4, -h / 2);
        ctx.lineTo(w / 4, h / 2);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  /**
   * Injects or updates CSS team variables into the document root
   */
  static applyCSSTeamVariables(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    this.PALETTES.forEach((p) => {
      root.style.setProperty(`--maw-team-${p.id}-primary`, p.primary);
      root.style.setProperty(`--maw-team-${p.id}-bright`, p.bright);
      root.style.setProperty(`--maw-team-${p.id}-glow`, p.glow);
      root.style.setProperty(`--maw-team-${p.id}-dark`, p.dark);
    });
  }

  /**
   * Clear cached mask canvases (e.g. on resolution changes)
   */
  static clearCache(): void {
    this.maskCache.clear();
  }
}
