export class Worshipper {
  id: number;
  name: string;
  position: Coordinates;
  size: number;
  status: WorshipperStatuses;
  gracePoints: number;
  velocity: Coordinates;

  constructor({
    id,
    name,
    position,
    size,
    status,
    gracePoints,
    velocity,
  }: {
    id: number;
    name: string;
    position: Coordinates;
    size: number;
    status: WorshipperStatuses;
    gracePoints: number;
    velocity: Coordinates;
  }) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.size = size;
    this.status = status;
    this.gracePoints = gracePoints;
    this.velocity = velocity;
  }

  //TODO add currentVelocity and defaultVelocity to Worshipper
  static getSomeVelocity = (): Coordinates => ({
  x: (Math.random() - 0.5) * 0.5,
  y: (Math.random() - 0.5) * 0.5,
});
}

export enum WorshipperStatuses {
  praying = "praynig",
  idle = "idle",
  blaspheming = "blaspheming",
}

export type Coordinates = { x: number; y: number };
