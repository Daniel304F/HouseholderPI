import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import config from "./config/config.js";
import startDB from "./db.js";
import { jwtService } from "./services/jwt.service.js";

startDB(app)
  .then(() => {
    const httpServer = createServer(app);

    // Setup Socket.io
    const io = new Server(httpServer, {
      cors: {
        origin: config.clientUrl,
        credentials: true,
      },
    });

    // Store io instance in app.locals for controllers to use
    app.locals["io"] = io;

    // Socket.io authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth["token"] as string | undefined;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = jwtService.verifyAccessToken(token);
      if (!payload) {
        return next(new Error("Invalid token"));
      }

      socket.data.userId = payload.userId;
      next();
    });

    // Socket.io connection handling
    io.on("connection", (socket) => {
      const userId = socket.data.userId;
      console.log(`User connected: ${userId}`);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Join group room
      socket.on("group:join", (groupId: string) => {
        socket.join(`group:${groupId}`);
        console.log(`User ${userId} joined group: ${groupId}`);
      });

      // Leave group room
      socket.on("group:leave", (groupId: string) => {
        socket.leave(`group:${groupId}`);
        console.log(`User ${userId} left group: ${groupId}`);
      });

      // Typing indicator
      socket.on("message:typing", (data: { groupId: string; isTyping: boolean }) => {
        socket.to(`group:${data.groupId}`).emit("message:typing", {
          userId,
          isTyping: data.isTyping,
        });
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId}`);
      });
    });

    httpServer.listen(config.port, () => {
      console.log(`✅ Datenbank verbunden.`);
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`🔌 WebSocket server ready`);
    });
  })
  .catch((err) => {
    console.error("❌ Fehler beim Starten der Datenbank:", err);
    process.exit(1);
  });
