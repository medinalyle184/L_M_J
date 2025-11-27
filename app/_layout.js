'use client';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginSignupScreen from './login';

function RootLayoutContent() {
  const { user, login } = useAuth();

  if (!user) {
    return <LoginSignupScreen onLogin={login} />;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="room-detail"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    console.log('Temperature Tracker App Started');
  }, []);

  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}