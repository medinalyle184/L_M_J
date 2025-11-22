// App.js
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';

// Screens
import AlertsScreen from './screens/AlertsScreen';
import DashboardScreen from './screens/DashboardScreen';
import RoomDetailScreen from './screens/RoomDetailScreen';
import SensorSyncScreen from './screens/SensorSyncScreen';
import SettingsScreen from './screens/SettingsScreen';

// Services
import { setupNotifications } from './services/notificationService';
import { initDatabase } from './database/database.js';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const RoomStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
  </Stack.Navigator>
);

const App = () => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database first
        await initDatabase();
        
        // Then setup notifications
        await setupNotifications();
        
        // App is ready
        setAppReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppReady(true); // Still show app even if there's an error
      }
    };

    initializeApp();
  }, []);

  if (!appReady) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Alerts') {
              iconName = focused ? 'alert-circle' : 'alert-circle-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else if (route.name === 'Sync') {
              iconName = focused ? 'sync' : 'sync-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={RoomStack} />
        <Tab.Screen name="Alerts" component={AlertsScreen} />
        <Tab.Screen name="Sync" component={SensorSyncScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;