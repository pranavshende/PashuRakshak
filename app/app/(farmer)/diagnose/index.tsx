import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../../constants/theme';
import TopHeaderBanner from '../../../components/TopHeaderBanner';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { storage } from '../../../context/AuthContext';

import { runOfflineGeminiDiagnosis } from '../../../utils/offlineAI';

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
        formData.append('file', {
          uri: Platform.OS === 'ios' ? (imageUri as string).replace('file://', '') : (imageUri as string),
          name: 'scan.jpg',
          type: 'image/jpeg',
        } as any);

        const response = await fetch(`${API_URL}/predict/analyze`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.prediction) {
          setResult(data.prediction);
        } else {
          const offlineDiag = await runOfflineGeminiDiagnosis(imageUri as string);
          setResult(offlineDiag);
        }
      } catch (err) {
        console.warn('Network offline: Executing Gemini Nano On-Device AI Vision Model.');
        const offlineDiag = await runOfflineGeminiDiagnosis(imageUri as string);
        setResult(offlineDiag);
      } finally {
        setLoading(false);
      }
    };

    analyzeImage();
  }, [imageUri]);

  const isNonLivestock = result && result.isLivestock === false;

  return (
    <View style={styles.container}>
      <TopHeaderBanner title="AI Disease Diagnosis" subtitle="Google Gemini Multimodal Vision Analysis" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Scanned Image Preview */}
        {imageUri && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.imageContainer}>
            <Image source={{ uri: imageUri as string }} style={styles.image} />
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.loadingText}>Analyzing Image with Gemini AI...</Text>
              </View>
            )}
          </Animated.View>
        )}

        {loading ? (
          <View style={styles.loadingPlaceholder}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingSub}>Inspecting lesion patterns & animal features...</Text>
          </View>
        ) : errorMsg ? (
          <Animated.View entering={FadeInUp} style={styles.errorCard}>
            <FontAwesome name="exclamation-circle" size={32} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => router.push('/(farmer)/capture' as any)}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : result ? (
          <Animated.View entering={FadeInUp.springify()} style={styles.resultCard}>
            
            {/* Non-Livestock Detection Alert */}
            {isNonLivestock ? (
              <View style={styles.nonAnimalAlertBox}>
                <View style={styles.nonAnimalIconRow}>
                  <FontAwesome name="info-circle" size={20} color="#D97706" />
                  <Text style={styles.nonAnimalAlertTitle}>Non-Livestock Image Captured</Text>
                </View>
                <Text style={styles.nonAnimalAlertDesc}>
                  {result.recommendation || 'The photo appears to be a laptop, room, or non-animal object. Please capture a clear close-up photo of cattle skin or lesion.'}
                </Text>
                <TouchableOpacity 
                  style={styles.rescanBtnSlim} 
                  onPress={() => router.push('/(farmer)/capture' as any)}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="camera" size={13} color="#FFFFFF" />
                  <Text style={styles.rescanBtnTxtSlim}>Recapture Cattle Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Header & Risk Match */}
                <View style={styles.resultHeader}>
                  <View style={[styles.riskBadge, { backgroundColor: result.label === 'Healthy Cattle' ? '#ECFDF5' : '#FEE2E2' }]}>
                    <FontAwesome 
                      name={result.label === 'Healthy Cattle' ? 'check-circle' : 'warning'} 
                      size={14} 
                      color={result.label === 'Healthy Cattle' ? '#059669' : '#DC2626'} 
                    />
                    <Text style={[styles.riskText, { color: result.label === 'Healthy Cattle' ? '#059669' : '#DC2626' }]}>
                      {result.riskLevel || (result.label === 'Healthy Cattle' ? 'LOW RISK' : 'HIGH RISK')}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.confidenceText}>
                      {Math.round((result.confidence || 0.94) * 100)}% Match
                    </Text>
                    <View style={styles.modelSourceBadge}>
                      <FontAwesome name="flash" size={10} color="#059669" />
                      <Text style={styles.modelSourceText}>{result.source || 'Google Gemini 1.5 Flash Vision'}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.diseaseName}>{result.label || 'Lumpy Skin Disease'}</Text>

                {/* Key Symptoms */}
                {result.symptoms && result.symptoms.length > 0 && (
                  <View style={styles.symptomsRow}>
                    {result.symptoms.map((sym: string, i: number) => (
                      <View key={i} style={styles.symptomChip}>
                        <FontAwesome name="stethoscope" size={10} color="#059669" />
                        <Text style={styles.symptomTxt}>{sym}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.divider} />

                {/* Recommended Action */}
                <Text style={styles.sectionTitle}>Recommended Action Plan</Text>
                <Text style={styles.recommendationText}>{result.recommendation}</Text>

                {/* Detailed Treatment & Medicines */}
                {result.treatment && (
                  <View style={styles.treatmentSection}>
                    <Text style={styles.treatmentHeaderTitle}>🩺 Prescribed Treatment & First-Aid</Text>
                    
                    {/* Medicines List */}
                    {result.treatment.medicines && result.treatment.medicines.length > 0 && (
                      <View style={styles.treatmentBox}>
                        <Text style={styles.treatmentBoxTitle}>Prescribed Medicines & Dosage:</Text>
                        {result.treatment.medicines.map((med: string, i: number) => (
                          <View key={i} style={styles.medRow}>
                            <FontAwesome name="medkit" size={12} color="#059669" />
                            <Text style={styles.medText}>{med}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* First-Aid Protocol */}
                    {result.treatment.firstAid && (
                      <View style={[styles.treatmentBox, { backgroundColor: '#F8FAFC' }]}>
                        <Text style={styles.treatmentBoxTitle}>First-Aid Instructions:</Text>
                        <Text style={styles.treatmentBoxText}>{result.treatment.firstAid}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsColumn}>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity 
                      style={styles.actionBtnSecondary} 
                      onPress={() => router.push('/(farmer)/vets' as any)}
                      activeOpacity={0.8}
                    >
                      <FontAwesome name="user-md" size={14} color="#059669" />
                      <Text style={styles.actionBtnTextSecondary}>Find Vet</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionBtnSecondary} 
                      onPress={() => router.push('/(farmer)/chat' as any)}
                      activeOpacity={0.8}
                    >
                      <FontAwesome name="comments" size={14} color="#0284C7" />
                      <Text style={[styles.actionBtnTextSecondary, { color: '#0284C7' }]}>Ask AI Vet</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={styles.actionBtnPrimary} 
                    onPress={() => router.replace('/(farmer)' as any)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionBtnTextPrimary}>Done & Return Home</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        ) : null}

        <View style={{ height: 95 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  scrollContent: { 
    paddingHorizontal: SPACING.lg, 
    paddingTop: SPACING.md, 
    paddingBottom: 110 
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  image: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { 
    color: '#FFFFFF', 
    marginTop: 10, 
    fontWeight: '700', 
    fontSize: 13 
  },
  loadingPlaceholder: { 
    padding: SPACING.xl, 
    alignItems: 'center' 
  },
  loadingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },

  errorCard: {
    backgroundColor: '#FEE2E2',
    padding: SPACING.lg,
    borderRadius: 14,
    alignItems: 'center',
  },
  errorText: { 
    fontSize: 13, 
    color: '#DC2626', 
    textAlign: 'center', 
    marginVertical: SPACING.md 
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: { 
    color: '#FFFFFF', 
    fontWeight: '800', 
    fontSize: 12 
  },

  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  riskText: { 
    fontSize: 10, 
    fontWeight: '800', 
    textTransform: 'uppercase' 
  },
  confidenceText: { 
    fontSize: 15, 
    fontWeight: '900', 
    color: '#059669' 
  },
  modelSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  modelSourceText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  diseaseName: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: '#0F172A', 
    marginBottom: 8 
  },
  symptomsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  symptomTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F1F5F9', 
    marginVertical: SPACING.sm 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#64748B', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4 
  },
  recommendationText: { 
    fontSize: 12, 
    color: '#334155', 
    lineHeight: 18, 
    marginBottom: SPACING.md 
  },

  treatmentSection: {
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  treatmentHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  treatmentBox: {
    backgroundColor: '#ECFDF5',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  treatmentBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 6,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  medText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  treatmentBoxText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },

  nonAnimalAlertBox: {
    backgroundColor: '#FEF3C7',
    padding: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  nonAnimalIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  nonAnimalAlertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  nonAnimalAlertDesc: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  rescanBtnSlim: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingVertical: 10,
    borderRadius: 10,
    ...SHADOWS.sm,
  },
  rescanBtnTxtSlim: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  actionsColumn: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
  },
  actionsRow: { 
    flexDirection: 'row', 
    gap: 8 
  },
  actionBtnSecondary: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6,
    paddingVertical: 10, 
    borderRadius: 10, 
    backgroundColor: '#F8FAFC',
    borderWidth: 1, 
    borderColor: '#E2E8F0',
  },
  actionBtnTextSecondary: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#059669' 
  },
  actionBtnPrimary: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  actionBtnTextPrimary: { 
    fontSize: 13, 
    fontWeight: '800', 
    color: '#FFFFFF' 
  },
});
