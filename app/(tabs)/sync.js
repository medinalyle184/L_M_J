import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SyncScreen() {
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('ready');

  const scanForDevices = () => {
    setScanning(true);
    setSyncStatus('scanning');
    
    setTimeout(() => {
      setScanning(false);
      setSyncStatus('ready');
      Alert.alert('✓ Scan Complete', 'Found 3 devices and connected successfully!');
    }, 3000);
  };

  const refreshAllData = () => {
    setRefreshing(true);
    setSyncStatus('syncing');
    
    setTimeout(() => {
      setRefreshing(false);
      setSyncStatus('ready');
      Alert.alert('✓ Sync Complete', 'All sensor data refreshed successfully!');
    }, 2000);
  };

  const DeviceItem = ({ icon, name, ip, status, color }) => (
    <View style={styles.deviceItem}>
      <View style={[styles.deviceIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{name}</Text>
        <Text style={styles.deviceIp}>{ip}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: status === 'Connected' || status === 'Online' ? '#D1FAE5' : '#FEE2E2' }]}>
        <View style={[styles.statusDot, { backgroundColor: status === 'Connected' || status === 'Online' ? '#10B981' : '#EF4444' }]} />
        <Text style={[styles.statusText, { color: status === 'Connected' || status === 'Online' ? '#065F46' : '#7F1D1D' }]}>
          {status}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <LinearGradient
        colors={['#065F46', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Sensor Sync</Text>
        <Text style={styles.headerSubtitle}>Manage device connections</Text>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDotLarge, { backgroundColor: syncStatus === 'ready' ? '#10B981' : '#F59E0B' }]} />
          <Text style={styles.statusTextLarge}>
            {syncStatus === 'ready' ? 'Ready' : syncStatus === 'scanning' ? 'Scanning...' : 'Syncing...'}
          </Text>
        </View>
      </LinearGradient>

      {/* Bluetooth Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconBadge}>
            <Ionicons name="bluetooth" size={24} color="#0EA5E9" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.sectionTitle}>Bluetooth Devices</Text>
            <Text style={styles.sectionDescription}>ESP32 BLE Sensors</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.bluetoothButton, scanning && styles.buttonDisabled]}
          onPress={scanForDevices}
          disabled={scanning}
          activeOpacity={0.8}
        >
          {scanning ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.buttonText}>Scanning...</Text>
            </>
          ) : (
            <>
              <Ionicons name="bluetooth" size={20} color="white" />
              <Text style={styles.buttonText}>Scan for Devices</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.deviceList}>
          <Text style={styles.listTitle}>Available Devices</Text>
          <DeviceItem
            icon="bluetooth"
            name="ESP32_LivingRoom"
            ip="MAC: 4C:11:AE:10:39:F2"
            status="Connected"
            color="#0EA5E9"
          />
          <DeviceItem
            icon="bluetooth"
            name="ESP32_Kitchen"
            ip="MAC: 5D:22:BF:21:40:G3"
            status="Disconnected"
            color="#6B7280"
          />
        </View>
      </View>

      {/* WiFi Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconBadge}>
            <Ionicons name="wifi" size={24} color="#10B981" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.sectionTitle}>WiFi Sensors</Text>
            <Text style={styles.sectionDescription}>Network Connected</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.wifiButton, refreshing && styles.buttonDisabled]}
          onPress={refreshAllData}
          disabled={refreshing}
          activeOpacity={0.8}
        >
          {refreshing ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.buttonText}>Refreshing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.buttonText}>Refresh All Data</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.deviceList}>
          <Text style={styles.listTitle}>Connected Sensors</Text>
          <DeviceItem
            icon="wifi"
            name="Bedroom Sensor"
            ip="192.168.1.101"
            status="Online"
            color="#10B981"
          />
          <DeviceItem
            icon="wifi"
            name="Office Sensor"
            ip="192.168.1.102"
            status="Online"
            color="#10B981"
          />
        </View>
      </View>

      {/* Connection Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconBadge}>
            <Ionicons name="pulse" size={24} color="#F59E0B" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.sectionTitle}>System Health</Text>
            <Text style={styles.sectionDescription}>Overall Status</Text>
          </View>
        </View>

        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <View style={styles.statusCardContent}>
              <View style={[styles.statusCardIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="bluetooth" size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.statusCardLabel}>BLE</Text>
              <Text style={styles.statusCardValue}>2</Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusCardContent}>
              <View style={[styles.statusCardIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="wifi" size={24} color="#10B981" />
              </View>
              <Text style={styles.statusCardLabel}>WiFi</Text>
              <Text style={styles.statusCardValue}>2</Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusCardContent}>
              <View style={[styles.statusCardIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statusCardLabel}>Last</Text>
              <Text style={styles.statusCardValue}>5m</Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusCardContent}>
              <View style={[styles.statusCardIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <Text style={styles.statusCardLabel}>Status</Text>
              <Text style={styles.statusCardValue}>OK</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusDetails}>
          <View style={styles.statusDetailRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.statusDetailText}>All sensors connected</Text>
          </View>
          <View style={styles.statusDetailRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.statusDetailText}>Data syncing in real-time</Text>
          </View>
          <View style={styles.statusDetailRow}>
            <Ionicons name="information-circle" size={20} color="#0EA5E9" />
            <Text style={styles.statusDetailText}>Next sync: 5 minutes</Text>
          </View>
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb" size={24} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Tips</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>1</Text>
          <Text style={styles.tipText}>Keep sensors powered and within Bluetooth/WiFi range</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>2</Text>
          <Text style={styles.tipText}>Use 2.4GHz WiFi for best connectivity</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>3</Text>
          <Text style={styles.tipText}>Restart router if devices won't connect</Text>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  statusDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusTextLarge: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
  },
  bluetoothButton: {
    backgroundColor: '#0EA5E9',
  },
  wifiButton: {
    backgroundColor: '#10B981',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  deviceList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  deviceIp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  statusCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  statusCardContent: {
    alignItems: 'center',
  },
  statusCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusDetails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
  },
  statusDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDetailText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginTop: 2,
  },
  spacer: {
    height: 20,
  },
});