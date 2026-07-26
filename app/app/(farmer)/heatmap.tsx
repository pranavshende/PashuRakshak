import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Switch } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../constants/theme';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, withRepeat, withSequence, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

let MapView: any;
let Marker: any;
let Circle: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
}

const PulseWarning = () => {
  const opacity = useSharedValue(0.2);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.2, { duration: 600 })
      ),
      -1,
      true
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View style={[styles.warningPill, animatedStyle]}>
      <FontAwesome name="exclamation-triangle" size={14} color="#fff" />
      <Text style={styles.warningText}>High Risk Zones Detected</Text>
    </Animated.View>
  );
};

export default function HeatmapScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);
  const [showPredictions, setShowPredictions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [days, showPredictions]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = showPredictions ? 'predict' : `historical?days=${days}`;
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/outbreaks/${endpoint}`);
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <FontAwesome name="map" size={50} color={COLORS.textMuted} />
        <Text style={styles.webFallbackText}>Interactive GIS Maps are only available on the native mobile app.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 19.0760,
          longitude: 72.8777,
          latitudeDelta: 2.0,
          longitudeDelta: 2.0,
        }}
      >
        {data.map((report) => (
          <Circle
            key={report.id}
            center={{ latitude: report.latitude, longitude: report.longitude }}
            radius={report.severity === 'High' ? 15000 : 8000}
            fillColor={showPredictions ? 'rgba(139, 92, 246, 0.4)' : report.severity === 'High' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}
            strokeWidth={0}
          />
        ))}
      </MapView>

      <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={styles.titlePill}>
          <Text style={styles.titleText}>Disease Intelligence</Text>
        </View>
      </Animated.View>

      {showPredictions && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.warningContainer}>
          <PulseWarning />
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.overlay}>
        <View style={styles.controlPanel}>
          <View style={styles.row}>
            <View>
              <Text style={styles.labelTitle}>AI Prediction</Text>
              <Text style={styles.labelSub}>14-Day Outbreak Forecast</Text>
            </View>
            <Switch 
              value={showPredictions} 
              onValueChange={setShowPredictions}
              trackColor={{ false: COLORS.borderMedium, true: COLORS.secondary }}
              thumbColor={'#fff'}
            />
          </View>

          {!showPredictions && (
            <View style={styles.sliderContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
                <Text style={styles.labelTitle}>Time Machine</Text>
                <Text style={{ ...TYPOGRAPHY.label, color: COLORS.primaryDark }}>Last {days} Days</Text>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={365}
                step={1}
                value={days}
                onSlidingComplete={setDays}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.borderMedium}
                thumbTintColor={COLORS.primary}
              />
            </View>
          )}

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.primary} size="small" />
              <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted }}>Fetching GIS data...</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundBase },
  map: { width: '100%', height: '100%' },
  webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.backgroundBase },
  webFallbackText: { ...TYPOGRAPHY.h3, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.lg },
  header: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 60 : 40, 
    left: SPACING.lg, 
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  titlePill: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radiusXl,
    ...SHADOWS.md,
  },
  titleText: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textMain,
  },
  warningContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 120 : 100, left: 0, right: 0, alignItems: 'center' },
  warningPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.error, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: 100, gap: SPACING.sm, ...SHADOWS.md },
  warningText: { ...TYPOGRAPHY.label, color: '#fff', fontWeight: '700' },
  overlay: { position: 'absolute', bottom: 40, left: SPACING.lg, right: SPACING.lg },
  controlPanel: { 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    padding: SPACING.xl, 
    borderRadius: SIZES.radiusXl, 
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  labelTitle: { ...TYPOGRAPHY.label, color: COLORS.textMain, fontWeight: '700' },
  labelSub: { ...TYPOGRAPHY.label, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  sliderContainer: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: SPACING.md },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md, gap: SPACING.sm }
});
