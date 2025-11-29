import db from './supabase';

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create rooms table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          sensor_type TEXT DEFAULT 'temperature',
          connection_type TEXT DEFAULT 'wifi',
          ip_address TEXT,
          mac_address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        [],
        () => console.log('Rooms table created'),
        (_, error) => {
          console.error('Error creating rooms table:', error);
          return false;
        }
      );

      // Create readings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS readings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id INTEGER,
          temperature REAL,
          humidity REAL,
          air_quality REAL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (room_id) REFERENCES rooms (id)
        )`,
        [],
        () => console.log('Readings table created'),
        (_, error) => {
          console.error('Error creating readings table:', error);
          return false;
        }
      );

      // Create thresholds table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS thresholds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id INTEGER UNIQUE,
          min_temp REAL DEFAULT 18,
          max_temp REAL DEFAULT 25,
          min_humidity REAL DEFAULT 30,
          max_humidity REAL DEFAULT 70,
          max_aqi REAL DEFAULT 50,
          notifications_enabled INTEGER DEFAULT 1,
          FOREIGN KEY (room_id) REFERENCES rooms (id)
        )`,
        [],
        () => console.log('Thresholds table created'),
        (_, error) => {
          console.error('Error creating thresholds table:', error);
          return false;
        }
      );

      // Create alerts table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id INTEGER,
          type TEXT,
          message TEXT,
          severity TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          acknowledged INTEGER DEFAULT 0,
          FOREIGN KEY (room_id) REFERENCES rooms (id)
        )`,
        [],
        () => console.log('Alerts table created'),
        (_, error) => {
          console.error('Error creating alerts table:', error);
          return false;
        }
      );

      // Insert sample data if tables are empty
      tx.executeSql(
        'SELECT COUNT(*) as count FROM rooms',
        [],
        (_, { rows: { _array } }) => {
          if (_array[0].count === 0) {
            // Insert sample rooms
            tx.executeSql(
              `INSERT INTO rooms (name, sensor_type, connection_type) VALUES (?, ?, ?)`,
              ['Living Room', 'temperature', 'wifi'],
              () => {
                tx.executeSql(
                  `INSERT INTO thresholds (room_id) VALUES (?)`,
                  [1],
                  () => console.log('Sample data inserted'),
                  (_, error) => console.error('Error inserting sample thresholds:', error)
                );
              },
              (_, error) => console.error('Error inserting sample room:', error)
            );

            tx.executeSql(
              `INSERT INTO rooms (name, sensor_type, connection_type) VALUES (?, ?, ?)`,
              ['Bedroom', 'temperature', 'wifi'],
              () => {
                tx.executeSql(
                  `INSERT INTO thresholds (room_id) VALUES (?)`,
                  [2],
                  () => console.log('Sample data inserted'),
                  (_, error) => console.error('Error inserting sample thresholds:', error)
                );
              },
              (_, error) => console.error('Error inserting sample room:', error)
            );

            tx.executeSql(
              `INSERT INTO rooms (name, sensor_type, connection_type) VALUES (?, ?, ?)`,
              ['Kitchen', 'temperature', 'wifi'],
              () => {
                tx.executeSql(
                  `INSERT INTO thresholds (room_id) VALUES (?)`,
                  [3],
                  () => console.log('Sample data inserted'),
                  (_, error) => console.error('Error inserting sample thresholds:', error)
                );
              },
              (_, error) => console.error('Error inserting sample room:', error)
            );
          }
        },
        (_, error) => console.error('Error checking rooms count:', error)
      );
    }, (error) => {
      console.error('Transaction error:', error);
      reject(error);
    }, () => {
      console.log('Database initialized successfully');
      resolve();
    });
  });
};

export default initDatabase;
