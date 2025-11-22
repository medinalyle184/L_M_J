import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RoomCard = ({ room, onPress, onRefresh }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'comfortable': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'comfortable': return 'happy';
      case 'warning': return 'warning';
      case 'critical': return 'sad';
      default: return 'help';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: getStatusColor(room.status) }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{room.name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={16} color="#007AFF" />
          </TouchableOpacity>
          <Ionicons name={getStatusIcon(room.status)} size={24} color={getStatusColor(room.status)} />
        </View>
      </View>
      
      <View style={styles.data}>
        <View style={styles.dataItem}>
          <Ionicons name="thermometer" size={16} color="#666" />
          <Text style={styles.dataText}>
            {room.temperature ? `${room.temperature.toFixed(1)}°C` : '--'}
          </Text>
        </View>
        
        <View style={styles.dataItem}>
          <Ionicons name="water" size={16} color="#666" />
          <Text style={styles.dataText}>
            {room.humidity ? `${room.humidity.toFixed(1)}%` : '--'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 4,
    marginRight: 8,
  },
  data: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});

export default RoomCard;