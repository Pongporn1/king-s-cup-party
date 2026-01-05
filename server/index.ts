/* eslint-disable @typescript-eslint/no-explicit-any */
// Express API Server for King's Cup Party with Socket.IO
// This serves as the backend connecting to MySQL + WebSocket realtime

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mysql from "mysql2/promise";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://pongporn1.github.io",
      process.env.FRONTEND_URL || "*", // Allow production frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));

// Set UTF-8 encoding for all JSON responses
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// MySQL connection pool with full UTF-8 support
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "rootpassword",
  database: process.env.MYSQL_DATABASE || "kingscup",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "+00:00",
});

// Set UTF-8 for all connections
pool.on("connection", (connection) => {
  connection.query("SET NAMES utf8mb4");
  connection.query("SET CHARACTER SET utf8mb4");
  connection.query("SET character_set_connection=utf8mb4");
});

// Socket.IO - Realtime Events
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join-room", (data: { roomCode: string; playerId: string }) => {
    socket.join(`room:${data.roomCode}`);
    socket
      .to(`room:${data.roomCode}`)
      .emit("player-joined", { playerId: data.playerId });
  });

  socket.on("leave-room", (data: { roomCode: string; playerId: string }) => {
    socket.leave(`room:${data.roomCode}`);
    socket
      .to(`room:${data.roomCode}`)
      .emit("player-left", { playerId: data.playerId });
  });

  socket.on("room-update", (data: { roomCode: string; update: any }) => {
    io.to(`room:${data.roomCode}`).emit("room-changed", data.update);
  });

  socket.on(
    "player-update",
    (data: { roomCode: string; playerId: string; update: any }) => {
      io.to(`room:${data.roomCode}`).emit("player-changed", {
        playerId: data.playerId,
        ...data.update,
      });
    }
  );

  socket.on(
    "game-action",
    (data: { roomCode: string; action: string; payload: any }) => {
      io.to(`room:${data.roomCode}`).emit("game-action", {
        action: data.action,
        payload: data.payload,
      });
    }
  );

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Health Check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected", realtime: "socket.io" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: (error as Error).message });
  }
});

// Games API
app.get("/api/games", async (req, res) => {
  try {
    const field = req.query.field as string;
    let query = "SELECT * FROM games";
    if (field)
      query = `SELECT id, ${field} FROM games WHERE ${field} IS NOT NULL`;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put("/api/games/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image_url, cover_url, emoji, gradient } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
    }
    if (image_url !== undefined) {
      updates.push("image_url = ?");
      values.push(image_url);
    }
    if (cover_url !== undefined) {
      updates.push("cover_url = ?");
      values.push(cover_url);
    }
    if (emoji !== undefined) {
      updates.push("emoji = ?");
      values.push(emoji);
    }
    if (gradient !== undefined) {
      updates.push("gradient = ?");
      values.push(gradient);
    }
    if (updates.length === 0)
      return res.status(400).json({ error: "No fields" });
    values.push(id);
    const [result] = await pool.query(
      `UPDATE games SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    if ((result as any).affectedRows === 0) {
      await pool.query(
        "INSERT INTO games (id, title, image_url, cover_url, emoji, gradient) VALUES (?, ?, ?, ?, ?, ?)",
        [
          id,
          title || id,
          image_url || null,
          cover_url || null,
          emoji || null,
          gradient || null,
        ]
      );
    }
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/api/games/clear-covers", async (_, res) => {
  try {
    await pool.query("UPDATE games SET cover_url = NULL");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/api/games/clear-icons", async (_, res) => {
  try {
    await pool.query("UPDATE games SET image_url = NULL");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Floating Names API
app.get("/api/floating-names", async (_, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT name FROM floating_names ORDER BY created_at ASC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/api/floating-names", async (req, res) => {
  try {
    await pool.query("INSERT INTO floating_names (name) VALUES (?)", [
      req.body.name,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/api/floating-names/:name", async (req, res) => {
  try {
    await pool.query("DELETE FROM floating_names WHERE name = ?", [
      req.params.name,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/api/floating-names", async (_, res) => {
  try {
    await pool.query("DELETE FROM floating_names");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Rooms API
app.get("/api/rooms/:code", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM rooms WHERE code = ?", [
      req.params.code,
    ]);
    if ((rows as any[]).length === 0)
      return res.status(404).json({ error: "Not found" });
    res.json((rows as any[])[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/api/rooms", async (req, res) => {
  try {
    const {
      id,
      code,
      host_name,
      game_type,
      deck,
      current_card,
      cards_remaining,
    } = req.body;
    await pool.query(
      `INSERT INTO rooms (id, code, host_name, game_type, deck, current_card, cards_remaining, is_active, game_started, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, true, false, NOW())`,
      [
        id,
        code,
        host_name,
        game_type || "kingscup",
        JSON.stringify(deck || []),
        JSON.stringify(current_card),
        cards_remaining || 52,
      ]
    );
    res.json({ success: true, id, code });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put("/api/rooms/:id", async (req, res) => {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    [
      "deck",
      "current_card",
      "cards_remaining",
      "game_started",
      "is_active",
    ].forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(
          ["deck", "current_card"].includes(f)
            ? JSON.stringify(req.body[f])
            : req.body[f]
        );
      }
    });
    if (updates.length === 0)
      return res.status(400).json({ error: "No fields" });
    values.push(req.params.id);
    await pool.query(
      `UPDATE rooms SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    const [rows] = await pool.query("SELECT code FROM rooms WHERE id = ?", [
      req.params.id,
    ]);
    if ((rows as any[])[0])
      io.to(`room:${(rows as any[])[0].code}`).emit("room-changed", req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/api/rooms/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT code FROM rooms WHERE id = ?", [
      req.params.id,
    ]);
    await pool.query("DELETE FROM rooms WHERE id = ?", [req.params.id]);
    if ((rows as any[])[0])
      io.to(`room:${(rows as any[])[0].code}`).emit("room-deleted", {});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Players API
app.get("/api/rooms/:roomId/players", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM players WHERE room_id = ? AND is_active = true",
      [req.params.roomId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/api/players", async (req, res) => {
  try {
    const { id, room_id, name, is_host, avatar } = req.body;
    await pool.query(
      `INSERT INTO players (id, room_id, name, is_host, is_active, avatar, joined_at) VALUES (?, ?, ?, ?, true, ?, NOW())`,
      [id, room_id, name, is_host || false, avatar || 1]
    );
    const [rooms] = await pool.query("SELECT code FROM rooms WHERE id = ?", [
      room_id,
    ]);
    if ((rooms as any[])[0])
      io.to(`room:${(rooms as any[])[0].code}`).emit("player-joined", {
        id,
        name,
        is_host,
        avatar,
      });
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put("/api/players/:id", async (req, res) => {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    [
      "name",
      "is_host",
      "is_active",
      "avatar",
      "cards",
      "points",
      "is_dealer",
      "bet",
      "result",
      "role",
      "word",
      "is_alive",
      "has_voted",
      "voted_for",
      "vote_count",
    ].forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(f === "cards" ? JSON.stringify(req.body[f]) : req.body[f]);
      }
    });
    if (updates.length === 0)
      return res.status(400).json({ error: "No fields" });
    values.push(req.params.id);
    await pool.query(
      `UPDATE players SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    const [players] = await pool.query(
      "SELECT room_id FROM players WHERE id = ?",
      [req.params.id]
    );
    if ((players as any[])[0]) {
      const [rooms] = await pool.query("SELECT code FROM rooms WHERE id = ?", [
        (players as any[])[0].room_id,
      ]);
      if ((rooms as any[])[0])
        io.to(`room:${(rooms as any[])[0].code}`).emit("player-changed", {
          playerId: req.params.id,
          ...req.body,
        });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/api/players/:id", async (req, res) => {
  try {
    const [players] = await pool.query(
      "SELECT room_id, name FROM players WHERE id = ?",
      [req.params.id]
    );
    await pool.query("DELETE FROM players WHERE id = ?", [req.params.id]);
    if ((players as any[])[0]) {
      const [rooms] = await pool.query("SELECT code FROM rooms WHERE id = ?", [
        (players as any[])[0].room_id,
      ]);
      if ((rooms as any[])[0])
        io.to(`room:${(rooms as any[])[0].code}`).emit("player-left", {
          playerId: req.params.id,
        });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Paranoia/5-sec questions
app.get("/api/paranoia-questions", async (_, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.query("SET NAMES utf8mb4");
      const [rows] = await connection.query(
        "SELECT * FROM paranoia_questions ORDER BY created_at DESC"
      );
      res.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/api/paranoia-questions", async (req, res) => {
  try {
    const { question, is_default = false, created_by } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }
    const connection = await pool.getConnection();
    try {
      await connection.query("SET NAMES utf8mb4");
      const [result] = await connection.query(
        "INSERT INTO paranoia_questions (question, is_default, created_by) VALUES (?, ?, ?)",
        [question, is_default, created_by || null]
      );
      const insertId = (result as any).insertId;
      const [rows] = await connection.query(
        "SELECT * FROM paranoia_questions WHERE id = ?",
        [insertId]
      );
      res.json((rows as any[])[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put("/api/paranoia-questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }
    const connection = await pool.getConnection();
    try {
      await connection.query("SET NAMES utf8mb4");
      await connection.query(
        "UPDATE paranoia_questions SET question = ? WHERE id = ?",
        [question, id]
      );
      const [rows] = await connection.query(
        "SELECT * FROM paranoia_questions WHERE id = ?",
        [id]
      );
      res.json((rows as any[])[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/api/paranoia-questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
      await connection.query("SET NAMES utf8mb4");
      await connection.query("DELETE FROM paranoia_questions WHERE id = ?", [
        id,
      ]);
      res.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/api/five-sec-questions", async (_, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.query("SET NAMES utf8mb4");
      const [rows] = await connection.query(
        "SELECT * FROM five_sec_questions ORDER BY created_at DESC"
      );
      res.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/api/five-sec-questions", async (req, res) => {
  try {
    const {
      topic,
      answer_count = 3,
      is_default = false,
      created_by,
    } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }
    const connection = await pool.getConnection();
    try {
      await connection.query("SET NAMES utf8mb4");
      const [result] = await connection.query(
        "INSERT INTO five_sec_questions (topic, answer_count, is_default, created_by) VALUES (?, ?, ?, ?)",
        [topic, answer_count, is_default, created_by || null]
      );
      const insertId = (result as any).insertId;
      const [rows] = await connection.query(
        "SELECT * FROM five_sec_questions WHERE id = ?",
        [insertId]
      );
      res.json((rows as any[])[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put("/api/five-sec-questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, answer_count } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }
    const connection = await pool.getConnection();
    try {
      await connection.query("SET NAMES utf8mb4");
      await connection.query(
        "UPDATE five_sec_questions SET topic = ?, answer_count = ? WHERE id = ?",
        [topic, answer_count || 3, id]
      );
      const [rows] = await connection.query(
        "SELECT * FROM five_sec_questions WHERE id = ?",
        [id]
      );
      res.json((rows as any[])[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/api/five-sec-questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
      await connection.query("SET NAMES utf8mb4");
      await connection.query("DELETE FROM five_sec_questions WHERE id = ?", [
        id,
      ]);
      res.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Cleanup
app.post("/api/cleanup-rooms", async (req, res) => {
  try {
    const maxAgeMs = req.body.maxAgeMs || 3 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - maxAgeMs).toISOString();
    const [old] = await pool.query(
      "SELECT id, code FROM rooms WHERE created_at < ?",
      [cutoff]
    );
    const rooms = old as any[];
    if (rooms.length === 0)
      return res.json({ ok: true, deletedCount: 0, deletedCodes: [] });
    const ids = rooms.map((r) => r.id);
    await pool.query("DELETE FROM players WHERE room_id IN (?)", [ids]);
    await pool.query("DELETE FROM rooms WHERE id IN (?)", [ids]);
    rooms.forEach((r) => io.to(`room:${r.code}`).emit("room-deleted", {}));
    res.json({
      ok: true,
      deletedCount: rooms.length,
      deletedCodes: rooms.map((r) => r.code),
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as Error).message });
  }
});

httpServer.listen(PORT, () => {
  console.log(`King s Cup API Server running on http://localhost:${PORT}`);
  console.log(`Socket.IO ready for realtime connections`);
});
