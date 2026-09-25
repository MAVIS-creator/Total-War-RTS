/**
 * Scene manager entry point for Antigravity UI & presentation scenes
 */
export const SCENE_KEYS = {
  BOOT: 'BootScene',
  MAIN_MENU: 'MainMenuScene',
  SKIRMISH_SETUP: 'SkirmishSetupScene',
  LOADING: 'LoadingScene',
  BATTLEFIELD: 'BattlefieldScene',
  HUD: 'HUDScene',
  VICTORY_DEFEAT: 'VictoryDefeatScene',
} as const;

export type SceneKey = typeof SCENE_KEYS[keyof typeof SCENE_KEYS];
