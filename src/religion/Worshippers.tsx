import { useState } from "react";
import { WorshipperStatuses, type Worshipper } from "./worshipper";
import { useReligionGameStore } from "./religionStore";

export const Worshippers = (worshippers: Worshipper[]) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const addGrace = useReligionGameStore((s) => s.addGrace);
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
          onClick={() => {
            if (w.status === WorshipperStatuses.praying) {
              addGrace(w.id);
            }
          }}
          style={{
            position: "absolute",
            left: w.position.x,
            top: w.position.y,
            width: w.size,
            height: w.size,
            background:
              w.status === WorshipperStatuses.praying
                ? "lightblue"
                : w.status === WorshipperStatuses.blaspheming
                  ? "red"
                  : "white",
            cursor: w.status === WorshipperStatuses.praying ? "pointer" : "default",
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
