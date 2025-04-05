
import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("background", "/assets/background.png"); // Full scene image
    this.load.image("player", "/assets/blue-square.png");    // Blue square sprite
  }

  create() {
    // Add background and get its dimensions
    const bg = this.add.image(0, 0, "background").setOrigin(0).setScale(1);
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // or 'E'


    // Set world and camera bounds to match background image
    this.physics.world.setBounds(0, 0, bg.width, bg.height);
    this.cameras.main.setBounds(0, 0, bg.width, bg.height);

    // Create player
    this.player = this.physics.add.sprite(100, 100, "player").setCollideWorldBounds(true);
    this.player.setScale(0.5); // Resize if needed

    // Enable camera follow
    this.cameras.main.startFollow(this.player);

    // Create walls group and place invisible walls near furniture
    this.walls = this.physics.add.staticGroup();

    // 🧱 Example wall placements (adjust these based on your background layout)
    this.walls.create(160, 180, "player").setVisible(false); // near desk
    this.walls.create(150, 320, "player").setVisible(false).setSize(350, 10); // near cupboard
    this.walls.create(660, 480, "player").setVisible(false).setSize(350, 10); // bottom wall
    this.walls.create(662, 320, "player").setVisible(false).setSize(350, 10); // right wall
    this.walls.create(160, 100, "player").setVisible(false);
    this.walls.create(240, 180, "player").setVisible(false);
    this.walls.create(160, 240, "player").setVisible(false);
    this.walls.create(80, 180, "player").setVisible(false);
    this.walls.create(80, 240, "player").setVisible(false);
    this.walls.create(240, 100, "player").setVisible(false);
    this.walls.create(80, 100, "player").setVisible(false);
    this.walls.create(150, 480, "player").setVisible(false).setSize(350, 10); // bottom wall
    this.walls.create(400, 165, "player").setVisible(false).setSize(10, 320);
    this.walls.create(600, 620, "player").setVisible(false).setSize(250, 160);
    // this.walls.create(500, 150, "player").setVisible(false).setSize(250, 160);
    this.walls.create(400, 650, "player").setVisible(false).setSize(10, 320);
    // this.walls.create(400, 650, "player").setVisible(false).setSize(10, 320);
    // Player collides with walls
    this.physics.add.collider(this.player, this.walls);

    // Setup arrow key controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Inside create()
this.cupboardZone = this.add.zone(350, 50, 60, 100); // adjust coords
this.physics.world.enable(this.cupboardZone);
this.cupboardZone.body.setAllowGravity(false);
this.cupboardZone.body.setImmovable(true);

this.physics.add.overlap(this.player, this.cupboardZone, () => this.showCupboardPopup(), null, this);

// Popup container
this.cupboardPopup = this.add.container(400, 300).setVisible(false);
let popupBg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.95).setOrigin(0.5);
// Create subject list with selection highlight
this.subjects = [
  this.add.text(-100, -50, "📘 Math", { fontSize: '20px', fill: '#fff' }),
  this.add.text(-100, 0, "📗 Science", { fontSize: '20px', fill: '#fff' }),
  this.add.text(-100, 50, "📕 History", { fontSize: '20px', fill: '#fff' }),
];

this.selectedIndex = 0;

this.highlightSelectedSubject = () => {
  this.subjects.forEach((text, index) => {
    text.setStyle({ fill: index === this.selectedIndex ? '#ffff00' : '#ffffff' }); // Yellow if selected
  });
};

this.highlightSelectedSubject(); // initial highlight

// Add all elements to cupboardPopup
this.cupboardPopup.add([popupBg, ...this.subjects]);


this.popupShown = false;
this.input.keyboard.on('keydown-UP', () => {
  if (this.popupShown) {
    this.selectedIndex = (this.selectedIndex - 1 + this.subjects.length) % this.subjects.length;
    this.highlightSelectedSubject();
  }
});

this.input.keyboard.on('keydown-DOWN', () => {
  if (this.popupShown) {
    this.selectedIndex = (this.selectedIndex + 1) % this.subjects.length;
    this.highlightSelectedSubject();
  }
});

this.input.keyboard.on('keydown-ENTER', () => {
  if (this.popupShown) {
    const selectedSubject = this.subjects[this.selectedIndex].text;
    this.showDocumentPopup(selectedSubject);
  }
});


// Escape to close popup
this.input.keyboard.on('keydown-ESC', () => {
  if (this.docPopup && this.docPopup.visible) {
    this.docPopup.setVisible(false);
  } else if (this.popupShown) {
    this.cupboardPopup.setVisible(false);
    this.popupShown = false;
  }
  this.player.body.moves = true;
});

this.noticeZone = this.add.zone(600, 150, 80, 100);
this.physics.world.enable(this.noticeZone);
this.noticeZone.body.setAllowGravity(false);
this.noticeZone.body.setImmovable(true);
this.canOpenNotice = false;

this.physics.add.overlap(this.player, this.noticeZone, () => {
  this.canOpenNotice = true;
}, null, this);

// ===== Escape key to close notice board popup =====
this.input.keyboard.on('keydown-ESC', () => {
  if (this.noticePopup) this.noticePopup.setVisible(false);
  this.player.body.moves = true;
});


  }
  // Below or outside create(), add this function inside the class
  showDocumentPopup(subject) {
    this.cupboardPopup.setVisible(false);
    this.popupShown = false;
  
    // Destroy previous doc popup if it exists
    if (this.docPopup) this.docPopup.destroy();
  
    this.docPopup = this.add.container(400, 300);
  
    const bg = this.add.rectangle(0, 0, 350, 300, 0x222222, 0.98).setOrigin(0.5);
    const heading = this.add.text(-140, -120, `📄 Documents for ${subject}`, { fontSize: '18px', fill: '#fff' });
  
    const docs = [
      this.add.text(-100, -60, "📄 Algebra Notes.pdf", { fontSize: '16px', fill: '#fff' }),
      this.add.text(-100, -30, "📄 Chapter 1 - Quiz.docx", { fontSize: '16px', fill: '#fff' }),
    ];
  
    const uploadButton = this.add.text(-100, 70, "⬆️ Upload Document", {
      fontSize: '16px',
      fill: '#0f0',
      backgroundColor: '#000',
      padding: { x: 5, y: 5 }
    }).setInteractive();
  
    uploadButton.on("pointerdown", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.txt";
  
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log(`File selected for ${subject}:`, file.name);
        }
      };
      input.click();
    });
  
    
  
    this.docPopup.add([bg, heading, ...docs, uploadButton]);
  }
  
  // Just after create() method, and before update()
showCupboardPopup() {
  if (!this.popupShown) {
    this.cupboardPopup.setVisible(true);
    this.popupShown = true;
    this.player.body.moves = false;
    this.highlightSelectedSubject();
  }
}
showNoticeBoard() {
  if (this.noticePopup) this.noticePopup.destroy();

  this.noticePopup = this.add.container(400, 300);

  const bg = this.add.rectangle(0, 0, 350, 300, 0x000000, 0.95).setOrigin(0.5);
  const heading = this.add.text(-120, -120, "📌 Notice Board", {
    fontSize: '20px',
    fill: '#fff'
  });

  // Example notice list
  const notices = [
    this.add.text(-140, -70, "📢 Exam on Friday", { fontSize: '16px', fill: '#fff' }),
    this.add.text(-140, -40, "📢 Science Fair: Monday", { fontSize: '16px', fill: '#fff' }),
  ];

  const uploadButton = this.add.text(-120, 80, "⬆️ Upload Notice", {
    fontSize: '16px',
    fill: '#0f0',
    backgroundColor: '#000',
    padding: { x: 5, y: 5 }
  }).setInteractive();

  uploadButton.on("pointerdown", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.pdf,.doc,.docx";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log("Uploaded Notice:", file.name);
        // You can push this to the backend or update the notices array
      }
    };
    input.click();
  });

  const closeButton = this.add.text(130, -120, "❌", {
    fontSize: '18px',
    fill: '#f55'
  }).setInteractive();

  closeButton.on("pointerdown", () => {
    this.noticePopup.setVisible(false);
    this.player.body.moves = true;
  });

  this.noticePopup.add([bg, heading, ...notices, uploadButton, closeButton]);
}

  

  update() {
    const speed = 200;
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
    if (this.canOpenNotice && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.showNoticeBoard();
      this.canOpenNotice = false;
    }

    // Reset flag when moving away
    if (!Phaser.Geom.Intersects.RectangleToRectangle(
      this.player.getBounds(),
      this.noticeZone.getBounds()
    )) {
      this.canOpenNotice = false;
    }
  }
}
