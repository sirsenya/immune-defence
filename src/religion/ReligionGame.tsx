import { useEffect } from "react";
import { useReligionGameStore } from "./religionStore";
import { Worshippers } from "./Worshippers";

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

  return Worshippers(worshippers);
};
