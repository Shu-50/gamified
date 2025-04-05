// import Phaser from "phaser";
// import axios from "axios";

// export default class GameScene extends Phaser.Scene {
//   constructor() {
//     super("GameScene");
//   }

//   score = 0;

//   preload() {
//     this.load.image("background", "/assets/background.png");
//     this.load.image("player", "/assets/blue-square.png");
//   }

//   create() {
//     this.uploadedDocuments = {
//       "📘 Math": [],
//       "📗 Science": [],
//       "📕 History": []
//     };

//     const bg = this.add.image(0, 0, "background").setOrigin(0).setScale(1);
//     this.physics.world.setBounds(0, 0, bg.width, bg.height);
//     this.cameras.main.setBounds(0, 0, bg.width, bg.height);

//     this.player = this.physics.add.sprite(100, 100, "player")
//       .setCollideWorldBounds(true)
//       .setScale(0.5);
//     this.cameras.main.startFollow(this.player);

//     this.cursors = this.input.keyboard.createCursorKeys();
//     this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

//     this.walls = this.physics.add.staticGroup();
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
//     this.physics.add.collider(this.player, this.walls);

//     this.createLoadingPopup();

//     this.activePopup = null;
//     this.popupShown = false;

//     this.createCupboardZone();
//     this.createNoticeZone();
//     this.createQuizZone();

//     this.setupKeyboardControls();
//   }

//   createCupboardZone() {
//     this.cupboardZone = this.add.zone(350, 50, 60, 100);
//     this.physics.world.enable(this.cupboardZone);
//     this.cupboardZone.body.setAllowGravity(false).setImmovable(true);
//     this.physics.add.overlap(this.player, this.cupboardZone, () => this.showCupboardPopup(), null, this);

//     this.cupboardPopup = this.add.container(400, 300).setVisible(false);
//     let cupboardBg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.95).setOrigin(0.5);
//     this.subjects = [
//       this.add.text(-100, -50, "📘 Math", { fontSize: '20px', fill: '#fff' }),
//       this.add.text(-100, 0, "📗 Science", { fontSize: '20px', fill: '#fff' }),
//       this.add.text(-100, 50, "📕 History", { fontSize: '20px', fill: '#fff' }),
//     ];
//     this.selectedIndex = 0;
//     this.highlightSelectedSubject = () => {
//       this.subjects.forEach((text, i) => {
//         text.setStyle({ fill: i === this.selectedIndex ? '#ffff00' : '#ffffff' });
//       });
//     };
//     this.highlightSelectedSubject();
//     this.cupboardPopup.add([cupboardBg, ...this.subjects]);
//   }

//   createNoticeZone() {
//     this.noticeZone = this.add.zone(50, 530, 64, 64);
//     this.physics.world.enable(this.noticeZone);
//     this.noticeZone.body.setAllowGravity(false).setImmovable(true);
//     this.physics.add.overlap(this.player, this.noticeZone, () => this.showNoticePopup(), null, this);

//     this.noticePopup = this.add.container(400, 300).setVisible(false);
//     const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.95).setOrigin(0.5);
//     const heading = this.add.text(-120, -80, "📌 Notice Board", { fontSize: '20px', fill: '#fff' });
//     const notices = [
//       this.add.text(-100, -30, "📢 Exam on Friday", { fontSize: '16px', fill: '#fff' }),
//       this.add.text(-100, 0, "📢 Science Fair: Monday", { fontSize: '16px', fill: '#fff' }),
//     ];
//     const uploadNotice = this.add.text(-100, 60, "⬆️ Upload Notice", {
//       fontSize: '16px',
//       fill: '#0f0',
//       backgroundColor: '#000',
//       padding: { x: 5, y: 5 }
//     }).setInteractive();

//     uploadNotice.on("pointerdown", () => {
//       const input = document.createElement("input");
//       input.type = "file";
//       input.accept = ".pdf,.doc,.docx,.txt";
//       input.onchange = (e) => {
//         const file = e.target.files[0];
//         if (file) console.log("Notice uploaded:", file.name);
//       };
//       input.click();
//     });

//     this.noticePopup.add([bg, heading, ...notices, uploadNotice]);
//   }

//   createQuizZone() {
//     this.quizZone = this.add.zone(470, 750, 64, 64);
//     this.physics.world.enable(this.quizZone);
//     this.quizZone.body.setAllowGravity(false).setImmovable(true);
//     this.physics.add.overlap(this.player, this.quizZone, () => this.showQuizPopup(), null, this);
//   }

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

//       this.popupShown = false;
//       this.activePopup = null;
//       if (this.player.body) this.player.body.moves = true;
//     });
//   }

//   showCupboardPopup() {
//     if (!this.activePopup) {
//       this.cupboardPopup.setVisible(true);
//       this.activePopup = "cupboard";
//       this.player.body.moves = false;
//       this.highlightSelectedSubject();
//     }
//   }

//   showNoticePopup() {
//     if (!this.popupShown) {
//       this.noticePopup.setVisible(true);
//       this.popupShown = true;
//       if (this.player.body) this.player.body.moves = false;
//     }
//   }

//   renderQuizQuestion() {
//     if (this.quizPopup) this.quizPopup.destroy();

//     const q = this.currentQuiz[this.quizIndex];
//     this.selectedOptionLabel = null;

//     this.quizPopup = this.add.container(500, 350);
//     this.popupShown = true;
//     this.activePopup = "quiz";

//     const bg = this.add.graphics();
//     bg.fillStyle(0x222244, 0.9);
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

//   createLoadingPopup() {
//     this.loadingPopup = this.add.container(400, 300).setVisible(false);
//     const bg = this.add.rectangle(0, 0, 300, 100, 0x000000, 0.8).setOrigin(0.5);
//     const text = this.add.text(-60, -10, "Loading...", { fontSize: '20px', fill: '#fff' });
//     this.loadingPopup.add([bg, text]);
//   }

// showDocumentPopup(subject) {
//     if (this.docPopup) this.docPopup.destroy();
  
//     this.docPopup = this.add.container(500, 350);
//     this.docPopup.setVisible(true);
//     this.popupShown = true;
//     this.activePopup = "document";
  
//     const bg = this.add.rectangle(0, 0, 350, 250, 0x000000, 0.9).setOrigin(0.5);
//     const heading = this.add.text(-150, -110, `📁 ${subject} Files`, {
//       fontSize: '20px',
//       fill: '#fff'
//     });
  
//     const files = this.uploadedDocuments[subject] || [];
//     const fileTexts = files.map((file, i) =>
//       this.add.text(-150, -70 + i * 25, `📄 ${file.name}`, {
//         fontSize: '16px',
//         fill: '#ffffff'
//       })
//     );
  
//     const uploadBtn = this.add.text(-150, 90, "⬆️ Upload File", {
//       fontSize: '16px',
//       fill: '#0f0',
//       backgroundColor: '#000',
//       padding: { x: 5, y: 5 }
//     }).setInteractive();
  
//     uploadBtn.on("pointerdown", () => {
//       const input = document.createElement("input");
//       input.type = "file";
//       input.accept = ".pdf,.doc,.docx,.txt";
//       input.onchange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//           this.uploadedDocuments[subject].push({ name: file.name });
//           this.showDocumentPopup(subject); // Refresh to show new file
//         }
//       };
//       input.click();
//     });
  
//     const closeBtn = this.add.text(100, 90, "❌ Close", {
//       fontSize: '16px',
//       fill: '#fff',
//       backgroundColor: '#f00',
//       padding: { x: 10, y: 5 }
//     }).setInteractive();
  
//     closeBtn.on("pointerdown", () => {
//       this.docPopup.setVisible(false);
//       this.popupShown = false;
//       this.activePopup = null;
//       this.player.body.moves = true;
//     });
  
//     this.docPopup.add([bg, heading, ...fileTexts, uploadBtn, closeBtn]);
//   }
// }

