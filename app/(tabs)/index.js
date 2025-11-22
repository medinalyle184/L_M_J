import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const mockRooms = [
    {
      id: 1,
      name: 'Living Room',
      temperature: 22.5,
      humidity: 45,
      air_quality: 35,
      status: 'comfortable',
      lastUpdated: new Date(),
      min_temp: 18,
      max_temp: 26,
      min_humidity: 30,
      max_humidity: 70,
    },
    {
      id: 2,
      name: 'Bedroom',
      temperature: 24.8,
      humidity: 65,
      air_quality: 42,
      status: 'warning',
      lastUpdated: new Date(),
      min_temp: 18,
      max_temp: 26,
      min_humidity: 30,
      max_humidity: 70,
    },
    {
      id: 3,
      name: 'Kitchen',
      temperature: 28.3,
      humidity: 35,
      air_quality: 85,
      status: 'critical',
      lastUpdated: new Date(),
      min_temp: 18,
      max_temp: 26,
      min_humidity: 30,
      max_humidity: 70,
    },
  ];

  useEffect(() => {
    const loadRooms = () => {
      // Mock data with lastUpdated
      const mockRooms = [
        { id: 1, name: 'Living Room', temperature: 22.5, humidity: 45, air_quality: 35, status: 'comfortable', lastUpdated: new Date() },
        { id: 2, name: 'Bedroom', temperature: 21.8, humidity: 50, air_quality: 28, status: 'comfortable', lastUpdated: new Date() },
        { id: 3, name: 'Kitchen', temperature: 24.1, humidity: 42, air_quality: 40, status: 'warning', lastUpdated: new Date() },
      ];
      setRooms(mockRooms);
    };
    loadRooms();
  }, []);

  const loadRooms = () => {
    setRooms(mockRooms);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadRooms();
      setRefreshing(false);
    }, 1000);
  };

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

  const renderRoomItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.roomCard, { borderLeftColor: getStatusColor(item.status) }]}
      onPress={() => router.push({
        pathname: '/room_details',
        params: {
          id: item.id,
          name: item.name,
          temperature: item.temperature,
          humidity: item.humidity,
          air_quality: item.air_quality,
          status: item.status
        }
      })}
    >
      <View style={styles.roomHeader}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Ionicons name={getStatusIcon(item.status)} size={24} color={getStatusColor(item.status)} />
      </View>
      
      <View style={styles.roomData}>
        <View style={styles.dataItem}>
          <Ionicons name="thermometer" size={16} color="#666" />
          <Text style={styles.dataText}>
            {item.temperature.toFixed(1)}°C
          </Text>
        </View>
        
        <View style={styles.dataItem}>
          <Ionicons name="water" size={16} color="#666" />
          <Text style={styles.dataText}>
            {item.humidity.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.dataItem}>
          <Ionicons name="leaf" size={16} color="#666" />
          <Text style={styles.dataText}>
            AQI: {item.air_quality}
          </Text>
        </View>
      </View>
      
      <Text style={styles.lastUpdated}>
        Last updated: {item.lastUpdated ? item.lastUpdated.toLocaleTimeString() : 'N/A'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temperature & Comfort Tracker</Text>
      <Text style={styles.subtitle}>Monitor your rooms in real-time</Text>
      
      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 16,
  },
  roomCard: {
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
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  roomData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});