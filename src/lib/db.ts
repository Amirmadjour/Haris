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
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_serial ON alerts (_serial);
  `);
}

export function alertExists(serial: string): boolean {
  const stmt = db.prepare('SELECT 1 FROM alerts WHERE _serial = ?');
  return !!stmt.get(serial);
}

export function insertAlerts(alerts: any[]) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO alerts 
    (_time, search_name, _serial, severity, status, trigger_time)
    VALUES (?, ?, ?, ?, ?, ?)
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
          alert.trigger_time
        );
      }
    }
  });

  insertMany(alerts);
}

export function updateAlertStatus(serial: string, status: string, assignedTo: string) {
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

// Initialize database on startup
initDb();

export default db;