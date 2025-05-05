import Database from 'better-sqlite3';

const db = new Database('alerts.db');

// Initialize database
export function initDb() {
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
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_serial TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (alert_serial) REFERENCES alerts(_serial)
    );
    
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      mentions TEXT,  -- JSON array of mentioned users
      FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
    );
    
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE
    );
    
    CREATE INDEX IF NOT EXISTS idx_serial ON alerts (_serial);
    CREATE INDEX IF NOT EXISTS idx_chat_room_alert ON chat_rooms (alert_serial);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages (room_id);
  `);
}

export function alertExists(serial: string): boolean {
  const stmt = db.prepare('SELECT 1 FROM alerts WHERE _serial = ?');
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

export function updateAlertStatus(serial: string, status: string, assignedTo: string) {
  console.log("Assigned to : ", assignedTo)
  const stmt = db.prepare(`
    UPDATE alerts 
    SET status = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
    WHERE _serial = ?
  `);
  stmt.run(status, assignedTo, serial);
}

export function getAlerts() {
  const stmt = db.prepare('SELECT * FROM alerts ORDER BY trigger_time DESC');
  return stmt.all();
}

// Chat room functions
export function getOrCreateChatRoom(alertSerial: string) {
  // Try to get existing room first
  let stmt = db.prepare('SELECT id FROM chat_rooms WHERE alert_serial = ?');
  let room = stmt.get(alertSerial);
  
  if (!room) {
    stmt = db.prepare('INSERT INTO chat_rooms (alert_serial) VALUES (?)');
    const info = stmt.run(alertSerial);
    return { id: info.lastInsertRowid };
  }
  
  return room;
}

export function addChatMessage(roomId: number, sender: string, message: string, mentions: string[] = []) {
  const stmt = db.prepare(`
    INSERT INTO chat_messages (room_id, sender, message, mentions)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(roomId, sender, message, JSON.stringify(mentions));
}

export function getChatMessages(roomId: number) {
  const stmt = db.prepare(`
    SELECT * FROM chat_messages 
    WHERE room_id = ?
    ORDER BY created_at ASC
  `);
  return stmt.all(roomId);
}

export function getTeamMembers() {
  const stmt = db.prepare('SELECT * FROM team_members ORDER BY name');
  return stmt.all();
}

export function addTeamMember(name: string, email: string) {
  const stmt = db.prepare('INSERT OR IGNORE INTO team_members (name, email) VALUES (?, ?)');
  stmt.run(name, email);
}

// Initialize database on startup
initDb();

// Add some sample team members if none exist
if (getTeamMembers().length === 0) {
  addTeamMember('Ahmed', 'ahmed@example.com');
  addTeamMember('Hassan', 'hassan@example.com');
  addTeamMember('Faisal Ghamdi', 'faisal@example.com');
}

export default db;