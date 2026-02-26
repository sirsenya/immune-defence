import { useEffect } from "react";
import { useReligionGameStore } from "./religionStore";

export const ReligionGame = () => {
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
          style={{
            position: "absolute",
            left: w.position.x,
            top: w.position.y,
            width: w.size,
            height: w.size,
            background: "white",
          }}
        />
      ))}
    </div>
  );
};
