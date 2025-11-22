// services/sensorService.js
import { BleManager } from 'react-native-ble-plx';
import axios from 'axios';

class SensorService {
  constructor() {
    this.bleManager = new BleManager();
    this.connectedDevices = new Map();
  }

  // BLE Methods
  scanForDevices = () => {
    return new Promise((resolve, reject) => {
      const devices = [];
      
      this.bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          reject(error);
          return;
        }
        
        if (device.name && device.name.includes('ESP32')) {
          devices.push(device);
        }
      });

      // Stop scanning after 10 seconds
      setTimeout(() => {
        this.bleManager.stopDeviceScan();
        resolve(devices);
      }, 10000);
    });
  };

  connectToDevice = async (deviceId) => {
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevices.set(deviceId, device);
      return device;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  };

  // WiFi API Methods
  fetchDataFromWiFi = async (ipAddress) => {
    try {
      const response = await axios.get(`http://${ipAddress}/sensor-data`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      console.error('WiFi API error:', error);
      throw error;
    }
  };

  // Generic data fetch method
  fetchSensorData = async (room) => {
    try {
      let data;
      
      if (room.connection_type === 'BLE') {
        const device = this.connectedDevices.get(room.mac_address);
        if (!device) {
          throw new Error('Device not connected');
        }
        // Implement BLE characteristic reading here
        // This is a simplified example
        data = await this.readBLEData(device);
      } else if (room.connection_type === 'WiFi') {
        data = await this.fetchDataFromWiFi(room.ip_address);
      }
      
      return this.parseSensorData(data, room.sensor_type);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      throw error;
    }
  };

  parseSensorData = (rawData, sensorType) => {
    // Parse data based on sensor type (DHT22, BME280, etc.)
    switch (sensorType) {
      case 'DHT22':
        return {
          temperature: rawData.temperature,
          humidity: rawData.humidity,
        };
      case 'BME280':
        return {
          temperature: rawData.temperature,
          humidity: rawData.humidity,
          pressure: rawData.pressure,
          air_quality: this.calculateAQI(rawData),
        };
      default:
        return rawData;
    }
  };

  calculateAQI = (data) => {
    // Simplified AQI calculation
    // In a real app, you'd use proper AQI formulas
    return Math.random() * 150; // Example value
  };
}

export default new SensorService();