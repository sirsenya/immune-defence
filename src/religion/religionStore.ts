import { create } from "zustand";

type Position = {
  x: number;
  y: number;
};

type WorshipperStatus = "praying" | "idle" | "blaspheming";

type Worshipper = {
  id: number;
  name: string;
  position: Position;
  size: number;
  status: WorshipperStatus;
  gracePoints: number;
  velocity: { dx: number; dy: number };
};

type GameStatus = "playing" | "lost" | "paused";

type GameState = {
  worshippers: Worshipper[];
  tick: number;
  gameStatus: GameStatus;
  setGameStatus: () => void;
  gameTick: () => void;
  reset: () => void;
};

export const useReligionGameStore = create<GameState>((set) => ({
  worshippers: [
    {
      id: 0,
      name: "Dolboslav",
      position: { x: 50, y: 50 },
      size: 10,
      status: "idle",
      gracePoints: 0,
      velocity: {
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
      },
    },
    {
      id: 1,
      name: "Muslim",
      position: { x: 100, y: 100 },
      size: 10,
      status: "idle",
      gracePoints: 0,
      velocity: {
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
      },
    },
  ],
  tick: 0,

  gameStatus: "playing",

  setGameStatus: () => set({ gameStatus: "lost" }),

  reset: () =>
    set(() => ({
      tick: 0,
      zones: [
        { id: "nose", name: "Нос", health: 100, infection: 10, macrophages: 1 },
        { id: "lungs", name: "Лёгкие", health: 100, infection: 0, macrophages: 0 },
      ],
    })),

  gameTick: () =>
    set((state) => {
      if (state.gameStatus !== "playing") return state;

      const width = window.innerWidth;
      const height = window.innerHeight;

      const updated = state.worshippers.map((w) => {
        let newX = w.position.x + w.velocity.dx;
        let newY = w.position.y + w.velocity.dy;

        let dx = w.velocity.dx;
        let dy = w.velocity.dy;

        // отражение от стен
        if (newX <= 0 || newX >= width - w.size) dx = -dx;
        if (newY <= 0 || newY >= height - w.size) dy = -dy;

        // иногда меняем направление случайно
        if (Math.random() < 0.01) {
          dx += (Math.random() - 0.5) * 0.2;
          dy += (Math.random() - 0.5) * 0.2;
        }

        return {
          ...w,
          position: { x: newX, y: newY },
          velocity: { dx, dy },
        };
      });

      return {
        worshippers: updated,
        tick: state.tick + 1,
      };
    }),
}));
