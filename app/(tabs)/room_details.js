import { Ionicons } from '@expo/vector-icons';
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
  View
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
    const loadRoomData = () => {
      // Mock data
      const mockRoom = {
        id: params.id,
        name: params.name || 'Room',
        temperature: parseFloat(params.temperature) || 22.5,
        humidity: parseFloat(params.humidity) || 45,
        air_quality: parseFloat(params.air_quality) || 35,
        status: params.status || 'comfortable',
      };

      // Mock readings data for chart
      const mockReadings = [22.5, 23.1, 21.8, 22.3, 24.1, 23.8];
      const mockLabels = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

      setRoom(mockRoom);
      setReadings({
        temperatures: mockReadings,
        humidities: [45, 43, 47, 46, 42, 44],
        labels: mockLabels
      });
    };
    loadRoomData();
  }, [params.id]);

  const updateThresholds = () => {
    Alert.alert('Success', 'Comfort thresholds updated successfully');
    setEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'comfortable': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (!room) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.roomName}>{room.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(room.status) }]}>
            <Text style={styles.statusText}>{room.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Current Readings */}
      <View style={styles.currentReadings}>
        <View style={styles.readingCard}>
          <Ionicons name="thermometer" size={32} color="#FF6B6B" />
          <Text style={styles.readingValue}>
            {room.temperature.toFixed(1)}°C
          </Text>
          <Text style={styles.readingLabel}>Temperature</Text>
        </View>
        
        <View style={styles.readingCard}>
          <Ionicons name="water" size={32} color="#4ECDC4" />
          <Text style={styles.readingValue}>
            {room.humidity.toFixed(1)}%
          </Text>
          <Text style={styles.readingLabel}>Humidity</Text>
        </View>

        <View style={styles.readingCard}>
          <Ionicons name="leaf" size={32} color="#45B7D1" />
          <Text style={styles.readingValue}>
            {room.air_quality}
          </Text>
          <Text style={styles.readingLabel}>Air Quality</Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Temperature History</Text>
        <LineChart
          data={{
            labels: readings.labels || [],
            datasets: [{
              data: readings.temperatures || [],
              color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
              strokeWidth: 2
            }]
          }}
          width={Dimensions.get('window').width - 32}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#FF6B6B'
            }
          }}
          bezier
          style={styles.chart}
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Humidity History</Text>
        <LineChart
          data={{
            labels: readings.labels || [],
            datasets: [{
              data: readings.humidities || [],
              color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
              strokeWidth: 2
            }]
          }}
          width={Dimensions.get('window').width - 32}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#4ECDC4'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Comfort Thresholds */}
      <View style={styles.thresholdsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Comfort Thresholds</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'checkmark' : 'pencil'} size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.thresholdRow}>
          <Text>Temperature Range (°C)</Text>
          <View style={styles.thresholdInputs}>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={thresholds.min_temp.toString()}
              onChangeText={text => setThresholds({...thresholds, min_temp: parseFloat(text) || 0})}
              editable={editing}
              keyboardType="numeric"
            />
            <Text> to </Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={thresholds.max_temp.toString()}
              onChangeText={text => setThresholds({...thresholds, max_temp: parseFloat(text) || 0})}
              editable={editing}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.thresholdRow}>
          <Text>Humidity Range (%)</Text>
          <View style={styles.thresholdInputs}>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={thresholds.min_humidity.toString()}
              onChangeText={text => setThresholds({...thresholds, min_humidity: parseFloat(text) || 0})}
              editable={editing}
              keyboardType="numeric"
            />
            <Text> to </Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={thresholds.max_humidity.toString()}
              onChangeText={text => setThresholds({...thresholds, max_humidity: parseFloat(text) || 0})}
              editable={editing}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.thresholdRow}>
          <Text>Max Air Quality Index</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={thresholds.max_aqi.toString()}
            onChangeText={text => setThresholds({...thresholds, max_aqi: parseFloat(text) || 0})}
            editable={editing}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.thresholdRow}>
          <Text>Notifications</Text>
          <Switch
            value={thresholds.notifications_enabled}
            onValueChange={value => setThresholds({...thresholds, notifications_enabled: value})}
            disabled={!editing}
          />
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveButton} onPress={updateThresholds}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentReadings: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  readingCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  readingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  readingLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chartSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  thresholdsSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  thresholdInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 4,
    width: 60,
    textAlign: 'center',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});