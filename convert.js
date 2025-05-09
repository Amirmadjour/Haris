// migrate-to-mysql.js
const Database = require('better-sqlite3');
const fs = require('fs');

// Connect to SQLite database
const sqliteDb = new Database('alerts.db');

// Get all table names
const tables = sqliteDb
  .prepare("SELECT name FROM sqlite_master WHERE type='table'")
  .all()
  .map(t => t.name)
  .filter(name => name !== 'sqlite_sequence');

// Generate MySQL compatible SQL
let mysqlSchema = '';
let mysqlData = '';

tables.forEach(table => {
  // Schema creation
  const createTable = sqliteDb
    .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`)
    .get(table).sql;
  
  // Convert to MySQL syntax
  const mysqlCreate = createTable
    .replace(/AUTOINCREMENT/g, 'AUTO_INCREMENT')
    .replace(/INTEGER PRIMARY KEY/g, 'INT PRIMARY KEY AUTO_INCREMENT')
    .replace(/TEXT/g, 'LONGTEXT')
    .replace(/BLOB/g, 'LONGBLOB')
    .replace(/`/g, '`')  // Keep backticks for MySQL
    .replace(/\"([^\"]+)\"/g, '`$1`');  // Convert quotes to backticks

  mysqlSchema += `${mysqlCreate};\n\n`;

  // Data insertion
  const rows = sqliteDb.prepare(`SELECT * FROM ${table}`).all();
  if (rows.length > 0) {
    mysqlData += `-- Data for ${table}\n`;
    mysqlData += `INSERT INTO \`${table}\` VALUES\n`;
    
    const values = rows.map(row => {
      const vals = Object.values(row).map(v => {
        if (v === null) return 'NULL';
        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
        return v;
      });
      return `  (${vals.join(', ')})`;
    }).join(',\n');
    
    mysqlData += `${values};\n\n`;
  }
});

// Write to files
fs.writeFileSync('mysql-schema.sql', mysqlSchema);
fs.writeFileSync('mysql-data.sql', mysqlData);

console.log('Migration files created: mysql-schema.sql and mysql-data.sql');