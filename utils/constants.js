// App constants
export const DEFAULT_THRESHOLDS = {
  min_temp: 18,
  max_temp: 26,
  min_humidity: 30,
  max_humidity: 70,
  max_aqi: 100,
  notifications_enabled: true,
};

export const SENSOR_TYPES = {
  DHT22: 'DHT22',
  BME280: 'BME280',
};

export const CONNECTION_TYPES = {
  WIFI: 'WiFi',
  BLE: 'BLE',
};

export const ALERT_TYPES = {
  TEMPERATURE_HIGH: 'temperature_high',
  TEMPERATURE_LOW: 'temperature_low',
  HUMIDITY_HIGH: 'humidity_high',
  HUMIDITY_LOW: 'humidity_low',
};