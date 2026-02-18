import { useEffect } from "react";
import { useGameStore } from "./store/gameStore";

export const Game = () => {
  const { zones, gameTick, spawnMacrophage, reset, gameStatus } = useGameStore();

  useEffect(() => {
    let animationFrameId: number;
  
    const loop = () => {
      if (gameStatus === "playing") {
        gameTick();
        animationFrameId = requestAnimationFrame(loop);
      }
    };
  
    animationFrameId = requestAnimationFrame(loop);
  
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameStatus]);
  

  return (
    <div style={{ padding: 20 }}>
      <h1>Immune Defense</h1>
      {gameStatus === "lost" && <h2 style={{ color: "red" }}>ПРОИГРЫШ</h2>}

      {zones.map((zone) => (
        <div
          key={zone.id}
          style={{
            border: "1px solid gray",
            marginBottom: 10,
            padding: 10,
          }}
        >
          <h3>{zone.name}</h3>
          <p>Health: {zone.health}</p>
          <p>Infection: {zone.infection.toFixed(1)}</p>
          <p>Macrophages: {zone.macrophages}</p>

          <button onClick={() => spawnMacrophage(zone.id)}>+ Макрофаг</button>
        </div>
      ))}
      <button onClick={() => reset()}>Reset</button>
    </div>
  );
};
