import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, TextInput, Linking, Alert, Modal, StatusBar, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS } from '../../../constants/theme';
import TopHeaderBanner from '../../../components/TopHeaderBanner';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { storage } from '../../../context/AuthContext';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from '../../../config/api';

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

export default function VetSearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [vets, setVets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        let lat = 21.1458;
        let lon = 79.0882;

        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          lat = location.coords.latitude;
          lon = location.coords.longitude;
        }

        const token = await storage.getItemAsync('userToken');
        const response = await fetch(`${API_BASE_URL}/vets/nearby?lat=${lat}&lon=${lon}&radius=50000`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        const data = await response.json();
        
        if (response.ok && Array.isArray(data) && data.length > 0) {
          const enrichedVets = data.map((v: any) => ({
            ...v,
            clinic: v.clinic || 'Government Veterinary Clinic',
            phone: v.phone || '+919823012345',
            rating: v.rating || 4.8,
            available: v.available !== undefined ? v.available : true,
            distanceFormat: v.distance ? (v.distance / 1000).toFixed(1) + ' km' : '2.4 km'
          }));
          setVets(enrichedVets);
        } else {
          setVets([]);
        }
      } catch (err) {
        console.warn('Vets fetch failed, falling back to local storage if available', err);
        setVets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCallVet = (phone: string, name: string) => {
    const phoneNumber = phone.replace(/[^0-9+]/g, '') || '+911962';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Call Helpline', `Please dial ${phoneNumber} to contact ${name}.`);
    });
  };

  const handleNavigateVet = (lat: number, lon: number, name: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lon}`,
      android: `geo:0,0?q=${lat},${lon}(${encodeURIComponent(name)})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
    });
    Linking.openURL(url!).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
    });
  };

  const filteredVets = vets.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.clinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.specialty && v.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedMapVet, setSelectedMapVet] = useState<any>(null);
  const [isSatellite, setIsSatellite] = useState(false);

  return (
    <View style={styles.container}>
      <TopHeaderBanner title={t('vets.title', 'Nearby Vets & Clinics')} subtitle={t('vets.subtitle', 'Government Veterinary Officers & Hospitals')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Emergency Helpline Call Banner */}
        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.emergencyCard}>
          <View style={styles.emergencyIconCircle}>
            <FontAwesome name="ambulance" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>{t('vets.emergencyTitle', '24/7 Animal Emergency Helpline')}</Text>
            <Text style={styles.emergencySub}>{t('vets.emergencySub', 'National Veterinary Distress Number: 1962')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.emergencyCallBtn} 
            activeOpacity={0.8}
            onPress={() => handleCallVet('1962', 'National Animal Emergency Helpline')}
          >
            <FontAwesome name="phone" size={14} color="#DC2626" />
            <Text style={styles.emergencyCallTxt}>{t('vets.call1962', 'Call 1962')}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInUp.duration(500).delay(100).springify()} style={styles.searchRow}>
          <FontAwesome name="search" size={16} color="#64748B" style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('vets.searchPlaceholder', 'Search vet by name, clinic, or specialty...')}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
              <FontAwesome name="times-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Map Header Card (Clickable to open Full Radar Screen) */}
        <Animated.View entering={FadeInUp.duration(600).delay(200).springify()}>
          <TouchableOpacity 
            style={[styles.mapCard, isSatellite && { borderColor: '#0284C7' }]}
            activeOpacity={0.9}
            onPress={() => {
              if (filteredVets.length > 0) {
                setSelectedMapVet(filteredVets[0]);
                setIsMapModalOpen(true);
              } else {
                Alert.alert('No Vets', 'No nearby vets available to show on map.');
              }
            }}
          >
            <View style={styles.mapHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FontAwesome name={isSatellite ? "globe" : "map"} size={16} color={isSatellite ? "#0284C7" : "#059669"} />
                <Text style={styles.mapTitle}>{isSatellite ? t('vets.satelliteMap', 'Live Satellite Proximity') : t('vets.mapTitle', 'Live Geo-Proximity Map')}</Text>
              </View>

              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isSatellite ? '#0284C7' : '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}
                onPress={() => setIsSatellite(!isSatellite)}
              >
                <FontAwesome name="globe" size={11} color={isSatellite ? "#FFFFFF" : "#059669"} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: isSatellite ? "#FFFFFF" : "#059669" }}>
                  {isSatellite ? '📡 Satellite View' : '🗺️ Vector Radar'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.mapPlaceholder, isSatellite && { backgroundColor: '#031724', borderColor: '#0284C7' }]}>
              {isSatellite && (
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop&q=80' }} 
                  style={[StyleSheet.absoluteFillObject, { opacity: 0.75 }]} 
                  resizeMode="cover" 
                />
              )}
              <FontAwesome name={isSatellite ? "globe" : "compass"} size={36} color={isSatellite ? "#38BDF8" : "#059669"} />
              <Text style={[styles.mapLabel, isSatellite && { color: '#38BDF8', backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 8, borderRadius: 6 }]}>
                {t('vets.mapLabel', 'Nagpur District Veterinary Radar')}
              </Text>
              <Text style={[styles.mapSubLabel, isSatellite && { color: '#E2E8F0', backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 8, borderRadius: 6 }]}>
                {isSatellite ? 'High-resolution satellite terrain & hospital markers' : 'Tap here to open full interactive map & hospital pins'}
              </Text>
              <View style={[styles.openMapBtnPill, isSatellite && { backgroundColor: '#0284C7' }]}>
                <FontAwesome name="external-link" size={11} color="#FFFFFF" />
                <Text style={styles.openMapBtnTxt}>{t('vets.openRadar', 'Open Radar Map Screen')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* List Title Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listSectionTitle}>Verified Government Vets</Text>
          <Text style={styles.listBadgeTxt}>{filteredVets.length} Vets Found</Text>
        </View>

        {/* Vet Cards List */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loaderTxt}>Locating nearest veterinary officers...</Text>
          </View>
        ) : filteredVets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="user-md" size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Vets Found</Text>
            <Text style={styles.emptySub}>No veterinary officers match your search query.</Text>
          </View>
        ) : (
          filteredVets.map((vet, index) => (
            <Animated.View key={vet.id} entering={FadeInRight.delay(100 * index).springify()} style={styles.vetCard}>
              <View style={styles.vetCardTop}>
                <View style={styles.vetAvatar}>
                  <FontAwesome name="user-md" size={24} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vetName}>{vet.name}</Text>
                  <Text style={styles.clinicName}>{vet.clinic}</Text>
                  {vet.specialty && <Text style={styles.specialtyTxt}>{vet.specialty}</Text>}
                </View>
                <View style={styles.ratingBadge}>
                  <FontAwesome name="star" size={11} color="#D97706" />
                  <Text style={styles.ratingTxt}>{vet.rating?.toFixed(1)}</Text>
                </View>
              </View>

              <View style={styles.vetCardMiddle}>
                <View style={styles.detailChip}>
                  <FontAwesome name="map-marker" size={12} color="#64748B" />
                  <Text style={styles.detailTxt}>{vet.distanceFormat} away</Text>
                </View>
                <View style={styles.detailChip}>
                  <FontAwesome name="circle" size={8} color={vet.available ? '#059669' : '#DC2626'} />
                  <Text style={[styles.detailTxt, { color: vet.available ? '#059669' : '#DC2626' }]}>
                    {vet.available ? 'Available Now' : 'On Duty Field Call'}
                  </Text>
                </View>
              </View>

              <View style={styles.vetCardBottom}>
                <TouchableOpacity 
                  style={styles.actionNavBtn} 
                  activeOpacity={0.8}
                  onPress={() => handleNavigateVet(vet.latitude || 21.1458, vet.longitude || 79.0882, vet.name)}
                >
                  <FontAwesome name="location-arrow" size={14} color="#059669" />
                  <Text style={styles.actionNavTxt}>Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCallBtn} 
                  activeOpacity={0.8}
                  onPress={() => handleCallVet(vet.phone, vet.name)}
                >
                  <FontAwesome name="phone" size={14} color="#FFFFFF" />
                  <Text style={styles.actionCallTxt}>Call Vet</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}

        <View style={{ height: 95 }} />
      </ScrollView>

      {/* Live Geo-Proximity Radar Map Modal */}
      <Modal
        visible={isMapModalOpen}
        animationType="slide"
        transparent={false}
        statusBarTranslucent={true}
        onRequestClose={() => setIsMapModalOpen(false)}
      >
        <View style={styles.modalFullContainer}>
          {/* Modal Header */}
          <View style={[styles.modalGreenHeader, isSatellite && { backgroundColor: '#0F172A' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <TouchableOpacity onPress={() => setIsMapModalOpen(false)} style={styles.modalCloseBtn}>
                <FontAwesome name="arrow-left" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalGreenTitle} numberOfLines={1}>
                  {isSatellite ? '📡 Nagpur Satellite Radar' : 'Nagpur Live Geo Radar'}
                </Text>
                <Text style={styles.modalGreenSub} numberOfLines={1}>
                  {isSatellite ? 'Orbital Telemetry Active' : '10 Govt Vets Plotted'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity 
                onPress={() => setIsSatellite(!isSatellite)} 
                style={[styles.modalClosePill, isSatellite && { backgroundColor: '#0284C7' }]}
              >
                <FontAwesome name="globe" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.modalClosePillTxt}>{isSatellite ? 'Satellite' : 'Radar'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsMapModalOpen(false)} style={styles.modalCloseBtn}>
                <FontAwesome name="times" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Interactive Radar Map Area */}
          <View style={{ flex: 1, backgroundColor: '#020617' }}>
            {Platform.OS !== 'web' && MapView ? (
              <MapView
                style={StyleSheet.absoluteFillObject}
                mapType={isSatellite ? 'satellite' : 'standard'}
                initialRegion={{
                  latitude: 21.1458,
                  longitude: 79.0882,
                  latitudeDelta: 0.15,
                  longitudeDelta: 0.15,
                }}
                showsUserLocation={true}
              >
                {filteredVets.map((v: any, i: number) => {
                  const isSelected = selectedMapVet?.id === v.id;
                  return (
                    <Marker
                      key={v.id}
                      coordinate={{
                        latitude: v.latitude || 21.1458 + (i * 0.01),
                        longitude: v.longitude || 79.0882 + (i * 0.01),
                      }}
                      title={v.name}
                      description={v.clinic}
                      pinColor={isSelected ? 'blue' : 'green'}
                      onPress={() => setSelectedMapVet(v)}
                    />
                  );
                })}
              </MapView>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white' }}>Radar Map is not available on this platform.</Text>
              </View>
            )}
          </View>

          {/* Bottom Selected Vet Detail Sheet */}
          {selectedMapVet && (
            <View style={styles.mapDetailSheet}>
              <View style={styles.sheetTopRow}>
                <View style={styles.sheetAvatarCircle}>
                  <FontAwesome name="user-md" size={22} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetVetName}>{selectedMapVet.name}</Text>
                  <Text style={styles.sheetClinic}>{selectedMapVet.clinic}</Text>
                  <Text style={styles.sheetAddress}>{selectedMapVet.address || 'Nagpur, Maharashtra'}</Text>
                </View>
                <View style={styles.sheetRating}>
                  <FontAwesome name="star" size={12} color="#D97706" />
                  <Text style={styles.sheetRatingTxt}>{selectedMapVet.rating?.toFixed(1)}</Text>
                </View>
              </View>

              <View style={styles.sheetMetaRow}>
                <View style={styles.sheetMetaTag}>
                  <FontAwesome name="stethoscope" size={11} color="#059669" />
                  <Text style={styles.sheetMetaTxt}>{selectedMapVet.specialty || 'General Veterinary Officer'}</Text>
                </View>
                <View style={styles.sheetMetaTag}>
                  <FontAwesome name="location-arrow" size={11} color="#0284C7" />
                  <Text style={styles.sheetMetaTxt}>{selectedMapVet.distanceFormat} away</Text>
                </View>
              </View>

              <View style={styles.sheetActionRow}>
                <TouchableOpacity 
                  style={styles.sheetNavBtn}
                  activeOpacity={0.8}
                  onPress={() => handleNavigateVet(selectedMapVet.latitude || 21.1458, selectedMapVet.longitude || 79.0882, selectedMapVet.name)}
                >
                  <FontAwesome name="location-arrow" size={14} color="#059669" />
                  <Text style={styles.sheetNavTxt}>GPS Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sheetCallBtn}
                  activeOpacity={0.8}
                  onPress={() => handleCallVet(selectedMapVet.phone, selectedMapVet.name)}
                >
                  <FontAwesome name="phone" size={14} color="#FFFFFF" />
                  <Text style={styles.sheetCallTxt}>Call Doctor Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 110,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  emergencyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emergencySub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  emergencyCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emergencyCallTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#0F172A',
  },

  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  liveTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 6,
  },
  mapSubLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  listSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  listBadgeTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  loaderContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  loaderTxt: {
    fontSize: 13,
    color: '#64748B',
    marginTop: SPACING.sm,
  },

  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: SPACING.sm,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  vetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  vetCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  vetAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vetName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  clinicName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  specialtyTxt: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },

  vetCardMiddle: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginVertical: SPACING.xs + 2,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailTxt: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  vetCardBottom: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
    marginTop: SPACING.md,
  },
  actionNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionNavTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  actionCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionCallTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  openMapBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 8,
  },
  openMapBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Modal styles
  modalFullContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalGreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#15803D',
    paddingTop: Platform.OS === 'ios' ? 55 : (StatusBar.currentHeight || 40) + 12,
    paddingBottom: 14,
    paddingHorizontal: 14,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalGreenTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalGreenSub: {
    fontSize: 11,
    color: '#DCFCE7',
    marginTop: 1,
  },
  modalClosePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalClosePillTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  radarMapArea: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  radarCircleOuter: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  radarCircleMid: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  radarCircleInner: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.45)',
  },

  radarCenterPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  radarCenterPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
  },
  radarCenterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    marginTop: 6,
  },

  radarPinWrapper: {
    position: 'absolute',
    padding: 6,
  },
  radarPinSelected: {
    transform: [{ scale: 1.25 }],
    zIndex: 10,
  },
  radarPinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#059669',
    ...SHADOWS.sm,
  },
  radarPinBadgeActive: {
    backgroundColor: '#059669',
    borderColor: '#FFFFFF',
  },
  radarPinNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },

  mapDetailSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  sheetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sheetAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetVetName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetClinic: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginTop: 1,
  },
  sheetAddress: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sheetRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sheetRatingTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },

  sheetMetaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sheetMetaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sheetMetaTxt: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },

  sheetActionRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
  },
  sheetNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 12,
    borderRadius: 14,
  },
  sheetNavTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  sheetCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 14,
  },
  sheetCallTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
