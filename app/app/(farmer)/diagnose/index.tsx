import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { storage } from '../../../context/AuthContext';

export default function DiagnoseScreen() {
  const { imageUri } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!imageUri) {
      setErrorMsg('No image provided.');
      setLoading(false);
      return;
    }

    const analyzeImage = async () => {
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
        const token = await storage.getItemAsync('userToken');

        const formData = new FormData();
        // React Native FormData requires { uri, name, type } for files
        formData.append('file', {
          uri: Platform.OS === 'ios' ? (imageUri as string).replace('file://', '') : (imageUri as string),
          name: 'scan.jpg',
          type: 'image/jpeg',
        } as any);

        const response = await fetch(`${API_URL}/predict/analyze`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setResult(data.prediction);
        } else {
          setErrorMsg(data.error?.detail || data.error || 'Analysis failed.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Network error while analyzing image. Please ensure ML service is running on port 8000.');
      } finally {
        setLoading(false);
      }
    };

    analyzeImage();
  }, [imageUri]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.replace('/(farmer)' as any)}>
          <FontAwesome name="times" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={TYPOGRAPHY.h3}>AI Diagnosis</Text>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Scanned Image Preview */}
        {imageUri && (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.imageContainer}>
            <Image source={{ uri: imageUri as string }} style={styles.image} />
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Running ML Model...</Text>
              </View>
            )}
          </Animated.View>
        )}

        {loading ? (
          <View style={styles.loadingPlaceholder}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: SPACING.md }}>Analyzing lesion patterns...</Text>
          </View>
        ) : errorMsg ? (
          <Animated.View entering={FadeInUp} style={styles.errorCard}>
            <FontAwesome name="exclamation-circle" size={32} color={COLORS.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : result ? (
          <Animated.View entering={FadeInUp.springify()} style={styles.resultCard}>
            
            <View style={styles.resultHeader}>
              <View style={[styles.riskBadge, { backgroundColor: result.label === 'Healthy' ? '#D1FAE5' : '#FEE2E2' }]}>
                <FontAwesome 
                  name={result.label === 'Healthy' ? 'check-circle' : 'warning'} 
                  size={16} 
                  color={result.label === 'Healthy' ? COLORS.success : COLORS.error} 
                />
                <Text style={[styles.riskText, { color: result.label === 'Healthy' ? COLORS.success : COLORS.error }]}>
                  {result.label === 'Healthy' ? 'Low Risk' : 'High Risk'}
                </Text>
              </View>
              <Text style={styles.confidenceText}>
                {Math.round((result.confidence || 0) * 100)}% Match
              </Text>
            </View>

            <Text style={styles.diseaseName}>{result.label || 'Unknown Condition'}</Text>
            
            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Recommended Action</Text>
            {result.label === 'Healthy' ? (
              <Text style={styles.recommendationText}>
                No immediate action required. Maintain standard hygiene and continue routine monitoring.
              </Text>
            ) : (
              <Text style={styles.recommendationText}>
                Immediate isolation recommended. Administer prescribed first-aid and contact a local veterinarian for confirmation.
              </Text>
            )}

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => router.replace('/(farmer)/vets')}>
                <FontAwesome name="user-md" size={16} color={COLORS.primaryDark} />
                <Text style={styles.actionBtnTextSecondary}>Find Vet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => router.replace('/(farmer)')}>
                <Text style={styles.actionBtnTextPrimary}>Done</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : null}
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
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.backgroundSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  iconBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundBase,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  scrollContent: { padding: SPACING.xl, paddingBottom: 100 },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: '#fff', marginTop: SPACING.md, fontWeight: '600', fontSize: 16 },
  loadingPlaceholder: { padding: SPACING.xxl, alignItems: 'center' },
  errorCard: {
    backgroundColor: '#FEE2E2',
    padding: SPACING.xl,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
  },
  errorText: { ...TYPOGRAPHY.body, color: COLORS.error, textAlign: 'center', marginVertical: SPACING.lg },
  retryBtn: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radiusMd,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  resultCard: {
    backgroundColor: COLORS.backgroundSurface,
    borderRadius: SIZES.radiusLg,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  riskText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  confidenceText: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark },
  diseaseName: { ...TYPOGRAPHY.h1, color: COLORS.textMain, fontSize: 24, marginBottom: SPACING.md },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SPACING.md },
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.textMuted, marginBottom: SPACING.sm },
  recommendationText: { ...TYPOGRAPHY.body, color: COLORS.textMain, lineHeight: 22, marginBottom: SPACING.xl },
  actionsRow: { flexDirection: 'row', gap: SPACING.md },
  actionBtnSecondary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs,
    paddingVertical: 14, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  actionBtnTextSecondary: { ...TYPOGRAPHY.body, color: COLORS.primaryDark, fontWeight: '600' },
  actionBtnPrimary: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: SIZES.radiusMd,
  },
  actionBtnTextPrimary: { ...TYPOGRAPHY.body, color: '#fff', fontWeight: '600' },
});
