import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation';
import { useAuthStore } from './src/store';
import { GamificationOverlay } from './src/components/common/GamificationOverlay';
import { LoadingScreen } from './src/components/common/Loading';

// Suppress non-critical warnings in dev
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  const { initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0c0f1a" />
        <AppNavigator />
        <GamificationOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
