CREATE TABLE alerts (
      id INT PRIMARY KEY AUTO_INCREMENT AUTO_INCREMENT,
      _time LONGTEXT NOT NULL,
      search_name LONGTEXT NOT NULL,
      _serial LONGTEXT NOT NULL UNIQUE,
      severity LONGTEXT NOT NULL,
      status LONGTEXT NOT NULL,
      trigger_time INTEGER NOT NULL,
      assigned_to LONGTEXT,
      splunk_link LONGTEXT,
      updated_at LONGTEXT DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE chat_rooms (
      id INT PRIMARY KEY AUTO_INCREMENT AUTO_INCREMENT,
      alert_serial LONGTEXT NOT NULL UNIQUE,
      created_at LONGTEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (alert_serial) REFERENCES alerts(_serial)
    );

CREATE TABLE chat_messages (
      id INT PRIMARY KEY AUTO_INCREMENT AUTO_INCREMENT,
      room_id INTEGER NOT NULL,
      sender LONGTEXT NOT NULL,
      message LONGTEXT NOT NULL,
      created_at LONGTEXT DEFAULT CURRENT_TIMESTAMP,
      mentions LONGTEXT,  -- JSON array of mentioned users
      FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
    );

CREATE TABLE chat_attachments (
      id INT PRIMARY KEY AUTO_INCREMENT AUTO_INCREMENT,
      message_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      filename LONGTEXT NOT NULL,
      filepath LONGTEXT NOT NULL,
      content_type LONGTEXT,
      size INTEGER,
      created_at LONGTEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES chat_messages(id),
      FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
    );

CREATE TABLE team_members (
      id INT PRIMARY KEY AUTO_INCREMENT AUTO_INCREMENT,
      name LONGTEXT NOT NULL UNIQUE,
      email LONGTEXT NOT NULL UNIQUE
    );

