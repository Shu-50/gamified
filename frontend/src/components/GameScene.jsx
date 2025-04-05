// import React, { useEffect, useRef, useState } from 'react';
// import Phaser from 'phaser';
// import axios from 'axios';
// import { io } from 'socket.io-client';

// const GameScene = () => {
//   const gameRef = useRef(null);
//   const [score, setScore] = useState(0);
//   const [activePopup, setActivePopup] = useState(null);
//   const [selectedSubject, setSelectedSubject] = useState(0);
//   const [currentQuiz, setCurrentQuiz] = useState([]);
//   const [quizIndex, setQuizIndex] = useState(0);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [uploadedDocuments, setUploadedDocuments] = useState({
//     "📘 Math": [],
//     "📗 Science": [],
//     "📕 History": []
//   });
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Initialize socket connection
//   useEffect(() => {
//     const socket = io("http://localhost:5000", { withCredentials: true });
    
//     socket.on("user-connected", (userId) => {
//       console.log("Another user joined:", userId);
//     });
    
//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   // Setup Phaser game
//   useEffect(() => {
//     // Configuration for our Phaser game
//     const config = {
//       type: Phaser.AUTO,
//       parent: 'game-container',
//       width: '100%',
//       height: '100%',
//       physics: {
//         default: 'arcade',
//         arcade: {
//           gravity: { y: 0 },
//           debug: false
//         }
//       },
//       scene: {
//         preload: preload,
//         create: create,
//         update: update
//       }
//     };
    
//     let game = new Phaser.Game(config);
//     let player;
//     let cursors;
//     let walls;
//     let cupboardZone;
//     let noticeZone;
//     let studentZone;
//     let cupboardPopup;
//     let docPopup;
//     let noticePopup;
//     let studentPopup;
//     let popupShown = false;
//     let selectedIndex = 0;
//     let subjects = [];
//     let canOpenNotice = false;
//     let canOpenStudent = false;
//     let interactKey;
    
//     // Helper function to create a player with name label
//     function createPlayerWithLabel(scene, x, y, textureKey, playerName, enablePhysics = false) {
//       const image = enablePhysics
//         ? scene.physics.add.image(0, 0, textureKey).setOrigin(0.5, 0.5)
//         : scene.add.image(0, 0, textureKey).setOrigin(0.5, 0.5);
      
//       const nameText = scene.add.text(0, -30, playerName, {
//         font: '14px Arial',
//         fill: '#ffffff',
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         padding: { x: 6, y: 3 },
//       }).setOrigin(0.5);
      
//       const container = scene.add.container(x, y, [image, nameText]);
      
//       if (enablePhysics) {
//         scene.physics.world.enable(container);
//         container.body.setCollideWorldBounds(true);
//       }
      
//       container.setDepth(10);
//       return container;
//     }
    
//     // Preload game assets
//     function preload() {
//       this.load.image("background", "/assets/background.png");
//       this.load.image("player", "/assets/blue-square.png");
//     }
    
//     // Create game objects
//     function create() {
//       // Add background and get its dimensions
//       const bg = this.add.image(0, 0, "background").setOrigin(0).setScale(1);
//       interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      
//       // Set world and camera bounds to match background image
//       this.physics.world.setBounds(0, 0, bg.width, bg.height);
//       this.cameras.main.setBounds(0, 0, bg.width, bg.height);
      
//       // Create player
//       player = this.physics.add.sprite(100, 100, "player").setCollideWorldBounds(true);
//       player.setScale(0.5);
      
//       // Enable camera follow
//       this.cameras.main.startFollow(player);
      
//       // Create walls group and place invisible walls
//       walls = this.physics.add.staticGroup();
      
//       // Wall placements
//       const wallData = [
//         [160, 180], [150, 320, 350, 10], [660, 480, 350, 10], [662, 320, 350, 10],
//         [160, 100], [240, 180], [160, 240], [80, 180], [80, 240], [240, 100],
//         [80, 100], [150, 480, 350, 10], [400, 165, 10, 320], [600, 620, 250, 160],
//         [400, 650, 10, 320]
//       ];
      
//       // Create walls from data
//       wallData.forEach(wall => {
//         if (wall.length === 2) {
//           walls.create(wall[0], wall[1], "player").setVisible(false);
//         } else {
//           walls.create(wall[0], wall[1], "player").setVisible(false).setSize(wall[2], wall[3]);
//         }
//       });
      
//       // Player collides with walls
//       this.physics.add.collider(player, walls);
      
//       // Setup arrow key controls
//       cursors = this.input.keyboard.createCursorKeys();
      
//       // Cupboard Zone
//       cupboardZone = this.add.zone(350, 50, 60, 100);
//       this.physics.world.enable(cupboardZone);
//       cupboardZone.body.setAllowGravity(false);
//       cupboardZone.body.setImmovable(true);
      
//       this.physics.add.overlap(player, cupboardZone, () => {
//         if (Phaser.Input.Keyboard.JustDown(interactKey)) {
//           showCupboardPopup();
//         }
//       }, null, this);
      
//       // Cupboard popup
//       cupboardPopup = this.add.container(400, 300).setVisible(false);
//       let popupBg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.95).setOrigin(0.5);
      
//       // Create subject list with selection highlight
//       subjects = [
//         this.add.text(-100, -50, "📘 Math", { fontSize: '20px', fill: '#fff' }),
//         this.add.text(-100, 0, "📗 Science", { fontSize: '20px', fill: '#fff' }),
//         this.add.text(-100, 50, "📕 History", { fontSize: '20px', fill: '#fff' }),
//       ];
      
//       // Add all elements to cupboardPopup
//       cupboardPopup.add([popupBg, ...subjects]);
      
//       // Notice board zone
//       noticeZone = this.add.zone(600, 150, 80, 100);
//       this.physics.world.enable(noticeZone);
//       noticeZone.body.setAllowGravity(false);
//       noticeZone.body.setImmovable(true);
      
//       this.physics.add.overlap(player, noticeZone, () => {
//         canOpenNotice = true;
//       }, null, this);
      
//       // Student info zone
//       studentZone = this.add.zone(850, 200, 80, 100);
//       this.physics.world.enable(studentZone);
//       studentZone.body.setAllowGravity(false);
//       studentZone.body.setImmovable(true);
      
//       this.physics.add.overlap(player, studentZone, () => {
//         canOpenStudent = true;
//       }, null, this);
      
//       // Quiz zone (you can add this similar to other zones)
//       const quizZone = this.add.zone(470, 750, 64, 64);
//       this.physics.world.enable(quizZone);
//       quizZone.body.setAllowGravity(false);
//       quizZone.body.setImmovable(true);
      
//       this.physics.add.overlap(player, quizZone, () => {
//         if (Phaser.Input.Keyboard.JustDown(interactKey)) {
//           setActivePopup('quiz-loading');
//           setIsLoading(true);
          
//           axios.post('http://localhost:5000/api/quiz', { subject: "Math" })
//             .then(res => {
//               const quizText = res.data.quiz;
//               const parsedQuiz = parseQuizText(quizText);
//               setCurrentQuiz(parsedQuiz);
//               setQuizIndex(0);
//               setScore(0);
//               setIsLoading(false);
//               setActivePopup('quiz');
//             })
//             .catch(error => {
//               console.error("Quiz fetch error:", error);
//               setIsLoading(false);
//               setActivePopup(null);
//             });
//         }
//       }, null, this);
      
//       // Keyboard handling for popups
//       this.input.keyboard.on('keydown-UP', () => {
//         if (popupShown) {
//           selectedIndex = (selectedIndex - 1 + subjects.length) % subjects.length;
//           setSelectedSubject(selectedIndex);
//           highlightSelectedSubject();
//         }
//       });
      
//       this.input.keyboard.on('keydown-DOWN', () => {
//         if (popupShown) {
//           selectedIndex = (selectedIndex + 1) % subjects.length;
//           setSelectedSubject(selectedIndex);
//           highlightSelectedSubject();
//         }
//       });
      
//       this.input.keyboard.on('keydown-ENTER', () => {
//         if (popupShown) {
//           const selectedSubjectName = subjects[selectedIndex].text;
//           showDocumentPopup(selectedSubjectName);
//         }
//       });
      
//       // Escape to close popups
//       this.input.keyboard.on('keydown-ESC', () => {
//         if (docPopup && docPopup.visible) {
//           docPopup.setVisible(false);
//         } else if (noticePopup && noticePopup.visible) {
//           noticePopup.setVisible(false);
//         } else if (studentPopup && studentPopup.visible) {
//           studentPopup.setVisible(false);
//         } else if (popupShown) {
//           cupboardPopup.setVisible(false);
//           popupShown = false;
//         }
        
//         setActivePopup(null);
//         player.body.moves = true;
//       });
      
//       // Function to highlight selected subject
//       function highlightSelectedSubject() {
//         subjects.forEach((text, index) => {
//           text.setStyle({ fill: index === selectedIndex ? '#ffff00' : '#ffffff' }); // Yellow if selected
//         });
//       }
      
//       // Function to show cupboard popup
//       function showCupboardPopup() {
//         if (!popupShown) {
//           cupboardPopup.setVisible(true);
//           popupShown = true;
//           player.body.moves = false;
//           highlightSelectedSubject();
//           setActivePopup('cupboard');
//         }
//       }
      
//       // Function to show document popup
//       function showDocumentPopup(subject) {
//         cupboardPopup.setVisible(false);
//         popupShown = false;
        
//         // Destroy previous doc popup if it exists
//         if (docPopup) docPopup.destroy();
        
//         docPopup = game.scene.scenes[0].add.container(400, 300);
        
//         const bg = game.scene.scenes[0].add.rectangle(0, 0, 350, 300, 0x222222, 0.98).setOrigin(0.5);
//         const heading = game.scene.scenes[0].add.text(-140, -120, `📄 Documents for ${subject}`, { fontSize: '18px', fill: '#fff' });
        
//         // Get the documents for this subject
//         const subjectDocs = uploadedDocuments[subject] || [];
        
//         const docs = subjectDocs.map((doc, index) => {
//           return game.scene.scenes[0].add.text(-100, -60 + (index * 30), `📄 ${doc}`, { fontSize: '16px', fill: '#fff' });
//         });
        
//         // If no documents, show message
//         if (docs.length === 0) {
//           docs.push(game.scene.scenes[0].add.text(-100, -60, "No documents uploaded yet", { fontSize: '16px', fill: '#999' }));
//         }
        
//         const uploadButton = game.scene.scenes[0].add.text(-100, 70, "⬆️ Upload Document", {
//           fontSize: '16px',
//           fill: '#0f0',
//           backgroundColor: '#000',
//           padding: { x: 5, y: 5 }
//         }).setInteractive();
        
//         uploadButton.on("pointerdown", () => {
//           const input = document.createElement("input");
//           input.type = "file";
//           input.accept = ".pdf,.doc,.docx,.txt";
          
//           input.onchange = (e) => {
//             const file = e.target.files[0];
//             if (file) {
//               console.log(`File selected for ${subject}:`, file.name);
              
//               // Update the uploaded documents
//               setUploadedDocuments(prev => ({
//                 ...prev,
//                 [subject]: [...(prev[subject] || []), file.name]
//               }));
              
//               // Refresh document popup to show new file
//               showDocumentPopup(subject);
//             }
//           };
//           input.click();
//         });
        
//         docPopup.add([bg, heading, ...docs, uploadButton]);
//         setActivePopup('document');
//       }
      
//       // Function to show notice board
//       function showNoticeBoard() {
//         if (noticePopup) noticePopup.destroy();
        
//         noticePopup = game.scene.scenes[0].add.container(400, 300);
        
//         const bg = game.scene.scenes[0].add.rectangle(0, 0, 350, 300, 0x000000, 0.95).setOrigin(0.5);
//         const heading = game.scene.scenes[0].add.text(-120, -120, "📌 Notice Board", {
//           fontSize: '20px',
//           fill: '#fff'
//         });
        
//         // Example notice list
//         const notices = [
//           game.scene.scenes[0].add.text(-140, -70, "📢 Exam on Friday", { fontSize: '16px', fill: '#fff' }),
//           game.scene.scenes[0].add.text(-140, -40, "📢 Science Fair: Monday", { fontSize: '16px', fill: '#fff' }),
//         ];
        
//         const uploadButton = game.scene.scenes[0].add.text(-120, 80, "⬆️ Upload Notice", {
//           fontSize: '16px',
//           fill: '#0f0',
//           backgroundColor: '#000',
//           padding: { x: 5, y: 5 }
//         }).setInteractive();
        
//         uploadButton.on("pointerdown", () => {
//           const input = document.createElement("input");
//           input.type = "file";
//           input.accept = ".txt,.pdf,.doc,.docx";
//           input.onchange = (e) => {
//             const file = e.target.files[0];
//             if (file) {
//               console.log("Uploaded Notice:", file.name);
//               // You can push this to the backend or update the notices array
//             }
//           };
//           input.click();
//         });
        
//         const closeButton = game.scene.scenes[0].add.text(130, -120, "❌", {
//           fontSize: '18px',
//           fill: '#f55'
//         }).setInteractive();
        
//         closeButton.on("pointerdown", () => {
//           noticePopup.setVisible(false);
//           player.body.moves = true;
//           setActivePopup(null);
//         });
        
//         noticePopup.add([bg, heading, ...notices, uploadButton, closeButton]);
//         setActivePopup('notice');
//       }
      
//       // Function to show student profile
//       function showStudentProfile() {
//         if (studentPopup) studentPopup.destroy();
        
//         studentPopup = game.scene.scenes[0].add.container(400, 300);
        
//         const bg = game.scene.scenes[0].add.rectangle(0, 0, 350, 250, 0x1e1e1e, 0.95).setOrigin(0.5);
//         const title = game.scene.scenes[0].add.text(-120, -100, "🎓 Student Profile", {
//           fontSize: '20px',
//           fill: '#fff'
//         });
        
//         const name = game.scene.scenes[0].add.text(-100, -50, "👤 Name: Aryan Sharma", { fontSize: '16px', fill: '#fff' });
//         const id = game.scene.scenes[0].add.text(-100, -20, "🆔 ID: STD12345", { fontSize: '16px', fill: '#fff' });
//         const grade = game.scene.scenes[0].add.text(-100, 10, "📚 Grade: 10th", { fontSize: '16px', fill: '#fff' });
//         const subject = game.scene.scenes[0].add.text(-100, 40, "🧪 Favorite: Science", { fontSize: '16px', fill: '#fff' });
        
//         const closeBtn = game.scene.scenes[0].add.text(130, -100, "❌", {
//           fontSize: '18px',
//           fill: '#f55'
//         }).setInteractive();
        
//         closeBtn.on("pointerdown", () => {
//           studentPopup.setVisible(false);
//           player.body.moves = true;
//           setActivePopup(null);
//         });
        
//         studentPopup.add([bg, title, name, id, grade, subject, closeBtn]);
//         setActivePopup('student');
//       }
//     }
    
//     // Update game state
//     function update() {
//       if (!player || !cursors) return;
      
//       const speed = 400;
//       player.setVelocity(0);
      
//       if (cursors.left.isDown) {
//         player.setVelocityX(-speed);
//       } else if (cursors.right.isDown) {
//         player.setVelocityX(speed);
//       }
      
//       if (cursors.up.isDown) {
//         player.setVelocityY(-speed);
//       } else if (cursors.down.isDown) {
//         player.setVelocityY(speed);
//       }
      
//       // Notice board interaction
//       if (canOpenNotice && Phaser.Input.Keyboard.JustDown(interactKey)) {
//         showNoticeBoard();
//         canOpenNotice = false;
//         player.body.moves = false;
//       }
      
//       // Reset flag when moving away from notice board
//       if (noticeZone && player && !Phaser.Geom.Intersects.RectangleToRectangle(
//         player.getBounds(),
//         noticeZone.getBounds()
//       )) {
//         canOpenNotice = false;
//       }
      
//       // Student profile interaction
//       if (canOpenStudent && Phaser.Input.Keyboard.JustDown(interactKey)) {
//         showStudentProfile();
//         canOpenStudent = false;
//         player.body.moves = false;
//       }
      
//       // Reset flag when moving away from student zone
//       if (studentZone && player && !Phaser.Geom.Intersects.RectangleToRectangle(
//         player.getBounds(),
//         studentZone.getBounds()
//       )) {
//         canOpenStudent = false;
//       }
//     }
    
//     // Helper function to parse quiz text
//     function parseQuizText(text) {
//       const questions = [];
//       const blocks = text.split(/Q\d+:/).slice(1);
      
//       blocks.forEach(block => {
//         const lines = block.trim().split('\n');
//         const question = lines[0].trim();
//         const options = lines.slice(1, 5).map(line => line.slice(3).trim());
        
//         const answerLine = lines.find(line => line.includes("Answer:"));
//         const answer = answerLine ? answerLine.split("Answer:")[1].trim() : options[0];
        
//         questions.push({
//           question,
//           options,
//           answer
//         });
//       });
      
//       return questions;
//     }
    
//     // Save game instance ref for cleanup
//     gameRef.current = game;
    
//     // Cleanup on unmount
//     return () => {
//       if (gameRef.current) {
//         gameRef.current.destroy(true);
//       }
//     };
//   }, [uploadedDocuments]); // Add dependencies as needed

//   // Handle quiz submission
//   const handleQuizSubmit = () => {
//     if (!selectedOption) return;
    
//     const q = currentQuiz[quizIndex];
//     if (selectedOption === q.answer) {
//       setScore(prev => prev + 1);
//     }
    
//     if (quizIndex < currentQuiz.length - 1) {
//       setQuizIndex(prev => prev + 1);
//       setSelectedOption(null);
//     } else {
//       setActivePopup('quiz-result');
//     }
//   };

//   return (
//     <div className="game-container relative w-full h-screen overflow-hidden">
//       {/* Game Canvas Container */}
//       <div id="game-container" className="absolute inset-0"></div>
      
//       {/* React UI Overlays for popups that are better handled with React */}
//       {activePopup === 'quiz' && currentQuiz.length > 0 && (
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-900 bg-opacity-90 p-6 rounded-lg w-96 z-50">
//           <div className="text-lg text-white mb-6">
//             {currentQuiz[quizIndex].question}
//           </div>
          
//           {['A', 'B', 'C', 'D'].map((label, idx) => (
//             <div 
//               key={label}
//               className={`py-2 px-4 mb-2 cursor-pointer rounded ${selectedOption === label ? 'text-green-400' : 'text-white'}`}
//               onClick={() => setSelectedOption(label)}
//             >
//               {label}. {currentQuiz[quizIndex].options[idx]}
//             </div>
//           ))}
          
//           <button 
//             className="mt-6 py-2 px-4 bg-green-700 text-white rounded"
//             onClick={handleQuizSubmit}
//           >
//             ✅ Submit
//           </button>
//           <div className="mt-4 text-sm text-gray-400">Press ESC to close</div>
//         </div>
//       )}
      
//       {activePopup === 'quiz-loading' && (
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 p-6 rounded-lg z-50">
//           <div className="text-xl text-white text-center">Loading Quiz...</div>
//         </div>
//       )}
      
//       {activePopup === 'quiz-result' && (
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-95 p-6 rounded-lg w-80 z-50">
//           <div className="text-xl text-white text-center mb-6">
//             Your score: {score}
//           </div>
//           <button 
//             className="w-full py-2 px-4 bg-red-700 text-white rounded"
//             onClick={() => setActivePopup(null)}
//           >
//             ❌ Close
//           </button>
//         </div>
//       )}

//       {/* Game instructions overlay */}
//       <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-2 rounded">
//         <div>Arrow keys: Move</div>
//         <div>Space: Interact</div>
//         <div>ESC: Close popups</div>
//       </div>
//     </div>
//   );
// };

// export default GameScene;
