export class Worshipper {
  id: number;
  name: string;
  position: Coordinates;
  size: number;
  status: WorshipperStatus;
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
    status: WorshipperStatus;
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
}

export type WorshipperStatus = "praying" | "idle" | "blaspheming";

type Coordinates = { x: number; y: number };
