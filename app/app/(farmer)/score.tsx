import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../config/api';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../constants/theme';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';

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
      const res = await fetch(`${API_BASE_URL}/farm/score`, {
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
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, justifyContent: 'center', backgroundColor: COLORS.backgroundBase }} />;
  }

  if (!data) return <Text style={{ textAlign: 'center', marginTop: 50, ...TYPOGRAPHY.body }}>Error loading score.</Text>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.primary;
    if (score >= 50) return COLORS.warning;
    return COLORS.error;
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return COLORS.primaryLight;
    if (score >= 50) return '#FEF3C7';
    return '#FEE2E2';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Farm Analytics</Text>
            <Text style={styles.headerSubtitle}>AI Productivity Score</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={[GLOBAL_STYLES.card, { alignItems: 'center', paddingVertical: SPACING.xxl }]}>
          <View style={[styles.circle, { borderColor: getScoreColor(data.score), backgroundColor: getScoreBgColor(data.score) }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(data.score) }]}>{data.score}</Text>
            <Text style={styles.scoreOutOf}>/ 100</Text>
          </View>
          <Text style={styles.suggestionTitle}>AI Recommendation</Text>
          <Text style={styles.suggestionText}>{data.suggestion}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)}>
          <Text style={styles.sectionTitle}>Performance Breakdown</Text>
          
          <Animated.View entering={FadeInRight.delay(300).springify()} style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: COLORS.secondaryLight }]}>
              <FontAwesome name="shield" size={24} color={COLORS.secondaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricTitle}>Vaccination Coverage</Text>
              <Text style={styles.metricDesc}>{data.details?.vaccinationScore}/40 Points</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(400).springify()} style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEE2E2' }]}>
              <FontAwesome name="heartbeat" size={24} color={COLORS.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricTitle}>Herd Health (Low Disease Rate)</Text>
              <Text style={styles.metricDesc}>{data.details?.healthScore}/40 Points</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(500).springify()} style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#EDE9FE' }]}>
              <FontAwesome name="tint" size={24} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricTitle}>Milk Yield Trajectory</Text>
              <Text style={styles.metricDesc}>{data.details?.milkScore}/20 Points ({data.details?.totalMilkLiters} L logged)</Text>
            </View>
          </Animated.View>
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
  scrollContent: { padding: SPACING.lg, paddingBottom: 120 },
  circle: { width: 160, height: 160, borderRadius: 80, borderWidth: 8, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl },
  scoreText: { fontSize: 48, fontWeight: '800', lineHeight: 56 },
  scoreOutOf: { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  suggestionTitle: { ...TYPOGRAPHY.h3, fontSize: 18, color: COLORS.textMain, marginBottom: SPACING.sm },
  suggestionText: { ...TYPOGRAPHY.body, textAlign: 'center', paddingHorizontal: SPACING.md },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain, marginBottom: SPACING.md, marginTop: SPACING.md },
  metricCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSurface, borderRadius: SIZES.radiusLg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.borderMedium, gap: SPACING.md },
  metricIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  metricTitle: { ...TYPOGRAPHY.label, fontSize: 16, marginBottom: 2 },
  metricDesc: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.textMuted }
});
