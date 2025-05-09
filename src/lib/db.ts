import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// MySQL connection configuration using your cPanel details
const pool = mysql.createPool({
  host: 'madjria.com',
  user: 'madjri81_amir_haris',
  password: 'p)c9BsL\'cTW"4Su',
  database: 'madjri81_haris',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
   // Add these additional options:
  port: 3306, // Default MySQL port
  connectTimeout: 10000, // 10 seconds timeout
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Initialize database
export async function initDb() {
  const connection = await pool.getConnection();
  try {
    // Create tables with MySQL syntax
    await connection.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        _time TEXT NOT NULL,
        search_name TEXT NOT NULL,
        _serial VARCHAR(255) NOT NULL UNIQUE,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        trigger_time BIGINT NOT NULL,
        assigned_to TEXT,
        splunk_link TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alert_serial VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_alert_serial FOREIGN KEY (alert_serial) 
        REFERENCES alerts(_serial) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mentions TEXT,
        CONSTRAINT fk_room_id FOREIGN KEY (room_id) 
        REFERENCES chat_rooms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS chat_attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message_id INT NOT NULL,
        room_id INT NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        content_type TEXT,
        size INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_message_id FOREIGN KEY (message_id) 
        REFERENCES chat_messages(id) ON DELETE CASCADE,
        CONSTRAINT fk_room_id_attachments FOREIGN KEY (room_id) 
        REFERENCES chat_rooms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `);

    // Create indexes
    await connection.query('CREATE INDEX idx_serial ON alerts (_serial)');
    await connection.query('CREATE INDEX idx_chat_room_alert ON chat_rooms (alert_serial)');
    await connection.query('CREATE INDEX idx_chat_messages_room ON chat_messages (room_id)');
    await connection.query('CREATE INDEX idx_chat_attachments_message ON chat_attachments (message_id)');

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  } finally {
    connection.release();
  }
}

export async function addChatMessage(roomId: number, sender: string, message: string, mentions: string[] = []) {
  const [result]: any = await pool.query(
    `INSERT INTO chat_messages (room_id, sender, message, mentions) VALUES (?, ?, ?, ?)`,
    [roomId, sender, message, JSON.stringify(mentions)]
  );
  return result.insertId;
}

export async function saveAttachment(roomId: number, messageId: number, file: any) {
  const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const filePath = path.join(UPLOAD_DIR, fileId);
  
  // Write file to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // Save to database
  await pool.query(
    `INSERT INTO chat_attachments 
    (message_id, room_id, filename, filepath, content_type, size)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [messageId, roomId, file.name, filePath, file.type, file.size]
  );

  return fileId;
}

export async function getMessageAttachments(messageId: number) {
  const [rows] = await pool.query(
    `SELECT id, filename, content_type, size 
    FROM chat_attachments 
    WHERE message_id = ?`,
    [messageId]
  );
  return rows;
}

export async function getAttachmentInfo(id: string) {
  const [rows]: any = await pool.query(
    `SELECT filepath, filename, content_type 
    FROM chat_attachments 
    WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function alertExists(serial: string): Promise<boolean> {
  const [rows]: any = await pool.query(
    `SELECT 1 FROM alerts WHERE _serial = ?`,
    [serial]
  );
  return rows.length > 0;
}

export async function insertAlerts(alerts: any[]) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const alert of alerts) {
      if (!(await alertExists(alert._serial))) {
        await connection.query(
          `INSERT IGNORE INTO alerts 
          (_time, search_name, _serial, severity, status, trigger_time, splunk_link)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            alert._time,
            alert.search_name,
            alert._serial,
            alert.severity,
            alert.status,
            alert.trigger_time,
            alert.splunk_link
          ]
        );
      }
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateAlertStatus(serial: string, status: string, assignedTo: string) {
  console.log("Assigned to : ", assignedTo);
  await pool.query(
    `UPDATE alerts 
    SET status = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
    WHERE _serial = ?`,
    [status, assignedTo, serial]
  );
}

export async function getAlerts() {
  const [rows] = await pool.query('SELECT * FROM alerts ORDER BY trigger_time DESC');
  return rows;
}

export async function getOrCreateChatRoom(alertSerial: string) {
  const [rows]: any = await pool.query(
    'SELECT id FROM chat_rooms WHERE alert_serial = ?',
    [alertSerial]
  );
  
  if (rows.length === 0) {
    const [result]: any = await pool.query(
      'INSERT INTO chat_rooms (alert_serial) VALUES (?)',
      [alertSerial]
    );
    return { id: result.insertId };
  }
  
  return rows[0];
}

export async function getChatMessages(roomId: number) {
  const [rows] = await pool.query(
    `SELECT * FROM chat_messages 
    WHERE room_id = ?
    ORDER BY created_at ASC`,
    [roomId]
  );
  return rows;
}

export async function getTeamMembers() {
  const [rows] = await pool.query('SELECT * FROM team_members ORDER BY name');
  return rows;
}

export async function addTeamMember(name: string, email: string) {
  await pool.query(
    'INSERT IGNORE INTO team_members (name, email) VALUES (?, ?)',
    [name, email]
  );
}

// Initialize database on startup
(async () => {
  try {
    await initDb();
    const members: any = await getTeamMembers();
    if (members.length === 0) {
      await addTeamMember('Ahmed', 'ahmed@example.com');
      await addTeamMember('Hassan', 'hassan@example.com');
      await addTeamMember('Faisal Ghamdi', 'faisal@example.com');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
})();

export default pool;