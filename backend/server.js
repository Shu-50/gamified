

// const express = require("express");
// const mongoose = require("mongoose");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const cors = require("cors");
// const authRoutes = require("./routes/authRoutes");
// const http = require("http"); // ⬅️ Required to use Socket.IO
// const { Server } = require("socket.io");

// const app = express();
// const server = http.createServer(app); // ⬅️ Use server here
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // ⬅️ Allow frontend origin
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// const PORT = 5000;
// const MONGO_URL = "mongodb://127.0.0.1:27017/gamified";

// // Middleware
// app.use(express.json());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
// app.use(
//   session({
//     secret: "secret-key",
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: MONGO_URL }),
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24,
//       httpOnly: true,
//     },
//   })
// );

// app.use("/api/auth", authRoutes);

// // 💬 Socket.IO logic
// let pinnedMessage = null;

// io.on("connection", (socket) => {
//   console.log("🟢 A user connected");

//   socket.on("chat message", (msg) => {
//     io.emit("chat message", msg);
//   });

//   socket.on("typing", (data) => {
//     socket.broadcast.emit("typing", data);
//   });

//   socket.on("stop typing", () => {
//     socket.broadcast.emit("stop typing");
//   });

//   socket.on("pin message", (msg) => {
//     pinnedMessage = msg;
//     io.emit("pinned message", pinnedMessage);
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 A user disconnected");
//   });
// });

// mongoose
//   .connect(MONGO_URL)
//   .then(() => {
//     console.log("Connected to MongoDB");
//     server.listen(PORT, () =>
//       console.log(`🚀 Server running at http://localhost:${PORT}`)
//     );
//   })
//   .catch((err) => console.error("DB Connection Error:", err));

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = 5000;
const MONGO_URL = "mongodb://127.0.0.1:27017/gamified";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URL }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
  })
);

app.use("/api/auth", authRoutes);

// 💬 Chat State
let pinnedMessage = null;

// 🎮 Multiplayer Classroom State
// io.on("connection", (socket) => {
//   console.log("🟢 A user connected");

//   // --- Join room logic ---
  
//     socket.on("join-room", (roomId, userId) => {
//       socket.join(roomId);
//       socket.to(roomId).emit("user-connected", userId);
//     });
  
  

//     console.log(`👤 ${student.name} joined room ${roomId}`);

//     // Notify others in the room about the new player
//     socket.to(roomId).emit("newPlayer", {
//       id: socket.id,
//       name: student.name,
//       x: student.x || 100,
//       y: student.y || 200,
//     });

//     // Send list of existing players in room (excluding current socket)
//     socket.on("getPlayers", () => {
//       const playersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
//         .map((id) => io.sockets.sockets.get(id))
//         .filter((s) => s && s.student && s.id !== socket.id)
//         .map((s) => ({
//           id: s.id,
//           name: s.student.name,
//           x: s.student.x || 100,
//           y: s.student.y || 200,
//         }));

//       socket.emit("playersList", playersInRoom);
//     });

//     // Update movement
//     socket.on("playerMoved", ({ x, y }) => {
//       if (socket.student) {
//         socket.student.x = x;
//         socket.student.y = y;
//         socket.to(roomId).emit("playerMoved", {
//           id: socket.id,
//           x,
//           y,
//         });
//       }
//     });

//     // On disconnect
//     socket.on("disconnect", () => {
//       console.log(`🔴 ${socket.student?.name || "Unknown"} left room ${roomId}`);
//       socket.to(roomId).emit("playerLeft", socket.id);
//     });
//   });

//   // 💬 Chat System
//   socket.on("chat message", (msg) => {
//     io.emit("chat message", msg);
//   });

//   socket.on("typing", (data) => {
//     socket.broadcast.emit("typing", data);
//   });

//   socket.on("stop typing", () => {
//     socket.broadcast.emit("stop typing");
//   });

//   socket.on("pin message", (msg) => {
//     pinnedMessage = msg;
//     io.emit("pinned message", pinnedMessage);
//   });
// });
io.on("connection", (socket) => {
    console.log("🟢 A user connected");
  
    // Store student and roomId inside the socket
    socket.on("join-room", (roomId, student) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.student = student;
  
      console.log(`👤 ${student.name} joined room ${roomId}`);
  
      // Notify others in the room about the new player
      socket.to(roomId).emit("newPlayer", {
        id: socket.id,
        name: student.name,
        x: student.x || 100,
        y: student.y || 200,
      });
  
      // Send list of existing players in room to the new user
      const playersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        .map((id) => io.sockets.sockets.get(id))
        .filter((s) => s && s.student && s.id !== socket.id)
        .map((s) => ({
          id: s.id,
          name: s.student.name,
          x: s.student.x || 100,
          y: s.student.y || 200,
        }));
  
      socket.emit("playersList", playersInRoom);
    });
  
    // Movement update
    socket.on("playerMoved", ({ x, y }) => {
      if (socket.student && socket.roomId) {
        socket.student.x = x;
        socket.student.y = y;
  
        socket.to(socket.roomId).emit("playerMoved", {
          id: socket.id,
          x,
          y,
        });
      }
    });
  
    // Chat system
    socket.on("chat message", (msg) => {
      io.emit("chat message", msg);
    });
  
    socket.on("typing", (data) => {
      socket.broadcast.emit("typing", data);
    });
  
    socket.on("stop typing", () => {
      socket.broadcast.emit("stop typing");
    });
  
    socket.on("pin message", (msg) => {
      pinnedMessage = msg;
      io.emit("pinned message", pinnedMessage);
    });
  
    // Disconnect
    socket.on("disconnect", () => {
      if (socket.student && socket.roomId) {
        console.log(`🔴 ${socket.student.name} left room ${socket.roomId}`);
        socket.to(socket.roomId).emit("playerLeft", socket.id);
      }
    });
  });
  
// DB + Server Init
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB Connection Error:", err));
