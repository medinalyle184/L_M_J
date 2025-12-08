import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../supabase';

export default function DashboardScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('User');
  const [userId, setUserId] = useState(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
      loadRooms();
    }, [])
  );

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [subscription]);

  const loadProfileData = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.log('No active session');
        setLoading(false);
        return;
      }

      const user = session.user;
      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Fetching profile:', error.message);
      }

      if (data) {
        setProfileImage(data.profile_image || null);
        setUserName(data.full_name || 'User');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadRooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setRooms([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.log('Error loading rooms:', error.message);
        setRooms([]);
      } else {
        setRooms(data || []);
      }

      // Setup real-time subscription
      setupRealtime(session.user.id);
    } catch (error) {
      console.log('Loading rooms error:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = (userId) => {
    // Unsubscribe from previous subscription if it exists
    if (subscription) {
      subscription.unsubscribe();
    }

    const channel = supabase
      .channel(`rooms:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRooms(prevRooms => [payload.new, ...prevRooms]);
          } else if (payload.eventType === 'UPDATE') {
            setRooms(prevRooms =>
              prevRooms.map(room =>
                room.id === payload.new.id ? payload.new : room
              )
            );
            if (selectedRoom && selectedRoom.id === payload.new.id) {
              setSelectedRoom(payload.new);
            }
          } else if (payload.eventType === 'DELETE') {
            setRooms(prevRooms =>
              prevRooms.filter(room => room.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    setSubscription(channel);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const saveAlertToSupabase = async (alertData) => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert([{
          user_id: userId,
          type: alertData.type,
          message: alertData.message,
          room_name: alertData.room_name,
          value: alertData.value,
          threshold: alertData.threshold,
          description: alertData.description,
          handled: false,
        }]);

      if (error) {
        console.error('Error saving alert to Supabase:', error);
        return false;
      }
      
      console.log('Alert saved to Supabase:', data);
      return true;
    } catch (error) {
      console.error('Error saving alert:', error);
      return false;
    }
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a room name', [{ text: 'OK' }]);
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated', [{ text: 'OK' }]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([
          {
            user_id: userId,
            name: newRoomName.trim(),
            temperature: 22,
            humidity: 50,
            air_quality: 50,
            status: 'comfortable',
          }
        ])
        .select();

      if (error) {
        Alert.alert('Error', 'Failed to add room: ' + error.message);
        return;
      }

      // Save alert to Supabase
      const alertSaved = await saveAlertToSupabase({
        type: 'room_added',
        message: `Room "${newRoomName.trim()}" added successfully`,
        room_name: newRoomName.trim(),
        value: '22',
        threshold: null,
        description: `New room added with initial temperature of 22°C and humidity at 50%. Start monitoring this room's environmental conditions.`
      });

      setShowAddRoom(false);
      const roomNameCopy = newRoomName;
      setNewRoomName('');
      
      if (alertSaved) {
        Alert.alert('Success', `Room "${roomNameCopy}" added! Alert has been logged.`, [{ text: 'OK' }]);
      } else {
        Alert.alert('Partial Success', `Room "${roomNameCopy}" added but alert logging failed.`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error adding room:', error);
      Alert.alert('Error', 'Failed to add room');
    }
  };

  const deleteRoom = async (roomId, roomName) => {
    Alert.alert(
      'Delete Room',
      `Delete "${roomName}" permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('rooms')
                .delete()
                .eq('id', roomId)
                .eq('user_id', userId);

              if (error) {
                Alert.alert('Error', 'Failed to delete room');
                return;
              }

              // Save delete alert to Supabase
              const alertSaved = await saveAlertToSupabase({
                type: 'room_deleted',
                message: `Room "${roomName}" has been deleted`,
                room_name: roomName,
                value: null,
                threshold: null,
                description: `Room "${roomName}" was removed from your dashboard.`
              });

              setRoomModalVisible(false);
              
              if (alertSaved) {
                Alert.alert('Deleted', 'Room removed from dashboard', [{ text: 'OK' }]);
              } else {
                Alert.alert('Deleted', 'Room removed but alert logging failed', [{ text: 'OK' }]);
              }
            } catch (error) {
              console.error('Error deleting room:', error);
              Alert.alert('Error', 'Failed to delete room');
            }
          }
        }
      ]
    );
  };

  const viewRoomDetails = (room) => {
    setSelectedRoom(room);
    setRoomModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'comfortable': return ['#10B981', '#059669'];
      case 'warning': return ['#F59E0B', '#D97706'];
      case 'critical': return ['#EF4444', '#DC2626'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  const getDisplayInitials = () => {
    if (!userName || userName === 'User') return 'U';
    const names = userName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const renderRoomItem = ({ item }) => {
    const [startColor, endColor] = getStatusColor(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => viewRoomDetails(item)}
      >
        <LinearGradient
          colors={[startColor, endColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.roomCard}
        >
          <View style={styles.cardContent}>
            <View style={styles.roomHeader}>
              <View>
                <Text style={styles.roomName}>{item.name}</Text>
                <Text style={styles.statusLabel}>{item.status.toUpperCase()}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => deleteRoom(item.id, item.name)}
                style={styles.deleteIconContainer}
              >
                <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>

            <View style={styles.roomData}>
              <View style={styles.dataItem}>
                <Ionicons name="thermometer" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.dataLabel}>Temp</Text>
                <Text style={styles.dataValue}>{item.temperature.toFixed(1)}°</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.dataItem}>
                <Ionicons name="water" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.dataLabel}>Humidity</Text>
                <Text style={styles.dataValue}>{item.humidity.toFixed(0)}%</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.dataItem}>
                <Ionicons name="leaf" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.dataLabel}>AQI</Text>
                <Text style={styles.dataValue}>{item.air_quality}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.timeText}>
                {item.updated_at ? new Date(item.updated_at).toLocaleTimeString() : 'N/A'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="home" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Rooms Yet</Text>
      <Text style={styles.emptySubtitle}>Add your first room to get started</Text>
      <TouchableOpacity 
        style={styles.emptyAddButton}
        onPress={() => setShowAddRoom(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={20} color="white" />
        <Text style={styles.emptyAddButtonText}>Add Room</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#065F46', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Room Monitor</Text>
              <Text style={styles.headerSubtitle}>Manage your rooms</Text>
            </View>
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
          <View>
            <Text style={styles.greeting}>Room Monitor</Text>
            <Text style={styles.headerSubtitle}>Manage your rooms</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            style={styles.profileIcon}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileInitials}>
                <Text style={styles.profileInitialsText}>{getDisplayInitials()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {rooms.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Your Rooms ({rooms.length})</Text>
            <TouchableOpacity 
              onPress={() => setShowAddRoom(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={28} color="#10B981" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={rooms}
            renderItem={renderRoomItem}
            keyExtractor={item => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#10B981"
              />
            }
            contentContainerStyle={styles.listContent}
            scrollEventThrottle={16}
          />
        </>
      )}

      {/* Add Room Modal */}
      <Modal
        visible={showAddRoom}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddRoom(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#065F46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <TouchableOpacity onPress={() => setShowAddRoom(false)}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Room</Text>
            <View style={{ width: 24 }} />
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <View style={styles.addRoomForm}>
              <Text style={styles.formLabel}>Room Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Living Room, Bedroom, Kitchen, Office, Garage..."
                value={newRoomName}
                onChangeText={setNewRoomName}
                autoFocus
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.formHint}>You can add any room type you want</Text>

              <View style={styles.formButtons}>
                <TouchableOpacity 
                  onPress={() => setShowAddRoom(false)} 
                  style={styles.formCancelButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.formCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleAddRoom} 
                  style={styles.formSubmitButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={styles.formSubmitButtonText}>Add Room</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Room Details Modal */}
      <Modal
        visible={roomModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRoomModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#065F46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <TouchableOpacity onPress={() => setRoomModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Room Details</Text>
            <View style={{ width: 24 }} />
          </LinearGradient>

          {selectedRoom && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.roomDetailsCard}>
                <View style={styles.roomDetailsHeader}>
                  <Text style={styles.roomCardTitle}>{selectedRoom.name}</Text>
                  <TouchableOpacity 
                    onPress={() => deleteRoom(selectedRoom.id, selectedRoom.name)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.statGrid}>
                  <View style={styles.statBox}>
                    <Ionicons name="thermometer" size={24} color="#FF6B6B" />
                    <Text style={styles.statLabel}>Temperature</Text>
                    <Text style={styles.statValue}>{selectedRoom.temperature}°C</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Ionicons name="water" size={24} color="#4ECDC4" />
                    <Text style={styles.statLabel}>Humidity</Text>
                    <Text style={styles.statValue}>{selectedRoom.humidity}%</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Ionicons name="leaf" size={24} color="#10B981" />
                    <Text style={styles.statLabel}>Air Quality</Text>
                    <Text style={styles.statValue}>{selectedRoom.air_quality}</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    <Text style={styles.statLabel}>Status</Text>
                    <Text style={[styles.statValue, { fontSize: 14, textTransform: 'capitalize' }]}>
                      {selectedRoom.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>Last Updated</Text>
                  <Text style={styles.infoValue}>
                    {selectedRoom.updated_at ? new Date(selectedRoom.updated_at).toLocaleString() : 'N/A'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeModal}
                  onPress={() => setRoomModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeModalText}>Close</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  profileIcon: {
    padding: 4,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  profileInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitialsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  roomCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    padding: 20,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  statusLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  deleteIconContainer: {
    padding: 4,
  },
  roomData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  dataItem: {
    alignItems: 'center',
    flex: 1,
  },
  dataLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyAddButton: {
    marginTop: 24,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    padding: 20,
  },
  addRoomForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  formHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  formCancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  formSubmitButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  formSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  roomDetailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  roomDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roomCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeModal: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});