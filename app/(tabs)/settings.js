import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    inAppNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    temperatureUnit: 'C',
    refreshInterval: 5,
    autoRefresh: true,
    dataRetention: 30,
    analyticsEnabled: true,
    crashReports: true,
  });

  const [rooms, setRooms] = useState([]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomModalVisible, setRoomModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [])
  );

  const loadRooms = async () => {
    try {
      const result = await window.storage.get('rooms');
      if (result && result.value) {
        setRooms(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Error loading rooms:', error);
    }
  };

  const saveSettings = () => {
    Alert.alert('✓ Saved', 'All settings have been saved successfully!', [{ text: 'OK' }]);
  };

  const resetSettings = () => {
    Alert.alert(
      '⚠️ Reset Settings',
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
              refreshInterval: 5,
              autoRefresh: true,
              dataRetention: 30,
              analyticsEnabled: true,
              crashReports: true,
            });
            Alert.alert('✓ Success', 'Settings reset to defaults', [{ text: 'OK' }]);
          },
        },
      ]
    );
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('⚠️ Error', 'Please enter a room name', [{ text: 'OK' }]);
      return;
    }

    const newRoom = {
      id: Math.max(...rooms.map(r => r.id), 0) + 1,
      name: newRoomName.trim(),
      temperature: 22,
      humidity: 50,
      air_quality: 50,
      status: 'comfortable',
      lastUpdated: new Date(),
    };

    const updatedRooms = [newRoom, ...rooms];
    setRooms(updatedRooms);

    try {
      await window.storage.set('rooms', JSON.stringify(updatedRooms));
      setShowAddRoom(false);
      setNewRoomName('');
      Alert.alert('✓ Success', `Room "${newRoom.name}" added!\nIt will appear in your dashboard now.`, [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save room');
    }
  };

  const deleteRoom = async (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    Alert.alert(
      '🗑️ Delete Room',
      `Delete "${room?.name}" permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedRooms = rooms.filter(r => r.id !== roomId);
            setRooms(updatedRooms);

            try {
              await window.storage.set('rooms', JSON.stringify(updatedRooms));
              Alert.alert('✓ Deleted', 'Room removed from dashboard', [{ text: 'OK' }]);
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to delete room');
            }
          }
        }
      ]
    );
  };

  const viewRoomDetails = (room) => {
    setSelectedRoom(room);
    setRoomModalVisible(true);
  };

  const SettingRow = ({ icon, title, description, children }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>{title}</Text>
            {description && <Text style={styles.settingDescription}>{description}</Text>}
          </View>
        </View>
      </View>
      {children}
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
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </LinearGradient>

      {/* Notification Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications" size={24} color="#10B981" />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>

        <SettingRow
          icon="notifications"
          title="Push Notifications"
          description="Receive alerts"
        >
          <Switch
            value={settings.pushNotifications}
            onValueChange={(value) => setSettings({ ...settings, pushNotifications: value })}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={settings.pushNotifications ? '#10B981' : '#E5E7EB'}
          />
        </SettingRow>

        <SettingRow
          icon="volume-high"
          title="Sound"
          description="Notification sounds"
        >
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => setSettings({ ...settings, soundEnabled: value })}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={settings.soundEnabled ? '#10B981' : '#E5E7EB'}
          />
        </SettingRow>
      </View>

      {/* Display Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="eye" size={24} color="#10B981" />
          <Text style={styles.sectionTitle}>Display</Text>
        </View>

        <SettingRow
          icon="thermometer"
          title="Temperature Unit"
          description="Celsius or Fahrenheit"
        >
          <View style={styles.unitSelector}>
            <TouchableOpacity
              style={[styles.unitButton, settings.temperatureUnit === 'C' && styles.unitButtonActive]}
              onPress={() => setSettings({ ...settings, temperatureUnit: 'C' })}
              activeOpacity={0.8}
            >
              <Text style={[styles.unitText, settings.temperatureUnit === 'C' && styles.unitTextActive]}>
                °C
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, settings.temperatureUnit === 'F' && styles.unitButtonActive]}
              onPress={() => setSettings({ ...settings, temperatureUnit: 'F' })}
              activeOpacity={0.8}
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
          description="Data update frequency"
        >
          <View style={styles.intervalSelector}>
            <TextInput
              style={styles.intervalInput}
              value={settings.refreshInterval.toString()}
              onChangeText={(text) => setSettings({ ...settings, refreshInterval: parseInt(text) || 5 })}
              keyboardType="numeric"
            />
            <Text style={styles.intervalLabel}>min</Text>
          </View>
        </SettingRow>
      </View>

      {/* Room Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderWithButton}>
          <View style={styles.sectionHeader}>
            <Ionicons name="home" size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>My Rooms ({rooms.length})</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddRoom(!showAddRoom)} style={styles.addButton} activeOpacity={0.8}>
            <Ionicons name="add-circle" size={28} color="#10B981" />
          </TouchableOpacity>
        </View>

        {showAddRoom && (
          <View style={styles.addRoomContainer}>
            <Text style={styles.addRoomTitle}>Add New Room</Text>
            <TextInput
              style={styles.addRoomInput}
              placeholder="Enter room name (e.g., Bathroom, Office)"
              value={newRoomName}
              onChangeText={setNewRoomName}
              autoFocus
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.addRoomButtons}>
              <TouchableOpacity onPress={() => setShowAddRoom(false)} style={styles.cancelButton} activeOpacity={0.8}>
                <Ionicons name="close" size={18} color="#6B7280" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddRoom} style={styles.confirmButton} activeOpacity={0.8}>
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.confirmButtonText}>Add Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {rooms.length === 0 ? (
          <View style={styles.noRooms}>
            <Ionicons name="home" size={48} color="#D1D5DB" />
            <Text style={styles.noRoomsText}>No rooms yet</Text>
            <Text style={styles.noRoomsSubtext}>Add a room to get started</Text>
          </View>
        ) : (
          rooms.map((room, index) => (
            <TouchableOpacity 
              key={room.id} 
              style={[styles.settingRow, index === rooms.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => viewRoomDetails(room)}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                    <Ionicons name="home" size={20} color="#10B981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>{room.name}</Text>
                    <Text style={styles.settingDescription}>
                      🌡️ {room.temperature}°C • 💧 {room.humidity}% • 🌿 Status: {room.status}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => deleteRoom(room.id)}
                activeOpacity={0.8}
                style={{ padding: 8 }}
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={resetSettings} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={20} color="#EF4444" />
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
        <Text style={styles.copyright}>© 2024 Room Monitor</Text>
      </View>

      {/* Room Details Modal */}
      <Modal
        visible={roomModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRoomModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#065F46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <TouchableOpacity onPress={() => setRoomModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Room Info</Text>
            <View style={{ width: 24 }} />
          </LinearGradient>

          {selectedRoom && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.roomCard}>
                <Text style={styles.roomCardTitle}>{selectedRoom.name}</Text>

                <View style={styles.statGrid}>
                  <View style={styles.statBox}>
                    <Ionicons name="thermometer" size={24} color="#FF6B6B" />
                    <Text style={styles.statLabel}>Temperature</Text>
                    <Text style={styles.statValue}>{selectedRoom.temperature}°C</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Ionicons name="water" size={24} color="#4ECDC4" />
                    <Text style={styles.statLabel}>Humidity</Text>
                    <Text style={styles.statValue}>{selectedRoom.humidity}%</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Ionicons name="leaf" size={24} color="#10B981" />
                    <Text style={styles.statLabel}>Air Quality</Text>
                    <Text style={styles.statValue}>{selectedRoom.air_quality}</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    <Text style={styles.statLabel}>Status</Text>
                    <Text style={[styles.statValue, { fontSize: 14, textTransform: 'capitalize' }]}>{selectedRoom.status}</Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>Quick Actions</Text>
                  <TouchableOpacity style={styles.actionLink} activeOpacity={0.8}>
                    <Ionicons name="open" size={18} color="#0EA5E9" />
                    <Text style={styles.actionLinkText}>View Room Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionLink} activeOpacity={0.8}>
                    <Ionicons name="create" size={18} color="#10B981" />
                    <Text style={styles.actionLinkText}>Edit Thresholds</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeModal}
                  onPress={() => setRoomModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
    paddingVertical: 12,
    gap: 12,
  },
  sectionHeaderWithButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  unitSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
  },
  unitButtonActive: {
    backgroundColor: '#10B981',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  unitTextActive: {
    color: 'white',
  },
  intervalSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intervalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    width: 60,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  intervalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  addButton: {
    padding: 8,
  },
  addRoomContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  addRoomTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  addRoomInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  addRoomButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  noRooms: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noRoomsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 12,
  },
  noRoomsSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
  },
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  version: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  roomCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  roomCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  actionLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  closeModal: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});