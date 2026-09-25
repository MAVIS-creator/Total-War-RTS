import type { EntityId } from '@/contracts';

export class StableIdFactory {
  private nextValue = 1;

  public next(prefix: string): EntityId {
    const id = `${prefix}-${this.nextValue}`;
    this.nextValue += 1;
    return id;
  }
}
