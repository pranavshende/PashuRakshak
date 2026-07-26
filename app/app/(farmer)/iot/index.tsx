import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS } from '../../../constants/theme';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat, withSequence } from 'react-native-reanimated';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

// Reanimated SVG Component for Biometric Rings
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BiometricRing = ({ value, maxValue, color, title, unit, icon, delay = 0 }: any) => {
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  
  const animatedProgress = useSharedValue(0);
  
  useEffect(() => {
    setTimeout(() => {
      animatedProgress.value = withTiming(value / maxValue, { duration: 1500, easing: Easing.out(Easing.cubic) });
    }, delay);
  }, []);

  // @ts-ignore - Reanimated and react-native-svg typing clash for strokeDashoffset
  const animatedProps = useAnimatedStyle(() => {
    const strokeDashoffset = circumference - (circumference * animatedProgress.value);
    return {
      strokeDashoffset,
    };
  });

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()} style={styles.ringCard}>
      <View style={styles.ringHeader}>
        <FontAwesome name={icon} size={14} color={COLORS.textMuted} />
        <Text style={styles.ringTitle}>{title}</Text>
      </View>
      <View style={styles.svgContainer}>
        <Svg width={150} height={150} viewBox="0 0 150 150">
          {/* Background Track */}
          <Circle
            cx="75"
            cy="75"
            r={radius}
            stroke={COLORS.borderMedium}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Progress */}
          <AnimatedCircle
            cx="75"
            cy="75"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            // @ts-ignore
            animatedProps={animatedProps}
            fill="none"
            rotation="-90"
            origin="75, 75"
          />
        </Svg>
        <View style={styles.ringValueContainer}>
          <Text style={styles.ringValueText}>{value}</Text>
          <Text style={styles.ringUnitText}>{unit}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default function IoTSmartFarmScreen() {
  const router = useRouter();
  
  // GPS Ping Animation
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(0.8);
  
  useEffect(() => {
    pingScale.value = withRepeat(withTiming(2.5, { duration: 2000 }), -1, false);
    pingOpacity.value = withRepeat(withTiming(0, { duration: 2000 }), -1, false);
  }, []);

  const animatedPingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Smart Farm</Text>
            <Text style={styles.headerSubtitle}>IoT Collar Telemetry</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>CONNECTED</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Productivity Score Header */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.productivityCard}>
          <View style={styles.prodLeft}>
            <Text style={styles.prodLabel}>Holistic Farm Score</Text>
            <Text style={styles.prodValue}>--<Text style={styles.prodMax}>/100</Text></Text>
            <View style={[styles.trendRow, { backgroundColor: 'transparent' }]}>
              <Text style={styles.trendText}>Awaiting collar telemetry...</Text>
            </View>
          </View>
          <View style={styles.prodRight}>
            <View style={styles.medalWrapper}>
              <FontAwesome name="chain-broken" size={24} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.prodRank}>No Active Devices</Text>
          </View>
        </Animated.View>

        {/* Biometric Rings Grid */}
        <Text style={styles.sectionTitle}>Herd Averages</Text>
        <View style={styles.ringsGrid}>
          <BiometricRing value={0} maxValue={42} color={COLORS.primary} title="Temperature" unit="°C" icon="thermometer-half" delay={200} />
          <BiometricRing value={0} maxValue={100} color="#f43f5e" title="Heart Rate" unit="BPM" icon="heartbeat" delay={400} />
        </View>

        {/* GPS Tracking Map */}
        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.gpsCard}>
          <View style={styles.gpsHeader}>
            <Text style={styles.sectionTitle}>Live GPS Tracking</Text>
            <TouchableOpacity style={styles.refreshBtn}>
              <FontAwesome name="refresh" size={14} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapPlaceholder}>
            <FontAwesome name="map" size={48} color={COLORS.borderMedium} />
            <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: SPACING.md }}>Satellite View Offline</Text>
            <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: 4, fontSize: 12 }}>No GPS collars detected.</Text>
          </View>
        </Animated.View>

        {/* Sync Log */}
        <Animated.View entering={FadeInUp.delay(800)} style={styles.logContainer}>
          <FontAwesome name="wifi" size={12} color={COLORS.textMuted} />
          <Text style={styles.logText}>Not synced</Text>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundBase },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: COLORS.backgroundBase, 
    padding: SPACING.lg, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 10
  },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.textMain, marginBottom: 2 },
  headerSubtitle: { ...TYPOGRAPHY.label, color: COLORS.primary },
  backBtn: { padding: SPACING.xs },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  statusText: { color: '#065F46', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  productivityCard: { flexDirection: 'row', backgroundColor: COLORS.primaryDark, borderRadius: SIZES.radiusLg, padding: SPACING.xl, marginBottom: SPACING.xxl, ...SHADOWS.md, overflow: 'hidden' },
  prodLeft: { flex: 1 },
  prodLabel: { ...TYPOGRAPHY.label, color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
  prodValue: { ...TYPOGRAPHY.h1, color: '#fff', fontSize: 48, lineHeight: 56 },
  prodMax: { fontSize: 20, color: 'rgba(255,255,255,0.6)' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.xs, backgroundColor: 'rgba(0,0,0,0.2)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  trendText: { ...TYPOGRAPHY.label, color: '#fff', fontSize: 11 },
  prodRight: { justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)', paddingLeft: SPACING.lg },
  medalWrapper: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  prodRank: { ...TYPOGRAPHY.label, color: '#FEF3C7', fontSize: 11, fontWeight: '700' },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain, marginBottom: SPACING.lg },
  ringsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xxl },
  ringCard: { flex: 1, minWidth: '45%', backgroundColor: COLORS.backgroundSurface, borderRadius: SIZES.radiusLg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderLight, alignItems: 'center', ...SHADOWS.sm },
  ringHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md, alignSelf: 'flex-start' },
  ringTitle: { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  svgContainer: { position: 'relative', width: 150, height: 150, justifyContent: 'center', alignItems: 'center' },
  ringValueContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ringValueText: { ...TYPOGRAPHY.h2, fontSize: 28, color: COLORS.textMain },
  ringUnitText: { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  gpsCard: { backgroundColor: COLORS.backgroundSurface, borderRadius: SIZES.radiusLg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm, marginBottom: SPACING.xl },
  gpsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  refreshBtn: { padding: SPACING.xs },
  mapPlaceholder: { height: 250, backgroundColor: COLORS.backgroundBase, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: COLORS.borderMedium, borderStyle: 'dashed' },
  tracker: { position: 'absolute', width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  trackerDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.secondary, borderWidth: 2, borderColor: '#fff' },
  trackerPing: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.secondary },
  trackerLabel: { position: 'absolute', top: 24, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, ...SHADOWS.sm },
  trackerLabelText: { ...TYPOGRAPHY.label, color: COLORS.textMain, fontSize: 10, fontWeight: '700' },
  logContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: SPACING.xl },
  logText: { ...TYPOGRAPHY.label, color: COLORS.textMuted, fontSize: 11 }
});
