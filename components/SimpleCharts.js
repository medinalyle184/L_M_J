import { StyleSheet, Text, View } from 'react-native';

const SimpleChart = ({ data, labels, height = 200, color = '#007AFF' }) => {
  
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noData}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisText}>{maxValue.toFixed(1)}</Text>
          <Text style={styles.axisText}>{((maxValue + minValue) / 2).toFixed(1)}</Text>
          <Text style={styles.axisText}>{minValue.toFixed(1)}</Text>
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
          
          {/* Data points and lines */}
          <View style={styles.dataLine}>
            {data.map((value, index) => {
              const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
              return (
                <View key={index} style={styles.dataPointContainer}>
                  <View 
                    style={[
                      styles.dataPoint,
                      { 
                        backgroundColor: color,
                        left: `${(index / (data.length - 1)) * 100}%`,
                        bottom: `${isNaN(percentage) ? 0 : percentage}%`
                      }
                    ]} 
                  />
                  {index > 0 && (
                    <View 
                      style={[
                        styles.lineSegment,
                        {
                          backgroundColor: color,
                          left: `${((index - 1) / (data.length - 1)) * 100}%`,
                          width: `${100 / (data.length - 1)}%`,
                          bottom: `${((data[index - 1] - minValue) / (maxValue - minValue)) * 100}%`,
                          height: `${Math.abs(((value - data[index - 1]) / (maxValue - minValue)) * 100)}%`,
                          transform: [{ rotate: `${Math.atan2(value - data[index - 1], 1) * (180 / Math.PI)}deg` }]
                        }
                      ]} 
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {labels.map((label, index) => (
          <Text key={index} style={styles.axisText}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  yAxis: {
    justifyContent: 'space-between',
    marginRight: 8,
    paddingVertical: 8,
  },
  axisText: {
    fontSize: 10,
    color: '#666',
  },
  chartArea: {
    flex: 1,
    justifyContent: 'space-between',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  dataLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  dataPointContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ translateX: -4 }, { translateY: 4 }],
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});

export default SimpleChart;