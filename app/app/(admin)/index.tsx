import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../constants/theme';
import Animated, { FadeInUp, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { storage } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Mock data for analytics
  const [stats, setStats] = useState({
    totalScans: 0,
    highRisk: 0,
    activeVets: 0,
    farmers: 0
  });

  const [liveFeed, setLiveFeed] = useState<any[]>([]);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await storage.getItemAsync('userToken');
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setStats({
            totalScans: data.totalPredictions || 0,
            highRisk: Math.floor((data.totalPredictions || 0) * 0.15), // Mock derived stat
            activeVets: data.totalVets || 0,
            farmers: data.totalFarmers || 0
          });
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Mock Live Feed
    setLiveFeed([
      { id: '1', disease: 'Lumpy Skin Disease', location: 'Pune District', risk: 'HIGH', time: '2 mins ago' },
      { id: '2', disease: 'Mastitis', location: 'Satara District', risk: 'MEDIUM', time: '14 mins ago' },
      { id: '3', disease: 'Healthy', location: 'Nashik District', risk: 'LOW', time: '45 mins ago' },
    ]);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundBase }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: SPACING.md }}>{t('admin.loading', 'Loading Command Center...')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      {/* Header Actions */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcomeText}>{t('admin.welcomeAdmin', 'Welcome back, Admin')}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity 
          style={styles.manageVetsBtn}
          onPress={() => router.push('/(admin)/vets' as any)}
          activeOpacity={0.8}
        >
          <FontAwesome name="users" size={16} color="#fff" />
          <Text style={styles.manageVetsText}>{t('admin.manageNetwork', 'Manage Network')}</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Grid */}
      <View style={styles.gridContainer}>
        <Animated.View entering={FadeInUp.delay(100).springify()} style={[styles.kpiCard, { width: IS_WEB ? '23%' : '48%' }]}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
            <FontAwesome name="camera" size={24} color={COLORS.secondary} />
          </View>
          <Text style={styles.kpiValue}>{stats.totalScans.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>{t('admin.totalScans', 'Total Scans')}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()} style={[styles.kpiCard, { width: IS_WEB ? '23%' : '48%' }]}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <FontAwesome name="warning" size={24} color={COLORS.error} />
          </View>
          <Text style={[styles.kpiValue, { color: COLORS.error }]}>{stats.highRisk.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>{t('admin.highRisk', 'High Risk')}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={[styles.kpiCard, { width: IS_WEB ? '23%' : '48%' }]}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(22, 163, 74, 0.1)' }]}>
            <FontAwesome name="user-md" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.kpiValue}>{stats.activeVets.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>{t('admin.activeVets', 'Active Vets')}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()} style={[styles.kpiCard, { width: IS_WEB ? '23%' : '48%' }]}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <FontAwesome name="users" size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.kpiValue}>{stats.farmers.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>{t('admin.farmers', 'Farmers')}</Text>
        </Animated.View>
      </View>

      <View style={styles.mainLayout}>
        {/* Left Column: Analytics/Map Placeholder */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.leftCol}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Regional Outbreak Map</Text>
            <View style={styles.mapPlaceholder}>
              <FontAwesome name="map" size={64} color={COLORS.borderMedium} />
              <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: SPACING.md }}>GIS Heatmap Visualization</Text>
              <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4 }}>Connects to PostGIS for real-time spatial clustering</Text>
              
              {/* Mock Hotspots */}
              <View style={[styles.hotspot, { top: '30%', left: '40%', width: 80, height: 80 }]} />
              <View style={[styles.hotspot, { top: '60%', right: '20%', width: 50, height: 50 }]} />
            </View>
          </View>
        </Animated.View>

        {/* Right Column: Live Feed */}
        <Animated.View entering={FadeInRight.delay(600).springify()} style={styles.rightCol}>
          <View style={styles.sectionCard}>
            <View style={styles.feedHeader}>
              <Text style={styles.sectionTitle}>{t('admin.liveFeed', 'Live Scan Feed')}</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            
            <View style={styles.feedList}>
              {liveFeed.map((feed, index) => (
                <View key={feed.id} style={[styles.feedItem, index === liveFeed.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.feedIconWrapper}>
                    <FontAwesome name={feed.risk === 'HIGH' ? 'exclamation-circle' : feed.risk === 'MEDIUM' ? 'warning' : 'check-circle'} size={18} color={feed.risk === 'HIGH' ? COLORS.error : feed.risk === 'MEDIUM' ? COLORS.warning : COLORS.success} />
                  </View>
                  <View style={styles.feedContent}>
                    <Text style={styles.feedDisease}>{feed.disease}</Text>
                    <Text style={styles.feedLocation}>{feed.location}</Text>
                  </View>
                  <Text style={styles.feedTime}>{feed.time}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All Logs</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundBase },
  contentContainer: { padding: SPACING.xl, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xxl },
  welcomeText: { ...TYPOGRAPHY.h1, color: COLORS.textMain, fontSize: 28 },
  dateText: { ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: 4 },
  manageVetsBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primaryDark, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: SIZES.radiusLg, ...SHADOWS.sm },
  manageVetsText: { ...TYPOGRAPHY.body, color: '#fff', fontWeight: '700' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: SPACING.lg, marginBottom: SPACING.xxl },
  kpiCard: { backgroundColor: COLORS.backgroundSurface, padding: SPACING.xl, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm },
  kpiIconWrapper: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  kpiValue: { ...TYPOGRAPHY.h1, color: COLORS.textMain, fontSize: 32, marginBottom: 4 },
  kpiLabel: { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  mainLayout: { flexDirection: IS_WEB ? 'row' : 'column', gap: SPACING.xl },
  leftCol: { flex: IS_WEB ? 2 : 1 },
  rightCol: { flex: IS_WEB ? 1 : 1 },
  sectionCard: { backgroundColor: COLORS.backgroundSurface, borderRadius: SIZES.radiusLg, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm, minHeight: 400 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain, marginBottom: SPACING.lg },
  mapPlaceholder: { flex: 1, backgroundColor: COLORS.backgroundBase, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: COLORS.borderMedium, borderStyle: 'dashed', minHeight: 300 },
  hotspot: { position: 'absolute', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 100 },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },
  liveText: { ...TYPOGRAPHY.label, color: COLORS.error, fontWeight: '800', fontSize: 10 },
  feedList: { flex: 1 },
  feedItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  feedIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.backgroundBase, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  feedContent: { flex: 1 },
  feedDisease: { ...TYPOGRAPHY.body, color: COLORS.textMain, fontWeight: '700' },
  feedLocation: { ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: 2 },
  feedTime: { ...TYPOGRAPHY.label, color: COLORS.textMuted, fontSize: 11 },
  viewAllBtn: { marginTop: SPACING.lg, paddingVertical: SPACING.sm, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: SPACING.md },
  viewAllText: { ...TYPOGRAPHY.body, color: COLORS.primaryDark, fontWeight: '600' }
});
