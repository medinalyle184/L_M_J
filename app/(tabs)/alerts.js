import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
} from 'react-native';

export default function AlertsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockAlerts = [
    {
      id: 1,
      room_id: 1,
      room_name: 'Living Room',
      message: 'Temperature too high (28.3°C)',
      type: 'temperature_high',
      value: 28.3,
      threshold: 26,
      handled: false,
      timestamp: new Date(),
      description: 'The temperature has exceeded the safe threshold. Consider turning on AC or opening windows.',
    },
    {
      id: 2,
      room_id: 2,
      room_name: 'Bedroom',
      message: 'Humidity too high (65%)',
      type: 'humidity_high',
      value: 65,
      threshold: 60,
      handled: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      description: 'Humidity levels are elevated. Try improving ventilation.',
    },
    {
      id: 3,
      room_id: 3,
      room_name: 'Kitchen',
      message: 'Temperature too low (16.2°C)',
      type: 'temperature_low',
      value: 16.2,
      threshold: 18,
      handled: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      description: 'Temperature is below the comfortable range. Check heating system.',
    },
  ];

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = () => {
    let filteredAlerts = mockAlerts;
    if (filter === 'unhandled') {
      filteredAlerts = mockAlerts.filter(alert => !alert.handled);
    } else if (filter === 'handled') {
      filteredAlerts = mockAlerts.filter(alert => alert.handled);
    }
    setAlerts(filteredAlerts);
  };

  const markAsHandled = (alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      Alert.alert(
        '✓ Mark Handled',
        `Are you sure you want to mark "${alert.message}" as handled?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Mark Handled',
            onPress: () => {
              const updatedAlerts = alerts.map(a =>
                a.id === alertId ? { ...a, handled: true } : a
              );
              setAlerts(updatedAlerts);
              Alert.alert('Success!', 'Alert marked as handled ✓', [{ text: 'OK' }]);
            }
          }
        ]
      );
    }
  };

  const deleteAlert = (alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      Alert.alert(
        '🗑️ Delete Alert',
        `Delete "${alert.message}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              const updatedAlerts = alerts.filter(a => a.id !== alertId);
              setAlerts(updatedAlerts);
              Alert.alert('Deleted!', 'Alert has been removed', [{ text: 'OK' }]);
            }
          }
        ]
      );
    }
  };

  const viewAlert = (alert) => {
    setSelectedAlert(alert);
    setModalVisible(true);
  };

  const getAlertGradient = (type) => {
    if (type.includes('high')) return ['#FEF3C7', '#FECACA'];
    if (type.includes('low')) return ['#CFFAFE', '#A5F3FC'];
    return ['#DCFCE7', '#BBF7D0'];
  };

  const getAlertColor = (type) => {
    if (type.includes('high')) return '#DC2626';
    if (type.includes('low')) return '#0369A1';
    return '#16A34A';
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'temperature_high': return 'thermometer';
      case 'temperature_low': return 'thermometer-outline';
      case 'humidity_high': return 'water';
      case 'humidity_low': return 'water-outline';
      default: return 'warning';
    }
  };

  const renderAlertItem = ({ item }) => (
    <LinearGradient
      colors={getAlertGradient(item.type)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.alertCard, item.handled && styles.alertCardHandled]}
    >
      <View style={styles.alertContent}>
        <View style={styles.alertIconContainer}>
          <Ionicons
            name={getAlertIcon(item.type)}
            size={24}
            color={getAlertColor(item.type)}
          />
        </View>

        <View style={styles.alertBody}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertMessage}>{item.message}</Text>
            <Text style={styles.alertTime}>
              {item.timestamp.toLocaleTimeString()}
            </Text>
          </View>

          <View style={styles.alertDetails}>
            <Text style={styles.detailText}>📍 {item.room_name}</Text>
            <Text style={styles.detailText}>
              Threshold: {item.threshold}{item.type.includes('temperature') ? '°C' : '%'}
            </Text>
          </View>

          <View style={styles.alertActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.viewBtn]}
              onPress={() => viewAlert(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="eye" size={14} color="white" />
              <Text style={styles.actionBtnText}>View</Text>
            </TouchableOpacity>

            {!item.handled && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.handleBtn]}
                onPress={() => markAsHandled(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle" size={14} color="white" />
                <Text style={styles.actionBtnText}>Handle</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => deleteAlert(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color="white" />
              <Text style={styles.actionBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const alertStats = {
    total: mockAlerts.length,
    unhandled: mockAlerts.filter(alert => !alert.handled).length,
    handled: mockAlerts.filter(alert => alert.handled).length,
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#065F46', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Alerts</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>{alertStats.unhandled}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.filterContainer}
        horizontal
        showsHorizontalScrollIndicator={true}
      >
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({alertStats.total})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'unhandled' && styles.filterButtonActive]}
          onPress={() => setFilter('unhandled')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === 'unhandled' && styles.filterTextActive]}>
            Active ({alertStats.unhandled})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'handled' && styles.filterButtonActive]}
          onPress={() => setFilter('handled')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === 'handled' && styles.filterTextActive]}>
            Resolved ({alertStats.handled})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No alerts</Text>
            <Text style={styles.emptyStateSubText}>All systems running smoothly!</Text>
          </View>
        }
      />

      {/* Alert Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#065F46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Alert Details</Text>
            <View style={{ width: 24 }} />
          </LinearGradient>

          {selectedAlert && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name={getAlertIcon(selectedAlert.type)} size={40} color={getAlertColor(selectedAlert.type)} />
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.detailTitle}>{selectedAlert.message}</Text>
                    <Text style={styles.detailSubtitle}>{selectedAlert.room_name}</Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Current Value</Text>
                  <Text style={styles.infoValue}>{selectedAlert.value}</Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Threshold</Text>
                  <Text style={styles.infoValue}>{selectedAlert.threshold}</Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoDescription}>{selectedAlert.description}</Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <View style={[styles.statusTag, { backgroundColor: selectedAlert.handled ? '#DCFCE7' : '#FEE2E2' }]}>
                    <Ionicons name={selectedAlert.handled ? 'checkmark-circle' : 'alert-circle'} size={16} color={selectedAlert.handled ? '#10B981' : '#EF4444'} />
                    <Text style={[styles.statusText, { color: selectedAlert.handled ? '#10B981' : '#EF4444' }]}>
                      {selectedAlert.handled ? 'Handled' : 'Active'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Close Details</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  badgeContainer: {
    backgroundColor: '#DC2626',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  alertCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  alertCardHandled: {
    opacity: 0.6,
  },
  alertContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBody: {
    flex: 1,
  },
  alertHeader: {
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  alertDetails: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  handleBtn: {
    backgroundColor: '#10B981',
  },
  viewBtn: {
    backgroundColor: '#0EA5E9',
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
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
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  infoDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});