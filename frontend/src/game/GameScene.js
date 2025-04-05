

import Phaser from "phaser";
import axios from "axios";
// Dummy quiz data


export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }
  score= 0;
  preload() {
    this.load.image("background", "/assets/background.png");
    this.load.image("player", "/assets/blue-square.png");
  }

  create() {
    this.uploadedDocuments = {
      "📘 Math": [],
      "📗 Science": [],
      "📕 History": []
    };
    
    // Background setup
    const bg = this.add.image(0, 0, "background").setOrigin(0).setScale(1);
    this.physics.world.setBounds(0, 0, bg.width, bg.height);
    this.cameras.main.setBounds(0, 0, bg.width, bg.height);

    // Player setup
    this.player = this.physics.add.sprite(100, 100, "player")
      .setCollideWorldBounds(true)
      .setScale(0.5);
    this.cameras.main.startFollow(this.player);

    // Input keys
    this.cursors = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Wall setup
    this.walls = this.physics.add.staticGroup();
    const wallData = [
      [160, 180], [150, 320, 350, 10], [660, 480, 350, 10], [662, 320, 350, 10],
      [160, 100], [240, 180], [160, 240], [80, 180], [80, 240], [240, 100],
      [80, 100], [150, 480, 350, 10], [400, 165, 10, 320], [600, 620, 250, 160],
      [400, 650, 10, 320]
    ];
    wallData.forEach(([x, y, width = 64, height = 64]) => {
      this.walls.create(x, y, "player")
        .setVisible(false)
        .setSize(width, height)
        .setDisplaySize(width, height);
    });
    this.physics.add.collider(this.player, this.walls);

    this.createLoadingPopup();

    // ======================= STATE FLAGS =======================
    this.activePopup = null;
    this.popupShown = false;

    // ======================= ZONES =======================
    this.createCupboardZone();
    this.createNoticeZone();
    this.createQuizZone();

    // ======================= INPUT EVENTS =======================
    this.setupKeyboardControls();
  }

  // ============ Zone Methods ============
  createCupboardZone() {
    this.cupboardZone = this.add.zone(350, 50, 60, 100);
    this.physics.world.enable(this.cupboardZone);
    this.cupboardZone.body.setAllowGravity(false).setImmovable(true);
    this.physics.add.overlap(this.player, this.cupboardZone, () => this.showCupboardPopup(), null, this);

    this.cupboardPopup = this.add.container(400, 300).setVisible(false);
    let cupboardBg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.95).setOrigin(0.5);
    this.subjects = [
      this.add.text(-100, -50, "📘 Math", { fontSize: '20px', fill: '#fff' }),
      this.add.text(-100, 0, "📗 Science", { fontSize: '20px', fill: '#fff' }),
      this.add.text(-100, 50, "📕 History", { fontSize: '20px', fill: '#fff' }),
    ];
    this.selectedIndex = 0;
    this.highlightSelectedSubject = () => {
      this.subjects.forEach((text, i) => {
        text.setStyle({ fill: i === this.selectedIndex ? '#ffff00' : '#ffffff' });
      });
    };
    this.highlightSelectedSubject();
    this.cupboardPopup.add([cupboardBg, ...this.subjects]);
  }

  createNoticeZone() {
    this.noticeZone = this.add.zone(50, 530, 64, 64);
    this.physics.world.enable(this.noticeZone);
    this.noticeZone.body.setAllowGravity(false).setImmovable(true);
    this.physics.add.overlap(this.player, this.noticeZone, () => this.showNoticePopup(), null, this);

    this.noticePopup = this.add.container(400, 300).setVisible(false);
    const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.95).setOrigin(0.5);
    const heading = this.add.text(-120, -80, "📌 Notice Board", { fontSize: '20px', fill: '#fff' });
    const notices = [
      this.add.text(-100, -30, "📢 Exam on Friday", { fontSize: '16px', fill: '#fff' }),
      this.add.text(-100, 0, "📢 Science Fair: Monday", { fontSize: '16px', fill: '#fff' }),
    ];
    const uploadNotice = this.add.text(-100, 60, "⬆️ Upload Notice", {
      fontSize: '16px',
      fill: '#0f0',
      backgroundColor: '#000',
      padding: { x: 5, y: 5 }
    }).setInteractive();

    uploadNotice.on("pointerdown", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.txt";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) console.log("Notice uploaded:", file.name);
      };
      input.click();
    });

    this.noticePopup.add([bg, heading, ...notices, uploadNotice]);
  }

  createQuizZone() {
    this.quizZone = this.add.zone(470, 750, 64, 64);
    this.physics.world.enable(this.quizZone);
    this.quizZone.body.setAllowGravity(false).setImmovable(true);
    this.physics.add.overlap(this.player, this.quizZone, () => this.showQuizPopup(), null, this);
  }

  // ============ Input Events ============
  setupKeyboardControls() {
    this.input.keyboard.on('keydown-UP', () => {
      if (this.activePopup === "cupboard") {
        this.selectedIndex = (this.selectedIndex - 1 + this.subjects.length) % this.subjects.length;
        this.highlightSelectedSubject();
      }
    });
  
    this.input.keyboard.on('keydown-DOWN', () => {
      if (this.activePopup === "cupboard") {
        this.selectedIndex = (this.selectedIndex + 1) % this.subjects.length;
        this.highlightSelectedSubject();
      }
    });
  
    this.input.keyboard.on('keydown-ENTER', () => {
      if (this.activePopup === "cupboard") {
        const selectedSubject = this.subjects[this.selectedIndex].text;
        this.showDocumentPopup(selectedSubject);
      }
    });
  
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.docPopup && this.docPopup.visible) {
        this.docPopup.setVisible(false);
      }
  
      if (this.quizPopup && this.quizPopup.visible) {
        this.quizPopup.setVisible(false);
      }
  
      if (this.cupboardPopup && this.cupboardPopup.visible) {
        this.cupboardPopup.setVisible(false);
      }
  
      if (this.noticePopup && this.noticePopup.visible) {
        this.noticePopup.setVisible(false);
      }
  
      // Reset states
      this.popupShown = false;
      this.activePopup = null;
      if (this.player.body) this.player.body.moves = true;
    });
  }
  
  // ============ Popup Methods ============
  showCupboardPopup() {
    if (!this.activePopup) {
      this.cupboardPopup.setVisible(true);
      this.activePopup = "cupboard";
      this.player.body.moves = false;
      this.highlightSelectedSubject();
    }
  }

  showNoticePopup() {
    if (!this.popupShown) {
      this.noticePopup.setVisible(true);
      this.popupShown = true;
      if (this.player.body) this.player.body.moves = false;
    }
  }


  renderQuizQuestion() {
    if (this.quizPopup) this.quizPopup.destroy();
  
    const q = this.currentQuiz[this.quizIndex];
    this.selectedOptionLabel = null;
  
    this.quizPopup = this.add.container(500, 350);
    this.popupShown = true;
    this.activePopup = "quiz";
  
    // 🎨 Background Panel
    const bg = this.add.graphics();
    bg.fillStyle(0x222244, 0.9); // Dark blueish with opacity
    bg.fillRoundedRect(-200, -150, 400, 300, 20);
  
    const questionText = this.add.text(-180, -120, q.question, {
      fontSize: '18px',
      fill: '#ffffff',
      wordWrap: { width: 360 }
    });
  
    const optionLabels = ['A', 'B', 'C', 'D'];
    const optionTexts = q.options.map((opt, i) => {
      const label = optionLabels[i];
      const txt = this.add.text(-150, -60 + i * 40, `${label}. ${opt}`, {
        fontSize: '16px',
        fill: '#ffffff'
      }).setInteractive();
  
      txt.on("pointerdown", () => {
        this.selectedOptionLabel = label;
        optionTexts.forEach(o => o.setStyle({ fill: '#ffffff' }));
        txt.setStyle({ fill: '#00ff00' });
      });
  
      return txt;
    });
  
    const submit = this.add.text(-50, 100, "✅ Submit", {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#00aa00',
      padding: { x: 10, y: 5 }
    }).setInteractive();
  
    submit.on("pointerdown", () => {
      if (!this.selectedOptionLabel) return;
      if (this.selectedOptionLabel === q.answer) {
        this.score++;
      }
      this.quizIndex++;
      if (this.quizIndex < this.currentQuiz.length) {
        this.renderQuizQuestion();
      } else {
        this.showQuizResult();
      }
    });
  
    // Add everything to the container
    this.quizPopup.add([bg, questionText, ...optionTexts, submit]);
  }
  
  

  showQuizResult() {
    this.quizPopup.destroy();
    this.quizPopup = this.add.container(500, 350);
    this.popupShown = true;
    this.activePopup = "quiz";

    const bg = this.add.rectangle(0, 0, 300, 200, 0x222222, 0.95).setOrigin(0.5);
    const result = this.add.text(-100, -20, `Your score: ${this.score}`, { fontSize: '20px', fill: '#fff' });
    const close = this.add.text(-50, 50, "❌ Close", {
      fontSize: '16px', fill: '#fff', backgroundColor: '#f00', padding: { x: 10, y: 5 }
    }).setInteractive();

    close.on("pointerdown", () => {
      this.quizPopup.setVisible(false);
      this.popupShown = false;
      this.activePopup = null;
      this.player.body.moves = true;
      console.log("Send to backend:", this.score);
    });

    this.quizPopup.add([bg, result, close]);
  }
  createLoadingPopup() {
    this.loadingPopup = this.add.container(400, 300).setVisible(false);
    const bg = this.add.rectangle(0, 0, 300, 100, 0x000000, 0.8).setOrigin(0.5);
    const loadingText = this.add.text(0, 0, "Loading Quiz...", {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    this.loadingPopup.add([bg, loadingText]);
  }
  

  showDocumentPopup(subject) {
    if (this.docPopup) this.docPopup.destroy();
    this.docPopup = this.add.container(400, 300);
    this.popupShown = true;

    const bg = this.add.rectangle(0, 0, 350, 300, 0x222222, 0.98).setOrigin(0.5);
    const heading = this.add.text(-140, -120, `📄 Documents for ${subject}`, { fontSize: '18px', fill: '#fff' });

    const uploaded = this.uploadedDocuments[subject] || [];
const docs = uploaded.map((fileName, i) => {
  return this.add.text(-100, -60 + i * 30, `📄 ${fileName}`, {
    fontSize: '16px', fill: '#fff'
  });
});


    const upload = this.add.text(-100, 70, "⬆️ Upload Document", {
      fontSize: '16px',
      fill: '#0f0',
      backgroundColor: '#000',
      padding: { x: 5, y: 5 }
    }).setInteractive();

    upload.on("pointerdown", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.txt";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log(`File selected for ${subject}:`, file.name);
          
          // Store the file name in the uploadedDocuments map
          if (!this.uploadedDocuments[subject]) {
            this.uploadedDocuments[subject] = [];
          }
          this.uploadedDocuments[subject].push(file.name);
    
          // Refresh the document popup to show updated list
          this.showDocumentPopup(subject);
        }
      };
      input.click();
    });
    
    this.docPopup.add([bg, heading, ...docs, upload]);
  }
  parseQuizText(text) {
  const questions = [];
  const blocks = text.split(/Q\d+:/).slice(1);

  blocks.forEach(block => {
    const lines = block.trim().split('\n');
    const question = lines[0].trim();
    const options = lines.slice(1, 5).map(line => line.slice(3).trim()); // skip A. B. etc.

    const answerLine = lines.find(line => line.includes("Answer:"));
    const answer = answerLine ? answerLine.split("Answer:")[1].trim() : options[0];

    questions.push({
      question,
      options,
      answer
    });
  });

  return questions;
}

showQuizPopup() {
  this.activePopup = "quiz";
  this.player.body.moves = false;
  
  // Show loading popup
  this.loadingPopup.setVisible(true);

  const subject = "Math"; // Adjust based on your subject selection logic

  axios.post('http://localhost:5000/api/quiz', { subject })
    .then(res => {
      const quizText = res.data.quiz;
      this.currentQuiz = this.parseQuizText(quizText);
      this.quizIndex = 0;
      this.score = 0;
      
      // Hide loading popup
      this.loadingPopup.setVisible(false);

      this.renderQuizQuestion();
    })
    .catch(error => {
      console.error("Quiz fetch error:", error);
      // Hide loading popup in case of error
      this.loadingPopup.setVisible(false);
    });



  this.player.body.moves = false;
}




update() {
  if (
    this.activePopup || 
    (this.docPopup && this.docPopup.visible) || 
    this.popupShown
  ) return;

  const speed = 300;
  this.player.setVelocity(0);

  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-speed);
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(speed);
  }

  if (this.cursors.up.isDown) {
    this.player.setVelocityY(-speed);
  } else if (this.cursors.down.isDown) {
    this.player.setVelocityY(speed);
  }
}
  
}


// import Phaser from "phaser";
// import { io } from "socket.io-client";
// import axios from "axios";

// const socket = io("http://localhost:5000", { withCredentials: true });

// socket.on("user-connected", (userId) => {
//   console.log("Another user joined:", userId);
// });

// function createPlayerWithLabel(scene, x, y, textureKey, playerName, enablePhysics = false) {
//   const image = enablePhysics
//     ? scene.physics.add.image(0, 0, textureKey).setOrigin(0.5, 0.5)
//     : scene.add.image(0, 0, textureKey).setOrigin(0.5, 0.5);

//   const nameText = scene.add.text(0, -30, playerName, {
//     font: '14px Arial',
//     fill: '#ffffff',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     padding: { x: 6, y: 3 },
//   }).setOrigin(0.5);

//   const container = scene.add.container(x, y, [image, nameText]);

//   if (enablePhysics) {
//     scene.physics.world.enable(container);
//     container.body.setCollideWorldBounds(true);
//   }

//   container.setDepth(10);
//   return container;
// }

// export default class GameScene extends Phaser.Scene {
//   constructor() {
//     super("GameScene");
//     this.score = 0;
//   }

//   preload() {
//     this.load.image("background", "/assets/background.png");
//     this.load.image("player", "/assets/blue-square.png");
//   }
  
//   create() {
//     // Initialize document storage
//     this.uploadedDocuments = {
//       "📘 Math": [],
//       "📗 Science": [],
//       "📕 History": []
//     };
    
//     // Add background and get its dimensions
//     const bg = this.add.image(0, 0, "background").setOrigin(0).setScale(1);
    
//     // Set world and camera bounds to match background image
//     this.physics.world.setBounds(0, 0, bg.width, bg.height);
//     this.cameras.main.setBounds(0, 0, bg.width, bg.height);

//     // Create player
//     this.player = this.physics.add.sprite(100, 100, "player")
//       .setCollideWorldBounds(true)
//       .setScale(0.5);
      
//     // Enable camera follow
//     this.cameras.main.startFollow(this.player);

//     // Setup keyboard controls
//     this.cursors = this.input.keyboard.createCursorKeys();
//     this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

//     // Create walls group and place invisible walls
//     this.walls = this.physics.add.staticGroup();

//     // Wall data with positions and optional sizes
//     const wallData = [
//       [160, 180], [150, 320, 350, 10], [660, 480, 350, 10], [662, 320, 350, 10],
//       [160, 100], [240, 180], [160, 240], [80, 180], [80, 240], [240, 100],
//       [80, 100], [150, 480, 350, 10], [400, 165, 10, 320], [600, 620, 250, 160],
//       [400, 650, 10, 320]
//     ];
    
//     wallData.forEach(([x, y, width = 64, height = 64]) => {
//       this.walls.create(x, y, "player")
//         .setVisible(false)
//         .setSize(width, height)
//         .setDisplaySize(width, height);
//     });
    
//     // Player collides with walls
//     this.physics.add.collider(this.player, this.walls);

//     // Initialize loading popup for quiz
//     this.createLoadingPopup();

//     // State management
//     this.activePopup = null;
//     this.popupShown = false;
    
//     // Create interactive zones
//     this.createCupboardZone();
//     this.createNoticeZone();
//     this.createStudentZone();
//     this.createQuizZone();
    
//     // Setup keyboard controls for all popups
//     this.setupKeyboardControls();
//   }
  
//   // ============== ZONE CREATION METHODS ==============
  
//   createCupboardZone() {
//     this.cupboardZone = this.add.zone(350, 50, 60, 100);
//     this.physics.world.enable(this.cupboardZone);
//     this.cupboardZone.body.setAllowGravity(false).setImmovable(true);
//     this.physics.add.overlap(
//       this.player, 
//       this.cupboardZone, 
//       () => this.showCupboardPopup(), 
//       null, 
//       this
//     );

//     this.cupboardPopup = this.add.container(400, 300).setVisible(false);
//     const cupboardBg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.95).setOrigin(0.5);
    
//     this.subjects = [
//       this.add.text(-100, -50, "📘 Math", { fontSize: '20px', fill: '#fff' }),
//       this.add.text(-100, 0, "📗 Science", { fontSize: '20px', fill: '#fff' }),
//       this.add.text(-100, 50, "📕 History", { fontSize: '20px', fill: '#fff' }),
//     ];
    
//     this.selectedIndex = 0;
//     this.highlightSelectedSubject = () => {
//       this.subjects.forEach((text, index) => {
//         text.setStyle({ fill: index === this.selectedIndex ? '#ffff00' : '#ffffff' });
//       });
//     };
    
//     this.highlightSelectedSubject(); // Initial highlight
//     this.cupboardPopup.add([cupboardBg, ...this.subjects]);
//   }

//   createNoticeZone() {
//     this.noticeZone = this.add.zone(600, 150, 80, 100);
//     this.physics.world.enable(this.noticeZone);
//     this.noticeZone.body.setAllowGravity(false).setImmovable(true);
//     this.canOpenNotice = false;

//     this.physics.add.overlap(
//       this.player, 
//       this.noticeZone, 
//       () => {
//         this.canOpenNotice = true;
//       }, 
//       null, 
//       this
//     );
    
//     // Create notice popup container (will be populated when opened)
//     this.noticePopup = this.add.container(400, 300).setVisible(false);
//     const bg = this.add.rectangle(0, 0, 350, 300, 0x000000, 0.95).setOrigin(0.5);
//     const heading = this.add.text(-120, -120, "📌 Notice Board", { fontSize: '20px', fill: '#fff' });
    
//     // Example notice list
//     const notices = [
//       this.add.text(-140, -70, "📢 Exam on Friday", { fontSize: '16px', fill: '#fff' }),
//       this.add.text(-140, -40, "📢 Science Fair: Monday", { fontSize: '16px', fill: '#fff' }),
//     ];

//     const uploadButton = this.add.text(-120, 80, "⬆️ Upload Notice", {
//       fontSize: '16px',
//       fill: '#0f0',
//       backgroundColor: '#000',
//       padding: { x: 5, y: 5 }
//     }).setInteractive();

//     uploadButton.on("pointerdown", () => {
//       const input = document.createElement("input");
//       input.type = "file";
//       input.accept = ".txt,.pdf,.doc,.docx";
//       input.onchange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//           console.log("Uploaded Notice:", file.name);
//           // You can push this to the backend or update the notices array
//         }
//       };
//       input.click();
//     });

//     const closeButton = this.add.text(130, -120, "❌", {
//       fontSize: '18px',
//       fill: '#f55'
//     }).setInteractive();

//     closeButton.on("pointerdown", () => {
//       this.noticePopup.setVisible(false);
//       this.player.body.moves = true;
//     });

//     this.noticePopup.add([bg, heading, ...notices, uploadButton, closeButton]);
//   }
  
//   createStudentZone() {
//     this.studentZone = this.add.zone(850, 200, 80, 100);
//     this.physics.world.enable(this.studentZone);
//     this.studentZone.body.setAllowGravity(false).setImmovable(true);
//     this.canOpenStudent = false;

//     this.physics.add.overlap(
//       this.player, 
//       this.studentZone, 
//       () => {
//         this.canOpenStudent = true;
//       }, 
//       null, 
//       this
//     );
//   }
  
//   createQuizZone() {
//     this.quizZone = this.add.zone(470, 750, 64, 64);
//     this.physics.world.enable(this.quizZone);
//     this.quizZone.body.setAllowGravity(false).setImmovable(true);
    
//     this.physics.add.overlap(
//       this.player, 
//       this.quizZone, 
//       () => this.showQuizPopup(), 
//       null, 
//       this
//     );
//   }
  
//   createLoadingPopup() {
//     this.loadingPopup = this.add.container(400, 300).setVisible(false);
//     const bg = this.add.rectangle(0, 0, 300, 100, 0x000000, 0.8).setOrigin(0.5);
//     const loadingText = this.add.text(0, 0, "Loading Quiz...", {
//       fontSize: '20px',
//       fill: '#ffffff'
//     }).setOrigin(0.5);
//     this.loadingPopup.add([bg, loadingText]);
//   }
  
//   // ============== INPUT CONTROL METHODS ==============
  
//   setupKeyboardControls() {
//     this.input.keyboard.on('keydown-UP', () => {
//       if (this.activePopup === "cupboard") {
//         this.selectedIndex = (this.selectedIndex - 1 + this.subjects.length) % this.subjects.length;
//         this.highlightSelectedSubject();
//       }
//     });
  
//     this.input.keyboard.on('keydown-DOWN', () => {
//       if (this.activePopup === "cupboard") {
//         this.selectedIndex = (this.selectedIndex + 1) % this.subjects.length;
//         this.highlightSelectedSubject();
//       }
//     });
  
//     this.input.keyboard.on('keydown-ENTER', () => {
//       if (this.activePopup === "cupboard") {
//         const selectedSubject = this.subjects[this.selectedIndex].text;
//         this.showDocumentPopup(selectedSubject);
//       }
//     });
  
//     this.input.keyboard.on('keydown-ESC', () => {
//       // Close any visible popup
//       if (this.docPopup && this.docPopup.visible) {
//         this.docPopup.setVisible(false);
//       }
      
//       if (this.quizPopup && this.quizPopup.visible) {
//         this.quizPopup.setVisible(false);
//       }
      
//       if (this.cupboardPopup && this.cupboardPopup.visible) {
//         this.cupboardPopup.setVisible(false);
//       }
      
//       if (this.noticePopup && this.noticePopup.visible) {
//         this.noticePopup.setVisible(false);
//       }
      
//       if (this.studentPopup && this.studentPopup.visible) {
//         this.studentPopup.setVisible(false);
//       }
      
//       // Reset states
//       this.popupShown = false;
//       this.activePopup = null;
//       if (this.player.body) this.player.body.moves = true;
//     });
//   }

//   // ============== POPUP DISPLAY METHODS ==============
  
//   showCupboardPopup() {
//     if (!this.activePopup) {
//       this.cupboardPopup.setVisible(true);
//       this.activePopup = "cupboard";
//       this.popupShown = true;
//       this.player.body.moves = false;
//       this.highlightSelectedSubject();
//     }
//   }

//   showDocumentPopup(subject) {
//     if (this.docPopup) this.docPopup.destroy();
    
//     this.docPopup = this.add.container(400, 300);
//     this.popupShown = true;

//     const bg = this.add.rectangle(0, 0, 350, 300, 0x222222, 0.98).setOrigin(0.5);
//     const heading = this.add.text(-140, -120, `📄 Documents for ${subject}`, { fontSize: '18px', fill: '#fff' });

//     // Display uploaded documents for this subject
//     const uploaded = this.uploadedDocuments[subject] || [];
//     const docs = uploaded.map((fileName, i) => {
//       return this.add.text(-100, -60 + i * 30, `📄 ${fileName}`, {
//         fontSize: '16px', fill: '#fff'
//       });
//     });

//     const uploadButton = this.add.text(-100, 70, "⬆️ Upload Document", {
//       fontSize: '16px',
//       fill: '#0f0',
//       backgroundColor: '#000',
//       padding: { x: 5, y: 5 }
//     }).setInteractive();

//     uploadButton.on("pointerdown", () => {
//       const input = document.createElement("input");
//       input.type = "file";
//       input.accept = ".pdf,.doc,.docx,.txt";
      
//       input.onchange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//           console.log(`File selected for ${subject}:`, file.name);
          
//           // Store the file name
//           if (!this.uploadedDocuments[subject]) {
//             this.uploadedDocuments[subject] = [];
//           }
//           this.uploadedDocuments[subject].push(file.name);
    
//           // Refresh the document popup to show updated list
//           this.showDocumentPopup(subject);
//         }
//       };
//       input.click();
//     });
    
//     this.docPopup.add([bg, heading, ...docs, uploadButton]);
//   }
  
//   showNoticeBoard() {
//     if (this.noticePopup) this.noticePopup.setVisible(true);
//     this.popupShown = true;
//     this.player.body.moves = false;
//   }
  
//   showStudentProfile() {
//     if (this.studentPopup) this.studentPopup.destroy();
  
//     this.studentPopup = this.add.container(400, 300);
//     this.popupShown = true;
  
//     const bg = this.add.rectangle(0, 0, 350, 250, 0x1e1e1e, 0.95).setOrigin(0.5);
//     const title = this.add.text(-120, -100, "🎓 Student Profile", {
//       fontSize: '20px',
//       fill: '#fff'
//     });
  
//     const name = this.add.text(-100, -50, "👤 Name: Aryan Sharma", { fontSize: '16px', fill: '#fff' });
//     const id = this.add.text(-100, -20, "🆔 ID: STD12345", { fontSize: '16px', fill: '#fff' });
//     const grade = this.add.text(-100, 10, "📚 Grade: 10th", { fontSize: '16px', fill: '#fff' });
//     const subject = this.add.text(-100, 40, "🧪 Favorite: Science", { fontSize: '16px', fill: '#fff' });
  
//     const closeBtn = this.add.text(130, -100, "❌", {
//       fontSize: '18px',
//       fill: '#f55'
//     }).setInteractive();
  
//     closeBtn.on("pointerdown", () => {
//       this.studentPopup.setVisible(false);
//       this.player.body.moves = true;
//     });
  
//     this.studentPopup.add([bg, title, name, id, grade, subject, closeBtn]);
//   }
  
//   // ============== QUIZ METHODS ==============
  
//   parseQuizText(text) {
//     const questions = [];
//     const blocks = text.split(/Q\d+:/).slice(1);
  
//     blocks.forEach(block => {
//       const lines = block.trim().split('\n');
//       const question = lines[0].trim();
//       const options = lines.slice(1, 5).map(line => line.slice(3).trim()); // skip A. B. etc.
  
//       const answerLine = lines.find(line => line.includes("Answer:"));
//       const answer = answerLine ? answerLine.split("Answer:")[1].trim() : options[0];
  
//       questions.push({
//         question,
//         options,
//         answer
//       });
//     });
  
//     return questions;
//   }
  
//   showQuizPopup() {
//     if (this.activePopup) return;
    
//     this.activePopup = "quiz";
//     this.player.body.moves = false;
    
//     // Show loading popup
//     this.loadingPopup.setVisible(true);
  
//     const subject = "Math"; // Adjust based on your subject selection logic
  
//     axios.post('http://localhost:5000/api/quiz', { subject })
//       .then(res => {
//         const quizText = res.data.quiz;
//         this.currentQuiz = this.parseQuizText(quizText);
//         this.quizIndex = 0;
//         this.score = 0;
        
//         // Hide loading popup
//         this.loadingPopup.setVisible(false);
  
//         this.renderQuizQuestion();
//       })
//       .catch(error => {
//         console.error("Quiz fetch error:", error);
//         // Hide loading popup in case of error
//         this.loadingPopup.setVisible(false);
        
//         // Enable movement in case of error
//         this.player.body.moves = true;
//         this.activePopup = null;
//       });
//   }
  
//   renderQuizQuestion() {
//     if (this.quizPopup) this.quizPopup.destroy();
  
//     const q = this.currentQuiz[this.quizIndex];
//     this.selectedOptionLabel = null;
  
//     this.quizPopup = this.add.container(500, 350);
//     this.popupShown = true;
//     this.activePopup = "quiz";
  
//     // Background Panel
//     const bg = this.add.graphics();
//     bg.fillStyle(0x222244, 0.9); // Dark blueish with opacity
//     bg.fillRoundedRect(-200, -150, 400, 300, 20);
  
//     const questionText = this.add.text(-180, -120, q.question, {
//       fontSize: '18px',
//       fill: '#ffffff',
//       wordWrap: { width: 360 }
//     });
  
//     const optionLabels = ['A', 'B', 'C', 'D'];
//     const optionTexts = q.options.map((opt, i) => {
//       const label = optionLabels[i];
//       const txt = this.add.text(-150, -60 + i * 40, `${label}. ${opt}`, {
//         fontSize: '16px',
//         fill: '#ffffff'
//       }).setInteractive();
  
//       txt.on("pointerdown", () => {
//         this.selectedOptionLabel = label;
//         optionTexts.forEach(o => o.setStyle({ fill: '#ffffff' }));
//         txt.setStyle({ fill: '#00ff00' });
//       });
  
//       return txt;
//     });
  
//     const submit = this.add.text(-50, 100, "✅ Submit", {
//       fontSize: '18px',
//       fill: '#ffffff',
//       backgroundColor: '#00aa00',
//       padding: { x: 10, y: 5 }
//     }).setInteractive();
  
//     submit.on("pointerdown", () => {
//       if (!this.selectedOptionLabel) return;
//       if (this.selectedOptionLabel === q.answer) {
//         this.score++;
//       }
//       this.quizIndex++;
//       if (this.quizIndex < this.currentQuiz.length) {
//         this.renderQuizQuestion();
//       } else {
//         this.showQuizResult();
//       }
//     });
  
//     // Add everything to the container
//     this.quizPopup.add([bg, questionText, ...optionTexts, submit]);
//   }
  
//   showQuizResult() {
//     this.quizPopup.destroy();
//     this.quizPopup = this.add.container(500, 350);
//     this.popupShown = true;
//     this.activePopup = "quiz";

//     const bg = this.add.rectangle(0, 0, 300, 200, 0x222222, 0.95).setOrigin(0.5);
//     const result = this.add.text(-100, -20, `Your score: ${this.score}`, { fontSize: '20px', fill: '#fff' });
//     const close = this.add.text(-50, 50, "❌ Close", {
//       fontSize: '16px', fill: '#fff', backgroundColor: '#f00', padding: { x: 10, y: 5 }
//     }).setInteractive();

//     close.on("pointerdown", () => {
//       this.quizPopup.setVisible(false);
//       this.popupShown = false;
//       this.activePopup = null;
//       this.player.body.moves = true;
//       console.log("Send to backend:", this.score);
//     });

//     this.quizPopup.add([bg, result, close]);
//   }
  
//   // ============== UPDATE METHOD ==============
  
//   update() {
//     // Skip player movement if any popup is active
//     if (
//       this.activePopup || 
//       (this.docPopup && this.docPopup.visible) || 
//       this.popupShown
//     ) return;

//     const speed = 400;
//     this.player.setVelocity(0);

//     // Player movement with arrow keys
//     if (this.cursors.left.isDown) {
//       this.player.setVelocityX(-speed);
//     } else if (this.cursors.right.isDown) {
//       this.player.setVelocityX(speed);
//     }

//     if (this.cursors.up.isDown) {
//       this.player.setVelocityY(-speed);
//     } else if (this.cursors.down.isDown) {
//       this.player.setVelocityY(speed);
//     }
    
//     // Notice board interaction
//     if (this.canOpenNotice && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
//       this.showNoticeBoard();
//       this.canOpenNotice = false;
//     }

//     // Reset notice flag when moving away
//     if (this.noticeZone && !Phaser.Geom.Intersects.RectangleToRectangle(
//       this.player.getBounds(),
//       this.noticeZone.getBounds()
//     )) {
//       this.canOpenNotice = false;
//     }

//     // Student profile interaction
//     if (this.canOpenStudent && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
//       this.showStudentProfile();
//       this.canOpenStudent = false;
//     }
      
//     // Reset student flag when moving away
//     if (this.studentZone && !Phaser.Geom.Intersects.RectangleToRectangle(
//       this.player.getBounds(),
//       this.studentZone.getBounds()
//     )) {
//       this.canOpenStudent = false;
//     }
//   }
// }