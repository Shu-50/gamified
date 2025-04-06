import characterImg from "../assets/character.png";
import { useEffect, useState } from "react";

export default function Character() {
  const [position, setPosition] = useState({ x: 100, y: 100 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const move = { x: 0, y: 0 };
      if (e.key === "ArrowUp") move.y = -10;
      else if (e.key === "ArrowDown") move.y = 10;
      else if (e.key === "ArrowLeft") move.x = -10;
      else if (e.key === "ArrowRight") move.x = 10;
      setPosition((prev) => ({ x: prev.x + move.x, y: prev.y + move.y }));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <img
      src={characterImg}
      alt="Character"
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        width: "40px",
        height: "40px",
      }}
    />
  );
}
