import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AlertItem = ({ alert, onMarkHandled, onViewRoom, onDelete }) => {
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

  return (
    <View style={[styles.card, alert.handled && styles.handled]}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Ionicons 
            name={getAlertIcon(alert.type)} 
            size={20} 
            color={getAlertColor(alert.type)} 
          />
          <Text style={styles.message}>{alert.message}</Text>
        </View>
        <Text style={styles.time}>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.value}>
          Current: {alert.value} {alert.type.includes('temperature') ? '°C' : '%'}
        </Text>
        <Text style={styles.threshold}>
          Threshold: {alert.threshold} {alert.type.includes('temperature') ? '°C' : '%'}
        </Text>
      </View>
      
      <View style={styles.actions}>
        {!alert.handled && (
          <TouchableOpacity style={styles.action} onPress={onMarkHandled}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.actionText}>Handled</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.action} onPress={onViewRoom}>
          <Ionicons name="eye" size={20} color="#007AFF" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.action} onPress={onDelete}>
          <Ionicons name="trash" size={20} color="#F44336" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  handled: {
    opacity: 0.6,
    borderLeftColor: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
  threshold: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});

export default AlertItem;