import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: Platform.OS === 'ios' ? 86 : 68,
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          paddingBottom: Platform.OS === 'ios' ? 26 : 10,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('layout.home', 'Home'),
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('layout.aiVet', 'AI Vet'),
          tabBarIcon: ({ color }) => <FontAwesome name="comments" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community/index"
        options={{
          title: t('layout.alerts', 'Alerts'),
          tabBarIcon: ({ color }) => <FontAwesome name="map" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('layout.settings', 'Settings'),
          tabBarIcon: ({ color }) => <FontAwesome name="cog" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: t('layout.profile', 'Profile'),
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={22} color={color} />,
        }}
      />
      
      {/* Hide non-tab screens from the bottom navigation bar */}
      <Tabs.Screen name="diagnose/index" options={{ href: null }} />
      <Tabs.Screen name="capture/index" options={{ href: null }} />
      <Tabs.Screen name="iot/index" options={{ href: null }} />
      <Tabs.Screen name="vets/index" options={{ href: null }} />
      <Tabs.Screen name="medicine" options={{ href: null }} />
      <Tabs.Screen name="score" options={{ href: null }} />
      <Tabs.Screen name="sync/index" options={{ href: null }} />
      <Tabs.Screen name="animals/index" options={{ href: null }} />
      <Tabs.Screen name="animals/[id]" options={{ href: null }} />
      <Tabs.Screen name="animals/certificate" options={{ href: null }} />
      <Tabs.Screen name="debugger" options={{ href: null }} />
    </Tabs>
  );
}
