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
    <div style={{ padding: 20 }}>
      <h1>Religion Game</h1>
      {gameStatus === "lost" && <h2 style={{ color: "red" }}>ПРОИГРЫШ</h2>}

      {worshippers.map((worshipper) => (
        <div
          key={worshipper.id}
          style={{
            border: "1px solid gray",
            marginBottom: 10,
            padding: 10,
          }}
        >
          <h3>{worshipper.name}</h3>
          <p>Grace: {worshipper.gracePoints}</p>
          <p>Status: {worshipper.status}</p>

          <button onClick={() => {}}>+ Макрофаг</button>
        </div>
      ))}
      <button onClick={() => reset()}>Reset</button>
    </div>
  );
};
