
import Phaser from "phaser";
// import GameScene from "../game/ClassroomPage"; // or your main game scene
// import GameScene from "../game/GameScene"; // or your main game scene
import GameScene from "../game/GameComponent"; // or your main game scene
import { useEffect, useState } from "react";
import ChatBox from "./Chatbot";
import Dashboard from "./Dashboard"
import { useLocation } from 'react-router-dom';

export default function Game() {
  const student = JSON.parse(localStorage.getItem("studentInfo"));

  const location = useLocation();
  const { studentId } = location.state || {};

  const [showChat, setShowChat] = useState(false); // ✅ Define state
  const [showdash , setdash] = useState(false); // ✅ Define state

  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container", // must match div ID
    scene: GameScene,
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
  };

  useEffect(() => {
    const game = new Phaser.Game({ ...config, scene: [new GameScene(student)] });

    return () => {
      game.destroy(true);
    };
  }, []);

  // ✅ ESC key hides chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowChat(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div id="game-container" className="w-full h-screen relative">
      {/* 💬 Chat Toggle Button */}
      <button
        onClick={() => setShowChat((prev) => !prev)}
        className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg text-xl z-50"
        title="Open Chat"
      >
        💬
      </button>

      {/* 📨 ChatBox Component */}
      {showChat && (
        <div className="absolute bottom-20 right-4 z-50">
          <ChatBox />
        </div>
      )}
      <button
        onClick={() => setdash((prev) => !prev)}
        className="absolute bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg text-xl z-50"
        title="Dashboard"
      >
        🙂
      </button>

      
      {showdash && (
  <div className="absolute bottom-20 right-4 z-50">
    <div className="bg-white/90 rounded-xl p-2 shadow-xl">
      <Dashboard studentId={studentId}/>
    </div>
  </div>
)}

    </div>
  );
}
