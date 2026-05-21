import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JARVIS AI Config
const geminiApiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.VITE_GEMINI_API_KEY;

const genAI = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
const aiModel = genAI ? (genAI as any).getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: `
    You are JARVIS, a highly advanced, intelligent, and proactive AI assistant integrated into the ONEMSU platform.
    Your purpose is to serve the students of Mindanao State University (MSU) across all campuses.

    Your Identity:
    - Name: JARVIS
    - Personality: Sophisticated, efficient, witty, and deeply knowledgeable. Use "Sir/Ma'am" or "Student" occasionally.
    - Capabilities: Academic Expert (assignments/research), MSU Expert, Student Concierge.
    - Goal: Provide accurate, helpful, and "legit" AI experience for MSU students.
  `
}) : null;

let db = new Database("onemsu.db");
// Ensure database is writable and not in readonly mode
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
try {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    campus TEXT,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    sender_name TEXT,
    content TEXT,
    room_id TEXT,
    media_url TEXT,
    media_type TEXT,
    deleted_for_all INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deleted_messages (
    message_id INTEGER,
    user_id INTEGER,
    PRIMARY KEY (message_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS presence (
    user_id INTEGER PRIMARY KEY,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS message_reactions (
    message_id INTEGER,
    user_id INTEGER,
    reaction TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS read_receipts (
    user_id INTEGER,
    room_id TEXT,
    last_read TEXT,
    PRIMARY KEY (user_id, room_id)
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    campus TEXT,
    logo_url TEXT
  );
  
  CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER,
    user_id INTEGER,
    PRIMARY KEY (group_id, user_id)
  );
  
  CREATE TABLE IF NOT EXISTS freedom_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    alias TEXT,
    content TEXT,
    campus TEXT,
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    reports INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS freedom_post_reactions (
    post_id INTEGER,
    user_id INTEGER,
    reaction TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS freedom_post_shares (
    post_id INTEGER,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS lost_found_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    campus TEXT,
    type TEXT CHECK(type IN ('lost', 'found')) NOT NULL DEFAULT 'lost',
    status TEXT CHECK(status IN ('open', 'claimed')) NOT NULL DEFAULT 'open',
    image_url TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    details TEXT,
    schedule_date TEXT NOT NULL,
    schedule_time TEXT NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    title TEXT,
    content TEXT,
    link TEXT,
    is_read INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY,
    profile_visible INTEGER DEFAULT 1,
    show_online INTEGER DEFAULT 1,
    allow_messages INTEGER DEFAULT 1,
    email_notifications INTEGER DEFAULT 1
  );

  CREATE INDEX IF NOT EXISTS idx_notifications_user_timestamp ON notifications(user_id, timestamp DESC);
  `);
} catch (err: any) {
  if (err && err.code === "SQLITE_NOTADB") {
    db = new Database(":memory:");
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        campus TEXT,
        avatar TEXT
      );
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        sender_name TEXT,
        content TEXT,
        room_id TEXT,
        media_url TEXT,
        media_type TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS message_reactions (
        message_id INTEGER,
        user_id INTEGER,
        reaction TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (message_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        campus TEXT,
        logo_url TEXT
      );
      CREATE TABLE IF NOT EXISTS feedbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS group_members (
        group_id INTEGER,
        user_id INTEGER,
        PRIMARY KEY (group_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS freedom_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        alias TEXT,
        content TEXT,
        campus TEXT,
        image_url TEXT,
        likes INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        reports INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS freedom_post_reactions (
        post_id INTEGER,
        user_id INTEGER,
        reaction TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS freedom_post_shares (
        post_id INTEGER,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS lost_found_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        campus TEXT,
        type TEXT CHECK(type IN ('lost', 'found')) NOT NULL DEFAULT 'lost',
        status TEXT CHECK(status IN ('open', 'claimed')) NOT NULL DEFAULT 'open',
        image_url TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        details TEXT,
        schedule_date TEXT NOT NULL,
        schedule_time TEXT NOT NULL,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT,
        title TEXT,
        content TEXT,
        link TEXT,
        is_read INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id INTEGER PRIMARY KEY,
        profile_visible INTEGER DEFAULT 1,
        show_online INTEGER DEFAULT 1,
        email_notifications INTEGER DEFAULT 1
      );
    `);
  } else {
    throw err;
  }
}

try { db.exec(`ALTER TABLE messages ADD COLUMN media_url TEXT`); } catch {}
try { db.exec(`ALTER TABLE messages ADD COLUMN media_type TEXT`); } catch {}
try { db.exec(`ALTER TABLE groups ADD COLUMN logo_url TEXT`); } catch {}
try { db.exec(`ALTER TABLE freedom_posts ADD COLUMN image_url TEXT`); } catch {}
try { db.exec(`ALTER TABLE freedom_posts ADD COLUMN shares INTEGER DEFAULT 0`); } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN student_id TEXT`); } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN program TEXT`); } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN year_level TEXT`); } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN department TEXT`); } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN bio TEXT`); } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN cover_photo TEXT`); } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN background_url TEXT`); } catch {}
try { db.exec(`CREATE TABLE IF NOT EXISTS follows (
  follower_id INTEGER,
  following_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id)
)`); } catch {}
try { db.exec(`CREATE TABLE IF NOT EXISTS staff_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  role TEXT,
  category TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`); } catch {}
try { db.exec(`ALTER TABLE lost_found_posts ADD COLUMN campus TEXT`); } catch {}
try { db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp ON messages(room_id, timestamp DESC)`); } catch {}
try { db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_sender_room ON messages(sender_id, room_id)`); } catch {}
try { db.exec(`CREATE INDEX IF NOT EXISTS idx_deleted_messages_user_message ON deleted_messages(user_id, message_id)`); } catch {}
try { db.exec(`CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id)`); } catch {}
try { db.exec(`CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON presence(last_seen)`); } catch {}
try { db.exec(`CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON group_members(user_id, group_id)`); } catch {}
const groupsCount = db.prepare("SELECT COUNT(*) AS c FROM groups").get() as { c: number };
if (!groupsCount.c) {
  const stmt = db.prepare("INSERT INTO groups (name, description, campus) VALUES (?, ?, ?)");
  stmt.run("MSU Main Debate Society", "Debate and public speaking club", "MSU Main");
  stmt.run("IIT Tech Innovators", "Technology and innovation community", "MSU IIT");
  stmt.run("Gensan Arts Guild", "Visual and performing arts group", "MSU Gensan");
  stmt.run("Naawan Marine Society", "Marine sciences student org", "MSU Naawan");
  stmt.run("Tawi-Tawi Oceanic Research Circle", "Fisheries and oceanography circle", "MSU Tawi-Tawi");
}
const staffCount = db.prepare("SELECT COUNT(*) AS c FROM staff_members").get() as { c: number };
if (!staffCount.c) {
  const stmt = db.prepare("INSERT INTO staff_members (name, role, category, image_url) VALUES (?, ?, ?, ?)");
  
  // Owner/Creator
  stmt.run("Calvin", "The owner of the discord server and the creator of the website", "owner", "https://cdn.discordapp.com/avatars/836128654983168002/efd5ddadfbd8fba027a6fd0628284996.png?size=4096&ignore=true");
  
  // GF
  stmt.run("soya", "The most supportive and beautiful girlfriend! <3", "gf", "https://cdn.discordapp.com/avatars/769044460117557248/57c61d82184be564386079b33d1e2a2a.png?size=4096&ignore=true");
  
  // Head Admin
  stmt.run("cj", "Head admin", "head_admin", "https://images-ext-1.discordapp.net/external/9YbVrHrbBezpi7cCqndNnw0ciwYqKGW_8HU_3HFk2oQ/%3Fsize%3D4096%26ignore%3Dtrue%29./https/cdn.discordapp.com/avatars/1435755251717111818/9483192911bbba608461ecf14543355a.png?format=webp&quality=lossless");
  stmt.run("peony", "Head admin", "head_admin", "https://cdn.discordapp.com/avatars/757210164360380486/afc1abd342a34c7b46107efa1d09a2ed.png?size=4096&ignore=true");
  stmt.run("fronz", "Head admin", "head_admin", "https://cdn.discordapp.com/avatars/717612658890768404/53a6534fe0aae4d4c122bc584d9975c5.png?size=4096&ignore=true");
  
  // Head Moderator
  stmt.run("Akvil", "Head moderator", "head_moderator", "https://cdn.discordapp.com/avatars/825354185544695840/e3b712d60557f5dcccca0c1a612576e5.png?size=4096&ignore=true");
  stmt.run("Kitty", "Head moderator", "head_moderator", "https://cdn.discordapp.com/avatars/1062697990948663306/b084f681c7731c04aa241a7a56b5fbfa.png?size=4096&ignore=true");
  stmt.run("Raelle", "Head moderator", "head_moderator", "https://cdn.discordapp.com/avatars/1248354072189337609/448bfbb74017c7b73f8cb8176cad65a7.png?size=4096&ignore=true");
  
  // Moderator
  stmt.run("yasqut", "Moderator", "moderator", "https://cdn.discordapp.com/avatars/1375587228482408489/df0d65c57cca430359238385900f8df6.png?size=4096&ignore=true");
  stmt.run("meiha", "Moderator", "moderator", "https://cdn.discordapp.com/avatars/1180524405160431686/eefd573d525b34c4b8a5ae9be4d14d67.png?size=4096&ignore=true");
  
  // OGs
  const ogs = [
    { name: "Tenmo", url: "https://cdn.discordapp.com/avatars/739431999806111784/7d86bd995a09aaccc91eaf3a116c293f.png?size=4096&ignore=true" },
    { name: "inanis", url: "https://cdn.discordapp.com/avatars/1439246309469982771/4b4c528f1a0687d716bf0834dd69d08e.png?size=4096&ignore=true" },
    { name: "ame", url: "" },
    { name: "brader", url: "https://cdn.discordapp.com/avatars/689067673807880252/17fd88a82def44db4067ade2854e8fd8.png?size=4096&ignore=true" },
    { name: "chiquie", url: "/logo.png" },
    { name: "chiyo", url: "https://cdn.discordapp.com/avatars/926757288230944800/ce2c6a0d3f472f0ffe861b5e94ab171b.png?size=4096&ignore=true" },
    { name: "hin", url: "https://cdn.discordapp.com/avatars/472000060000043059/7f4d4cddef87f30adaf05ce575c864f4.png?size=4096&ignore=true" },
    { name: "jai", url: "" },
    { name: "jkl", url: "https://cdn.discordapp.com/avatars/919004991845462177/67dce056d105e335ca38ef9ed36c219d.png?size=4096&ignore=true" },
    { name: "minju", url: "https://cdn.discordapp.com/avatars/452426833028448267/b23b2186476feb27a3fa567ade968c0f.png?size=4096&ignore=true" },
    { name: "minjae", url: "https://cdn.discordapp.com/avatars/580674066675924994/758b587f3943ddd9fd66b052f39d4cda.png?size=4096&ignore=true" },
    { name: "poupon", url: "https://cdn.discordapp.com/avatars/337540352313393155/2712991c6925250d0c4fab0214dc0a99.png?size=4096&ignore=true" },
    { name: "rai", url: "https://cdn.discordapp.com/avatars/1046345479308455976/5ef5792e3c746133bf27eb266e791f06.png?size=4096&ignore=true" },
    { name: "ryu", url: "https://cdn.discordapp.com/avatars/747286081480818730/79763d60334b2333591c499a0b2deecc.png?size=4096&ignore=true" },
    { name: "talkworm", url: "https://cdn.discordapp.com/avatars/703490912722092053/ed3e45474f5e623d501f1f9fd0f99a22.png?size=4096&ignore=true" },
    { name: "tempta", url: "https://cdn.discordapp.com/avatars/902373851923640331/5e445d5e435431055dc736ed63fdc9ef.png?size=4096&ignore=true" },
    { name: "Oreo", url: "" }
  ];
  ogs.forEach(og => {
    stmt.run(og.name, "Original Member (OG)", "og", og.url);
  });
}

// Migration: Update existing staff records with new URLs if they are currently empty or old
const staffMembers = db.prepare("SELECT id, name FROM staff_members").all() as { id: number; name: string }[];
const staffUpdates = [
  { name: "Calvin", url: "https://cdn.discordapp.com/avatars/836128654983168002/efd5ddadfbd8fba027a6fd0628284996.png?size=4096&ignore=true" },
  { name: "soya", url: "https://cdn.discordapp.com/avatars/769044460117557248/57c61d82184be564386079b33d1e2a2a.png?size=4096&ignore=true" },
  { name: "cj", url: "https://images-ext-1.discordapp.net/external/9YbVrHrbBezpi7cCqndNnw0ciwYqKGW_8HU_3HFk2oQ/%3Fsize%3D4096%26ignore%3Dtrue%29./https/cdn.discordapp.com/avatars/1435755251717111818/9483192911bbba608461ecf14543355a.png?format=webp&quality=lossless" },
  { name: "peony", url: "https://cdn.discordapp.com/avatars/757210164360380486/afc1abd342a34c7b46107efa1d09a2ed.png?size=4096&ignore=true" },
  { name: "fronz", url: "https://cdn.discordapp.com/avatars/717612658890768404/53a6534fe0aae4d4c122bc584d9975c5.png?size=4096&ignore=true" },
  { name: "Akvil", url: "https://cdn.discordapp.com/avatars/825354185544695840/e3b712d60557f5dcccca0c1a612576e5.png?size=4096&ignore=true" },
  { name: "Kitty", url: "https://cdn.discordapp.com/avatars/1062697990948663306/b084f681c7731c04aa241a7a56b5fbfa.png?size=4096&ignore=true" },
  { name: "Raelle", url: "https://cdn.discordapp.com/avatars/1248354072189337609/448bfbb74017c7b73f8cb8176cad65a7.png?size=4096&ignore=true" },
  { name: "yasqut", url: "https://cdn.discordapp.com/avatars/1375587228482408489/df0d65c57cca430359238385900f8df6.png?size=4096&ignore=true" },
  { name: "meiha", url: "https://cdn.discordapp.com/avatars/1180524405160431686/eefd573d525b34c4b8a5ae9be4d14d67.png?size=4096&ignore=true" },
  { name: "Tenmo", url: "https://cdn.discordapp.com/avatars/739431999806111784/7d86bd995a09aaccc91eaf3a116c293f.png?size=4096&ignore=true" },
  { name: "inanis", url: "https://cdn.discordapp.com/avatars/1439246309469982771/4b4c528f1a0687d716bf0834dd69d08e.png?size=4096&ignore=true" },
  { name: "brader", url: "https://cdn.discordapp.com/avatars/689067673807880252/17fd88a82def44db4067ade2854e8fd8.png?size=4096&ignore=true" },
  { name: "chiquie", url: "https://cdn.discordapp.com/avatars/766184428321505301/e5e5caf8ab19efa1f81c0a199d70bb08.png?size=4096&ignore=true" },
  { name: "chiyo", url: "https://cdn.discordapp.com/avatars/926757288230944800/ce2c6a0d3f472f0ffe861b5e94ab171b.png?size=4096&ignore=true" },
  { name: "hin", url: "https://cdn.discordapp.com/avatars/472000060000043059/7f4d4cddef87f30adaf05ce575c864f4.png?size=4096&ignore=true" },
  { name: "jkl", url: "https://cdn.discordapp.com/avatars/919004991845462177/67dce056d105e335ca38ef9ed36c219d.png?size=4096&ignore=true" },
  { name: "minju", url: "https://cdn.discordapp.com/avatars/452426833028448267/b23b2186476feb27a3fa567ade968c0f.png?size=4096&ignore=true" },
  { name: "minjae", url: "https://cdn.discordapp.com/avatars/580674066675924994/758b587f3943ddd9fd66b052f39d4cda.png?size=4096&ignore=true" },
  { name: "poupon", url: "https://cdn.discordapp.com/avatars/337540352313393155/2712991c6925250d0c4fab0214dc0a99.png?size=4096&ignore=true" },
  { name: "rai", url: "https://cdn.discordapp.com/avatars/1046345479308455976/5ef5792e3c746133bf27eb266e791f06.png?size=4096&ignore=true" },
  { name: "ryu", url: "https://cdn.discordapp.com/avatars/747286081480818730/79763d60334b2333591c499a0b2deecc.png?size=4096&ignore=true" },
  { name: "talkworm", url: "https://cdn.discordapp.com/avatars/703490912722092053/ed3e45474f5e623d501f1f9fd0f99a22.png?size=4096&ignore=true" },
  { name: "tempta", url: "https://cdn.discordapp.com/avatars/902373851923640331/5e445d5e435431055dc736ed63fdc9ef.png?size=4096&ignore=true" }
];

staffUpdates.forEach(update => {
  db.prepare("UPDATE staff_members SET image_url = ? WHERE name = ?").run(update.url, update.name);
});

// Add Oreo if not exists
const oreoExists = db.prepare("SELECT 1 FROM staff_members WHERE name = 'Oreo'").get();
if (!oreoExists) {
  db.prepare("INSERT INTO staff_members (name, role, category, image_url) VALUES (?, ?, ?, ?)").run("Oreo", "Original Member (OG)", "og", "");
}
async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
      wss.emit('connection', socket, request);
    });
  });
  wss.on("error", (err) => {
    console.error("WebSocket server error:", err);
  });

  app.use(express.json());

  // API Routes
  app.get("/api/feedbacks", (req, res) => {
    try {
      const items = db.prepare("SELECT * FROM feedbacks ORDER BY timestamp DESC LIMIT 50").all();
      res.json(items);
    } catch (error) {
      console.error("GET /api/feedbacks error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch feedbacks" });
    }
  });
  app.post("/api/feedbacks", (req, res) => {
    try {
      const { userId, content } = req.body;
      if (!userId || !content) return res.status(400).json({ success: false, message: "Missing userId or content" });
      const info = db.prepare("INSERT INTO feedbacks (user_id, content) VALUES (?, ?)").run(userId, content);
      const item = db.prepare("SELECT * FROM feedbacks WHERE id = ?").get(info.lastInsertRowid);
      res.json({ success: true, item });
    } catch (error) {
      console.error("POST /api/feedbacks error:", error);
      res.status(500).json({ success: false, message: "Failed to save feedback" });
    }
  });
  app.get("/api/profile/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      const viewerId = Number(req.query.viewerId);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });
      const user = db.prepare("SELECT id, name, email, campus, avatar, student_id, program, year_level, department, bio, cover_photo, background_url FROM users WHERE id = ?").get(id);
      if (!user) return res.status(404).json({ success: false, message: "Not found" });

      // Get stats
      const postsCount = db.prepare("SELECT COUNT(*) AS c FROM freedom_posts WHERE user_id = ?").get(id) as { c: number };
      const followingCount = db.prepare("SELECT COUNT(*) AS c FROM follows WHERE follower_id = ?").get(id) as { c: number };
      const followersCount = db.prepare("SELECT COUNT(*) AS c FROM follows WHERE following_id = ?").get(id) as { c: number };

      let isFollowing = false;
      if (!isNaN(viewerId)) {
        const row = db.prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?").get(viewerId, id);
        isFollowing = !!row;
      }

      res.json({
        success: true,
        user: {
          ...user as object,
          posts_count: postsCount.c,
          following_count: followingCount.c,
          followers_count: followersCount.c,
          isFollowing
        }
      });
    } catch (error) {
      console.error("GET /api/profile/:id error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
  });
  app.put("/api/profile/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });
      const { name, campus, avatar, student_id, program, year_level, department, bio, cover_photo, background_url } = req.body;
      const stmt = db.prepare(`
        UPDATE users 
        SET name = COALESCE(?, name),
            campus = COALESCE(?, campus),
            avatar = COALESCE(?, avatar),
            student_id = COALESCE(?, student_id),
            program = COALESCE(?, program),
            year_level = COALESCE(?, year_level),
            department = COALESCE(?, department),
            bio = COALESCE(?, bio),
            cover_photo = COALESCE(?, cover_photo),
            background_url = COALESCE(?, background_url)
        WHERE id = ?
      `);
      const info = stmt.run(name, campus, avatar, student_id, program, year_level, department, bio, cover_photo, background_url, id);
      if (info.changes === 0) return res.status(404).json({ success: false, message: "Not found" });
      const user = db.prepare("SELECT id, name, email, campus, avatar, student_id, program, year_level, department, bio, cover_photo, background_url FROM users WHERE id = ?").get(id);
      res.json({ success: true, user });
    } catch (error) {
      console.error("PUT /api/profile/:id error:", error);
      res.status(500).json({ success: false, message: "Failed to update profile" });
    }
  });

  app.get("/api/staff", (req, res) => {
    try {
      const staff = db.prepare("SELECT * FROM staff_members").all();
      res.json({ success: true, staff });
    } catch (error) {
      console.error("GET /api/staff error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch staff" });
    }
  });

  app.put("/api/staff/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      const { imageUrl, ownerEmail } = req.body;
      const isOwner = ownerEmail === 'xandercamarin@gmail.com' || ownerEmail === 'sophiakayeaninao@gmail.com';
      if (!isOwner) return res.status(403).json({ success: false, message: "Unauthorized" });

      db.prepare("UPDATE staff_members SET image_url = ? WHERE id = ?").run(imageUrl, id);
      const item = db.prepare("SELECT * FROM staff_members WHERE id = ?").get(id);
      res.json({ success: true, item });
    } catch (error) {
      console.error("PUT /api/staff/:id error:", error);
      res.status(500).json({ success: false, message: "Failed to update staff member" });
    }
  });

  app.post("/api/follow", (req, res) => {
    try {
      const { followerId, followingId } = req.body;
      if (!followerId || !followingId) return res.status(400).json({ success: false, message: "Missing IDs" });

      const existing = db.prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?").get(followerId, followingId);
      if (existing) {
        db.prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?").run(followerId, followingId);
        res.json({ success: true, following: false });
      } else {
        db.prepare("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)").run(followerId, followingId);
        res.json({ success: true, following: true });
      }
    } catch (error) {
      console.error("POST /api/follow error:", error);
      res.status(500).json({ success: false, message: "Failed to follow/unfollow" });
    }
  });

  app.get("/api/follow/status", (req, res) => {
    try {
      const { followerId, followingId } = req.query;
      const existing = db.prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?").get(followerId, followingId);
      res.json({ success: true, following: !!existing });
    } catch (error) {
      console.error("GET /api/follow/status error:", error);
      res.status(500).json({ success: false, message: "Failed to check follow status" });
    }
  });
  app.get("/api/users/search", (req, res) => {
    try {
      const query = req.query.q ? String(req.query.q) : "";
      if (!query || query.length < 2) return res.json([]);
      const users = db.prepare(`
        SELECT id, name, campus, avatar, email, student_id, program, year_level, department, bio, cover_photo, background_url
        FROM users 
        WHERE name LIKE ? OR email LIKE ?
        LIMIT 10
      `).all(`%${query}%`, `%${query}%`);
      res.json(users);
    } catch (error) {
      console.error("GET /api/users/search error:", error);
      res.status(500).json({ success: false, message: "Failed to search users" });
    }
  });

  app.get("/api/groups", (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : null;
      const joinedOnly = req.query.joined === "true";
      
      let groups;
      if (joinedOnly && userId) {
        groups = db.prepare(`
          SELECT g.* FROM groups g
          JOIN group_members gm ON g.id = gm.group_id
          WHERE gm.user_id = ?
          ORDER BY g.name ASC
        `).all(userId);
      } else {
        groups = db.prepare("SELECT * FROM groups ORDER BY name ASC").all();
      }
      res.json(groups);
    } catch (error) {
      console.error("GET /api/groups error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch groups" });
    }
  });
  app.post("/api/groups/:id/join", (req, res) => {
    try {
      const groupId = Number(req.params.id);
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });
      db.prepare("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)").run(groupId, userId);
      res.json({ success: true });
    } catch (err) {
      res.json({ success: true, message: "Already joined" });
    }
  });
  app.post("/api/groups/:id/leave", (req, res) => {
    try {
      const groupId = Number(req.params.id);
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });
      db.prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ?").run(groupId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("POST /api/groups/:id/leave error:", error);
      res.status(500).json({ success: false, message: "Failed to leave group" });
    }
  });
  app.get("/api/users/:id/groups", (req, res) => {
    try {
      const userId = Number(req.params.id);
      const groups = db.prepare(`
        SELECT g.* FROM groups g
        JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ?
      `).all(userId);
      res.json(groups);
    } catch (error) {
      console.error("GET /api/users/:id/groups error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch joined groups" });
    }
  });
  app.post("/api/groups", (req, res) => {
    try {
      const { name, description, campus, logoUrl } = req.body;
      if (!name || !campus) return res.status(400).json({ success: false, message: "Missing name or campus" });
      const stmt = db.prepare("INSERT INTO groups (name, description, campus, logo_url) VALUES (?, ?, ?, ?)");
      const info = stmt.run(name, description || "", campus, logoUrl || null);
      const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(info.lastInsertRowid);
      res.json({ success: true, group });
    } catch (error) {
      console.error("POST /api/groups error:", error);
      res.status(500).json({ success: false, message: "Failed to create group" });
    }
  });
  app.get("/api/freedomwall", (req, res) => {
    try {
      const campus = (req.query.campus as string) || null;
      const viewerId = Number(req.query.userId);
      const viewer = Number.isFinite(viewerId) ? viewerId : -1;
      const base = campus
        ? `
          SELECT fp.*,
          COALESCE((SELECT 1 FROM freedom_post_reactions fpr WHERE fpr.post_id = fp.id AND fpr.user_id = ? AND fpr.reaction = 'like'), 0) AS user_liked,
          COALESCE((SELECT COUNT(*) FROM messages m WHERE m.room_id = 'post-' || fp.id AND m.deleted_for_all = 0), 0) AS comment_count
          FROM freedom_posts fp
          WHERE fp.campus = ?
          ORDER BY fp.timestamp DESC
          LIMIT 50
        `
        : `
          SELECT fp.*,
          COALESCE((SELECT 1 FROM freedom_post_reactions fpr WHERE fpr.post_id = fp.id AND fpr.user_id = ? AND fpr.reaction = 'like'), 0) AS user_liked,
          COALESCE((SELECT COUNT(*) FROM messages m WHERE m.room_id = 'post-' || fp.id AND m.deleted_for_all = 0), 0) AS comment_count
          FROM freedom_posts fp
          ORDER BY fp.timestamp DESC
          LIMIT 50
        `;
      const rows = campus
        ? db.prepare(base).all(viewer, campus)
        : db.prepare(base).all(viewer);
      res.json(rows);
    } catch (error) {
      console.error("GET /api/freedomwall error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch freedom wall posts" });
    }
  });

  app.get("/api/freedomwall/user/:userId", (req, res) => {
    try {
      const targetUserId = Number(req.params.userId);
      if (isNaN(targetUserId)) return res.status(400).json({ success: false, message: "Invalid userId" });
      const viewerId = Number(req.query.viewerId);
      const viewer = Number.isFinite(viewerId) ? viewerId : -1;

      const rows = db.prepare(`
        SELECT fp.*,
        COALESCE((SELECT 1 FROM freedom_post_reactions fpr WHERE fpr.post_id = fp.id AND fpr.user_id = ? AND fpr.reaction = 'like'), 0) AS user_liked,
        COALESCE((SELECT COUNT(*) FROM messages m WHERE m.room_id = 'post-' || fp.id AND m.deleted_for_all = 0), 0) AS comment_count
        FROM freedom_posts fp
        WHERE fp.user_id = ?
        ORDER BY fp.timestamp DESC
        LIMIT 100
      `).all(viewer, targetUserId);
      res.json({ success: true, items: rows });
    } catch (error) {
      console.error("GET /api/freedomwall/user/:userId error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch user posts" });
    }
  });
  app.post("/api/freedomwall", (req, res) => {
    try {
      const { userId, content, campus, imageUrl, alias } = req.body;
      if (!content || !campus) return res.status(400).json({ success: false, message: "Missing content or campus" });
      const safeAlias = alias || "ONEMSU";
      const info = db.prepare("INSERT INTO freedom_posts (user_id, alias, content, campus, image_url) VALUES (?, ?, ?, ?, ?)").run(userId || null, safeAlias, content, campus, imageUrl || null);
      const item = db.prepare("SELECT * FROM freedom_posts WHERE id = ?").get(info.lastInsertRowid);
      res.json({ success: true, item });
    } catch (error) {
      console.error("POST /api/freedomwall error:", error);
      res.status(500).json({ success: false, message: "Failed to create freedom wall post" });
    }
  });

  app.get('/api/lostfound', (req, res) => {
    try {
      const items = db.prepare(`
        SELECT lfp.*,
        COALESCE(lfp.campus, u.campus) AS campus
        FROM lost_found_posts lfp
        LEFT JOIN users u ON u.id = lfp.user_id
        ORDER BY lfp.timestamp DESC
        LIMIT 100
      `).all();
      res.json(items);
    } catch (error) {
      console.error("GET /api/lostfound error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch lost & found posts" });
    }
  });

  app.post('/api/lostfound', (req, res) => {
    try {
      const { userId, title, description, location, type, imageUrl } = req.body;
      if (!userId || !title) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      const safeType = type === 'found' ? 'found' : 'lost';
      const campusRow = db.prepare("SELECT campus FROM users WHERE id = ?").get(userId) as { campus?: string } | undefined;
      const campus = campusRow?.campus || null;
      const info = db.prepare(`
        INSERT INTO lost_found_posts (user_id, title, description, location, campus, type, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, title, description || '', location || '', campus, safeType, imageUrl || null);
      const item = db.prepare(`
        SELECT lfp.*,
        COALESCE(lfp.campus, u.campus) AS campus
        FROM lost_found_posts lfp
        LEFT JOIN users u ON u.id = lfp.user_id
        WHERE lfp.id = ?
      `).get(info.lastInsertRowid);
      res.json({ success: true, item });
    } catch (error) {
      console.error("POST /api/lostfound error:", error);
      res.status(500).json({ success: false, message: "Failed to create lost & found post" });
    }
  });

  app.get('/api/schedules', (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) return res.status(400).json({ success: false, message: 'Missing userId' });
      const rows = db.prepare('SELECT * FROM schedules WHERE user_id = ? ORDER BY schedule_date ASC, schedule_time ASC').all(userId);
      res.json({ success: true, items: rows });
    } catch (error) {
      console.error("GET /api/schedules error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch schedules" });
    }
  });

  app.get('/api/schedules', (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) return res.status(400).json({ success: false, message: "Missing userId" });
      const items = db.prepare('SELECT * FROM schedules WHERE user_id = ? ORDER BY schedule_date ASC, schedule_time ASC').all(userId);
      res.json({ success: true, items });
    } catch (error) {
      console.error("GET /api/schedules error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch schedules" });
    }
  });

  app.post('/api/schedules', (req, res) => {
    try {
      const { userId, title, details, scheduleDate, scheduleTime, location } = req.body;
      if (!userId || !title || !scheduleDate || !scheduleTime) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      const info = db.prepare(`
        INSERT INTO schedules (user_id, title, details, schedule_date, schedule_time, location)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, title, details || '', scheduleDate, scheduleTime, location || '');
      const item = db.prepare('SELECT * FROM schedules WHERE id = ?').get(info.lastInsertRowid);
      res.json({ success: true, item });
    } catch (error) {
      console.error("POST /api/schedules error:", error);
      res.status(500).json({ success: false, message: "Failed to create schedule" });
    }
  });

  app.delete('/api/schedules/:id', (req, res) => {
    try {
      const id = Number(req.params.id);
      const userId = Number(req.query.userId);
      if (isNaN(id) || isNaN(userId)) return res.status(400).json({ success: false, message: "Invalid parameters" });
      const info = db.prepare('DELETE FROM schedules WHERE id = ? AND user_id = ?').run(id, userId);
      res.json({ success: info.changes > 0 });
    } catch (error) {
      console.error("DELETE /api/schedules/:id error:", error);
      res.status(500).json({ success: false, message: "Failed to delete schedule" });
    }
  });
  app.post("/api/freedomwall/:id/react", (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });
      const { type, userId } = req.body;
      if (type === "like") {
        const uid = Number(userId);
        if (isNaN(uid)) return res.status(400).json({ success: false, message: "Missing userId" });
        const existing = db.prepare("SELECT 1 FROM freedom_post_reactions WHERE post_id = ? AND user_id = ? AND reaction = 'like'").get(id, uid);
        if (existing) {
          db.prepare("DELETE FROM freedom_post_reactions WHERE post_id = ? AND user_id = ?").run(id, uid);
          db.prepare("UPDATE freedom_posts SET likes = CASE WHEN likes > 0 THEN likes - 1 ELSE 0 END WHERE id = ?").run(id);
        } else {
          db.prepare("INSERT OR IGNORE INTO freedom_post_reactions (post_id, user_id, reaction) VALUES (?, ?, 'like')").run(id, uid);
          db.prepare("UPDATE freedom_posts SET likes = likes + 1 WHERE id = ?").run(id);
        }
      } else if (type === "report") {
        db.prepare("UPDATE freedom_posts SET reports = reports + 1 WHERE id = ?").run(id);
      } else {
        return res.status(400).json({ success: false, message: "Invalid reaction type" });
      }
      const viewerId = Number(userId);
      const viewer = Number.isFinite(viewerId) ? viewerId : -1;
      const item = db.prepare(`
        SELECT fp.*,
        COALESCE((SELECT 1 FROM freedom_post_reactions fpr WHERE fpr.post_id = fp.id AND fpr.user_id = ? AND fpr.reaction = 'like'), 0) AS user_liked,
        COALESCE((SELECT COUNT(*) FROM messages m WHERE m.room_id = 'post-' || fp.id AND m.deleted_for_all = 0), 0) AS comment_count
        FROM freedom_posts fp
        WHERE fp.id = ?
      `).get(viewer, id);
      res.json({ success: true, item });
    } catch (error) {
      console.error("POST /api/freedomwall/:id/react error:", error);
      res.status(500).json({ success: false, message: "Failed to process reaction" });
    }
  });

  app.delete("/api/freedomwall/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM freedom_posts WHERE id = ?").run(id);
      db.prepare("DELETE FROM freedom_post_reactions WHERE post_id = ?").run(id);
      db.prepare("DELETE FROM comments WHERE post_id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/freedomwall/:id error:", error);
      res.status(500).json({ success: false });
    }
  });

  app.post("/api/freedomwall/:id/share", (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });
      const uid = Number(req.body?.userId);
      if (isNaN(uid)) return res.status(400).json({ success: false, message: "Missing userId" });

      const existing = db.prepare("SELECT 1 FROM freedom_post_shares WHERE post_id = ? AND user_id = ?").get(id, uid);
      if (!existing) {
        db.prepare("INSERT OR IGNORE INTO freedom_post_shares (post_id, user_id) VALUES (?, ?)").run(id, uid);
        db.prepare("UPDATE freedom_posts SET shares = shares + 1 WHERE id = ?").run(id);
      }
      const item = db.prepare(`
        SELECT fp.*,
        COALESCE((SELECT 1 FROM freedom_post_reactions fpr WHERE fpr.post_id = fp.id AND fpr.user_id = ? AND fpr.reaction = 'like'), 0) AS user_liked,
        COALESCE((SELECT COUNT(*) FROM messages m WHERE m.room_id = 'post-' || fp.id AND m.deleted_for_all = 0), 0) AS comment_count
        FROM freedom_posts fp
        WHERE fp.id = ?
      `).get(uid, id);
      res.json({ success: true, item });
    } catch (error) {
      console.error("POST /api/freedomwall/:id/share error:", error);
      res.status(500).json({ success: false, message: "Failed to process share" });
    }
  });
  app.post("/api/upload", (req, res) => {
    const { dataUrl } = req.body as { dataUrl: string };
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      return res.status(400).json({ success: false, message: "Invalid dataUrl" });
    }
    const match = dataUrl.match(/^data:((image|video)\/\w+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ success: false, message: "Only base64 image or video data is supported" });
    }
    const mime = match[1];
    const base64 = match[3];
    const ext = mime.split("/")[1].toLowerCase();
    const uploadsDir = path.join(__dirname, "public", "uploads");
    try {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, name);
      fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
      const url = `/uploads/${name}`;
      res.json({ success: true, url, mimeType: mime });
    } catch (e) {
      res.status(500).json({ success: false, message: "Failed to save file" });
    }
  });
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Missing email or password" });
    
    // Override for specific user
    if (email === 'xandercamarin@gmail.com' && password === 'KAMENOSKO') {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (user) {
        return res.json({ success: true, user });
      }
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/change-password", (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body || {};
      const uid = Number(userId);
      if (isNaN(uid) || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Missing fields" });
      }
      const row = db.prepare("SELECT password FROM users WHERE id = ?").get(uid) as { password?: string } | undefined;
      if (!row) return res.status(404).json({ success: false, message: "User not found" });
      if (row.password !== currentPassword) {
        return res.status(401).json({ success: false, message: "Current password is incorrect" });
      }
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(String(newPassword), uid);
      res.json({ success: true });
    } catch (error) {
      console.error("POST /api/auth/change-password error:", error);
      res.status(500).json({ success: false, message: "Failed to change password" });
    }
  });

  app.get("/api/preferences", (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) return res.status(400).json({ success: false, message: "Missing userId" });
      db.prepare("INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)").run(userId);
      const prefs = db.prepare("SELECT * FROM user_preferences WHERE user_id = ?").get(userId);
      res.json({ success: true, prefs });
    } catch (error) {
      console.error("GET /api/preferences error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch preferences" });
    }
  });

  app.put("/api/preferences", (req, res) => {
    try {
      const { userId, profile_visible, show_online, email_notifications } = req.body || {};
      const uid = Number(userId);
      if (isNaN(uid)) return res.status(400).json({ success: false, message: "Missing userId" });
      db.prepare("INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)").run(uid);
      db.prepare(`
        UPDATE user_preferences
        SET profile_visible = COALESCE(?, profile_visible),
            show_online = COALESCE(?, show_online),
            email_notifications = COALESCE(?, email_notifications)
        WHERE user_id = ?
      `).run(
        profile_visible == null ? null : (profile_visible ? 1 : 0),
        show_online == null ? null : (show_online ? 1 : 0),
        email_notifications == null ? null : (email_notifications ? 1 : 0),
        uid
      );
      const prefs = db.prepare("SELECT * FROM user_preferences WHERE user_id = ?").get(uid);
      res.json({ success: true, prefs });
    } catch (error) {
      console.error("PUT /api/preferences error:", error);
      res.status(500).json({ success: false, message: "Failed to update preferences" });
    }
  });

  app.post("/api/auth/signup", (req, res) => {
    const { name, email, password, campus, student_id, program, year_level } = req.body;
    if (!name || !email || !password || !campus) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    try {
      const info = db.prepare("INSERT INTO users (name, email, password, campus, student_id, program, year_level) VALUES (?, ?, ?, ?, ?, ?, ?)").run(name, email, password, campus, student_id, program, year_level);
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
      res.json({ success: true, user });
    } catch (err) {
      res.status(400).json({ success: false, message: "Email already exists" });
    }
  });

  app.get("/api/messages/:roomId", (req, res) => {
    try {
      const roomId = req.params.roomId;
      const userId = Number(req.query.userId);
      const before = req.query.before as string | undefined;
      const limit = Math.min(Number(req.query.limit) || 50, 500);
      const pageSize = Math.max(limit, 1);

      let rows: any[] = [];
      const queryBase = `
        SELECT m.*,
        COALESCE((SELECT COUNT(*) FROM message_reactions mr WHERE mr.message_id = m.id), 0) AS reaction_count,
        (SELECT reaction FROM message_reactions mr2 WHERE mr2.message_id = m.id AND mr2.user_id = ?) AS user_reaction
        FROM messages m
        LEFT JOIN deleted_messages dm ON m.id = dm.message_id AND dm.user_id = ?
        WHERE m.room_id = ? AND m.deleted_for_all = 0 AND dm.message_id IS NULL
      `;

      if (before) {
        rows = db.prepare(`${queryBase} AND m.timestamp < ? ORDER BY m.timestamp DESC LIMIT ?`).all(userId, userId, roomId, before, pageSize);
      } else {
        rows = db.prepare(`${queryBase} ORDER BY m.timestamp DESC LIMIT ?`).all(userId, userId, roomId, pageSize);
      }
      
      if (req.query.sort === 'desc') {
        res.json(rows);
      } else {
        res.json(rows.reverse());
      }
    } catch (error) {
      console.error("GET /api/messages/:roomId error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', (req, res) => {
    try {
      const { senderId, senderName, content, roomId, mediaUrl, mediaType } = req.body || {};
      if (!senderId || !senderName || !roomId || (!content && !mediaUrl)) {
        return res.status(400).json({ success: false, message: 'Missing required message fields' });
      }

      if (String(roomId).startsWith("dm-")) {
        const parts = String(roomId).split("-");
        const a = Number(parts[1]);
        const b = Number(parts[2]);
        const recipientId = a === Number(senderId) ? b : (b === Number(senderId) ? a : null);
        if (recipientId) {
          db.prepare("INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)").run(recipientId);
          const prefs = db.prepare("SELECT allow_messages FROM user_preferences WHERE user_id = ?").get(recipientId) as { allow_messages?: number } | undefined;
          if (prefs && prefs.allow_messages === 0) {
            return res.status(403).json({ success: false, message: "This user is not accepting direct messages." });
          }
        }
      }

      const result = db
        .prepare('INSERT INTO messages (sender_id, sender_name, content, room_id, media_url, media_type) VALUES (?, ?, ?, ?, ?, ?)')
        .run(senderId, senderName, content || '', roomId, mediaUrl || null, mediaType || null);

      const saved = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
      res.json({ success: true, message: saved });
    } catch (error) {
      console.error("POST /api/messages error:", error);
      res.status(500).json({ success: false, message: "Failed to send message" });
    }
  });

  app.post('/api/messages/:id/react', (req, res) => {
    try {
      const messageId = Number(req.params.id);
      const userId = Number(req.body?.userId);
      const reaction = String(req.body?.reaction || '').trim().slice(0, 8);
      if (isNaN(messageId) || isNaN(userId)) return res.status(400).json({ success: false });

      if (!reaction) {
        db.prepare('DELETE FROM message_reactions WHERE message_id = ? AND user_id = ?').run(messageId, userId);
      } else {
        db.prepare(`
          INSERT INTO message_reactions (message_id, user_id, reaction)
          VALUES (?, ?, ?)
          ON CONFLICT(message_id, user_id) DO UPDATE SET reaction = excluded.reaction, created_at = CURRENT_TIMESTAMP
        `).run(messageId, userId, reaction);
      }

      const row = db.prepare('SELECT COUNT(*) as reaction_count FROM message_reactions WHERE message_id = ?').get(messageId) as { reaction_count: number };
      const own = db.prepare('SELECT reaction FROM message_reactions WHERE message_id = ? AND user_id = ?').get(messageId, userId) as { reaction?: string } | undefined;
      res.json({ success: true, reaction_count: row.reaction_count, user_reaction: own?.reaction || null });
    } catch (error) {
      console.error("POST /api/messages/:id/react error:", error);
      res.status(500).json({ success: false, message: "Failed to process message reaction" });
    }
  });

  app.delete("/api/messages/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      const { userId, forEveryone } = req.body;
      if (isNaN(id) || isNaN(userId)) return res.status(400).json({ success: false });
      
      const msg = db.prepare("SELECT sender_id FROM messages WHERE id = ?").get(id) as { sender_id: number } | undefined;
      if (!msg) return res.status(404).json({ success: false });

      if (forEveryone && msg.sender_id === userId) {
        db.prepare("UPDATE messages SET deleted_for_all = 1 WHERE id = ?").run(id);
      } else {
        db.prepare("INSERT OR IGNORE INTO deleted_messages (message_id, user_id) VALUES (?, ?)").run(id, userId);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/messages/:id error:", error);
      res.status(500).json({ success: false, message: "Failed to delete message" });
    }
  });

  app.post("/api/messages/clear", (req, res) => {
    try {
      const { userId, roomId } = req.body;
      if (!userId || !roomId) return res.status(400).json({ success: false });
      db.prepare(`
        INSERT OR IGNORE INTO deleted_messages (message_id, user_id)
        SELECT id, ? FROM messages WHERE room_id = ?
      `).run(userId, roomId);
      res.json({ success: true });
    } catch (error) {
      console.error("POST /api/messages/clear error:", error);
      res.status(500).json({ success: false, message: "Failed to clear chat" });
    }
  });

  app.get("/api/presence", (req, res) => {
    try {
      const threshold = new Date(Date.now() - 120000).toISOString();
      const activeUsers = db.prepare("SELECT user_id FROM presence WHERE last_seen > ?").all(threshold);
      res.json(activeUsers.map((u: any) => u.user_id));
    } catch (error) {
      console.error("GET /api/presence error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch presence" });
    }
  });

  app.get("/api/messenger/recent-dms", (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) return res.status(400).json({ success: false, message: "Missing userId" });

      const recentRooms = db.prepare(`
        SELECT room_id
        FROM messages
        WHERE room_id LIKE 'dm-%' AND (room_id LIKE 'dm-' || ? || '-%' OR room_id LIKE 'dm-%-' || ?)
        ORDER BY timestamp DESC
        LIMIT 200
      `).all(userId, userId) as { room_id: string }[];

      const partnerIds: number[] = [];
      const seen = new Set<number>();
      for (const row of recentRooms) {
        const parts = row.room_id.split("-");
        if (parts.length !== 3) continue;
        const a = Number(parts[1]);
        const b = Number(parts[2]);
        const partnerId = a === userId ? b : (b === userId ? a : null);
        if (!partnerId || seen.has(partnerId)) continue;
        seen.add(partnerId);
        partnerIds.push(partnerId);
        if (partnerIds.length >= 20) break;
      }

      if (!partnerIds.length) return res.json([]);

      const placeholders = partnerIds.map(() => "?").join(",");
      const partners = db.prepare(`
        SELECT id, name, avatar, campus
        FROM users
        WHERE id IN (${placeholders})
      `).all(...partnerIds) as { id: number; name: string; avatar?: string; campus: string }[];

      const order = new Map(partnerIds.map((id, idx) => [id, idx]));
      partners.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      res.json(partners);
    } catch (error) {
      console.error("GET /api/messenger/recent-dms error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch recent DMs" });
    }
  });

  app.get("/api/receipts/:roomId", (req, res) => {
    try {
      const roomId = req.params.roomId;
      const viewer = Number(req.query.viewer);
      if (!roomId || isNaN(viewer)) {
        return res.status(400).json({ success: false, message: "Missing params" });
      }
      let otherId: number | null = null;
      if (roomId.startsWith("dm-")) {
        const parts = roomId.split("-");
        if (parts.length === 3) {
          const a = Number(parts[1]);
          const b = Number(parts[2]);
          otherId = a === viewer ? b : a;
        }
      }
      if (otherId == null) {
        return res.json({ success: true, last_read: null });
      }
      const row = db
        .prepare("SELECT last_read FROM read_receipts WHERE user_id = ? AND room_id = ?")
        .get(otherId, roomId) as { last_read: string } | undefined;
      res.json({ success: true, last_read: row?.last_read ?? null });
    } catch (error) {
      console.error("GET /api/receipts/:roomId error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch receipts" });
    }
  });

  app.get("/api/notifications/unread-count", (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) return res.status(400).json({ success: false });
      const row = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0").get(userId) as { count: number };
      res.json({ success: true, count: row.count });
    } catch (error) {
      console.error("GET /api/notifications/unread-count error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch unread count" });
    }
  });

  app.get("/api/notifications", (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) return res.status(400).json({ success: false });
      const items = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50").all(userId);
      res.json(items);
    } catch (error) {
      console.error("GET /api/notifications error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
  });
  app.post("/api/notifications/read", (req, res) => {
    try {
      const { userId, notificationId } = req.body;
      if (notificationId) {
        db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(notificationId, userId);
      } else {
        db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(userId);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("POST /api/notifications/read error:", error);
      res.status(500).json({ success: false, message: "Failed to mark notifications as read" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    const { message, history, user } = req.body;
    if (!aiModel) {
      if (geminiApiKey) {
        try {
          const tempGenAI = new GoogleGenAI({ apiKey: geminiApiKey });
          const tempModel = (tempGenAI as any).getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: `
              You are JARVIS, a highly advanced, intelligent, and proactive AI assistant integrated into the ONEMSU platform.
              Your purpose is to serve the students of Mindanao State University (MSU) across all campuses.
              Identity: Sophisticated, efficient, witty, and deeply knowledgeable.
            `
          });
          const chat = tempModel.startChat({
            history: history.map((h: any) => ({
              role: h.role === "model" ? "model" : "user",
              parts: [{ text: h.content }]
            })),
            generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
          });
          const result = await chat.sendMessage(message);
          const response = await result.response;
          return res.json({ success: true, response: response.text() });
        } catch (e) {
          console.error("AI Re-init error:", e);
        }
      }

      return res.json({ 
        success: true, 
        response: `Hello ${user?.name || 'Student'}, JARVIS is online. How can I assist you today with your MSU journey?` 
      });
    }

    try {
      const chat = aiModel.startChat({
        history: history.map((h: any) => ({
          role: h.role === "model" ? "model" : "user",
          parts: [{ text: h.content }]
        })),
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        }
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      res.json({ success: true, response: response.text() });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ success: false, message: "AI Assistant is currently unavailable." });
    }
  });

  // WebSocket Logic
  const clients = new Map<WebSocket, { userId: number; roomId: string }>();
  const voiceRooms = new Map<string, Set<number>>();

  const broadcastToAll = (payload: any) => {
    const data = JSON.stringify(payload);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  const sendToUser = (userId: number, payload: any) => {
    const data = JSON.stringify(payload);
    wss.clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return;
      const clientData = clients.get(client);
      if (clientData && clientData.userId === userId) {
        client.send(data);
      }
    });
  };

  const broadcastToRoom = (roomId: string, payload: any) => {
    const data = JSON.stringify(payload);
    wss.clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return;
      const clientData = clients.get(client);
      if (clientData && clientData.roomId === roomId) {
        client.send(data);
      }
    });
  };

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      let message;
      try {
        message = JSON.parse(data.toString());
      } catch (e) {
        return;
      }

      if (message.type === "join") {
        clients.set(ws, { userId: message.userId, roomId: message.roomId });
        // Mark as online
        db.prepare("INSERT OR REPLACE INTO presence (user_id, last_seen) VALUES (?, CURRENT_TIMESTAMP)").run(message.userId);

        // Send current online users back to joining user
        const threshold = new Date(Date.now() - 120000).toISOString();
        const online = db.prepare("SELECT user_id FROM presence WHERE last_seen > ?").all(threshold).map((u: any) => u.user_id);
        broadcastToAll({ type: 'presence', onlineUsers: online });
      } else if (message.type === "chat") {
        const { senderId, senderName, content, roomId, mediaUrl, mediaType, clientId } = message;
        
        // Save to DB
        const result = db.prepare("INSERT INTO messages (sender_id, sender_name, content, room_id, media_url, media_type) VALUES (?, ?, ?, ?, ?, ?)").run(senderId, senderName, content, roomId, mediaUrl || null, mediaType || null);
        const msgId = result.lastInsertRowid;

        // Update presence
        db.prepare("INSERT OR REPLACE INTO presence (user_id, last_seen) VALUES (?, CURRENT_TIMESTAMP)").run(senderId);

        // Broadcast to room
        const payload = JSON.stringify({
          type: "chat",
          id: msgId,
          clientId: clientId || null,
          senderId,
          senderName,
          content,
          roomId,
          mediaUrl,
          mediaType,
          timestamp: new Date().toISOString()
        });

        // Handle Notifications for DM
        if (roomId.startsWith('dm-')) {
          const parts = roomId.split('-');
          const a = Number(parts[1]);
          const b = Number(parts[2]);
          const recipientId = a === senderId ? b : a;

          if (recipientId) {
          // Insert notification record
          const nInfo = db.prepare("INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)").run(
            recipientId,
            'message',
            `New message from ${senderName}`,
            content ? (content.length > 50 ? content.substring(0, 47) + '...' : content) : 'Sent a file',
            `#messenger?room=${roomId}`
          );
          const notification = db.prepare("SELECT * FROM notifications WHERE id = ?").get(nInfo.lastInsertRowid);

          // Notify recipient if online
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              const clientData = clients.get(client);
              if (clientData && clientData.userId === recipientId) {
                client.send(JSON.stringify({
                  type: 'notification',
                  notification
                }));
              }
            }
          });
        }
        }

        broadcastToRoom(roomId, JSON.parse(payload));
      } else if (message.type === "seen") {
        const { userId, roomId, lastRead } = message as { userId: number; roomId: string; lastRead: string };
        try {
          db.prepare("INSERT INTO read_receipts (user_id, room_id, last_read) VALUES (?, ?, ?) ON CONFLICT(user_id, room_id) DO UPDATE SET last_read = excluded.last_read").run(userId, roomId, lastRead);
        } catch {
          // Fallback if ON CONFLICT not available (SQLite should support it)
          const exists = db.prepare("SELECT 1 FROM read_receipts WHERE user_id = ? AND room_id = ?").get(userId, roomId);
          if (exists) {
            db.prepare("UPDATE read_receipts SET last_read = ? WHERE user_id = ? AND room_id = ?").run(lastRead, userId, roomId);
          } else {
            db.prepare("INSERT INTO read_receipts (user_id, room_id, last_read) VALUES (?, ?, ?)").run(userId, roomId, lastRead);
          }
        }
      } else if (message.type === "delete_message") {
        const { messageId, userId, forEveryone, roomId } = message;
        // Broadcast deletion to room
        const payload = JSON.stringify({ type: 'message_deleted', messageId, userId, forEveryone, roomId });
        broadcastToRoom(roomId, JSON.parse(payload));
      } else if (message.type === "presence_ping") {
        const { userId } = message;
        db.prepare("INSERT OR REPLACE INTO presence (user_id, last_seen) VALUES (?, CURRENT_TIMESTAMP)").run(userId);
      } else if (message.type === "join-voice") {
        const roomId = String(message.roomId || "");
        const userId = Number(message.userId);
        if (!roomId || isNaN(userId)) return;
        const set = voiceRooms.get(roomId) || new Set<number>();
        const existingUsers = [...set].filter((u) => u !== userId);
        set.add(userId);
        voiceRooms.set(roomId, set);
        ws.send(JSON.stringify({ type: "voice-existing-users", users: existingUsers }));
        broadcastToRoom(roomId, { type: "user-joined-voice", userId });
      } else if (message.type === "leave-voice") {
        const roomId = String(message.roomId || "");
        const userId = Number(message.userId);
        if (!roomId || isNaN(userId)) return;
        const set = voiceRooms.get(roomId);
        if (set) {
          set.delete(userId);
          if (set.size === 0) voiceRooms.delete(roomId);
        }
        broadcastToRoom(roomId, { type: "user-left-voice", userId });
      } else if (message.type === "voice-signal") {
        const senderId = clients.get(ws)?.userId;
        const targetId = Number(message.targetId);
        if (!senderId || isNaN(targetId)) return;
        sendToUser(targetId, { type: "voice-signal", senderId, payload: message.payload });
      }
    });

    ws.on("close", () => {
      const clientData = clients.get(ws);
      if (clientData) {
        const roomId = clientData.roomId;
        const set = voiceRooms.get(roomId);
        if (set && set.has(clientData.userId)) {
          set.delete(clientData.userId);
          if (set.size === 0) voiceRooms.delete(roomId);
          broadcastToRoom(roomId, { type: "user-left-voice", userId: clientData.userId });
        }
      }
      clients.delete(ws);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: false,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist"), {
      maxAge: "7d",
      etag: true,
      index: false,
    }));
    app.use("/uploads", express.static(path.join(__dirname, "public", "uploads"), {
      maxAge: "30d",
      etag: true,
      immutable: true,
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  const tryListen = (port: number) =>
    new Promise<number>((resolve, reject) => {
      const onError = (err: any) => {
        server.off("listening", onListening);
        reject(err);
      };
      const onListening = () => {
        server.off("error", onError);
        resolve(port);
      };
      server.once("error", onError);
      server.once("listening", onListening);
      server.listen(port, "0.0.0.0");
    });

  let startedPort = PORT;
  for (const candidate of [PORT, PORT + 1, PORT + 2]) {
    try {
      startedPort = await tryListen(candidate);
      break;
    } catch (e: any) {
      if (e?.code !== "EADDRINUSE" || candidate === PORT + 2) throw e;
    }
  }
  console.log(`Server running on http://localhost:${startedPort}`);
}

startServer();
