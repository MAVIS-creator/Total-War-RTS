import Phaser from 'phaser';
import type { SimulationSnapshot } from '@/contracts';

export type SnapshotProvider = () => SimulationSnapshot;

export class SimulationScene extends Phaser.Scene {
  public constructor(private readonly snapshotProvider: SnapshotProvider) {
    super('simulation');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#17251b');
  }

  public update(): void {
    const snapshot = this.snapshotProvider();
    this.children.removeAll();
    for (const building of snapshot.buildings)
      this.add.rectangle(building.position.x, building.position.y, 28, 28, 0x63b3ff, 0.8);
    for (const unit of snapshot.units) this.add.circle(unit.position.x, unit.position.y, 7, 0x67e8b5, 0.9);
  }
}

export const createPhaserGame = (parent: string, snapshotProvider: SnapshotProvider): Phaser.Game =>
  new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1600,
    height: 1000,
    backgroundColor: '#17251b',
    scene: new SimulationScene(snapshotProvider),
  });
