import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: Platform.OS === 'ios' ? 96 : 80,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 32 : 20,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.05,
          shadowRadius: 20,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Vet',
          tabBarIcon: ({ color }) => <FontAwesome name="comments" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community/index"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <FontAwesome name="map" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome name="cog" size={28} color={color} />,
        }}
      />
      
      {/* Hide the rest of the screens from the bottom tab bar */}
      <Tabs.Screen name="capture/index" options={{ href: null }} />
      <Tabs.Screen name="iot/index" options={{ href: null }} />
      <Tabs.Screen name="vets/index" options={{ href: null }} />
      <Tabs.Screen name="medicine" options={{ href: null }} />
      <Tabs.Screen name="score" options={{ href: null }} />
      <Tabs.Screen name="sync/index" options={{ href: null }} />
      <Tabs.Screen name="animals/index" options={{ href: null }} />
      <Tabs.Screen name="animals/[id]" options={{ href: null }} />
      <Tabs.Screen name="animals/certificate" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
