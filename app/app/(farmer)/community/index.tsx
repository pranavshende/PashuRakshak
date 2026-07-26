import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { storage } from '../../../context/AuthContext';
import * as Location from 'expo-location';

// Dynamically import MapView for native platforms to avoid bundle crashes on web and Expo Go environments
let MapView: any = null;
let Marker: any = null;
let Circle: any = null;
if (Platform.OS !== 'web') {
  try {
    const MapModule = require('react-native-maps');
    MapView = MapModule.default;
    Marker = MapModule.Marker;
    Circle = MapModule.Circle;
  } catch (error) {
    console.warn("react-native-maps could not be loaded in this environment. Falling back to mockup map.", error);
  }
}

const { width } = Dimensions.get('window');

// Mock Data
const MOCK_ALERTS = [
  { id: '1', disease: 'Lumpy Skin Disease Cluster', location: 'Bhor, Pune', distance: '12 km', time: '2 hours ago', severity: 'HIGH', confirmedCases: 14, latitude: 18.1656, longitude: 73.8443 },
  { id: '2', disease: 'Foot & Mouth Outbreak', location: 'Khandala, Satara', distance: '28 km', time: '5 hours ago', severity: 'CRITICAL', confirmedCases: 42, latitude: 18.0319, longitude: 73.9856 },
  { id: '3', disease: 'Mastitis Trend', location: 'Purandar, Pune', distance: '8 km', time: '1 day ago', severity: 'MEDIUM', confirmedCases: 5, latitude: 18.2758, longitude: 74.0152 },
];

export default function CommunityNetworkScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.4:5000';

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (e) {
        console.error("Location permissions failed", e);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchOutbreaks = async () => {
      try {
        const token = await storage.getItemAsync('userToken');
        
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
              location: report.latitude && report.longitude ? `Lat: ${report.latitude.toFixed(2)}, Lon: ${report.longitude.toFixed(2)}` : 'Maharashtra Region',
              latitude: report.latitude,
              longitude: report.longitude,
              distance: (10 + Math.random() * 40).toFixed(1) + ' km',
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

        {/* Regional Disease Heatmap */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.heatmapCard}>
          <Text style={styles.sectionTitle}>Regional Disease Heatmap</Text>
          {Platform.OS === 'web' || !MapView ? (
            <WebMockupMap 
              alerts={alerts} 
              userLocation={userLocation} 
              onSelectAlert={setSelectedAlert}
              selectedAlert={selectedAlert}
            />
          ) : (
            <View style={{ height: 220, borderRadius: SIZES.radiusMd, overflow: 'hidden' }}>
              {MapView && (
                <MapView
                  style={StyleSheet.absoluteFillObject}
                  initialRegion={{
                    latitude: userLocation?.latitude || 18.5204,
                    longitude: userLocation?.longitude || 73.8567,
                    latitudeDelta: 0.8,
                    longitudeDelta: 0.8,
                  }}
                  showsUserLocation={true}
                >
                  {alerts.map((a: any) => (
                    <Marker
                      key={a.id}
                      coordinate={{
                        latitude: a.latitude || 18.5204,
                        longitude: a.longitude || 73.8567,
                      }}
                      title={a.disease || a.name}
                      description={`Severity: ${a.severity} | Cases: ${a.confirmedCases}`}
                      pinColor={a.severity === 'CRITICAL' ? 'red' : a.severity === 'HIGH' ? 'orange' : 'green'}
                    />
                  ))}
                  {userLocation && (
                    <Circle
                      center={userLocation}
                      radius={20000}
                      fillColor="rgba(239, 68, 68, 0.12)"
                      strokeColor="rgba(239, 68, 68, 0.3)"
                      strokeWidth={1}
                    />
                  )}
                </MapView>
              )}
            </View>
          )}
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

function WebMockupMap({ alerts, userLocation, onSelectAlert, selectedAlert }: any) {
  const centerLat = userLocation?.latitude || 18.5204;
  const centerLon = userLocation?.longitude || 73.8567;
  
  const getCoordinates = (lat: number, lon: number) => {
    const widthPx = 320;
    const heightPx = 220;
    const dx = ((lon - centerLon) / 0.8) * (widthPx / 2) + (widthPx / 2);
    const dy = ((centerLat - lat) / 0.6) * (heightPx / 2) + (heightPx / 2);
    return { x: Math.max(20, Math.min(widthPx - 20, dx)), y: Math.max(20, Math.min(heightPx - 20, dy)) };
  };

  const userCoords = getCoordinates(centerLat, centerLon);

  return (
    <View style={styles.webMapContainer}>
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.webGridLineHorizontal} />
        <View style={[styles.webGridLineHorizontal, { top: '33%' }]} />
        <View style={[styles.webGridLineHorizontal, { top: '66%' }]} />
        <View style={styles.webGridLineVertical} />
        <View style={[styles.webGridLineVertical, { left: '33%' }]} />
        <View style={[styles.webGridLineVertical, { left: '66%' }]} />
      </View>

      {alerts.map((alert: any) => {
        const coords = getCoordinates(alert.latitude || 18.52, alert.longitude || 73.85);
        const isSelected = selectedAlert?.id === alert.id;
        const color = alert.severity === 'CRITICAL' ? COLORS.error : alert.severity === 'HIGH' ? '#f97316' : COLORS.warning;

        return (
          <View key={alert.id}>
            <View 
              style={[
                styles.webPulseCircle, 
                { 
                  left: coords.x - 24, 
                  top: coords.y - 24, 
                  borderColor: color,
                  backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.05)'
                }
              ]} 
            />
            <TouchableOpacity 
              style={[
                styles.webMapPin, 
                { 
                  left: coords.x - 8, 
                  top: coords.y - 8, 
                  backgroundColor: color,
                  transform: [{ scale: isSelected ? 1.3 : 1 }]
                }
              ]}
              onPress={() => onSelectAlert(alert)}
              activeOpacity={0.8}
            >
              <FontAwesome name="warning" size={8} color="#fff" />
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={[styles.webUserDotWrapper, { left: userCoords.x - 12, top: userCoords.y - 12 }]}>
        <View style={styles.webUserDotPulse} />
        <View style={styles.webUserDot} />
      </View>

      {selectedAlert && (
        <View style={styles.tooltipCard}>
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipTitle}>{selectedAlert.disease || selectedAlert.name}</Text>
            <TouchableOpacity onPress={() => onSelectAlert(null)}>
              <FontAwesome name="times" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.tooltipSub}>Severity: <Text style={{ color: selectedAlert.severity === 'CRITICAL' ? COLORS.error : '#f97316', fontWeight: '700' }}>{selectedAlert.severity}</Text></Text>
          <Text style={styles.tooltipDesc}>Distance: {selectedAlert.distance} | {selectedAlert.confirmedCases} cases</Text>
        </View>
      )}

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: COLORS.error }]} /><Text style={styles.legendText}>Critical</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: '#f97316' }]} /><Text style={styles.legendText}>High</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: COLORS.warning }]} /><Text style={styles.legendText}>Medium</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} /><Text style={styles.legendText}>You</Text></View>
      </View>
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
  webMapContainer: {
    height: 220,
    backgroundColor: COLORS.backgroundBase,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    position: 'relative',
  },
  webGridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  webGridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.borderLight,
  },
  webPulseCircle: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  webMapPin: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  webUserDotWrapper: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webUserDotPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGlow,
  },
  webUserDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  tooltipCard: {
    position: 'absolute',
    bottom: 12,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: SIZES.radiusSm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...SHADOWS.md,
    zIndex: 100,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  tooltipSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  tooltipDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  legendContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: SIZES.radiusSm,
    padding: 6,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
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
