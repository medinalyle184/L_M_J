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

  useFocusEffect(
    useCallback(() => {
      // Load settings if needed
    }, [])
  );

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
          description="Receive alerts on your device"
        >
          <Switch
            value={settings.pushNotifications}
            onValueChange={(value) => setSettings({ ...settings, pushNotifications: value })}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={settings.pushNotifications ? '#10B981' : '#E5E7EB'}
          />
        </SettingRow>

        <SettingRow
          icon="alert-circle"
          title="In-App Notifications"
          description="Show notifications in the app"
        >
          <Switch
            value={settings.inAppNotifications}
            onValueChange={(value) => setSettings({ ...settings, inAppNotifications: value })}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={settings.inAppNotifications ? '#10B981' : '#E5E7EB'}
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

        <SettingRow
          icon="phone-portrait"
          title="Vibration"
          description="Haptic feedback"
        >
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) => setSettings({ ...settings, vibrationEnabled: value })}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={settings.vibrationEnabled ? '#10B981' : '#E5E7EB'}
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
          description="Choose Celsius or Fahrenheit"
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
      </View>

      {/* Data Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time" size={24} color="#10B981" />
          <Text style={styles.sectionTitle}>Data & Sync</Text>
        </View>

        <SettingRow
          icon="time"
          title="Refresh Interval"
          description="How often data updates"
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

        <SettingRow
          icon="cloud-download"
          title="Auto Refresh"
          description="Automatically update data"
        >
          <Switch
            value={settings.autoRefresh}
            onValueChange={(value) => setSettings({ ...settings, autoRefresh: value })}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={settings.autoRefresh ? '#10B981' : '#E5E7EB'}
          />
        </SettingRow>

        <SettingRow
          icon="archive"
          title="Data Retention"
          description="Keep data for X days"
        >
          <View style={styles.intervalSelector}>
            <TextInput
              style={styles.intervalInput}
              value={settings.dataRetention.toString()}
              onChangeText={(text) => setSettings({ ...settings, dataRetention: parseInt(text) || 30 })}
              keyboardType="numeric"
            />
            <Text style={styles.intervalLabel}>days</Text>
          </View>
        </SettingRow>
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield" size={24} color="#10B981" />
          <Text style={styles.sectionTitle}>Privacy & Analytics</Text>
        </View>

        <SettingRow
          icon="bar-chart"
          title="Analytics"
          description="Help improve the app"
        >
          <Switch
            value={settings.analyticsEnabled}
            onValueChange={(value) => setSettings({ ...settings, analyticsEnabled: value })}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={settings.analyticsEnabled ? '#10B981' : '#E5E7EB'}
          />
        </SettingRow>

        <SettingRow
          icon="bug"
          title="Crash Reports"
          description="Send error reports"
        >
          <Switch
            value={settings.crashReports}
            onValueChange={(value) => setSettings({ ...settings, crashReports: value })}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={settings.crashReports ? '#10B981' : '#E5E7EB'}
          />
        </SettingRow>
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
});