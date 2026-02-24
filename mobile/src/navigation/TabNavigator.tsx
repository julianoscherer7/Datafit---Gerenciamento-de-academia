import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../theme';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TreinoListScreen } from '../screens/treino/TreinoListScreen';
import { SocialScreen } from '../screens/social/SocialScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { PerfilScreen } from '../screens/perfil/PerfilScreen';
import { useChatStore } from '../store';

export type TabParamList = {
  Home: undefined;
  Treino: undefined;
  Social: undefined;
  Chat: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const tabConfig: Record<
  string,
  { icon: string; activeIcon: string; label: string }
> = {
  Home: { icon: '🏠', activeIcon: '🏠', label: 'Home' },
  Treino: { icon: '💪', activeIcon: '💪', label: 'Treino' },
  Social: { icon: '👥', activeIcon: '👥', label: 'Social' },
  Chat: { icon: '💬', activeIcon: '💬', label: 'Chat' },
  Perfil: { icon: '👤', activeIcon: '👤', label: 'Perfil' },
};

export const TabNavigator: React.FC = () => {
  const unreadCount = useChatStore((s) => s.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          const cfg = tabConfig[route.name];
          return (
            <View style={styles.iconContainer}>
              <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
                {focused ? cfg.activeIcon : cfg.icon}
              </Text>
              {focused && <View style={styles.activeIndicator} />}
              {route.name === 'Chat' && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Treino" component={TreinoListScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    height: 70,
    elevation: 0,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIcon: {
    fontSize: 22,
  },
  tabIconActive: {
    fontSize: 24,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: colors.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
});
