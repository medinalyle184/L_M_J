import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const defaultRooms = [
    {
      id: 1,
      name: 'Living Room',
      temperature: 22.5,
      humidity: 45,
      air_quality: 35,
      status: 'comfortable',
      lastUpdated: new Date(),
    },
    {
      id: 2,
      name: 'Bedroom',
      temperature: 24.8,
      humidity: 65,
      air_quality: 42,
      status: 'warning',
      lastUpdated: new Date(),
    },
    {
      id: 3,
      name: 'Kitchen',
      temperature: 28.3,
      humidity: 35,
      air_quality: 85,
      status: 'critical',
      lastUpdated: new Date(),
    },
  ];

  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [])
  );

  const loadRooms = async () => {
    try {
      const result = await window.storage.get('rooms');
      if (result && result.value) {
        const savedRooms = JSON.parse(result.value);
        setRooms(savedRooms);
      } else {
        setRooms(defaultRooms);
        await window.storage.set('rooms', JSON.stringify(defaultRooms));
      }
    } catch (error) {
      console.log('Loading default rooms:', error);
      setRooms(defaultRooms);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadRooms();
      setRefreshing(false);
    }, 1000);
  };

  const deleteRoom = async (roomId) => {
    const updatedRooms = rooms.filter(r => r.id !== roomId);
    setRooms(updatedRooms);
    try {
      await window.storage.set('rooms', JSON.stringify(updatedRooms));
    } catch (error) {
      console.log('Error saving:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'comfortable': return ['#10B981', '#059669'];
      case 'warning': return ['#F59E0B', '#D97706'];
      case 'critical': return ['#EF4444', '#DC2626'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'comfortable': return 'checkmark-circle';
      case 'warning': return 'alert-circle';
      case 'critical': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderRoomItem = ({ item }) => {
    const [startColor, endColor] = getStatusColor(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push({
          pathname: '/room-detail',
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
        <LinearGradient
          colors={[startColor, endColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.roomCard}
        >
          <View style={styles.cardContent}>
            <View style={styles.roomHeader}>
              <View>
                <Text style={styles.roomName}>{item.name}</Text>
                <Text style={styles.statusLabel}>{item.status.toUpperCase()}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => deleteRoom(item.id)}
                style={styles.deleteIconContainer}
              >
                <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>

            <View style={styles.roomData}>
              <View style={styles.dataItem}>
                <Ionicons name="thermometer" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.dataLabel}>Temp</Text>
                <Text style={styles.dataValue}>{item.temperature.toFixed(1)}°</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.dataItem}>
                <Ionicons name="water" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.dataLabel}>Humidity</Text>
                <Text style={styles.dataValue}>{item.humidity.toFixed(0)}%</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.dataItem}>
                <Ionicons name="leaf" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.dataLabel}>AQI</Text>
                <Text style={styles.dataValue}>{item.air_quality}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.timeText}>
                {item.lastUpdated ? item.lastUpdated.toLocaleTimeString() : 'N/A'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const summaryStats = rooms.length > 0 ? {
    avgTemp: (rooms.reduce((sum, r) => sum + r.temperature, 0) / rooms.length).toFixed(1),
    avgHumidity: (rooms.reduce((sum, r) => sum + r.humidity, 0) / rooms.length).toFixed(0),
    alerts: rooms.filter(r => r.status === 'critical').length,
  } : { avgTemp: 0, avgHumidity: 0, alerts: 0 };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#065F46', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Room Monitor</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="leaf" size={28} color="#10B981" />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="thermometer" size={20} color="#FF6B6B" />
            <Text style={styles.statValue}>{summaryStats.avgTemp}°</Text>
            <Text style={styles.statLabel}>Avg</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="water" size={20} color="#4ECDC4" />
            <Text style={styles.statValue}>{summaryStats.avgHumidity}%</Text>
            <Text style={styles.statLabel}>Humidity</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="alert-circle" size={20} color={summaryStats.alerts > 0 ? '#EF4444' : '#10B981'} />
            <Text style={styles.statValue}>{summaryStats.alerts}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
        contentContainerStyle={styles.listContent}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  roomCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    padding: 20,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  statusLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  deleteIconContainer: {
    padding: 4,
  },
  roomData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  dataItem: {
    alignItems: 'center',
    flex: 1,
  },
  dataLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
  },
});