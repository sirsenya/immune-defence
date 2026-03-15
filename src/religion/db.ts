import { Worshipper, WorshipperStatuses  } from "./worshipper";


export const worshippersDb = [
  new Worshipper({
    id: 0,
    name: "Dolboslav",
    position: { x: 50, y: 50 },
    size: 100,
    status: WorshipperStatuses.idle,
    gracePoints: 0,
    velocity: Worshipper.getSomeVelocity(),
  }),
  new Worshipper({
    id: 1,
    name: "Muslim",
    position: { x: 100, y: 100 },
    size: 100,
    status: WorshipperStatuses.praying,
    gracePoints: 0,
    velocity: Worshipper.getSomeVelocity(),
  }),
];
