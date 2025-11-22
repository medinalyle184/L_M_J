import React from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet } from 'react-native';

const ThresholdEditor = ({ thresholds, onThresholdChange, onSave, editing }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comfort Thresholds</Text>
      
      <View style={styles.row}>
        <Text>Temperature Range (°C)</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, !editing && styles.disabled]}
            value={thresholds.min_temp?.toString()}
            onChangeText={(text) => onThresholdChange('min_temp', parseFloat(text))}
            editable={editing}
            keyboardType="numeric"
          />
          <Text> to </Text>
          <TextInput
            style={[styles.input, !editing && styles.disabled]}
            value={thresholds.max_temp?.toString()}
            onChangeText={(text) => onThresholdChange('max_temp', parseFloat(text))}
            editable={editing}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        <Text>Humidity Range (%)</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, !editing && styles.disabled]}
            value={thresholds.min_humidity?.toString()}
            onChangeText={(text) => onThresholdChange('min_humidity', parseFloat(text))}
            editable={editing}
            keyboardType="numeric"
          />
          <Text> to </Text>
          <TextInput
            style={[styles.input, !editing && styles.disabled]}
            value={thresholds.max_humidity?.toString()}
            onChangeText={(text) => onThresholdChange('max_humidity', parseFloat(text))}
            editable={editing}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        <Text>Notifications</Text>
        <Switch
          value={thresholds.notifications_enabled}
          onValueChange={(value) => onThresholdChange('notifications_enabled', value)}
          disabled={!editing}
        />
      </View>

      {editing && (
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  inputGroup: {
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
  disabled: {
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

export default ThresholdEditor;