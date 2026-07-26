import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 100, // Pill shape floating bar
          height: 64,
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.08,
          shadowRadius: 30,
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
        name="heatmap"
        options={{
          title: 'Map',
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
      <Tabs.Screen name="diagnose/index" options={{ href: null }} />
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
