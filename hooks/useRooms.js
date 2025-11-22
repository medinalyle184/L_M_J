import { useState, useEffect, useCallback } from 'react';
import { getDatabase } from '../database/database';
import { calculateRoomStatus } from '../utils/helpers';

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRooms = useCallback(() => {
    setLoading(true);
    setError(null);
    
    try {
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          `SELECT r.*, 
                  rd.temperature, 
                  rd.humidity, 
                  rd.air_quality,
                  rd.timestamp as last_reading,
                  t.min_temp, 
                  t.max_temp, 
                  t.min_humidity, 
                  t.max_humidity,
                  t.max_aqi,
                  t.notifications_enabled
           FROM rooms r
           LEFT JOIN (
             SELECT room_id, temperature, humidity, air_quality, timestamp
             FROM readings
             WHERE id IN (
               SELECT MAX(id) FROM readings GROUP BY room_id
             )
           ) rd ON r.id = rd.room_id
           LEFT JOIN thresholds t ON r.id = t.room_id
           ORDER BY r.name`,
          [],
          (_, { rows: { _array } }) => {
            const roomsWithStatus = _array.map(room => ({
              ...room,
              status: calculateRoomStatus(room),
            }));
            setRooms(roomsWithStatus);
            setLoading(false);
          },
          (_, error) => {
            setError(error);
            setLoading(false);
            return false;
          }
        );
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const addRoom = useCallback(async (roomData) => {
    return new Promise((resolve, reject) => {
      try {
        const db = getDatabase();
        
        db.transaction(tx => {
          tx.executeSql(
            `INSERT INTO rooms (name, sensor_type, connection_type, ip_address, mac_address) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              roomData.name,
              roomData.sensor_type,
              roomData.connection_type,
              roomData.ip_address || null,
              roomData.mac_address || null,
            ],
            (_, result) => {
              tx.executeSql(
                `INSERT INTO thresholds (room_id) VALUES (?)`,
                [result.insertId],
                () => {
                  resolve(result);
                  loadRooms();
                },
                (_, error) => {
                  reject(error);
                  return false;
                }
              );
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      } catch (err) {
        reject(err);
      }
    });
  }, [loadRooms]);

  const deleteRoom = useCallback(async (roomId) => {
    return new Promise((resolve, reject) => {
      try {
        const db = getDatabase();
        
        db.transaction(tx => {
          tx.executeSql('DELETE FROM readings WHERE room_id = ?', [roomId]);
          tx.executeSql('DELETE FROM thresholds WHERE room_id = ?', [roomId]);
          tx.executeSql('DELETE FROM alerts WHERE room_id = ?', [roomId]);
          tx.executeSql(
            'DELETE FROM rooms WHERE id = ?',
            [roomId],
            (_, result) => {
              resolve(result);
              loadRooms();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      } catch (err) {
        reject(err);
      }
    });
  }, [loadRooms]);

  const updateRoom = useCallback(async (roomId, roomData) => {
    return new Promise((resolve, reject) => {
      try {
        const db = getDatabase();
        
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE rooms SET 
             name = ?, sensor_type = ?, connection_type = ?, 
             ip_address = ?, mac_address = ?
             WHERE id = ?`,
            [
              roomData.name,
              roomData.sensor_type,
              roomData.connection_type,
              roomData.ip_address || null,
              roomData.mac_address || null,
              roomId,
            ],
            (_, result) => {
              resolve(result);
              loadRooms();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      } catch (err) {
        reject(err);
      }
    });
  }, [loadRooms]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  return {
    rooms,
    loading,
    error,
    refreshRooms: loadRooms,
    addRoom,
    deleteRoom,
    updateRoom,
  };
};

export const useRoom = (roomId) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRoom = useCallback(() => {
    if (!roomId) return;

    setLoading(true);
    setError(null);
    
    try {
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          `SELECT r.*, t.* 
           FROM rooms r 
           LEFT JOIN thresholds t ON r.id = t.room_id 
           WHERE r.id = ?`,
          [roomId],
          (_, { rows: { _array } }) => {
            if (_array.length > 0) {
              setRoom(_array[0]);
            } else {
              setError('Room not found');
            }
            setLoading(false);
          },
          (_, error) => {
            setError(error);
            setLoading(false);
            return false;
          }
        );
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  return { room, loading, error, refreshRoom: loadRoom };
};