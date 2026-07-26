import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Switch } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

// Only import MapView on native platforms to prevent Web crashes without setup
let MapView: any;
let Marker: any;
let Circle: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
}

export default function HeatmapScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    fetchData();
  }, [days, showPredictions]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = showPredictions ? 'predict' : `historical?days=${days}`;
      const res = await fetch(`http://127.0.0.1:5000/outbreaks/${endpoint}`);
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
        <FontAwesome name="map" size={50} color="#9CA3AF" />
        <Text style={styles.webFallbackText}>Interactive GIS Maps are only available on the native mobile app.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
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

      {/* Floating UI Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Disease Intelligence Map</Text>
        
        <View style={styles.controlPanel}>
          <View style={styles.row}>
            <Text style={styles.label}>AI Outbreak Prediction (14-Day)</Text>
            <Switch 
              value={showPredictions} 
              onValueChange={setShowPredictions}
              trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            />
          </View>

          {!showPredictions && (
            <View style={styles.sliderContainer}>
              <Text style={styles.label}>Time Slider: Last {days} Days</Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={365}
                step={1}
                value={days}
                onSlidingComplete={setDays}
                minimumTrackTintColor="#10B981"
                maximumTrackTintColor="#D1D5DB"
              />
            </View>
          )}

          {loading && <ActivityIndicator style={{ marginTop: 10 }} color="#10B981" />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  map: { width: '100%', height: '100%' },
  webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  webFallbackText: { fontSize: 18, color: '#4B5563', textAlign: 'center', marginTop: 20 },
  overlay: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 15, elevation: 5 },
  controlPanel: { backgroundColor: 'rgba(255,255,255,0.95)', padding: 20, borderRadius: 20, elevation: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 5 },
  sliderContainer: { marginTop: 5 }
});
