import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import * as Network from 'expo-network';

import LoginScreen from '../screens/auth/LoginScreen';
import QRScanScreen from '../screens/checkin/QRScanScreen';
import ManualSearchScreen from '../screens/checkin/ManualSearchScreen';
import { useAuthStore } from '../store/auth.store';
import { useOfflineStore } from '../store/offline.store';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function CheckInTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            'QR Code': focused ? 'qr-code' : 'qr-code-outline',
            'Busca Manual': focused ? 'search' : 'search-outline',
          };
          return <Ionicons name={(icons[route.name] || 'home') as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#f1f5f9' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="QR Code" component={QRScanScreen} />
      <Tab.Screen name="Busca Manual" component={ManualSearchScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, loadFromStorage } = useAuthStore();
  const { setOnline } = useOfflineStore();

  useEffect(() => {
    loadFromStorage();
    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      setOnline(!!state.isConnected);
    };
    check();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e1b4b' }}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={CheckInTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
