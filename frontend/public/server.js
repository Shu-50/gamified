
// const express = require("express");
// const mongoose = require("mongoose");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const cors = require("cors");
// const authRoutes = require("./routes/authRoutes");
// const http = require("http");
// const { Server } = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
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

// // 💬 Chat State
// let pinnedMessage = null;

// io.on("connection", (socket) => {
//     console.log("🟢 A user connected");
  
//     // Store student and roomId inside the socket
//     socket.on("join-room", (roomId, student) => {
//       socket.join(roomId);
//       socket.roomId = roomId;
//       socket.student = student;
  
//       console.log(`👤 ${student.name} joined room ${roomId}`);
  
//       // Notify others in the room about the new player
//       socket.to(roomId).emit("newPlayer", {
//         id: socket.id,
//         name: student.name,
//         x: student.x || 100,
//         y: student.y || 200,
//       });
  
//       // Send list of existing players in room to the new user
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
  
//     // Movement update
//     socket.on("playerMoved", ({ x, y }) => {
//       if (socket.student && socket.roomId) {
//         socket.student.x = x;
//         socket.student.y = y;
  
//         socket.to(socket.roomId).emit("playerMoved", {
//           id: socket.id,
//           x,
//           y,
//         });
//       }
//     });
  
//     // Chat system
//     socket.on("chat message", (msg) => {
//       io.emit("chat message", msg);
//     });
  
//     socket.on("typing", (data) => {
//       socket.broadcast.emit("typing", data);
//     });
  
//     socket.on("stop typing", () => {
//       socket.broadcast.emit("stop typing");
//     });
  
//     socket.on("pin message", (msg) => {
//       pinnedMessage = msg;
//       io.emit("pinned message", pinnedMessage);
//     });
  
//     // Disconnect
//     socket.on("disconnect", () => {
//       if (socket.student && socket.roomId) {
//         console.log(`🔴 ${socket.student.name} left room ${socket.roomId}`);
//         socket.to(socket.roomId).emit("playerLeft", socket.id);
//       }
//     });
//   });
  
// // DB + Server Init
// mongoose
//   .connect(MONGO_URL)
//   .then(() => {
//     console.log("✅ Connected to MongoDB");
//     server.listen(PORT, () =>
//       console.log(`🚀 Server running at http://localhost:${PORT}`)
//     );
//   })
//   .catch((err) => console.error("❌ DB Connection Error:", err));

// import express from "express";
// import mongoose from "mongoose";
// import session from "express-session";
// import MongoStore from "connect-mongo";
// import cors from "cors";
// import dotenv from "dotenv";
// import http from "http";
// import { Server } from "socket.io";
// import authRoutes from "./routes/authRoutes.js";
// import quizRoutes from "./routes/quiz.js";
// import uploadRoute from "./routes/upload.js";

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // adjust as needed
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// const PORT = process.env.PORT || 5000;
// const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/gamified";

// // Middleware
// app.use(express.json());
// app.use(
//   cors({
//     origin: "http://localhost:5173", // adjust as needed
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

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/quiz", quizRoutes);
// app.use("/api", uploadRoute); // upload route includes antivirus scanning

// // --- Socket.IO Setup ---
// let pinnedMessage = null;

// io.on("connection", (socket) => {
//   console.log("🟢 A user connected");

//   socket.on("join-room", (roomId, student) => {
//     socket.join(roomId);
//     socket.roomId = roomId;
//     socket.student = student;

//     console.log(`👤 ${student.name} joined room ${roomId}`);

//     socket.to(roomId).emit("newPlayer", {
//       id: socket.id,
//       name: student.name,
//       x: student.x || 100,
//       y: student.y || 200,
//     });

//     const playersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
//       .map((id) => io.sockets.sockets.get(id))
//       .filter((s) => s && s.student && s.id !== socket.id)
//       .map((s) => ({
//         id: s.id,
//         name: s.student.name,
//         x: s.student.x || 100,
//         y: s.student.y || 200,
//       }));

//     socket.emit("playersList", playersInRoom);
//   });

//   socket.on("playerMoved", ({ x, y }) => {
//     if (socket.student && socket.roomId) {
//       socket.student.x = x;
//       socket.student.y = y;

//       socket.to(socket.roomId).emit("playerMoved", {
//         id: socket.id,
//         x,
//         y,
//       });
//     }
//   });

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
//     if (socket.student && socket.roomId) {
//       console.log(`🔴 ${socket.student.name} left room ${socket.roomId}`);
//       socket.to(socket.roomId).emit("playerLeft", socket.id);
//     }
//   });
// });

// // DB + Server Startup
// mongoose
//   .connect(MONGO_URL)
//   .then(() => {
//     console.log("✅ Connected to MongoDB");
//     server.listen(PORT, () =>
//       console.log(`🚀 Server running at http://localhost:${PORT}`)
//     );
//   })
//   .catch((err) => console.error("❌ DB Connection Error:", err));


import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quiz.js";
import uploadRoute from "./routes/upload.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const FRONTEND_ORIGIN = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/gamified";

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// --- Middleware ---
app.use(express.json());

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URL }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
  },
}));

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api", uploadRoute);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --- Socket.IO Logic ---
let pinnedMessage = null;

io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("join-room", (roomId, student) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.student = student;

    console.log(`👤 ${student.name} joined room ${roomId}`);

    socket.to(roomId).emit("newPlayer", {
      id: socket.id,
      name: student.name,
      x: student.x || 100,
      y: student.y || 200,
    });

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

  socket.on("disconnect", () => {
    if (socket.student && socket.roomId) {
      console.log(`🔴 ${socket.student.name} left room ${socket.roomId}`);
      socket.to(socket.roomId).emit("playerLeft", socket.id);
    }
  });
});

// --- Database + Server Startup ---
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  });
