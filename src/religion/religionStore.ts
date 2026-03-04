import { create } from "zustand";
import { Worshipper } from "./worshipper";

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
    new Worshipper({
      id: 0,
      name: "Dolboslav",
      position: { x: 50, y: 50 },
      size: 10,
      status: "idle",
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
      status: "idle",
      gracePoints: 0,
      velocity: {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
      },
    }),
  ],
  tick: 0,

  gameStatus: "playing",

  setGameStatus: () => set({ gameStatus: "lost" }),

  reset: () =>
    set(() => ({
      tick: 0,
    })),

  gameTick: () =>
    set((state) => {
      if (state.gameStatus !== "playing") return state;

      const width = window.innerWidth;
      const height = window.innerHeight;

      const updated = state.worshippers.map((w) => {
        let newX = w.position.x + w.velocity.x;
        let newY = w.position.y + w.velocity.y;

        let dx = w.velocity.x;
        let dy = w.velocity.y;

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
          velocity: { x: dx, y: dy },
        };
      });

      return {
        worshippers: updated,
        tick: state.tick + 1,
      };
    }),
}));
