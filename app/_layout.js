import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    console.log('Temperature Tracker App Started');
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="room-detail" 
        options={{ 
          presentation: 'modal',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}