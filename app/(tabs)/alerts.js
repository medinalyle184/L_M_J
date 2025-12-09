import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../supabase';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [subscription, setSubscription] = useState(null);
  
  // Sync modal states
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('ready');

  useFocusEffect(
    useCallback(() => {
      loadUserAndAlerts();
    }, [])
  );

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [subscription]);

  const loadUserAndAlerts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        await loadAlerts(session.user.id);
        setupRealtime(session.user.id);
      } else {
        setAlerts([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setLoading(false);
    }
  };

  const loadAlerts = async (uid) => {
    try {
      let query = supabase
        .from('alerts')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (filter === 'unhandled') {
        query = query.eq('handled', false);
      } else if (filter === 'handled') {
        query = query.eq('handled', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading alerts:', error);
        setAlerts([]);
      } else {
        setAlerts(data || []);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = (uid) => {
    if (subscription) {
      subscription.unsubscribe();
    }

    const channel = supabase
      .channel(`alerts:${uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${uid}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts(prevAlerts => [payload.new, ...prevAlerts]);
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prevAlerts =>
              prevAlerts.map(alert =>
                alert.id === payload.new.id ? payload.new : alert
              )
            );
            if (selectedAlert && selectedAlert.id === payload.new.id) {
              setSelectedAlert(payload.new);
            }
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prevAlerts =>
              prevAlerts.filter(alert => alert.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    setSubscription(channel);
  };

  useEffect(() => {
    if (userId) {
      loadAlerts(userId);
    }
  }, [filter]);

  const markAsHandled = async (alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      Alert.alert(
        'Mark Handled',
        `Are you sure you want to mark "${alert.message}" as handled?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Mark Handled',
            onPress: async () => {
              try {
                const { error } = await supabase
                  .from('alerts')
                  .update({ handled: true })
                  .eq('id', alertId)
                  .eq('user_id', userId);

                if (error) {
                  Alert.alert('Error', 'Failed to update alert');
                  return;
                }

                await loadAlerts(userId);
                Alert.alert('Success', 'Alert marked as handled', [{ text: 'OK' }]);
              } catch (error) {
                console.error('Error marking alert as handled:', error);
                Alert.alert('Error', 'Failed to update alert');
              }
            }
          }
        ]
      );
    }
  };

  const deleteAlert = async (alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      Alert.alert(
        'Delete Alert',
        `Delete "${alert.message}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const { error } = await supabase
                  .from('alerts')
                  .delete()
                  .eq('id', alertId)
                  .eq('user_id', userId);

                if (error) {
                  Alert.alert('Error', 'Failed to delete alert');
                  return;
                }

                await loadAlerts(userId);
                Alert.alert('Success', 'Alert has been removed', [{ text: 'OK' }]);
              } catch (error) {
                console.error('Error deleting alert:', error);
                Alert.alert('Error', 'Failed to delete alert');
              }
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

  // Sync functions
  const scanForDevices = () => {
    setScanning(true);
    setSyncStatus('scanning');
    
    setTimeout(() => {
      setScanning(false);
      setSyncStatus('ready');
      Alert.alert('✓ Scan Complete', 'Found 3 devices and connected successfully!');
    }, 3000);
  };

  const refreshAllData = () => {
    setRefreshing(true);
    setSyncStatus('syncing');
    
    setTimeout(() => {
      setRefreshing(false);
      setSyncStatus('ready');
      Alert.alert('✓ Sync Complete', 'All sensor data refreshed successfully!');
    }, 2000);
  };

  const getAlertGradient = (alert) => {
    if (alert.type === 'room_added') return ['#DCFCE7', '#BBF7D0'];
    if (alert.type === 'room_deleted') return ['#FEE2E2', '#FECACA'];
    
    if (alert.type.includes('temperature')) {
      if (alert.type.includes('high')) return ['#FEF3C7', '#FECACA'];
      if (alert.type.includes('low')) return ['#CFFAFE', '#A5F3FC'];
    }
    
    if (alert.type.includes('humidity')) {
      if (alert.type.includes('high')) return ['#FEF3C7', '#FECACA'];
      if (alert.type.includes('low')) return ['#CFFAFE', '#A5F3FC'];
    }
    
    return ['#F3F4F6', '#E5E7EB'];
  };

  const getAlertColor = (alert) => {
    if (alert.type === 'room_added') return '#16A34A';
    if (alert.type === 'room_deleted') return '#DC2626';
    if (alert.type.includes('high')) return '#DC2626';
    if (alert.type.includes('low')) return '#0369A1';
    return '#6B7280';
  };

  const getAlertIcon = (alert) => {
    switch (alert.type) {
      case 'room_added':
        return 'home';
      case 'room_deleted':
        return 'home-outline';
      case 'temperature_high':
        return 'thermometer';
      case 'temperature_low':
        return 'thermometer-outline';
      case 'humidity_high':
        return 'water';
      case 'humidity_low':
        return 'water-outline';
      case 'air_quality_alert':
        return 'leaf';
      default:
        return 'warning';
    }
  };

  const getAlertValueText = (alert) => {
    if (alert.type === 'room_added' || alert.type === 'room_deleted') {
      return alert.value ? `${alert.value}°C` : 'N/A';
    }
    
    if (alert.type.includes('temperature')) {
      return `${alert.value}°C`;
    }
    
    if (alert.type.includes('humidity') || alert.type.includes('air_quality')) {
      return `${alert.value}%`;
    }
    
    return alert.value || 'N/A';
  };

  const DeviceItem = ({ icon, name, ip, status, color }) => (
    <View style={styles.deviceItem}>
      <View style={[styles.deviceIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{name}</Text>
        <Text style={styles.deviceIp}>{ip}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: status === 'Connected' || status === 'Online' ? '#D1FAE5' : '#FEE2E2' }]}>
        <View style={[styles.statusDot, { backgroundColor: status === 'Connected' || status === 'Online' ? '#10B981' : '#EF4444' }]} />
        <Text style={[styles.statusText, { color: status === 'Connected' || status === 'Online' ? '#065F46' : '#7F1D1D' }]}>
          {status}
        </Text>
      </View>
    </View>
  );

  const renderAlertItem = ({ item }) => {
    const gradientColors = getAlertGradient(item);
    const alertColor = getAlertColor(item);
    const iconName = getAlertIcon(item);
    const valueText = getAlertValueText(item);

    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.alertCard, item.handled && styles.alertCardHandled]}
      >
        <View style={styles.alertContent}>
          <View style={styles.alertIconContainer}>
            <Ionicons
              name={iconName}
              size={24}
              color={alertColor}
            />
          </View>

          <View style={styles.alertBody}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertMessage}>{item.message}</Text>
              <Text style={styles.alertTime}>
                {new Date(item.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>

            <View style={styles.alertDetails}>
              <Text style={styles.detailText}>📍 {item.room_name}</Text>
              {item.type !== 'room_added' && item.type !== 'room_deleted' && item.threshold && (
                <Text style={styles.detailText}>
                  Threshold: {item.threshold}
                  {item.type.includes('temperature') ? '°C' : '%'}
                </Text>
              )}
              <Text style={styles.detailText}>
                Value: {valueText}
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
  };

  const alertStats = {
    total: alerts.length,
    unhandled: alerts.filter(alert => !alert.handled).length,
    handled: alerts.filter(alert => alert.handled).length,
  };

  if (loading && alerts.length === 0) {
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
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#065F46', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Alerts</Text>
            {alertStats.unhandled > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badge}>{alertStats.unhandled}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowSyncModal(true)}
            style={styles.syncIcon}
          >
            <Ionicons name="sync" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.filterContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
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
            <Text style={styles.emptyStateText}>No alerts yet</Text>
            <Text style={styles.emptyStateSubText}>
              Alerts will appear here when you add rooms or when conditions exceed thresholds
            </Text>
          </View>
        }
        refreshing={loading}
        onRefresh={() => userId && loadAlerts(userId)}
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
                  <Ionicons 
                    name={getAlertIcon(selectedAlert)} 
                    size={40} 
                    color={getAlertColor(selectedAlert)} 
                  />
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.detailTitle}>{selectedAlert.message}</Text>
                    <Text style={styles.detailSubtitle}>{selectedAlert.room_name}</Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>
                    {selectedAlert.type.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Current Value</Text>
                  <Text style={styles.infoValue}>{getAlertValueText(selectedAlert)}</Text>
                </View>

                {selectedAlert.threshold && (
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Threshold</Text>
                    <Text style={styles.infoValue}>
                      {selectedAlert.threshold}
                      {selectedAlert.type.includes('temperature') ? '°C' : '%'}
                    </Text>
                  </View>
                )}

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoDescription}>{selectedAlert.description}</Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <View style={[styles.statusTag, { 
                    backgroundColor: selectedAlert.handled ? '#DCFCE7' : '#FEE2E2' 
                  }]}>
                    <Ionicons 
                      name={selectedAlert.handled ? 'checkmark-circle' : 'alert-circle'} 
                      size={16} 
                      color={selectedAlert.handled ? '#10B981' : '#EF4444'} 
                    />
                    <Text style={[styles.statusText, { 
                      color: selectedAlert.handled ? '#10B981' : '#EF4444' 
                    }]}>
                      {selectedAlert.handled ? 'Handled' : 'Active'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Timestamp</Text>
                  <Text style={styles.infoDescription}>
                    {new Date(selectedAlert.created_at).toLocaleString()}
                  </Text>
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

      {/* Sync Modal */}
      <Modal
        visible={showSyncModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSyncModal(false)}
      >
        <ScrollView style={styles.syncModalContainer} showsVerticalScrollIndicator={true}>
          <LinearGradient
            colors={['#065F46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.syncHeader}
          >
            <View style={styles.syncHeaderContent}>
              <TouchableOpacity onPress={() => setShowSyncModal(false)}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.syncHeaderTextContainer}>
                <Text style={styles.syncHeaderTitle}>Sensor Sync</Text>
                <Text style={styles.syncHeaderSubtitle}>Manage device connections</Text>
              </View>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDotLarge, { backgroundColor: syncStatus === 'ready' ? '#10B981' : '#F59E0B' }]} />
              <Text style={styles.statusTextLarge}>
                {syncStatus === 'ready' ? 'Ready' : syncStatus === 'scanning' ? 'Scanning...' : 'Syncing...'}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.syncContent}>
            {/* Bluetooth Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconBadge}>
                  <Ionicons name="bluetooth" size={24} color="#0EA5E9" />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.sectionTitle}>Bluetooth Devices</Text>
                  <Text style={styles.sectionDescription}>ESP32 BLE Sensors</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, styles.bluetoothButton, scanning && styles.buttonDisabled]}
                onPress={scanForDevices}
                disabled={scanning}
                activeOpacity={0.8}
              >
                {scanning ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={styles.buttonText}>Scanning...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="bluetooth" size={20} color="white" />
                    <Text style={styles.buttonText}>Scan for Devices</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.deviceList}>
                <Text style={styles.listTitle}>Available Devices</Text>
                <DeviceItem
                  icon="bluetooth"
                  name="ESP32_LivingRoom"
                  ip="MAC: 4C:11:AE:10:39:F2"
                  status="Connected"
                  color="#0EA5E9"
                />
                <DeviceItem
                  icon="bluetooth"
                  name="ESP32_Kitchen"
                  ip="MAC: 5D:22:BF:21:40:G3"
                  status="Disconnected"
                  color="#6B7280"
                />
              </View>
            </View>

            {/* WiFi Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconBadge}>
                  <Ionicons name="wifi" size={24} color="#10B981" />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.sectionTitle}>WiFi Sensors</Text>
                  <Text style={styles.sectionDescription}>Network Connected</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, styles.wifiButton, refreshing && styles.buttonDisabled]}
                onPress={refreshAllData}
                disabled={refreshing}
                activeOpacity={0.8}
              >
                {refreshing ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={styles.buttonText}>Refreshing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text style={styles.buttonText}>Refresh All Data</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.deviceList}>
                <Text style={styles.listTitle}>Connected Sensors</Text>
                <DeviceItem
                  icon="wifi"
                  name="Bedroom Sensor"
                  ip="192.168.1.101"
                  status="Online"
                  color="#10B981"
                />
                <DeviceItem
                  icon="wifi"
                  name="Office Sensor"
                  ip="192.168.1.102"
                  status="Online"
                  color="#10B981"
                />
              </View>
            </View>

            {/* System Health */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconBadge}>
                  <Ionicons name="pulse" size={24} color="#F59E0B" />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.sectionTitle}>System Health</Text>
                  <Text style={styles.sectionDescription}>Overall Status</Text>
                </View>
              </View>

              <View style={styles.statusGrid}>
                <View style={styles.statusCard}>
                  <View style={styles.statusCardContent}>
                    <View style={[styles.statusCardIcon, { backgroundColor: '#DBEAFE' }]}>
                      <Ionicons name="bluetooth" size={24} color="#0EA5E9" />
                    </View>
                    <Text style={styles.statusCardLabel}>BLE</Text>
                    <Text style={styles.statusCardValue}>2</Text>
                  </View>
                </View>

                <View style={styles.statusCard}>
                  <View style={styles.statusCardContent}>
                    <View style={[styles.statusCardIcon, { backgroundColor: '#DCFCE7' }]}>
                      <Ionicons name="wifi" size={24} color="#10B981" />
                    </View>
                    <Text style={styles.statusCardLabel}>WiFi</Text>
                    <Text style={styles.statusCardValue}>2</Text>
                  </View>
                </View>

                <View style={styles.statusCard}>
                  <View style={styles.statusCardContent}>
                    <View style={[styles.statusCardIcon, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="time" size={24} color="#F59E0B" />
                    </View>
                    <Text style={styles.statusCardLabel}>Last</Text>
                    <Text style={styles.statusCardValue}>5m</Text>
                  </View>
                </View>

                <View style={styles.statusCard}>
                  <View style={styles.statusCardContent}>
                    <View style={[styles.statusCardIcon, { backgroundColor: '#DCFCE7' }]}>
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    </View>
                    <Text style={styles.statusCardLabel}>Status</Text>
                    <Text style={styles.statusCardValue}>OK</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statusDetails}>
                <View style={styles.statusDetailRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.statusDetailText}>All sensors connected</Text>
                </View>
                <View style={styles.statusDetailRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.statusDetailText}>Data syncing in real-time</Text>
                </View>
                <View style={styles.statusDetailRow}>
                  <Ionicons name="information-circle" size={20} color="#0EA5E9" />
                  <Text style={styles.statusDetailText}>Next sync: 5 minutes</Text>
                </View>
              </View>
            </View>

            {/* Tips Section */}
            <View style={styles.section}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={24} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Tips</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>1</Text>
                <Text style={styles.tipText}>Keep sensors powered and within Bluetooth/WiFi range</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>2</Text>
                <Text style={styles.tipText}>Use 2.4GHz WiFi for best connectivity</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>3</Text>
                <Text style={styles.tipText}>Restart router if devices won't connect</Text>
              </View>
            </View>

            <View style={styles.spacer} />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  badgeContainer: {
    backgroundColor: '#DC2626',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  syncIcon: {
    padding: 4,
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
    flexGrow: 1,
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
    paddingHorizontal: 20,
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
    textAlign: 'center',
    lineHeight: 20,
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
  // Sync Modal Styles
  syncModalContainer: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  syncHeader: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingTop: 40,
    marginBottom: 16,
  },
  syncHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  syncHeaderTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  syncHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  syncHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusTextLarge: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  syncContent: {
    flex: 1,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
  },
  bluetoothButton: {
    backgroundColor: '#0EA5E9',
  },
  wifiButton: {
    backgroundColor: '#10B981',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  deviceList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  deviceIp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  statusCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  statusCardContent: {
    alignItems: 'center',
  },
  statusCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusDetails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
  },
  statusDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDetailText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginTop: 2,
  },
  spacer: {
    height: 20,
  },
});