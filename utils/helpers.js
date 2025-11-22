// Utility functions
export const calculateRoomStatus = (room) => {
  if (!room.temperature || !room.humidity) return 'unknown';

  const tempStatus = room.temperature < room.min_temp || room.temperature > room.max_temp ? 'critical' : 
                   room.temperature < room.min_temp + 2 || room.temperature > room.max_temp - 2 ? 'warning' : 'comfortable';
  
  const humidityStatus = room.humidity < room.min_humidity || room.humidity > room.max_humidity ? 'critical' :
                       room.humidity < room.min_humidity + 5 || room.humidity > room.max_humidity - 5 ? 'warning' : 'comfortable';

  if (tempStatus === 'critical' || humidityStatus === 'critical') return 'critical';
  if (tempStatus === 'warning' || humidityStatus === 'warning') return 'warning';
  return 'comfortable';
};

export const formatTemperature = (temp, unit = 'C') => {
  if (temp == null) return '--';
  return `${temp.toFixed(1)}°${unit}`;
};

export const formatHumidity = (humidity) => {
  if (humidity == null) return '--';
  return `${humidity.toFixed(1)}%`;
};

export const prepareChartData = (readings, type = 'temperature') => {
  const recentReadings = readings.slice(0, 24).reverse();
  
  return {
    labels: recentReadings.map((_, index) => 
      index % 6 === 0 ? new Date(recentReadings[index].timestamp).getHours() + 'h' : ''
    ),
    datasets: [
      {
        data: recentReadings.map(r => r[type]),
        color: () => type === 'temperature' ? '#FF6B6B' : '#4ECDC4',
        strokeWidth: 2,
      },
    ],
  };
};