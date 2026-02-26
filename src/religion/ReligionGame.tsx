import { useEffect } from "react";
import { useReligionGameStore } from "./religionStore";
import { useState } from "react";

export const ReligionGame = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { worshippers, gameTick, reset, gameStatus } = useReligionGameStore();

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

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     updateGame()
  //   }, 16) // ~60fps
  //   return () => clearInterval(interval)
  // }, [])
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     gameTick()
  //   }, 500)

  //   return () => clearInterval(interval)
  // }, [])

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#111",
        overflow: "hidden",
      }}
    >
      {worshippers.map((w) => (
        <div
          key={w.id}
          onMouseEnter={() => setHoveredId(w.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            position: "absolute",
            left: w.position.x,
            top: w.position.y,
            width: w.size,
            height: w.size,
            background: w.status === "praying" ? "lightblue" : w.status === "blaspheming" ? "red" : "white",
            cursor: "pointer",
          }}
        >
          {hoveredId === w.id && (
            <div
              style={{
                position: "absolute",
                top: -70,
                left: 15,
                background: "#222",
                color: "white",
                padding: "6px 8px",
                fontSize: 12,
                borderRadius: 4,
                whiteSpace: "nowrap",
                border: "1px solid #555",
                pointerEvents: "none",
              }}
            >
              <div>
                <b>{w.name}</b>
              </div>
              <div>Grace: {w.gracePoints}</div>
              <div>Status: {w.status}</div>
              <div>
                Pos: {Math.round(w.position.x)} / {Math.round(w.position.y)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
