

import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../game/GameScene";

const GameScenePage = () => {
  const gameRef = useRef(null); // reference to the Phaser game instance

  useEffect(() => {
    if (gameRef.current) return; // Prevent re-initialization

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      physics: {
        default: "arcade",
        arcade: {
          debug: true,
        },
      },
      scene: [GameScene],
      parent: "phaser-container", // attach to a DOM node
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div id="phaser-container" style={{ width: "800px", height: "600px", margin: "0 auto" }} />
  );
};

export default GameScenePage;