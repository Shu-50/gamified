import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const GameApp = () => {
  const gameContainerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [activePopup, setActivePopup] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState({
    "📘 Math": [],
    "📗 Science": [],
    "📕 History": []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 100 });

  // Mock wall data for collision detection
  const wallData = [
    [160, 180], [150, 320, 350, 10], [660, 480, 350, 10], [662, 320, 350, 10],
    [160, 100], [240, 180], [160, 240], [80, 180], [80, 240], [240, 100],
    [80, 100], [150, 480, 350, 10], [400, 165, 10, 320], [600, 620, 250, 160],
    [400, 650, 10, 320]
  ];

  // Check if player is in a zone
  const checkZones = () => {
    const { x, y } = playerPosition;
    
    // Cupboard zone check
    if (Math.abs(x - 350) < 30 && Math.abs(y - 50) < 50) {
      showCupboardPopup();
      return true;
    }
    
    // Notice zone check
    if (Math.abs(x - 50) < 32 && Math.abs(y - 530) < 32) {
      showNoticePopup();
      return true;
    }
    
    // Quiz zone check
    if (Math.abs(x - 470) < 32 && Math.abs(y - 750) < 32) {
      showQuizPopup();
      return true;
    }
    
    return false;
  };

  // Player movement logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activePopup) {
        handlePopupKeyControls(e);
        return;
      }

      const speed = 10;
      let newX = playerPosition.x;
      let newY = playerPosition.y;

      switch (e.key) {
        case 'ArrowLeft':
          newX -= speed;
          break;
        case 'ArrowRight':
          newX += speed;
          break;
        case 'ArrowUp':
          newY -= speed;
          break;
        case 'ArrowDown':
          newY += speed;
          break;
        case ' ': // Space key for interaction
          checkZones();
          break;
        default:
          break;
      }

      // Simple collision detection with walls
      if (!checkWallCollision(newX, newY)) {
        setPlayerPosition({ x: newX, y: newY });
      }
    };

    const handlePopupKeyControls = (e) => {
      if (e.key === 'Escape') {
        setActivePopup(null);
        return;
      }

      if (activePopup === 'cupboard') {
        if (e.key === 'ArrowUp') {
          setSelectedSubject(prev => (prev - 1 + 3) % 3);
        } else if (e.key === 'ArrowDown') {
          setSelectedSubject(prev => (prev + 1) % 3);
        } else if (e.key === 'Enter') {
          const subjects = ["📘 Math", "📗 Science", "📕 History"];
          showDocumentPopup(subjects[selectedSubject]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, activePopup, selectedSubject]);

  // Check for wall collisions
  const checkWallCollision = (x, y) => {
    const playerWidth = 32;
    const playerHeight = 32;
    
    for (const [wallX, wallY, width = 64, height = 64] of wallData) {
      if (
        x < wallX + width / 2 + playerWidth / 2 &&
        x > wallX - width / 2 - playerWidth / 2 &&
        y < wallY + height / 2 + playerHeight / 2 &&
        y > wallY - height / 2 - playerHeight / 2
      ) {
        return true;
      }
    }
    
    return false;
  };

  // Popup control functions
  const showCupboardPopup = () => {
    if (!activePopup) {
      setActivePopup('cupboard');
    }
  };

  const showNoticePopup = () => {
    if (!activePopup) {
      setActivePopup('notice');
    }
  };

  const showDocumentPopup = (subject) => {
    setActivePopup('document');
    setSelectedSubject(["📘 Math", "📗 Science", "📕 History"].indexOf(subject));
  };

  const showQuizPopup = () => {
    setActivePopup('quiz-loading');
    setIsLoading(true);
    
    axios.post('http://localhost:5000/api/quiz', { subject: "Math" })
      .then(res => {
        const quizText = res.data.quiz;
        const parsedQuiz = parseQuizText(quizText);
        setCurrentQuiz(parsedQuiz);
        setQuizIndex(0);
        setScore(0);
        setIsLoading(false);
        setActivePopup('quiz');
      })
      .catch(error => {
        console.error("Quiz fetch error:", error);
        setIsLoading(false);
        setActivePopup(null);
      });
  };

  const parseQuizText = (text) => {
    const questions = [];
    const blocks = text.split(/Q\d+:/).slice(1);

    blocks.forEach(block => {
      const lines = block.trim().split('\n');
      const question = lines[0].trim();
      const options = lines.slice(1, 5).map(line => line.slice(3).trim());

      const answerLine = lines.find(line => line.includes("Answer:"));
      const answer = answerLine ? answerLine.split("Answer:")[1].trim() : options[0];

      questions.push({
        question,
        options,
        answer
      });
    });

    return questions;
  };

  const handleFileUpload = (subject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.txt";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log(`File selected for ${subject}:`, file.name);
        
        setUploadedDocuments(prev => ({
          ...prev,
          [subject]: [...(prev[subject] || []), file.name]
        }));
      }
    };
    input.click();
  };

  const handleQuizSubmit = () => {
    if (!selectedOption) return;
    
    const q = currentQuiz[quizIndex];
    if (selectedOption === q.answer) {
      setScore(prev => prev + 1);
    }
    
    if (quizIndex < currentQuiz.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setActivePopup('quiz-result');
    }
  };

  return (
    <div className="game-container relative w-full h-screen bg-gray-800 overflow-hidden">
      {/* Game Background */}
      <div className="absolute inset-0 bg-blue-900">
        <img src="/assets/background.png" alt="Background" className="w-full h-full object-cover" />
      </div>
      
      {/* Player */}
      <div 
        className="absolute w-16 h-16 bg-blue-500" 
        style={{ 
          left: `${playerPosition.x - 8}px`, 
          top: `${playerPosition.y - 8}px`,
          transition: 'left 0.1s, top 0.1s'
        }}
      />
      
      {/* Cupboard Popup */}
      {activePopup === 'cupboard' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-95 p-6 rounded-lg w-80">
          {["📘 Math", "📗 Science", "📕 History"].map((subject, idx) => (
            <div 
              key={subject} 
              className={`py-2 px-4 text-lg cursor-pointer ${selectedSubject === idx ? 'text-yellow-400' : 'text-white'}`}
              onClick={() => showDocumentPopup(subject)}
            >
              {subject}
            </div>
          ))}
          <div className="mt-4 text-sm text-gray-400">Press ESC to close</div>
        </div>
      )}
      
      {/* Notice Popup */}
      {activePopup === 'notice' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-95 p-6 rounded-lg w-80">
          <h3 className="text-xl font-bold text-white mb-4">📌 Notice Board</h3>
          <div className="py-2 text-white">📢 Exam on Friday</div>
          <div className="py-2 text-white">📢 Science Fair: Monday</div>
          <button 
            className="mt-6 py-2 px-4 bg-green-800 text-green-400 rounded"
            onClick={() => handleFileUpload("Notice")}
          >
            ⬆️ Upload Notice
          </button>
          <div className="mt-4 text-sm text-gray-400">Press ESC to close</div>
        </div>
      )}
      
      {/* Document Popup */}
      {activePopup === 'document' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-98 p-6 rounded-lg w-96">
          <h3 className="text-xl font-bold text-white mb-4">
            📄 Documents for {["📘 Math", "📗 Science", "📕 History"][selectedSubject]}
          </h3>
          
          <div className="max-h-40 overflow-y-auto mb-4">
            {uploadedDocuments[["📘 Math", "📗 Science", "📕 History"][selectedSubject]]?.map((file, idx) => (
              <div key={idx} className="py-1 text-white">📄 {file}</div>
            ))}
            {!uploadedDocuments[["📘 Math", "📗 Science", "📕 History"][selectedSubject]]?.length && (
              <div className="py-1 text-gray-400">No documents uploaded yet</div>
            )}
          </div>
          
          <button 
            className="mt-2 py-2 px-4 bg-green-800 text-green-400 rounded"
            onClick={() => handleFileUpload(["📘 Math", "📗 Science", "📕 History"][selectedSubject])}
          >
            ⬆️ Upload Document
          </button>
          <div className="mt-4 text-sm text-gray-400">Press ESC to close</div>
        </div>
      )}
      
      {/* Quiz Loading Popup */}
      {activePopup === 'quiz-loading' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 p-6 rounded-lg">
          <div className="text-xl text-white text-center">Loading Quiz...</div>
        </div>
      )}
      
      {/* Quiz Popup */}
      {activePopup === 'quiz' && currentQuiz.length > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-900 bg-opacity-90 p-6 rounded-lg w-96">
          <div className="text-lg text-white mb-6">
            {currentQuiz[quizIndex].question}
          </div>
          
          {['A', 'B', 'C', 'D'].map((label, idx) => (
            <div 
              key={label}
              className={`py-2 px-4 mb-2 cursor-pointer rounded ${selectedOption === label ? 'text-green-400' : 'text-white'}`}
              onClick={() => setSelectedOption(label)}
            >
              {label}. {currentQuiz[quizIndex].options[idx]}
            </div>
          ))}
          
          <button 
            className="mt-6 py-2 px-4 bg-green-700 text-white rounded"
            onClick={handleQuizSubmit}
          >
            ✅ Submit
          </button>
          <div className="mt-4 text-sm text-gray-400">Press ESC to close</div>
        </div>
      )}
      
      {/* Quiz Result Popup */}
      {activePopup === 'quiz-result' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-95 p-6 rounded-lg w-80">
          <div className="text-xl text-white text-center mb-6">
            Your score: {score}
          </div>
          <button 
            className="w-full py-2 px-4 bg-red-700 text-white rounded"
            onClick={() => setActivePopup(null)}
          >
            ❌ Close
          </button>
        </div>
      )}

      {/* Game instructions overlay */}
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-2 rounded">
        <div>Arrow keys: Move</div>
        <div>Space: Interact</div>
        <div>ESC: Close popups</div>
      </div>
    </div>
  );
};

export default GameApp;