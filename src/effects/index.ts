/**
 * Antigravity Visual Effects System definitions
 */
export type EffectType =
  | 'muzzle_flash'
  | 'tracer'
  | 'shell_projectile'
  | 'impact_spark'
  | 'explosion_small'
  | 'explosion_large'
  | 'smoke'
  | 'shield_hit'
  | 'repair'
  | 'construction';

export interface VisualEffect {
  readonly id: string;
  readonly type: EffectType;
  readonly x: number;
  readonly y: number;
  readonly duration: number;
}
