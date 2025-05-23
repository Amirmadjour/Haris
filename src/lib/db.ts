import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const DB_PATH = path.join(process.cwd(), "alerts.db");

// Initialize SQLite database
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL"); // Better performance

// Initialize database
export async function initDb() {
  try {
    // Enable foreign key constraints
    db.pragma("foreign_keys = ON");

    // Create tables with SQLite syntax
    db.exec(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        _time TEXT NOT NULL,
        search_name TEXT NOT NULL,
        _serial TEXT NOT NULL UNIQUE,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        trigger_time INTEGER NOT NULL,
        assigned_to TEXT,
        splunk_link TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alert_serial TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (alert_serial) REFERENCES alerts(_serial) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mentions TEXT,
        FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS chat_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        content_type TEXT,
        size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      );
    `);

    // Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_serial ON alerts (_serial);
      CREATE INDEX IF NOT EXISTS idx_chat_room_alert ON chat_rooms (alert_serial);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages (room_id);
      CREATE INDEX IF NOT EXISTS idx_chat_attachments_message ON chat_attachments (message_id);
    `);

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

// Chat Message Functions
export function addChatMessage(
  roomId: number,
  sender: string,
  message: string,
  mentions: string[] = []
) {
  const user = findUserByUsername(sender);
  if (!user) {
    throw new Error(`User ${sender} not found`);
  }

  const stmt = db.prepare(
    `INSERT INTO chat_messages (room_id, sender, message, mentions) VALUES (?, ?, ?, ?)`
  );
  const info = stmt.run(roomId, sender, message, JSON.stringify(mentions));
  return info.lastInsertRowid;
}

export async function saveAttachment(
  roomId: number,
  messageId: number,
  file: any
) {
  const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const filePath = path.join(UPLOAD_DIR, fileId);

  // Write file to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // Save to database
  const stmt = db.prepare(
    `INSERT INTO chat_attachments 
    (message_id, room_id, filename, filepath, content_type, size)
    VALUES (?, ?, ?, ?, ?, ?)`
  );
  stmt.run(messageId, roomId, file.name, fileId, file.type, file.size);

  return fileId;
}

export function getMessageAttachments(messageId: number) {
  const stmt = db.prepare(
    `SELECT id, filename, content_type, size 
    FROM chat_attachments 
    WHERE message_id = ?`
  );
  return stmt.all(messageId);
}

export function getAttachmentInfo(id: string) {
  const stmt = db.prepare(
    `SELECT filepath, filename, content_type 
    FROM chat_attachments 
    WHERE id = ?`
  );
  return stmt.get(id) || null;
}

// Alert Functions
export function alertExists(serial: string): boolean {
  const stmt = db.prepare(`SELECT 1 FROM alerts WHERE _serial = ?`);
  return !!stmt.get(serial);
}

export function insertAlerts(alerts: any[]) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO alerts 
    (_time, search_name, _serial, severity, status, trigger_time, splunk_link)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((alerts: any) => {
    for (const alert of alerts) {
      if (!alertExists(alert._serial)) {
        stmt.run(
          alert._time,
          alert.search_name,
          alert._serial,
          alert.severity,
          alert.status,
          alert.trigger_time,
          alert.splunk_link
        );
      }
    }
  });

  insertMany(alerts);
}

export function updateAlertStatus(
  serial: string,
  status: string,
  assignedTo: string
) {
  const stmt = db.prepare(
    `UPDATE alerts 
    SET status = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
    WHERE _serial = ?`
  );
  stmt.run(status, assignedTo, serial);
}

export function getAlerts() {
  // SQLite doesn't support ROW_NUMBER() directly in this context, so we use a different approach
  return db
    .prepare(
      `
    WITH numbered_alerts AS (
      SELECT a.*, 
             ROW_NUMBER() OVER (ORDER BY trigger_time DESC) as row_num
      FROM alerts a
    )
    SELECT *, 
           '100' || (SELECT COUNT(*) FROM alerts) - row_num + 1 as display_index
    FROM numbered_alerts
    ORDER BY trigger_time DESC
  `
    )
    .all();
}

// Chat Room Functions
export function getOrCreateChatRoom(alertSerial: string) {
  let stmt = db.prepare("SELECT id FROM chat_rooms WHERE alert_serial = ?");
  let room = stmt.get(alertSerial);

  if (!room) {
    stmt = db.prepare("INSERT INTO chat_rooms (alert_serial) VALUES (?)");
    const info = stmt.run(alertSerial);
    return { id: info.lastInsertRowid };
  }

  return room;
}

export function getChatMessages(roomId: number) {
  return db
    .prepare(
      `
    SELECT 
      cm.*, 
      u.profile_image as sender_profile_image
    FROM chat_messages cm
    LEFT JOIN users u ON cm.sender = u.username
    WHERE cm.room_id = ?
    ORDER BY cm.created_at ASC
  `
    )
    .all(roomId);
}

// Team Member Functions
export function getTeamMembers() {
  return db
    .prepare(
      `
    SELECT tm.*, u.profile_image
    FROM team_members tm
    LEFT JOIN users u ON tm.name = u.username
    ORDER BY tm.name
  `
    )
    .all();
}

export function addTeamMember(name: string, email: string) {
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO team_members (name, email) VALUES (?, ?)"
  );
  stmt.run(name, email);
}

// User Functions
export async function createUser(
  username: string,
  email: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const capitalizedName =
    username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();

  const stmt = db.prepare(
    `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`
  );
  const info = stmt.run(capitalizedName, email, hashedPassword);

  await addTeamMember(capitalizedName, email);
  return info.lastInsertRowid;
}

export function findUserByUsername(username: string) {
  const stmt = db.prepare(
    `SELECT * FROM users WHERE username COLLATE NOCASE = ?`
  );
  return stmt.get(username) || null;
}

export function updateLastLogin(userId: number) {
  const stmt = db.prepare(
    `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`
  );
  stmt.run(userId);
}

export function getTeamMemberByUsername(username: string) {
  const stmt = db.prepare("SELECT * FROM team_members WHERE name = ?");
  return stmt.get(username) || null;
}

// Initialize database on startup
initDb();

export default db;
