import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FarmScoreScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchScore();
  }, []);

  const fetchScore = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch('http://127.0.0.1:5000/farm/score', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#10B981" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!data) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Error loading score.</Text>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 50) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Productivity Score</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.scoreCard}>
        <View style={[styles.circle, { borderColor: getScoreColor(data.score) }]}>
          <Text style={[styles.scoreText, { color: getScoreColor(data.score) }]}>{data.score}</Text>
          <Text style={styles.scoreOutOf}>/ 100</Text>
        </View>
        <Text style={styles.suggestionTitle}>AI Insight</Text>
        <Text style={styles.suggestionText}>{data.suggestion}</Text>
      </View>

      <Text style={styles.sectionTitle}>Breakdown</Text>
      
      <View style={styles.metricCard}>
        <View style={styles.metricRow}>
          <FontAwesome name="shield" size={24} color="#3B82F6" style={{ width: 30 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.metricTitle}>Vaccination Coverage</Text>
            <Text style={styles.metricDesc}>{data.details?.vaccinationScore}/40 Points</Text>
          </View>
        </View>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.metricRow}>
          <FontAwesome name="heartbeat" size={24} color="#EF4444" style={{ width: 30 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.metricTitle}>Herd Health (Low Disease Rate)</Text>
            <Text style={styles.metricDesc}>{data.details?.healthScore}/40 Points</Text>
          </View>
        </View>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.metricRow}>
          <FontAwesome name="tint" size={24} color="#8B5CF6" style={{ width: 30 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.metricTitle}>Milk Yield</Text>
            <Text style={styles.metricDesc}>{data.details?.milkScore}/20 Points ({data.details?.totalMilkLiters} L logged)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  scoreCard: { backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 2, marginBottom: 30 },
  circle: { width: 150, height: 150, borderRadius: 75, borderWidth: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  scoreText: { fontSize: 48, fontWeight: 'bold' },
  scoreOutOf: { fontSize: 16, color: '#6B7280' },
  suggestionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 5 },
  suggestionText: { fontSize: 14, color: '#4B5563', textAlign: 'center', paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
  metricCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, elevation: 1 },
  metricRow: { flexDirection: 'row', alignItems: 'center' },
  metricTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  metricDesc: { fontSize: 14, color: '#6B7280' }
});
