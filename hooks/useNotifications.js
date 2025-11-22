import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const useNotifications = () => {
  const [permission, setPermission] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for notification responses
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    setPermission(finalStatus);
    
    try {
      const projectId = "your-expo-project-id"; // You'll need to set this
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (error) {
      token = (await Notifications.getExpoPushTokenAsync()).data;
    }

    return token;
  };

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermission(status);
    return status;
  };

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermission(status);
    return status;
  };

  const scheduleNotification = async (title, body, data = {}, trigger = null) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const getNotificationSettings = async () => {
    return await Notifications.getPermissionsAsync();
  };

  return {
    permission,
    expoPushToken,
    notification,
    checkPermission,
    requestPermission,
    scheduleNotification,
    cancelAllNotifications,
    getNotificationSettings,
  };
};

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    inAppEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Here you would typically save to AsyncStorage or your database
  }, []);

  return {
    settings,
    updateSettings,
  };
};