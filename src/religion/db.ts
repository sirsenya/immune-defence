import { Worshipper, WorshipperStatuses } from "./worshipper";

export const worshippersDb = [
  new Worshipper({
    id: 0,
    name: "Dolboslav",
    position: { x: 50, y: 50 },
    size: 10,
    status: WorshipperStatuses.idle,
    gracePoints: 0,
    velocity: {
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5,
    },
  }),
  new Worshipper({
    id: 1,
    name: "Muslim",
    position: { x: 100, y: 100 },
    size: 10,
    status: WorshipperStatuses.praying,
    gracePoints: 0,
    velocity: {
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5,
    },
  }),
];
