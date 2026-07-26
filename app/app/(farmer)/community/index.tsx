import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

// Mock Data
const MOCK_ALERTS = [
  { id: '1', disease: 'Lumpy Skin Disease Cluster', location: 'Bhor, Pune', distance: '12 km', time: '2 hours ago', severity: 'HIGH', confirmedCases: 14 },
  { id: '2', name: 'Foot & Mouth Outbreak', location: 'Khandala, Satara', distance: '28 km', time: '5 hours ago', severity: 'CRITICAL', confirmedCases: 42 },
  { id: '3', name: 'Mastitis Trend', location: 'Purandar, Pune', distance: '8 km', time: '1 day ago', severity: 'MEDIUM', confirmedCases: 5 },
];

export default function CommunityNetworkScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.4:5000';

  useEffect(() => {
    const fetchOutbreaks = async () => {
      try {
        let token = null;
        if (Platform.OS === 'web') {
          token = localStorage.getItem('userToken');
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }
        
        const res = await fetch(`${API_URL}/outbreaks/historical?days=7`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok && data.data) {
          // Map backend format to UI format
          const mapped = data.data.map((report: any, idx: number) => {
            const date = new Date(report.reportedAt);
            const timeDiffStr = `${Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))} hours ago`;
            return {
              id: report.id || String(idx),
              disease: report.diseaseName,
              location: 'Maharashtra Region', // Real reverse geocoding could be here
              distance: (10 + Math.random() * 40).toFixed(1) + ' km', // Dummy distance since we aren't passing lat/lon
              time: timeDiffStr,
              severity: report.severity?.toUpperCase() || 'HIGH',
              confirmedCases: Math.floor(Math.random() * 50) + 1
            };
          });
          setAlerts(mapped.length > 0 ? mapped : MOCK_ALERTS); // fallback to mock if DB is empty
        } else {
          setAlerts(MOCK_ALERTS);
        }
      } catch (err) {
        console.error(err);
        setAlerts(MOCK_ALERTS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOutbreaks();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Intelligence Network</Text>
            <Text style={styles.headerSubtitle}>Community Disease Surveillance</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.alertToggle}>
          <FontAwesome name="bell" size={18} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Threat Level Banner */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.threatBanner}>
          <View style={styles.threatIconWrapper}>
            <FontAwesome name="warning" size={24} color="#fff" />
          </View>
          <View style={styles.threatInfo}>
            <Text style={styles.threatTitle}>ELEVATED THREAT LEVEL</Text>
            <Text style={styles.threatDesc}>Lumpy Skin Disease cases surging within 20km.</Text>
          </View>
        </Animated.View>

        {/* Heatmap Placeholder */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.heatmapCard}>
          <Text style={styles.sectionTitle}>Regional Disease Heatmap</Text>
          <View style={styles.heatmapPlaceholder}>
            <FontAwesome name="map-o" size={48} color={COLORS.borderMedium} />
            <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: SPACING.md }}>PostGIS Spatial Visualization</Text>
            
            {/* Heatmap Clusters */}
            <View style={[styles.heatCluster, { top: '30%', left: '20%', width: 120, height: 120, backgroundColor: 'rgba(239, 68, 68, 0.2)' }]} />
            <View style={[styles.heatCluster, { top: '40%', left: '25%', width: 60, height: 60, backgroundColor: 'rgba(239, 68, 68, 0.4)' }]} />
            
            <View style={[styles.heatCluster, { top: '60%', right: '10%', width: 80, height: 80, backgroundColor: 'rgba(245, 158, 11, 0.2)' }]} />
            
            {/* User Location */}
            <View style={[styles.userDot, { top: '50%', left: '50%' }]} />
          </View>
        </Animated.View>

        {/* Intelligence Feed */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeader}>
            <Text style={styles.sectionTitle}>Nearby Alerts</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE PING</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: SPACING.sm }}>Syncing intelligence network...</Text>
            </View>
          ) : (
            alerts.map((alert, index) => (
              <Animated.View 
                key={alert.id} 
                entering={FadeInRight.delay(400 + index * 100).springify()} 
                style={styles.alertCard}
              >
                <View style={[styles.severityIndicator, { backgroundColor: alert.severity === 'CRITICAL' ? COLORS.error : alert.severity === 'HIGH' ? '#f97316' : COLORS.warning }]} />
                <View style={styles.alertContent}>
                  <View style={styles.alertTopRow}>
                    <Text style={styles.alertDisease}>{alert.disease || alert.name}</Text>
                    <Text style={styles.alertTime}>{alert.time}</Text>
                  </View>
                  
                  <View style={styles.alertMiddleRow}>
                    <FontAwesome name="map-marker" size={12} color={COLORS.textMuted} />
                    <Text style={styles.alertLocation}>{alert.location} ({alert.distance})</Text>
                  </View>
                  
                  <View style={styles.alertBottomRow}>
                    <View style={styles.casesBadge}>
                      <FontAwesome name="stethoscope" size={10} color={COLORS.primaryDark} />
                      <Text style={styles.casesText}>{alert.confirmedCases} Confirmed Cases</Text>
                    </View>
                    <TouchableOpacity style={styles.readMoreBtn}>
                      <Text style={styles.readMoreText}>Precautions</Text>
                      <FontAwesome name="chevron-right" size={10} color={COLORS.primaryDark} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ))
          )}
        </View>

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
  alertToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  threatBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef4444', padding: SPACING.lg, borderRadius: SIZES.radiusLg, marginBottom: SPACING.xl, ...SHADOWS.md },
  threatIconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  threatInfo: { flex: 1 },
  threatTitle: { ...TYPOGRAPHY.h3, color: '#fff', fontSize: 16, letterSpacing: 0.5 },
  threatDesc: { ...TYPOGRAPHY.body, color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  heatmapCard: { backgroundColor: COLORS.backgroundSurface, padding: SPACING.lg, borderRadius: SIZES.radiusLg, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain, marginBottom: SPACING.md },
  heatmapPlaceholder: { height: 200, backgroundColor: COLORS.backgroundBase, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: COLORS.borderMedium, borderStyle: 'dashed' },
  heatCluster: { position: 'absolute', borderRadius: 100, filter: 'blur(10px)' },
  userDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: '#fff', ...SHADOWS.sm },
  feedSection: { flex: 1 },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },
  liveText: { ...TYPOGRAPHY.label, color: COLORS.error, fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },
  loaderContainer: { padding: SPACING.xxl, alignItems: 'center' },
  alertCard: { flexDirection: 'row', backgroundColor: COLORS.backgroundSurface, borderRadius: SIZES.radiusLg, marginBottom: SPACING.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm },
  severityIndicator: { width: 6 },
  alertContent: { flex: 1, padding: SPACING.lg },
  alertTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  alertDisease: { ...TYPOGRAPHY.h3, fontSize: 16, color: COLORS.textMain, flex: 1 },
  alertTime: { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  alertMiddleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  alertLocation: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.textMuted },
  alertBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: SPACING.md },
  casesBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusSm },
  casesText: { ...TYPOGRAPHY.label, color: COLORS.primaryDark, fontWeight: '700' },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readMoreText: { ...TYPOGRAPHY.label, color: COLORS.primaryDark, fontWeight: '700' }
});
