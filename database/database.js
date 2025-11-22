import { openDatabaseAsync } from 'expo-sqlite';

let db;

export const initDatabase = async () => {
  db = await openDatabaseAsync('temperature_tracker.db');
};

export default db;