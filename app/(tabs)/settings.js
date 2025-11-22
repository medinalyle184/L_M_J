import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRooms } from '../../hooks/useRooms';

export default function SettingsScreen() {
  const { addRoom } = useRooms();
  const [settings, setSettings] = useState({
    // Notification Settings
    pushNotifications: true,
    inAppNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    
    // Display Settings
    temperatureUnit: 'C', // 'C' or 'F'
    theme: 'light', // 'light' or 'dark'
    refreshInterval: 5, // minutes
    
    // Data Settings
    autoRefresh: true,
    dataRetention: 30, // days
    highPrecision: false,
    
    // Privacy Settings
    analyticsEnabled: true,
    crashReports: true,
  });

  const rooms = [
    { id: 1, name: 'Living Room', enabled: true },
    { id: 2, name: 'Bedroom', enabled: true },
    { id: 3, name: 'Kitchen', enabled: true },
  ];

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    // Load settings from storage
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Mock loading settings
    console.log('Loading settings...');
  };

  const saveSettings = () => {
    // Save settings to storage
    Alert.alert('Success', 'Settings saved successfully');
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              pushNotifications: true,
              inAppNotifications: true,
              soundEnabled: true,
              vibrationEnabled: true,
              temperatureUnit: 'C',
              theme: 'light',
              refreshInterval: 5,
              autoRefresh: true,
              dataRetention: 30,
              highPrecision: false,
              analyticsEnabled: true,
              crashReports: true,
            });
            Alert.alert('Success', 'Settings reset to defaults');
          },
        },
      ]
    );
  };

  const toggleRoom = (roomId) => {
    // TODO: Implement room enable/disable functionality
    console.log('Toggle room:', roomId);
  };

  const addNewRoom = () => {
    setShowAddRoom(true);
  };

  const cancelAddRoom = () => {
    setShowAddRoom(false);
    setNewRoomName('');
  };

  const handleAddRoom = async () => {
    if (newRoomName.trim()) {
      try {
        await addRoom({
          name: newRoomName.trim(),
          sensor_type: 'temperature',
          connection_type: 'wifi',
        });
        setShowAddRoom(false);
        setNewRoomName('');
        Alert.alert('Success', 'Room added successfully');
      } catch (_error) {
        Alert.alert('Error', 'Failed to add room');
      }
    }
  };

  const SettingRow = ({ icon, title, description, children }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          <Ionicons name={icon} size={20} color="#666" />
          <Text style={styles.settingTitle}>{title}</Text>
        </View>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Settings</Text>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <SettingRow 
          icon="notifications" 
          title="Push Notifications"
          description="Receive push notifications for alerts"
        >
          <Switch
            value={settings.pushNotifications}
            onValueChange={(value) => setSettings({...settings, pushNotifications: value})}
          />
        </SettingRow>

        <SettingRow 
          icon="phone-portrait" 
          title="In-App Notifications"
          description="Show notification badges in the app"
        >
          <Switch
            value={settings.inAppNotifications}
            onValueChange={(value) => setSettings({...settings, inAppNotifications: value})}
          />
        </SettingRow>

        <SettingRow 
          icon="volume-high" 
          title="Sound"
          description="Play sound for notifications"
        >
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => setSettings({...settings, soundEnabled: value})}
          />
        </SettingRow>

        <SettingRow 
          icon="phone-vibrate" 
          title="Vibration"
          description="Vibrate for important alerts"
        >
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) => setSettings({...settings, vibrationEnabled: value})}
          />
        </SettingRow>
      </View>

      {/* Display Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display</Text>
        
        <SettingRow 
          icon="thermometer" 
          title="Temperature Unit"
          description="Display temperature in Celsius or Fahrenheit"
        >
          <View style={styles.unitSelector}>
            <TouchableOpacity
              style={[styles.unitButton, settings.temperatureUnit === 'C' && styles.unitButtonActive]}
              onPress={() => setSettings({...settings, temperatureUnit: 'C'})}
            >
              <Text style={[styles.unitText, settings.temperatureUnit === 'C' && styles.unitTextActive]}>
                °C
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, settings.temperatureUnit === 'F' && styles.unitButtonActive]}
              onPress={() => setSettings({...settings, temperatureUnit: 'F'})}
            >
              <Text style={[styles.unitText, settings.temperatureUnit === 'F' && styles.unitTextActive]}>
                °F
              </Text>
            </TouchableOpacity>
          </View>
        </SettingRow>

        <SettingRow 
          icon="time" 
          title="Refresh Interval"
          description="How often to refresh sensor data"
        >
          <View style={styles.intervalSelector}>
            <TextInput
              style={styles.intervalInput}
              value={settings.refreshInterval.toString()}
              onChangeText={(text) => setSettings({...settings, refreshInterval: parseInt(text) || 5})}
              keyboardType="numeric"
            />
            <Text style={styles.intervalLabel}>min</Text>
          </View>
        </SettingRow>

        <SettingRow 
          icon="refresh" 
          title="Auto Refresh"
          description="Automatically refresh data in background"
        >
          <Switch
            value={settings.autoRefresh}
            onValueChange={(value) => setSettings({...settings, autoRefresh: value})}
          />
        </SettingRow>
      </View>

      {/* Room Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rooms & Sensors</Text>
          <TouchableOpacity onPress={addNewRoom} style={styles.addButton}>
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {showAddRoom && (
          <View style={styles.addRoomContainer}>
            <TextInput
              style={styles.addRoomInput}
              placeholder="Enter room name"
              value={newRoomName}
              onChangeText={setNewRoomName}
              autoFocus
            />
            <View style={styles.addRoomButtons}>
              <TouchableOpacity onPress={cancelAddRoom} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddRoom} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {rooms.map(room => (
          <SettingRow
            key={room.id}
            icon="home"
            title={room.name}
            description={room.enabled ? 'Monitoring enabled' : 'Monitoring disabled'}
          >
            <Switch
              value={room.enabled}
              onValueChange={() => toggleRoom(room.id)}
            />
          </SettingRow>
        ))}
      </View>

      {/* Data & Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        
        <SettingRow 
          icon="analytics" 
          title="Analytics"
          description="Help improve the app with anonymous usage data"
        >
          <Switch
            value={settings.analyticsEnabled}
            onValueChange={(value) => setSettings({...settings, analyticsEnabled: value})}
          />
        </SettingRow>

        <SettingRow 
          icon="bug" 
          title="Crash Reports"
          description="Automatically send crash reports"
        >
          <Switch
            value={settings.crashReports}
            onValueChange={(value) => setSettings({...settings, crashReports: value})}
          />
        </SettingRow>

        <SettingRow 
          icon="save" 
          title="Data Retention"
          description="How long to keep historical data"
        >
          <View style={styles.intervalSelector}>
            <TextInput
              style={styles.intervalInput}
              value={settings.dataRetention.toString()}
              onChangeText={(text) => setSettings({...settings, dataRetention: parseInt(text) || 30})}
              keyboardType="numeric"
            />
            <Text style={styles.intervalLabel}>days</Text>
          </View>
        </SettingRow>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2024 Temperature Tracker</Text>
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
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  unitSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  unitButtonActive: {
    backgroundColor: '#007AFF',
  },
  unitText: {
    fontSize: 14,
    color: '#666',
  },
  unitTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  intervalSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 4,
    width: 60,
    textAlign: 'center',
    marginRight: 8,
  },
  intervalLabel: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    padding: 8,
  },
  actionSection: {
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#999',
  },
  addRoomContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  addRoomInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
    marginBottom: 12,
  },
  addRoomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
