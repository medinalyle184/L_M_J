import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export const useAlerts = (filter = 'all') => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    unhandled: 0,
    handled: 0,
  });

  const loadAlerts = useCallback(() => {
    setLoading(true);
    setError(null);

    let query = `
      SELECT a.*, r.name as room_name 
      FROM alerts a 
      LEFT JOIN rooms r ON a.room_id = r.id
    `;
    
    const params = [];
    
    if (filter === 'unhandled') {
      query += ' WHERE a.handled = 0';
    } else if (filter === 'handled') {
      query += ' WHERE a.handled = 1';
    }
    
    query += ' ORDER BY a.timestamp DESC';

    db.transaction(tx => {
      // Load alerts
      tx.executeSql(
        query,
        params,
        (_, { rows: { _array } }) => {
          setAlerts(_array);
          setLoading(false);
        },
        (_, error) => {
          setError(error);
          setLoading(false);
          return false;
        }
      );

      // Load stats
      tx.executeSql(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN handled = 0 THEN 1 ELSE 0 END) as unhandled,
          SUM(CASE WHEN handled = 1 THEN 1 ELSE 0 END) as handled
         FROM alerts`,
        [],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            setStats(_array[0]);
          }
        }
      );
    });
  }, [filter]);

  const markAsHandled = useCallback(async (alertId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE alerts SET handled = 1 WHERE id = ?',
          [alertId],
          (_, result) => {
            resolve(result);
            loadAlerts(); // Refresh alerts list
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }, [loadAlerts]);

  const markAsUnhandled = useCallback(async (alertId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE alerts SET handled = 0 WHERE id = ?',
          [alertId],
          (_, result) => {
            resolve(result);
            loadAlerts(); // Refresh alerts list
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }, [loadAlerts]);

  const deleteAlert = useCallback(async (alertId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM alerts WHERE id = ?',
          [alertId],
          (_, result) => {
            resolve(result);
            loadAlerts(); // Refresh alerts list
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }, [loadAlerts]);

  const deleteAllHandled = useCallback(async () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM alerts WHERE handled = 1',
          [],
          (_, result) => {
            resolve(result);
            loadAlerts(); // Refresh alerts list
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }, [loadAlerts]);

  const getAlertsByRoom = useCallback((roomId) => {
    return alerts.filter(alert => alert.room_id === roomId);
  }, [alerts]);

  const getRecentAlerts = useCallback((hours = 24) => {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    return alerts.filter(alert => 
      new Date(alert.timestamp) >= cutoffTime
    );
  }, [alerts]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return {
    alerts,
    loading,
    error,
    stats,
    refreshAlerts: loadAlerts,
    markAsHandled,
    markAsUnhandled,
    deleteAlert,
    deleteAllHandled,
    getAlertsByRoom,
    getRecentAlerts,
  };
};

export const useAlertStats = () => {
  const [stats, setStats] = useState({
    byType: {},
    byRoom: {},
    today: 0,
    week: 0,
  });

  const loadStats = useCallback(() => {
    db.transaction(tx => {
      // Alerts by type
      tx.executeSql(
        `SELECT type, COUNT(*) as count 
         FROM alerts 
         WHERE handled = 0 
         GROUP BY type`,
        [],
        (_, { rows: { _array } }) => {
          const byType = {};
          _array.forEach(item => {
            byType[item.type] = item.count;
          });
          setStats(prev => ({ ...prev, byType }));
        }
      );

      // Alerts by room
      tx.executeSql(
        `SELECT r.name, COUNT(*) as count 
         FROM alerts a 
         JOIN rooms r ON a.room_id = r.id 
         WHERE a.handled = 0 
         GROUP BY r.name`,
        [],
        (_, { rows: { _array } }) => {
          const byRoom = {};
          _array.forEach(item => {
            byRoom[item.name] = item.count;
          });
          setStats(prev => ({ ...prev, byRoom }));
        }
      );

      // Today's alerts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      tx.executeSql(
        `SELECT COUNT(*) as count 
         FROM alerts 
         WHERE timestamp >= ?`,
        [today.toISOString()],
        (_, { rows: { _array } }) => {
          setStats(prev => ({ ...prev, today: _array[0]?.count || 0 }));
        }
      );

      // This week's alerts
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      tx.executeSql(
        `SELECT COUNT(*) as count 
         FROM alerts 
         WHERE timestamp >= ?`,
        [weekAgo.toISOString()],
        (_, { rows: { _array } }) => {
          setStats(prev => ({ ...prev, week: _array[0]?.count || 0 }));
        }
      );
    });
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, refreshStats: loadStats };
};