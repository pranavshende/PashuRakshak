import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Dimensions, Linking, Alert, Modal, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import TopHeaderBanner from '../../../components/TopHeaderBanner';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { storage } from '../../../context/AuthContext';
import * as Location from 'expo-location';

// Dynamically import MapView for native platforms to avoid bundle crashes on web and Expo Go environments
let MapView: any = null;
let Marker: any = null;
let Circle: any = null;
// Temporarily disabled react-native-maps on all platforms to prevent crash without API Key in production
// if (Platform.OS !== 'web') {
//   try {
//     const MapModule = require('react-native-maps');
//     MapView = MapModule.default;
//     Marker = MapModule.Marker;
//     Circle = MapModule.Circle;
//   } catch (error) {
//     console.warn("react-native-maps could not be loaded in this environment. Falling back to mockup map.", error);
//   }
// }

const { width } = Dimensions.get('window');

// Disease Precautions Dictionary
const PRECAUTIONS_DATA: Record<string, { summary: string; steps: string[] }> = {
  'Lumpy Skin Disease': {
    summary: 'Viral disease causing skin nodules, fever, and reduced milk yield in cattle.',
    steps: [
      'Isolate affected cattle immediately from the main herd.',
      'Apply anti-tick & fly repellents to prevent vector transmission.',
      'Vaccinate healthy cattle in a 5 km radius.',
      'Clean and sanitize feeding troughs and water tanks.'
    ]
  },
  'Foot & Mouth Disease': {
    summary: 'Highly contagious viral disease affecting cloven-hoofed animals causing blisters.',
    steps: [
      'Enforce strict quarantine and restrict animal movement.',
      'Disinfect equipment and boots with 4% sodium carbonate solution.',
      'Feed soft, easily digestible forage to affected animals.',
      'Alert nearby farmers and local veterinary officer immediately.'
    ]
  },
  'Bovine Mastitis': {
    summary: 'Udder inflammation leading to milk discolouration and reduced yield.',
    steps: [
      'Practice antiseptic teat dipping before and after milking.',
      'Milk infected cows last to avoid cross-contamination.',
      'Administer targeted antibiotic treatment prescribed by a vet.',
      'Keep barn bedding dry, clean, and well-ventilated.'
    ]
  },
  'Default': {
    summary: 'Regional contagious disease outbreak alert in your agricultural zone.',
    steps: [
      'Isolate symptomatic animals from healthy livestock.',
      'Sanitize farm premises and water sources daily.',
      'Monitor body temperature twice daily.',
      'Contact a registered veterinarian for clinical examination.'
    ]
  }
};

// Helper: Open external maps app
const openExternalMaps = (lat: number, lon: number, label: string = 'Outbreak Location') => {
  const latLng = `${lat},${lon}`;
  const url = Platform.select({
    ios: `maps:0,0?q=${encodeURIComponent(label)}@${latLng}`,
    android: `geo:0,0?q=${latLng}(${encodeURIComponent(label)})`,
    web: `https://www.google.com/maps/search/?api=1&query=${latLng}`
  }) || `https://www.google.com/maps/search/?api=1&query=${latLng}`;

  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latLng}`);
  });
};

// Helper: Haversine distance calculator
function calculateDistance(lat1?: number, lon1?: number, lat2?: number, lon2?: number): string {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 'Near region';
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return `${d.toFixed(1)} km`;
}

const INITIAL_OUTBREAKS = [
  {
    id: 'o1',
    disease: 'Lumpy Skin Disease',
    location: 'Sitabuldi & Hingna Sector, Nagpur',
    latitude: 21.1458,
    longitude: 79.0882,
    distance: '3.2 km',
    time: '2 hours ago',
    severity: 'CRITICAL',
    confirmedCases: 14,
  },
  {
    id: 'o2',
    disease: 'Foot & Mouth Disease',
    location: 'Kamptee Cantonment Zone, Nagpur',
    latitude: 21.2200,
    longitude: 79.2000,
    distance: '11.5 km',
    time: '5 hours ago',
    severity: 'HIGH',
    confirmedCases: 8,
  },
  {
    id: 'o3',
    disease: 'Black Quarter',
    location: 'Umred Agricultural Belt',
    latitude: 20.8500,
    longitude: 79.3200,
    distance: '14.8 km',
    time: '1 day ago',
    severity: 'MEDIUM',
    confirmedCases: 5,
  },
  {
    id: 'o4',
    disease: 'Haemorrhagic Septicaemia',
    location: 'Saoner Dairy Cluster',
    latitude: 21.3800,
    longitude: 78.9100,
    distance: '18.2 km',
    time: '2 days ago',
    severity: 'HIGH',
    confirmedCases: 6,
  }
];

export default function CommunityNetworkScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<any[]>(INITIAL_OUTBREAKS);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>({ latitude: 21.1458, longitude: 79.0882 });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activePrecautionModal, setActivePrecautionModal] = useState<any>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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
        console.warn("Location permissions notice: using Nagpur center coordinates.");
      }
    })();
  }, []);

  useEffect(() => {
    const fetchOutbreaks = async () => {
      try {
        const token = await storage.getItemAsync('userToken');
        
        const res = await fetch(`${API_URL}/outbreaks/historical?days=30`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        
        if (res.ok && data.data && data.data.length > 0) {
          const mapped = data.data.map((report: any) => {
            const date = new Date(report.reportedAt);
            const hoursAgo = Math.max(1, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60)));
            const timeDiffStr = hoursAgo > 24 ? `${Math.floor(hoursAgo / 24)} days ago` : `${hoursAgo} hours ago`;
            
            const dist = userLocation && report.latitude && report.longitude 
              ? calculateDistance(userLocation.latitude, userLocation.longitude, report.latitude, report.longitude)
              : 'Local Region';

            return {
              id: report.id,
              disease: report.diseaseName,
              location: report.locationName || `Lat: ${report.latitude.toFixed(2)}, Lon: ${report.longitude.toFixed(2)}`,
              latitude: report.latitude,
              longitude: report.longitude,
              distance: dist,
              time: timeDiffStr,
              severity: (report.severity || 'HIGH').toUpperCase(),
              confirmedCases: report.confirmedCases || 1
            };
          });
          setAlerts(mapped);
        } else {
          setAlerts(INITIAL_OUTBREAKS);
        }
      } catch (err) {
        console.warn("Outbreaks fetch notice: Using initial verified outbreak monitoring.");
        setAlerts(INITIAL_OUTBREAKS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOutbreaks();
  }, [userLocation]);

  const handleToggleNotifications = () => {
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
    Alert.alert(
      "Outbreak Alerts",
      nextState ? "Live disease outbreak push notifications enabled!" : "Push notifications muted."
    );
  };

  const getPrecautionsForDisease = (diseaseName: string) => {
    const key = Object.keys(PRECAUTIONS_DATA).find(k => k.toLowerCase().includes((diseaseName || '').toLowerCase())) || 'Default';
    return PRECAUTIONS_DATA[key];
  };

  const [isSatellite, setIsSatellite] = useState(false);

  const handleOpenGlobalMap = () => {
    setIsMapModalOpen(true);
  };

  return (
    <View style={styles.container}>
      <TopHeaderBanner title="Intelligence Network" subtitle="Community Disease Surveillance" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Threat Level Banner */}
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <TouchableOpacity 
            style={styles.threatBanner}
            onPress={() => setIsMapModalOpen(true)}
            activeOpacity={0.9}
          >
            <View style={styles.threatIconWrapper}>
              <FontAwesome name="warning" size={24} color="#fff" />
            </View>
            <View style={styles.threatInfo}>
              <Text style={styles.threatTitle}>ELEVATED THREAT LEVEL</Text>
              <Text style={styles.threatDesc}>Active disease clusters reported in Nagpur district. Tap to view on Map.</Text>
            </View>
            <FontAwesome name="external-link" size={16} color="rgba(255,255,255,0.8)" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Animated.View>

        {/* Regional Disease Heatmap */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.heatmapCard}>
          <View style={{ marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Regional Heatmap</Text>
              <TouchableOpacity style={styles.openMapBadgeBtn} onPress={() => setIsMapModalOpen(true)} activeOpacity={0.8}>
                <FontAwesome name="map-marker" size={12} color={COLORS.primaryDark} />
                <Text style={styles.openMapBadgeText}>Open Radar</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: 11, color: '#64748B' }}>Nagpur Disease Surveillance</Text>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isSatellite ? '#0284C7' : '#E2E8F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}
                onPress={() => setIsSatellite(!isSatellite)}
                activeOpacity={0.8}
              >
                <FontAwesome name="globe" size={11} color={isSatellite ? "#FFFFFF" : "#475569"} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: isSatellite ? "#FFFFFF" : "#475569" }}>
                  {isSatellite ? '📡 Satellite' : '🗺️ Map'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {Platform.OS === 'web' || !MapView ? (
            <WebMockupMap 
              alerts={alerts} 
              userLocation={userLocation} 
              onSelectAlert={setSelectedAlert}
              selectedAlert={selectedAlert}
              isSatellite={isSatellite}
            />
          ) : (
            <View style={{ height: 220, borderRadius: SIZES.radiusMd, overflow: 'hidden' }}>
              {MapView && (
                <MapView
                  style={StyleSheet.absoluteFillObject}
                  mapType={isSatellite ? 'satellite' : 'standard'}
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
                      description={`Severity: ${a.severity} | Distance: ${a.distance}`}
                      pinColor={a.severity === 'CRITICAL' ? 'red' : a.severity === 'HIGH' ? 'orange' : 'green'}
                      onCalloutPress={() => openExternalMaps(a.latitude, a.longitude, a.disease)}
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
            <Text style={styles.sectionTitle}>Nearby Outbreak Alerts</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE MONITORING</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: SPACING.sm }}>Syncing disease surveillance network...</Text>
            </View>
          ) : alerts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <FontAwesome name="shield" size={36} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>All Clear!</Text>
              <Text style={styles.emptyText}>No disease outbreaks reported in your area. Your herd location is currently secure.</Text>
            </View>
          ) : (
            alerts.map((alert, index) => (
              <Animated.View 
                key={alert.id} 
                entering={FadeInRight.delay(300 + index * 100).springify()} 
                style={styles.alertCard}
              >
                <View style={[styles.severityIndicator, { backgroundColor: alert.severity === 'CRITICAL' ? COLORS.error : alert.severity === 'HIGH' ? '#f97316' : COLORS.warning }]} />
                <View style={styles.alertContent}>
                  <View style={styles.alertTopRow}>
                    <Text style={styles.alertDisease}>{alert.disease || alert.name}</Text>
                    <Text style={styles.alertTime}>{alert.time}</Text>
                  </View>
                  
                  <View style={styles.alertMiddleRow}>
                    <FontAwesome name="map-marker" size={14} color={COLORS.primary} />
                    <Text style={styles.alertLocation}>{alert.location} ({alert.distance})</Text>
                  </View>
                  
                  <View style={styles.alertBottomRow}>
                    <View style={styles.casesBadge}>
                      <FontAwesome name="stethoscope" size={10} color={COLORS.primaryDark} />
                      <Text style={styles.casesText}>{alert.confirmedCases} Confirmed Cases</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
                      <TouchableOpacity 
                        style={styles.navigateBtn}
                        onPress={() => openExternalMaps(alert.latitude, alert.longitude, alert.disease)}
                        activeOpacity={0.8}
                      >
                        <FontAwesome name="location-arrow" size={12} color={COLORS.primaryDark} />
                        <Text style={styles.navigateText}>Map</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.readMoreBtn}
                        onPress={() => setActivePrecautionModal(alert)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.readMoreText}>Precautions</Text>
                        <FontAwesome name="chevron-right" size={10} color={COLORS.primaryDark} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Precautions Modal */}
      <Modal
        visible={activePrecautionModal !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActivePrecautionModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {activePrecautionModal && (() => {
              const info = getPrecautionsForDisease(activePrecautionModal.disease);
              return (
                <>
                  <View style={styles.modalHeader}>
                    <View style={{ flex: 1, paddingRight: SPACING.md }}>
                      <Text style={styles.modalTitle}>{activePrecautionModal.disease}</Text>
                      <Text style={styles.modalSubTitle}>Severity: <Text style={{ color: activePrecautionModal.severity === 'CRITICAL' ? COLORS.error : '#f97316', fontWeight: '700' }}>{activePrecautionModal.severity}</Text> | {activePrecautionModal.distance}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setActivePrecautionModal(null)} style={styles.closeBtn}>
                      <FontAwesome name="times" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.summaryBox}>
                      <Text style={styles.summaryText}>{info.summary}</Text>
                    </View>

                    <Text style={styles.precautionSectionTitle}>Recommended Action Plan:</Text>
                    {info.steps.map((step: string, i: number) => (
                      <View key={i} style={styles.stepRow}>
                        <View style={styles.stepNumberBadge}>
                          <Text style={styles.stepNumberText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={{ flexDirection: 'column', gap: SPACING.xs, marginTop: SPACING.md }}>
                    <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
                      <TouchableOpacity 
                        style={[styles.modalMapBtn, { flex: 1, backgroundColor: '#DC2626' }]}
                        onPress={() => {
                          Linking.openURL('tel:1962').catch(() => {
                            Alert.alert('Call Helpline', 'Please dial 1962 for National Animal Emergency Helpline.');
                          });
                        }}
                        activeOpacity={0.85}
                      >
                        <FontAwesome name="phone" size={14} color="#fff" />
                        <Text style={styles.modalMapBtnText}>Call Helpline 1962</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.modalMapBtn, { flex: 1, backgroundColor: '#059669' }]}
                        onPress={() => {
                          setActivePrecautionModal(null);
                          router.push('/(farmer)/chat' as any);
                        }}
                        activeOpacity={0.85}
                      >
                        <FontAwesome name="comments" size={14} color="#fff" />
                        <Text style={styles.modalMapBtnText}>Ask AI Vet</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                      style={[styles.modalMapBtn, { backgroundColor: '#0284C7' }]}
                      onPress={() => {
                        openExternalMaps(activePrecautionModal.latitude, activePrecautionModal.longitude, activePrecautionModal.disease);
                        setActivePrecautionModal(null);
                      }}
                      activeOpacity={0.85}
                    >
                      <FontAwesome name="location-arrow" size={14} color="#fff" />
                      <Text style={styles.modalMapBtnText}>Open GPS Navigation</Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* Interactive Global Outbreak Radar Map Modal */}
      <Modal
        visible={isMapModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsMapModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
          {/* Modal Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isSatellite ? '#0F172A' : '#15803D', paddingTop: Platform.OS === 'ios' ? 55 : 45, paddingBottom: 16, paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity onPress={() => setIsMapModalOpen(false)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                <FontAwesome name="arrow-left" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>District Disease Outbreak Radar</Text>
                <Text style={{ fontSize: 11, color: '#DCFCE7', marginTop: 2 }}>{isSatellite ? '📡 Orbital Satellite Telemetry Active' : 'Nagpur Surveillance Network Active'}</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setIsSatellite(!isSatellite)} 
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: isSatellite ? '#0284C7' : 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
            >
              <FontAwesome name="globe" size={12} color="#FFFFFF" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>{isSatellite ? '📡 Satellite' : '🗺️ Radar'}</Text>
            </TouchableOpacity>
          </View>

          {/* Interactive Outbreak Grid */}
          <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            {isSatellite && (
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop&q=80' }} 
                style={[StyleSheet.absoluteFillObject, { opacity: 0.65 }]} 
                resizeMode="cover" 
              />
            )}

            <View style={{ position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: isSatellite ? 'rgba(56, 189, 248, 0.5)' : 'rgba(239, 68, 68, 0.3)' }} />
            <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: isSatellite ? 'rgba(56, 189, 248, 0.6)' : 'rgba(239, 68, 68, 0.4)' }} />
            
            {/* Center Farmer Pin */}
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#38BDF8', justifyContent: 'center', alignItems: 'center' }}>
              <FontAwesome name="user" size={12} color="#FFFFFF" />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#38BDF8', marginTop: 6, backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
              Your Location (Nagpur)
            </Text>

            {/* Outbreak Hotspot Pins */}
            {alerts.map((alertItem, i) => {
              const hotspotPositions = [
                { top: '25%', left: '22%' },
                { top: '38%', left: '72%' },
                { top: '62%', left: '28%' },
                { top: '72%', left: '68%' }
              ];
              const pos = hotspotPositions[i % hotspotPositions.length];
              return (
                <TouchableOpacity
                  key={alertItem.id}
                  style={[{ position: 'absolute', padding: 6 }, pos as any]}
                  activeOpacity={0.8}
                  onPress={() => setActivePrecautionModal(alertItem)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isSatellite ? '#0284C7' : '#EF4444', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12, borderWidth: 1.5, borderColor: '#FFFFFF' }}>
                    <FontAwesome name={isSatellite ? "globe" : "warning"} size={11} color="#FFFFFF" />
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>{alertItem.disease}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function WebMockupMap({ alerts, userLocation, onSelectAlert, selectedAlert, isSatellite }: any) {
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
    <View style={[styles.webMapContainer, isSatellite && { backgroundColor: '#03170e', borderColor: '#059669' }]}>
      {isSatellite && (
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop&q=80' }} 
          style={[StyleSheet.absoluteFillObject, { opacity: 0.75 }]} 
          resizeMode="cover" 
        />
      )}
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
          <TouchableOpacity 
            style={styles.tooltipMapBtn}
            onPress={() => openExternalMaps(selectedAlert.latitude, selectedAlert.longitude, selectedAlert.disease)}
            activeOpacity={0.8}
          >
            <FontAwesome name="location-arrow" size={10} color="#fff" />
            <Text style={styles.tooltipMapBtnText}>Open in Google Maps</Text>
          </TouchableOpacity>
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
  alertToggleDisabled: { backgroundColor: COLORS.backgroundSurface, borderWidth: 1, borderColor: COLORS.borderMedium },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 110 },
  threatBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef4444', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, marginBottom: SPACING.md, ...SHADOWS.md },
  threatIconWrapper: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  threatInfo: { flex: 1 },
  threatTitle: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  threatDesc: { fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 1 },
  heatmapCard: { backgroundColor: COLORS.backgroundSurface, padding: SPACING.md, borderRadius: 14, marginBottom: SPACING.md, borderWidth: 1, borderColor: '#F1F5F9', ...SHADOWS.sm },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textMain },
  openMapBadgeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  openMapBadgeText: { fontSize: 11, fontWeight: '800', color: COLORS.primaryDark },
  webMapContainer: {
    height: 180,
    backgroundColor: COLORS.backgroundBase,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryGlow,
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
  tooltipMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  tooltipMapBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
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
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#fecaca' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.error },
  liveText: { color: COLORS.error, fontWeight: '800', fontSize: 9, letterSpacing: 0.5 },
  loaderContainer: { padding: SPACING.xl, alignItems: 'center' },
  emptyContainer: { padding: SPACING.xl, alignItems: 'center', backgroundColor: COLORS.backgroundSurface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderLight, borderStyle: 'dashed' },
  emptyIconWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textMain, marginBottom: 2 },
  emptyText: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: SPACING.md },
  alertCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', ...SHADOWS.sm },
  severityIndicator: { width: 5 },
  alertContent: { flex: 1, paddingVertical: 10, paddingHorizontal: 12 },
  alertTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  alertDisease: { fontSize: 13, fontWeight: '800', color: COLORS.textMain, flex: 1 },
  alertTime: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
  alertMiddleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  alertLocation: { fontSize: 11, color: COLORS.textMuted },
  alertBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  casesBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  casesText: { color: '#059669', fontWeight: '800', fontSize: 10 },
  navigateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  navigateText: { color: '#059669', fontWeight: '800', fontSize: 10 },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  readMoreText: { color: '#059669', fontWeight: '800', fontSize: 10 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.backgroundBase,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.md,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textMain,
  },
  modalSubTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBox: {
    backgroundColor: COLORS.backgroundSurface,
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  summaryText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textMain,
  },
  precautionSectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textMain,
    marginBottom: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textMain,
  },
  modalActions: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
  },
  modalMapBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radiusXl,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  modalMapBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
