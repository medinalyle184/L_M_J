import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';
import sensorService from '../services/sensorService';
import { sendNotification } from '../services/notificationService';

// Helper function to format readings for chart
const formatReadingsForChart = (readings) => {
  return readings.map(reading => ({
    ...reading,
    timestamp: reading.timestamp ? new Date(reading.timestamp) : new Date(),
    temperature: parseFloat(reading.temperature) || 0,
    humidity: parseFloat(reading.humidity) || 0,
    air_quality: reading.air_quality ? parseFloat(reading.air_quality) : 0,
  }));
};

export const useSensorData = (roomId) => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadReadings = useCallback((limit = 100) => {
    if (!roomId) return;

    setLoading(true);
    setError(null);
    
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM readings 
         WHERE room_id = ? 
         ORDER BY timestamp DESC 
         LIMIT ?`,
        [roomId, limit],
        (_, { rows: { _array } }) => {
          const formattedReadings = formatReadingsForChart(_array);
          setReadings(formattedReadings);
          setLoading(false);
        },
        (_, error) => {
          setError(error);
          setLoading(false);
          return false;
        }
      );
    });
  }, [roomId]);

  const refreshSensorData = useCallback(async () => {
    if (!roomId) return;

    setRefreshing(true);
    setError(null);

    try {
      // Get room details first
      const room = await new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `SELECT r.*, t.* FROM rooms r 
             LEFT JOIN thresholds t ON r.id = t.room_id 
             WHERE r.id = ?`,
            [roomId],
            (_, { rows: { _array } }) => {
              if (_array.length > 0) {
                resolve(_array[0]);
              } else {
                reject(new Error('Room not found'));
              }
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });

      // Fetch data from sensor
      const sensorData = await sensorService.fetchSensorData(room);
      
      // Save reading to database
      await new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO readings (room_id, temperature, humidity, air_quality) VALUES (?, ?, ?, ?)',
            [roomId, sensorData.temperature, sensorData.humidity, sensorData.air_quality || null],
            (_, result) => {
              resolve(result);
              loadReadings(); // Refresh readings list
              checkThresholds(room, sensorData); // Check for alerts
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, [roomId, loadReadings]);

  const checkThresholds = useCallback(async (room, data) => {
    if (!room.notifications_enabled) return;

    const alerts = [];
    
    // Check temperature thresholds
    if (data.temperature < room.min_temp) {
      alerts.push({
        type: 'temperature_low',
        message: `Temperature too low in ${room.name} (${data.temperature.toFixed(1)}°C)`,
        value: data.temperature,
        threshold: room.min_temp,
      });
    } else if (data.temperature > room.max_temp) {
      alerts.push({
        type: 'temperature_high',
        message: `Temperature too high in ${room.name} (${data.temperature.toFixed(1)}°C)`,
        value: data.temperature,
        threshold: room.max_temp,
      });
    }

    // Check humidity thresholds
    if (data.humidity < room.min_humidity) {
      alerts.push({
        type: 'humidity_low',
        message: `Humidity too low in ${room.name} (${data.humidity.toFixed(1)}%)`,
        value: data.humidity,
        threshold: room.min_humidity,
      });
    } else if (data.humidity > room.max_humidity) {
      alerts.push({
        type: 'humidity_high',
        message: `Humidity too high in ${room.name} (${data.humidity.toFixed(1)}%)`,
        value: data.humidity,
        threshold: room.max_humidity,
      });
    }

    // Check air quality threshold
    if (data.air_quality && data.air_quality > room.max_aqi) {
      alerts.push({
        type: 'air_quality_high',
        message: `Air quality poor in ${room.name} (AQI: ${data.air_quality.toFixed(0)})`,
        value: data.air_quality,
        threshold: room.max_aqi,
      });
    }

    // Create alerts and send notifications
    for (const alert of alerts) {
      await createAlert(room.id, alert);
      await sendNotification('Comfort Alert', alert.message, { 
        roomId: room.id,
        alertType: alert.type 
      });
    }
  }, []);

  const createAlert = useCallback(async (roomId, alert) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO alerts (room_id, type, message, value, threshold) VALUES (?, ?, ?, ?, ?)',
          [roomId, alert.type, alert.message, alert.value, alert.threshold],
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }, []);

  const getReadingsByTimeRange = useCallback((hours = 24) => {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    return readings.filter(reading => 
      reading.timestamp && new Date(reading.timestamp) >= cutoffTime
    );
  }, [readings]);

  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  return {
    readings,
    loading,
    error,
    refreshing,
    refreshReadings: loadReadings,
    refreshSensorData,
    getReadingsByTimeRange,
  };
};

export const useAllSensorsData = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState({});
  const { rooms, refreshRooms } = useRooms();

  const refreshAllSensors = useCallback(async () => {
    setRefreshing(true);
    setProgress({});

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      setProgress(prev => ({
        ...prev,
        [room.id]: { status: 'refreshing', room: room.name }
      }));

      try {
        const sensorData = await sensorService.fetchSensorData(room);
        
        await new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'INSERT INTO readings (room_id, temperature, humidity, air_quality) VALUES (?, ?, ?, ?)',
              [room.id, sensorData.temperature, sensorData.humidity, sensorData.air_quality || null],
              (_, result) => {
                resolve(result);
                setProgress(prev => ({
                  ...prev,
                  [room.id]: { status: 'success', room: room.name }
                }));
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          });
        });
      } catch (error) {
        setProgress(prev => ({
          ...prev,
          [room.id]: { status: 'error', room: room.name, error: error.message }
        }));
      }
    }

    setRefreshing(false);
    refreshRooms();
  }, [rooms, refreshRooms]);

  return {
    refreshing,
    progress,
    refreshAllSensors,
  };
};