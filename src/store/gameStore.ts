import { create } from "zustand";

type Zone = {
  id: string;
  name: string;
  health: number;
  infection: number;
  macrophages: number;
};

type GameStatus = "playing" | "lost" | "paused";

type GameState = {
  zones: Zone[];
  tick: number;
  gameStatus: GameStatus;
  setGameStatus: () => void;
  spawnMacrophage: (zoneId: string) => void;
  gameTick: () => void;
  reset: () => void;
};

export const useGameStore = create<GameState>((set) => ({
  zones: [
    { id: "nose", name: "Нос", health: 100, infection: 10, macrophages: 1 },
    { id: "lungs", name: "Лёгкие", health: 100, infection: 0, macrophages: 0 },
  ],
  tick: 0,

  gameStatus: "playing",

  setGameStatus: () => set({ gameStatus: "lost" }),

  spawnMacrophage: (zoneId) =>
    set((state) => ({
      zones: state.zones.map((z) => (z.id === zoneId ? { ...z, macrophages: z.macrophages + 1 } : z)),
    })),

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

      const updatedZones = state.zones.map((zone) => {
        const newHealth = zone.health - zone.infection * 0.1;

        return {
          ...zone,
          health: newHealth,
        };
      });

      const isDead = updatedZones.some((z) => z.health <= 0);

      return {
        zones: updatedZones,
        gameStatus: isDead ? "lost" : "playing",
      };
    }),
}));
