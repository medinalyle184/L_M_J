import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AlertsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');

  const mockAlerts = [
    {
      id: 1,
      room_id: 1,
      room_name: 'Living Room',
      message: 'Temperature too high (28.3°C)',
      type: 'temperature_high',
      value: 28.3,
      threshold: 26,
      handled: false,
      timestamp: new Date(),
    },
    {
      id: 2,
      room_id: 2,
      room_name: 'Bedroom',
      message: 'Humidity too high (65%)',
      type: 'humidity_high', 
      value: 65,
      threshold: 60,
      handled: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 3,
      room_id: 3,
      room_name: 'Kitchen',
      message: 'Temperature too low (16.2°C)',
      type: 'temperature_low',
      value: 16.2,
      threshold: 18,
      handled: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
  ];

  useEffect(() => {
    const loadAlerts = () => {
      let filteredAlerts = mockAlerts;
      if (filter === 'unhandled') {
        filteredAlerts = mockAlerts.filter(alert => !alert.handled);
      } else if (filter === 'handled') {
        filteredAlerts = mockAlerts.filter(alert => alert.handled);
      }
      setAlerts(filteredAlerts);
    };
    loadAlerts();
  }, [filter]);

  const markAsHandled = (alertId) => {
    Alert.alert(
      "Mark as Handled",
      "Are you sure you want to mark this alert as handled?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Mark Handled", 
          onPress: () => {
            const updatedAlerts = alerts.map(alert => 
              alert.id === alertId ? { ...alert, handled: true } : alert
            );
            setAlerts(updatedAlerts);
          }
        }
      ]
    );
  };

  const deleteAlert = (alertId) => {
    Alert.alert(
      "Delete Alert",
      "Are you sure you want to delete this alert?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
            setAlerts(updatedAlerts);
          }
        }
      ]
    );
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'temperature_high': return 'thermometer';
      case 'temperature_low': return 'thermometer-outline';
      case 'humidity_high': return 'water';
      case 'humidity_low': return 'water-outline';
      default: return 'warning';
    }
  };

  const getAlertColor = (type) => {
    if (type.includes('high')) return '#F44336';
    if (type.includes('low')) return '#2196F3';
    return '#FF9800';
  };

  const renderAlertItem = ({ item }) => (
    <View style={[styles.alertCard, item.handled && styles.alertCardHandled]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertTitle}>
          <Ionicons 
            name={getAlertIcon(item.type)} 
            size={20} 
            color={getAlertColor(item.type)} 
          />
          <Text style={styles.alertMessage}>{item.message}</Text>
        </View>
        <Text style={styles.alertTime}>
          {item.timestamp.toLocaleTimeString()}
        </Text>
      </View>
      
      <View style={styles.alertDetails}>
        <Text style={styles.alertValue}>
          Room: {item.room_name}
        </Text>
        <Text style={styles.alertThreshold}>
          Threshold: {item.threshold}{item.type.includes('temperature') ? '°C' : '%'}
        </Text>
      </View>

      {!item.handled && (
        <View style={styles.alertActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => markAsHandled(item.id)}
          >
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.actionText}>Mark Handled</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/room_details',
              params: { id: item.room_id }
            })}
          >
            <Ionicons name="eye" size={18} color="#007AFF" />
            <Text style={styles.actionText}>View Room</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteAlert(item.id)}
      >
        <Ionicons name="trash-outline" size={16} color="#F44336" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const alertStats = {
    total: mockAlerts.length,
    unhandled: mockAlerts.filter(alert => !alert.handled).length,
    handled: mockAlerts.filter(alert => alert.handled).length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({alertStats.total})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'unhandled' && styles.filterButtonActive]}
          onPress={() => setFilter('unhandled')}
        >
          <Text style={[styles.filterText, filter === 'unhandled' && styles.filterTextActive]}>
            Active ({alertStats.unhandled})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'handled' && styles.filterButtonActive]}
          onPress={() => setFilter('handled')}
        >
          <Text style={[styles.filterText, filter === 'handled' && styles.filterTextActive]}>
            Resolved ({alertStats.handled})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No alerts found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 16,
  },
  alertCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertCardHandled: {
    opacity: 0.6,
    borderLeftColor: '#4CAF50',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertMessage: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  alertDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertValue: {
    fontSize: 14,
    color: '#666',
  },
  alertThreshold: {
    fontSize: 14,
    color: '#666',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deleteText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#F44336',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});