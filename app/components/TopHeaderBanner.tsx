import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { SPACING, SHADOWS } from '../constants/theme';

export default function TopHeaderBanner({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.topHeaderGreen}>
      <View style={styles.headerTopBar}>
        {/* Left: Govt Emblem + PashuRakshak Title */}
        <View style={styles.headerGovBrand}>
          <View style={styles.emblemCircle}>
            <FontAwesome name="university" size={16} color="#15803D" />
          </View>
          <View>
            <Text style={styles.headerGovTitle}>पशुरक्षक</Text>
            <Text style={styles.headerGovSub}>पशुपालन विभाग, भारत सरकार</Text>
          </View>
        </View>

        {/* Right: User Avatar + Bell Button */}
        <View style={styles.headerActionsRow}>
          <TouchableOpacity style={styles.headerBellBtn} onPress={() => router.push('/(farmer)/community' as any)}>
            <FontAwesome name="bell-o" size={16} color="#15803D" />
            <View style={styles.headerBellDot} />
          </TouchableOpacity>
          <View style={styles.headerAvatarCircle}>
            <Text style={styles.headerAvatarText}>{user?.name?.charAt(0) || 'P'}</Text>
          </View>
        </View>
      </View>

      {/* User Greeting / Screen Title & Location Sub-Row */}
      <View style={styles.headerUserRow}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.headerGreeting}>{title || `Hello, ${user?.name?.split(' ')[0] || 'Pranav'}`}</Text>
            {!title && <Text style={{ fontSize: 16 }}>👋</Text>}
          </View>
          <Text style={styles.headerSubtext}>{subtitle || 'Welcome back to PashuRakshak'}</Text>
        </View>
        <View style={styles.headerLocationTag}>
          <FontAwesome name="map-marker" size={11} color="#DCFCE7" />
          <Text style={styles.headerLocationTxt}>Nagpur, Maharashtra</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topHeaderGreen: {
    backgroundColor: '#15803D',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 55 : 42,
    paddingBottom: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10,
    ...SHADOWS.md,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md - 2,
  },
  headerGovBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  emblemCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGovTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerGovSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DCFCE7',
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 4,
  },
  headerBellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerBellDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  headerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#14532D',
  },
  headerUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerGreeting: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerLocationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerLocationTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
