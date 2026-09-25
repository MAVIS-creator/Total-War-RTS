export type GamePhase = 'boot' | 'main-menu' | 'skirmish-setup' | 'loading' | 'game' | 'paused' | 'victory' | 'defeat';

const allowedTransitions: Readonly<Record<GamePhase, readonly GamePhase[]>> = {
  boot: ['main-menu'],
  'main-menu': ['skirmish-setup'],
  'skirmish-setup': ['loading', 'main-menu'],
  loading: ['game', 'main-menu'],
  game: ['paused', 'victory', 'defeat', 'main-menu'],
  paused: ['game', 'main-menu'],
  victory: ['main-menu'],
  defeat: ['main-menu'],
};

export class GameStateMachine {
  private current: GamePhase = 'boot';

  public phase(): GamePhase {
    return this.current;
  }

  public transition(next: GamePhase): void {
    if (!allowedTransitions[this.current].includes(next))
      throw new Error('Invalid game-state transition: ' + this.current + ' to ' + next);
    this.current = next;
  }
}
