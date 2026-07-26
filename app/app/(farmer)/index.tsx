import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, GLOBAL_STYLES, SHADOWS } from '../../constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setWeather({ temp: '28°', condition: 'Sunny', humidity: '45%' });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'F'}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Farmer'}</Text>
            <Text style={styles.subtitle}>Welcome back to PashuRakshak</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <FontAwesome name="sign-out" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Scan Action Area */}
        <Animated.View entering={FadeInUp.duration(600).springify()}>
          <TouchableOpacity 
            style={styles.scanButton}
            activeOpacity={0.9}
            onPress={() => router.push('/capture')}
          >
            <View style={styles.scanContent}>
              <View>
                <Text style={styles.scanButtonTitle}>Scan Cattle</Text>
                <Text style={styles.scanButtonSubtitle}>Instant AI health analysis</Text>
              </View>
              <View style={styles.scanIconContainer}>
                <FontAwesome name="camera" size={24} color={COLORS.primary} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Action Cards (Horizontal Scroll) */}
        <Animated.View entering={FadeInUp.duration(600).delay(100).springify()}>
          <Text style={styles.sectionTitle}>Farm Services</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(farmer)/animals' as any)}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#EDE9FE' }]}>
                <FontAwesome name="paw" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.actionCardText}>My Herd</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(farmer)/medicine' as any)}>
              <View style={[styles.actionIconWrapper, { backgroundColor: COLORS.secondaryLight }]}>
                <FontAwesome name="medkit" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionCardText}>Medicines</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(farmer)/chat' as any)}>
              <View style={[styles.actionIconWrapper, { backgroundColor: COLORS.primaryLight }]}>
                <FontAwesome name="comments" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionCardText}>AI Vet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(farmer)/community' as any)}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#FEF3C7' }]}>
                <FontAwesome name="map" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.actionCardText}>Map</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(farmer)/settings' as any)}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#F3F4F6' }]}>
                <FontAwesome name="cog" size={24} color="#4B5563" />
              </View>
              <Text style={styles.actionCardText}>Settings</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* Health Statistics Bar Chart */}
        <Animated.View entering={FadeInUp.duration(600).delay(200).springify()}>
          <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Weekly Scans</Text>
          <View style={GLOBAL_STYLES.card}>
            <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <FontAwesome name="bar-chart" size={32} color={COLORS.borderMedium} />
              <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: SPACING.sm }}>No scan data this week.</Text>
            </View>
          </View>
        </Animated.View>

        {/* Activity Timeline */}
        <Animated.View entering={FadeInUp.duration(600).delay(300).springify()}>
          <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Recent Activity</Text>
          <View style={GLOBAL_STYLES.card}>
            <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <FontAwesome name="history" size={32} color={COLORS.borderMedium} />
              <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: SPACING.sm }}>No recent activity to show.</Text>
            </View>
          </View>
        </Animated.View>

        {/* Extra spacing for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundBase,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 80,
    backgroundColor: COLORS.backgroundBase, // Blend with background
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primaryDark,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  greeting: {
    ...TYPOGRAPHY.h3,
    fontSize: 20,
    color: COLORS.textMain,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
  },
  logoutBtn: {
    padding: SPACING.sm,
    backgroundColor: COLORS.borderLight,
    borderRadius: SIZES.radiusXl,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusXl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.hover,
  },
  scanContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonTitle: {
    ...TYPOGRAPHY.h2,
    color: '#fff',
    marginBottom: 4,
  },
  scanButtonSubtitle: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.9)',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
  },
  horizontalScroll: {
    gap: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  quickActionCard: {
    backgroundColor: COLORS.backgroundSurface,
    width: 100,
    padding: SPACING.md,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionCardText: {
    ...TYPOGRAPHY.label,
    fontSize: 13,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: SPACING.md,
  },
  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarBackground: {
    width: 12,
    height: 100,
    backgroundColor: COLORS.borderLight,
    borderRadius: 6,
    justifyContent: 'flex-end',
    marginBottom: SPACING.sm,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 6,
  },
  chartDayText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: SPACING.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.borderLight,
    marginTop: 4,
    marginBottom: -4, // Connect to next
  },
  timelineContent: {
    flex: 1,
    paddingBottom: SPACING.lg,
  },
  timelineTitle: {
    ...TYPOGRAPHY.label,
    fontSize: 16,
  },
  timelineDesc: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    marginTop: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
