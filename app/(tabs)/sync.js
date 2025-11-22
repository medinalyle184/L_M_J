import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SyncScreen() {
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scanForDevices = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      alert('Scan completed! Found 3 devices');
    }, 3000);
  };

  const refreshAllData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      alert('All sensor data refreshed!');
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sensor Synchronization</Text>
      <Text style={styles.subtitle}>Manage your sensor connections</Text>

      {/* BLE Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bluetooth Devices</Text>
        <Text style={styles.sectionDescription}>
          Discover and connect to nearby ESP32 devices via Bluetooth
        </Text>
        
        <TouchableOpacity 
          style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
          onPress={scanForDevices}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="bluetooth" size={20} color="white" />
              <Text style={styles.scanButtonText}>Scan for Devices</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.deviceList}>
          <Text style={styles.deviceTitle}>Available Devices:</Text>
          <View style={styles.deviceItem}>
            <Ionicons name="bluetooth" size={20} color="#007AFF" />
            <Text style={styles.deviceName}>ESP32_LivingRoom</Text>
            <Text style={styles.deviceStatus}>Connected</Text>
          </View>
          <View style={styles.deviceItem}>
            <Ionicons name="bluetooth" size={20} color="#007AFF" />
            <Text style={styles.deviceName}>ESP32_Kitchen</Text>
            <Text style={styles.deviceStatus}>Disconnected</Text>
          </View>
        </View>
      </View>

      {/* WiFi Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WiFi Sensors</Text>
        <Text style={styles.sectionDescription}>
          Refresh data from your WiFi-connected sensors
        </Text>

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={refreshAllData}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.refreshButtonText}>Refresh All Data</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.wifiList}>
          <Text style={styles.deviceTitle}>Connected Sensors:</Text>
          <View style={styles.deviceItem}>
            <Ionicons name="wifi" size={20} color="#4CAF50" />
            <Text style={styles.deviceName}>192.168.1.101 - Bedroom</Text>
            <Text style={styles.deviceStatus}>Online</Text>
          </View>
          <View style={styles.deviceItem}>
            <Ionicons name="wifi" size={20} color="#4CAF50" />
            <Text style={styles.deviceName}>192.168.1.102 - Office</Text>
            <Text style={styles.deviceStatus}>Online</Text>
          </View>
        </View>
      </View>

      {/* Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        <View style={styles.statusItem}>
          <Ionicons name="bluetooth" size={20} color="#007AFF" />
          <Text style={styles.statusText}>2 BLE Devices</Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="wifi" size={20} color="#4CAF50" />
          <Text style={styles.statusText}>2 WiFi Sensors</Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="time" size={20} color="#666" />
          <Text style={styles.statusText}>Last sync: 5 min ago</Text>
        </View>
      </View>
    </ScrollView>
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
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  scanButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deviceList: {
    marginTop: 8,
  },
  wifiList: {
    marginTop: 8,
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  deviceStatus: {
    fontSize: 12,
    color: '#666',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});