import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Platform, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    router.replace('/(auth)/login');
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primaryDark,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          ...TYPOGRAPHY.h3,
          color: '#fff',
        },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ padding: SPACING.sm, marginRight: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <FontAwesome name="sign-out" size={16} color="#fff" />
              {Platform.OS === 'web' && <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>}
            </View>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Admin Dashboard',
          headerTitle: 'PashuRakshak Command Center'
        }} 
      />
      <Stack.Screen 
        name="vets" 
        options={{ 
          title: 'Network Management',
          headerTitle: 'Veterinarian Network'
        }} 
      />
    </Stack>
  );
}
