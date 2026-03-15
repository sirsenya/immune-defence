import { create } from "zustand";
import { Worshipper, WorshipperStatuses } from "./worshipper";
import { worshippersDb } from "./db";

type GameStatus = "playing" | "lost" | "paused";

type GameState = {
  worshippers: Worshipper[];
  tick: number;
  gameStatus: GameStatus;
  setGameStatus: () => void;
  gameTick: () => void;
  reset: () => void;
  addGrace: (id: number) => void;
};

export const useReligionGameStore = create<GameState>((set) => ({
  worshippers: worshippersDb,

  tick: 0,

  gameStatus: "playing",

  addGrace: (id: number) =>
    set((state) => ({
      worshippers: state.worshippers.map((w) =>
        w.id === id
          ? { ...w, gracePoints: w.gracePoints + 1 }
          : w
      ),
    })),

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
        const random = Math.random() < 0.01;

        let newX = w.position.x + w.velocity.x;
        let newY = w.position.y + w.velocity.y;

        let dx = w.velocity.x;
        let dy = w.velocity.y;

        // отражение от стен
        if (newX <= 0 || newX >= width - w.size) dx = -dx;
        if (newY <= 0 || newY >= height - w.size) dy = -dy;

        // иногда меняем направление случайно
        if (random) {
          w.status = Object.values(WorshipperStatuses).filter((status) => status !== w.status)[
            Math.round(Math.random())
          ];
          dx += (Math.random() - 0.5) * 0.2;
          dy += (Math.random() - 0.5) * 0.2;
        }

        if (w.status === WorshipperStatuses.praying || w.status === WorshipperStatuses.blaspheming) {
          newX = w.position.x;
          newY = w.position.y;
          w.velocity = { x: 0, y: 0 };
        }
        else {
          w.velocity = Worshipper.getSomeVelocity();
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
