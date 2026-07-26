import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';

import * as Location from 'expo-location';

export default function VetSearchScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vets, setVets] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;

        // Fetch from backend PostGIS
        const token = localStorage.getItem('userToken'); // Or from secure store
        const response = await fetch(`${API_URL}/vets/nearby?lat=${lat}&lon=${lon}&radius=50000`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Add random dummy rating and availability if not in DB for UI purposes
          const enrichedVets = data.map((v: any) => ({
            ...v,
            clinic: v.clinic || 'PashuRakshak Vet Partner',
            rating: 4.5 + Math.random() * 0.5,
            available: Math.random() > 0.3,
            distanceFormat: (v.distance / 1000).toFixed(1) + ' km'
          }));
          setVets(enrichedVets);
        } else {
          setErrorMsg(data.error || 'Failed to load vets');
        }
      } catch (err) {
        console.log(err);
        setErrorMsg('Network error.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Find a Vet</Text>
            <Text style={styles.headerSubtitle}>Geo-Proximity Search</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <FontAwesome name="sliders" size={20} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Map Placeholder */}
      <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <FontAwesome name="map" size={48} color={COLORS.borderMedium} />
          <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: SPACING.sm }}>Interactive PostGIS Map</Text>
          
          {/* Mock Map Markers */}
          <View style={[styles.mockMarker, { top: 40, left: 80 }]}>
            <View style={styles.mockMarkerDot} />
          </View>
          <View style={[styles.mockMarker, { top: 100, right: 60 }]}>
            <View style={styles.mockMarkerDot} />
          </View>
          
          {/* User Location */}
          <View style={[styles.userMarker, { top: '50%', left: '50%' }]}>
            <View style={styles.userMarkerDot} />
            <View style={styles.userMarkerPulse} />
          </View>
        </View>
      </Animated.View>

      <View style={styles.listContainer}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.listHeader}>
          <Text style={styles.listTitle}>Nearby Verified Clinics</Text>
          <Text style={styles.listCount}>{vets.length} Found</Text>
        </Animated.View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: SPACING.sm }}>Locating nearest help...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.loaderContainer}>
            <FontAwesome name="exclamation-triangle" size={32} color={COLORS.error} />
            <Text style={{ ...TYPOGRAPHY.body, color: COLORS.error, marginTop: SPACING.md }}>{errorMsg}</Text>
          </View>
        ) : vets.length === 0 ? (
          <View style={styles.loaderContainer}>
            <FontAwesome name="map-o" size={32} color={COLORS.textMuted} />
            <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: SPACING.md }}>No vets found within 50km.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {vets.map((vet, index) => (
              <Animated.View key={vet.id} entering={FadeInRight.delay(300 + index * 100).springify()} style={styles.vetCard}>
                <View style={styles.vetCardTop}>
                  <View style={styles.vetAvatar}>
                    <FontAwesome name="user-md" size={24} color={COLORS.primaryDark} />
                  </View>
                  <View style={styles.vetInfo}>
                    <Text style={styles.vetName}>{vet.name}</Text>
                    <Text style={styles.clinicName}>{vet.clinic}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <FontAwesome name="star" size={12} color="#D97706" />
                    <Text style={styles.ratingText}>{vet.rating?.toFixed(1)}</Text>
                  </View>
                </View>
                
                <View style={styles.vetCardMiddle}>
                  <View style={styles.detailItem}>
                    <FontAwesome name="map-marker" size={14} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{vet.distanceFormat || 'N/A'} away</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesome name="circle" size={10} color={vet.available ? COLORS.success : COLORS.error} />
                    <Text style={[styles.detailText, { color: vet.available ? COLORS.success : COLORS.error }]}>
                      {vet.available ? 'Available Now' : 'Currently Busy'}
                    </Text>
                  </View>
                </View>

                <View style={styles.vetCardBottom}>
                  <TouchableOpacity style={styles.actionBtnSecondary}>
                    <FontAwesome name="location-arrow" size={14} color={COLORS.primaryDark} />
                    <Text style={styles.actionBtnTextSecondary}>Navigate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtnPrimary, !vet.available && { backgroundColor: COLORS.borderMedium }]}>
                    <FontAwesome name="phone" size={14} color="#fff" />
                    <Text style={styles.actionBtnTextPrimary}>Call Now</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        )}
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
    zIndex: 10
  },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.textMain, marginBottom: 2 },
  headerSubtitle: { ...TYPOGRAPHY.label, color: COLORS.primary },
  backBtn: { padding: SPACING.xs },
  filterBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.backgroundSurface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm },
  mapContainer: { height: 250, paddingHorizontal: SPACING.lg },
  mapPlaceholder: { flex: 1, backgroundColor: COLORS.primaryLight, borderRadius: SIZES.radiusLg, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.md },
  mockMarker: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm },
  mockMarkerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  userMarker: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...SHADOWS.md },
  userMarkerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.secondary },
  userMarkerPulse: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(56, 189, 248, 0.3)', zIndex: -1 },
  listContainer: { flex: 1, padding: SPACING.lg, backgroundColor: COLORS.backgroundBase },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  listTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain },
  listCount: { ...TYPOGRAPHY.label, color: COLORS.primary, fontWeight: '700', backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vetCard: { backgroundColor: COLORS.backgroundSurface, borderRadius: SIZES.radiusLg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm },
  vetCardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  vetAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  vetInfo: { flex: 1 },
  vetName: { ...TYPOGRAPHY.h3, fontSize: 16, color: COLORS.textMain, marginBottom: 2 },
  clinicName: { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: SIZES.radiusSm },
  ratingText: { ...TYPOGRAPHY.label, color: '#D97706', fontWeight: '700' },
  vetCardMiddle: { flexDirection: 'row', justifyContent: 'flex-start', gap: SPACING.xl, marginBottom: SPACING.lg, paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  detailText: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.textMuted },
  vetCardBottom: { flexDirection: 'row', gap: SPACING.md },
  actionBtnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.backgroundBase, paddingVertical: SPACING.sm, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.primaryLight },
  actionBtnTextSecondary: { ...TYPOGRAPHY.body, color: COLORS.primaryDark, fontWeight: '600' },
  actionBtnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, borderRadius: SIZES.radiusMd },
  actionBtnTextPrimary: { ...TYPOGRAPHY.body, color: '#fff', fontWeight: '600' }
});
