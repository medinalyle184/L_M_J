import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function RoomDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [room, setRoom] = useState(null);
  const [thresholds, setThresholds] = useState({
    min_temp: 18,
    max_temp: 26,
    min_humidity: 30,
    max_humidity: 70,
    max_aqi: 100,
    notifications_enabled: true,
  });
  const [editing, setEditing] = useState(false);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    loadRoomData();
  }, [params.id]);

  const loadRoomData = () => {
    const mockRoom = {
      id: params.id,
      name: params.name || 'Room',
      temperature: parseFloat(params.temperature) || 22.5,
      humidity: parseFloat(params.humidity) || 45,
      air_quality: parseFloat(params.air_quality) || 35,
      status: params.status || 'comfortable',
    };

    const mockReadings = [22.5, 23.1, 21.8, 22.3, 24.1, 23.8];
    const mockLabels = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

    setRoom(mockRoom);
    setReadings({
      temperatures: mockReadings,
      humidities: [45, 43, 47, 46, 42, 44],
      labels: mockLabels
    });
  };

  const updateThresholds = () => {
    Alert.alert('Success', 'Thresholds updated successfully!');
    setEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'comfortable': return ['#10B981', '#059669'];
      case 'warning': return ['#F59E0B', '#D97706'];
      case 'critical': return ['#EF4444', '#DC2626'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  if (!room) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const [startColor, endColor] = getStatusColor(room.status);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <LinearGradient
        colors={[startColor, endColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.roomName}>{room.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{room.status.toUpperCase()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Current Readings */}
      <View style={styles.readingsSection}>
        <View style={styles.readingCard}>
          <View style={styles.readingIconContainer}>
            <Ionicons name="thermometer" size={32} color="#FF6B6B" />
          </View>
          <Text style={styles.readingValue}>
            {room.temperature.toFixed(1)}°
          </Text>
          <Text style={styles.readingLabel}>Temperature</Text>
        </View>

        <View style={styles.readingCard}>
          <View style={styles.readingIconContainer}>
            <Ionicons name="water" size={32} color="#4ECDC4" />
          </View>
          <Text style={styles.readingValue}>
            {room.humidity.toFixed(0)}%
          </Text>
          <Text style={styles.readingLabel}>Humidity</Text>
        </View>

        <View style={styles.readingCard}>
          <View style={styles.readingIconContainer}>
            <Ionicons name="leaf" size={32} color="#45B7D1" />
          </View>
          <Text style={styles.readingValue}>
            {room.air_quality}
          </Text>
          <Text style={styles.readingLabel}>Air Quality</Text>
        </View>
      </View>

      {/* Charts Section */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Temperature Trend</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: readings.labels || [],
              datasets: [{
                data: readings.temperatures || [],
                color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                strokeWidth: 3
              }]
            }}
            width={Dimensions.get('window').width - 32}
            height={200}
            chartConfig={{
              backgroundColor: 'white',
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 12
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#FF6B6B'
              }
            }}
            bezier
          />
        </View>

        <Text style={[styles.chartTitle, { marginTop: 24 }]}>Humidity Trend</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: readings.labels || [],
              datasets: [{
                data: readings.humidities || [],
                color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
                strokeWidth: 3
              }]
            }}
            width={Dimensions.get('window').width - 32}
            height={200}
            chartConfig={{
              backgroundColor: 'white',
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 12
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4ECDC4'
              }
            }}
            bezier
          />
        </View>
      </View>

      {/* Thresholds Section */}
      <View style={styles.thresholdsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Comfort Thresholds</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.editButton}>
            <Ionicons name={editing ? 'checkmark-circle' : 'pencil'} size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Temperature Range */}
        <View style={styles.thresholdRow}>
          <View style={styles.thresholdLabel}>
            <Ionicons name="thermometer" size={20} color="#FF6B6B" />
            <Text style={styles.label}>Temperature</Text>
          </View>
          <View style={styles.thresholdInputs}>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={thresholds.min_temp.toString()}
              onChangeText={text => setThresholds({...thresholds, min_temp: parseFloat(text) || 0})}
              editable={editing}
              keyboardType="numeric"
              placeholder="Min"
            />
            <Text style={styles.to}>-</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={thresholds.max_temp.toString()}
              onChangeText={text => setThresholds({...thresholds, max_temp: parseFloat(text) || 0})}
              editable={editing}
              keyboardType="numeric"
              placeholder="Max"
            />
            <Text style={styles.unit}>°C</Text>
          </View>
        </View>

        {/* Humidity Range */}
        <View style={styles.thresholdRow}>
          <View style={styles.thresholdLabel}>
            <Ionicons name="water" size={20} color="#4ECDC4" />
            <Text style={styles.label}>Humidity</Text>
          </View>
          <View style={styles.thresholdInputs}>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={thresholds.min_humidity.toString()}
              onChangeText={text => setThresholds({...thresholds, min_humidity: parseFloat(text) || 0})}
              editable={editing}
              keyboardType="numeric"
              placeholder="Min"
            />
            <Text style={styles.to}>-</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={thresholds.max_humidity.toString()}
              onChangeText={text => setThresholds({...thresholds, max_humidity: parseFloat(text) || 0})}
              editable={editing}
              keyboardType="numeric"
              placeholder="Max"
            />
            <Text style={styles.unit}>%</Text>
          </View>
        </View>

        {/* Max AQI */}
        <View style={styles.thresholdRow}>
          <View style={styles.thresholdLabel}>
            <Ionicons name="leaf" size={20} color="#45B7D1" />
            <Text style={styles.label}>Max AQI</Text>
          </View>
          <View style={styles.maxAqiInput}>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={thresholds.max_aqi.toString()}
              onChangeText={text => setThresholds({...thresholds, max_aqi: parseFloat(text) || 0})}
              editable={editing}
              keyboardType="numeric"
              placeholder="AQI"
            />
          </View>
        </View>

        {/* Notifications Toggle */}
        <View style={[styles.thresholdRow, styles.lastRow]}>
          <View style={styles.thresholdLabel}>
            <Ionicons name="notifications" size={20} color="#10B981" />
            <Text style={styles.label}>Notifications</Text>
          </View>
          <Switch
            value={thresholds.notifications_enabled}
            onValueChange={value => setThresholds({...thresholds, notifications_enabled: value})}
            disabled={!editing}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={thresholds.notifications_enabled ? '#10B981' : '#E5E7EB'}
          />
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveButton} onPress={updateThresholds}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  readingsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  readingCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  readingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  readingValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  readingLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  chartSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  thresholdsSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 20,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  thresholdLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  thresholdInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  maxAqiInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    width: 48,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  to: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  unit: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  spacer: {
    height: 20,
  },
});