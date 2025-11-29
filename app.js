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

// Auth Screens
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';

// Services
import initDatabase from './database/initDatabase.js';
import { setupNotifications } from './services/notificationService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const RoomStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
  </Stack.Navigator>
);

const AuthStack = ({ onLogin }) => (
  <Stack.Navigator>
    <Stack.Screen name="Login" options={{ headerShown: false }}>
      {(props) => <LoginScreen {...props} onLogin={onLogin} />}
    </Stack.Screen>
    <Stack.Screen name="Signup" options={{ headerShown: false }}>
      {(props) => <SignupScreen {...props} onLogin={onLogin} />}
    </Stack.Screen>
  </Stack.Navigator>
);

const MainTabs = () => (
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
);

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase();
        await setupNotifications();
        setAppReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppReady(true);
      }
    };
    initializeApp();
  }, []);

  const handleLogin = (email) => {
    setUser({ email });
  };

  if (!appReady) {
    return null;
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainTabs />
      ) : (
        <AuthStack onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
};

export default App;

