import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { colors } from '../theme';
import { useAuthStore } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';

// Screen imports for stack screens outside tabs
import { TreinoDetailScreen } from '../screens/treino/TreinoDetailScreen';
import { ExecucaoScreen } from '../screens/treino/ExecucaoScreen';
import { CheckInScreen } from '../screens/checkin/CheckInScreen';
import { ChatConversationScreen } from '../screens/chat/ChatConversationScreen';
import { CoachDashboardScreen } from '../screens/coach/CoachDashboardScreen';

export type RootStackParamList = {
  Main: undefined;
  TreinoDetail: { treinoId: number };
  Execucao: { treinoId: number };
  CheckIn: undefined;
  ChatConversation: { partnerId: number; partnerName: string; conversaId?: number };
  CoachDashboard: undefined;
  CoachTreinos: undefined;
  CoachStudentDetail: { studentId: number; studentName: string };
  PerfilPublico: { userId: number };
  EditPerfil: undefined;
  CreateStory: undefined;
  Configs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.bgPrimary },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen
      name="TreinoDetail"
      component={TreinoDetailScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name="Execucao"
      component={ExecucaoScreen}
      options={{
        animation: 'fade',
        gestureEnabled: false,
      }}
    />
    <Stack.Screen
      name="CheckIn"
      component={CheckInScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name="ChatConversation"
      component={ChatConversationScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="CoachDashboard"
      component={CoachDashboardScreen}
    />
  </Stack.Navigator>
);

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAuthStore();

  // Don't render until auth state is determined
  if (loading) return null;

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.bgPrimary,
          card: colors.bgSecondary,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.error,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      {isAuthenticated ? <AppStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
