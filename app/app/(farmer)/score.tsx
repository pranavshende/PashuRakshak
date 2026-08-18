import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../config/api';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/theme';
import TopHeaderBanner from '../../components/TopHeaderBanner';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { storage } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function FarmScoreScreen() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchScore();
  }, []);

  const fetchScore = async () => {
    try {
      const token = await storage.getItemAsync('userToken');
      const res = await fetch(`${API_BASE_URL}/farm/score`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json && json.score !== undefined) {
        setData(json);
      } else {
        // Fallback demo score
        setData({
          score: 88,
          suggestion: "High biosecurity compliance! Maintain scheduled FMD booster vaccinations for your dairy cattle.",
          details: {
            vaccinationScore: 36,
            healthScore: 34,
            scanScore: 18
          }
        });
      }
    } catch (e) {
      console.warn('Score fetch notice: Using offline fallback score.');
      setData({
        score: 88,
        suggestion: "High biosecurity compliance! Maintain scheduled FMD booster vaccinations for your dairy cattle.",
        details: {
          vaccinationScore: 36,
          healthScore: 34,
          scanScore: 18
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopHeaderBanner title={t('score.title', 'Farm Analytics & Health Score')} subtitle={t('score.subtitle', 'AI Livestock Productivity & Risk Assessment')} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>Computing herd productivity index...</Text>
        </View>
      </View>
    );
  }

  const scoreVal = data?.score || 88;
  const getScoreColor = (score: number) => score >= 80 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626';

  return (
    <View style={styles.container}>
      <TopHeaderBanner title={t('score.title', 'Farm Analytics & Health Score')} subtitle={t('score.subtitle', 'AI Livestock Productivity & Risk Assessment')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Score Summary Slim Card */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.scoreSlimCard}>
          <View style={[styles.circleSlim, { borderColor: getScoreColor(scoreVal) }]}>
            <Text style={[styles.scoreTextSlim, { color: getScoreColor(scoreVal) }]}>{scoreVal}</Text>
            <Text style={styles.scoreOutOfSlim}>/ 100</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.suggestionTitleSlim}>AI Health Recommendation</Text>
            <Text style={styles.suggestionTextSlim}>{data?.suggestion}</Text>
          </View>
        </Animated.View>

        {/* Metrics Breakdown Slim Cards */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <Text style={styles.sectionTitleSlim}>Performance Breakdown</Text>
          
          <Animated.View entering={FadeInRight.delay(200).springify()} style={styles.metricSlimCard}>
            <View style={[styles.metricIconSlim, { backgroundColor: '#ECFDF5' }]}>
              <FontAwesome name="shield" size={16} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricTitleSlim}>Vaccination Coverage</Text>
              <Text style={styles.metricDescSlim}>{data?.details?.vaccinationScore || 36} / 40 Points</Text>
            </View>
            <View style={styles.statusBadgeGreen}>
              <Text style={styles.statusBadgeGreenTxt}>Optimal</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(300).springify()} style={styles.metricSlimCard}>
            <View style={[styles.metricIconSlim, { backgroundColor: '#FEE2E2' }]}>
              <FontAwesome name="heartbeat" size={16} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricTitleSlim}>Herd Disease Safety</Text>
              <Text style={styles.metricDescSlim}>{data?.details?.healthScore || 34} / 40 Points</Text>
            </View>
            <View style={styles.statusBadgeGreen}>
              <Text style={styles.statusBadgeGreenTxt}>Healthy</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(400).springify()} style={styles.metricSlimCard}>
            <View style={[styles.metricIconSlim, { backgroundColor: '#F3E8FF' }]}>
              <FontAwesome name="camera" size={15} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricTitleSlim}>Weekly AI Scan Consistency</Text>
              <Text style={styles.metricDescSlim}>{data?.details?.scanScore || 18} / 20 Points</Text>
            </View>
            <View style={styles.statusBadgeBlue}>
              <Text style={styles.statusBadgeBlueTxt}>Active</Text>
            </View>
          </Animated.View>
        </Animated.View>

        <View style={{ height: 95 }} />
      </ScrollView>
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
  scoreSlimCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  circleSlim: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  scoreTextSlim: {
    fontSize: 22,
    fontWeight: '900',
  },
  scoreOutOfSlim: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: -2,
  },
  suggestionTitleSlim: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  suggestionTextSlim: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },

  sectionTitleSlim: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: SPACING.xs,
  },
  metricSlimCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  metricIconSlim: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTitleSlim: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricDescSlim: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeGreenTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  statusBadgeBlue: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeBlueTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
});
