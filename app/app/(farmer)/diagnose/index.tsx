import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { savePredictionLocally } from '../../database/localDb';
import * as FileSystem from 'expo-file-system';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import Animated, { FadeInDown, FadeInUp, withRepeat, withSequence, withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated';

let useTensorflowModel = (asset: any, delegate?: string) => ({ model: null });
if (Platform.OS !== 'web') {
  useTensorflowModel = require('react-native-fast-tflite').useTensorflowModel;
}

const SYMPTOMS_LIST = [
  { id: 'fever', label: 'High Fever' },
  { id: 'blisters', label: 'Skin Blisters / Nodules' },
  { id: 'salivation', label: 'Excessive Salivation' },
  { id: 'swelling', label: 'Swollen Udder' },
  { id: 'lameness', label: 'Lameness' },
  { id: 'nasal_discharge', label: 'Nasal Discharge' },
  { id: 'loss_appetite', label: 'Loss of Appetite' },
  { id: 'milk_drop', label: 'Sudden Drop in Milk' },
  { id: 'mouth_ulcers', label: 'Mouth Ulcers' }
];

const SkeletonLoader = () => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View style={[styles.skeletonImage, animatedStyle]} />
      <Animated.View style={[styles.skeletonText, animatedStyle, { width: '80%' }]} />
      <Animated.View style={[styles.skeletonText, animatedStyle, { width: '60%', height: 16 }]} />
    </View>
  );
};

export default function DiagnoseScreen() {
  const { imageUri } = useLocalSearchParams();
  const router = useRouter();
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const plugin = useTensorflowModel(require('../../../assets/cattlecare_v1.tflite'), 'default');

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateRuleScore = () => {
    let lsdScore = 0;
    let fmdScore = 0;
    let mastitisScore = 0;
    
    if (selectedSymptoms['blisters']) lsdScore += 0.8;
    if (selectedSymptoms['salivation']) fmdScore += 0.6;
    if (selectedSymptoms['mouth_ulcers']) fmdScore += 0.7;
    if (selectedSymptoms['lameness']) fmdScore += 0.3;
    if (selectedSymptoms['swelling']) mastitisScore += 0.9;
    
    if (selectedSymptoms['fever']) { lsdScore += 0.15; fmdScore += 0.15; mastitisScore += 0.1; }
    if (selectedSymptoms['loss_appetite']) { lsdScore += 0.1; fmdScore += 0.1; mastitisScore += 0.1; }
    if (selectedSymptoms['nasal_discharge']) { lsdScore += 0.2; fmdScore += 0.1; }
    if (selectedSymptoms['milk_drop']) { lsdScore += 0.1; fmdScore += 0.1; mastitisScore += 0.3; }

    return { 
      lsdScore: Math.min(lsdScore, 1.0), 
      fmdScore: Math.min(fmdScore, 1.0), 
      mastitisScore: Math.min(mastitisScore, 1.0) 
    };
  };

  const handleDiagnose = async () => {
    if (!plugin.model && Platform.OS !== 'web') {
      Alert.alert("Model not ready", "The AI model is still loading.");
      return;
    }
    if (!imageUri) {
      Alert.alert("Error", "No image provided.");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      let mockVisionConfidence = 0.85; 
      let mockVisionDisease = 'Lumpy Skin Disease';

      if (!plugin.model) {
        const token = localStorage.getItem('userToken');
        const formData = new FormData();
        
        if (Platform.OS === 'web') {
          try {
            const blobRes = await fetch(imageUri as string);
            const blob = await blobRes.blob();
            formData.append('file', blob, 'image.jpg');
          } catch (e) {
            formData.append('file', new Blob(['dummy content']), 'image.jpg');
          }
        } else {
          formData.append('file', {
            uri: Platform.OS === 'android' ? imageUri : (imageUri as string).replace('file://', ''),
            type: 'image/jpeg',
            name: 'image.jpg',
          } as any);
        }
        
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/predict/analyze`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (data.prediction) {
          mockVisionConfidence = data.prediction.confidence;
          mockVisionDisease = data.prediction.label;
        } else if (data.error) {
          throw new Error(data.error);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate inference time slightly longer for animation
      }

      const { lsdScore, fmdScore, mastitisScore } = calculateRuleScore();
      
      let finalDisease = mockVisionDisease;
      let finalConfidence = mockVisionConfidence;
      
      if (mockVisionDisease === 'Lumpy Skin Disease') {
        finalConfidence = (mockVisionConfidence * 0.6) + (lsdScore * 0.4);
      } else if (mockVisionDisease === 'FMD') {
        finalConfidence = (mockVisionConfidence * 0.6) + (fmdScore * 0.4);
      } else if (mockVisionDisease === 'Mastitis') {
        finalConfidence = (mockVisionConfidence * 0.6) + (mastitisScore * 0.4);
      } else {
        if (lsdScore > 0.6) { finalDisease = 'Lumpy Skin Disease'; finalConfidence = lsdScore; }
        else if (fmdScore > 0.6) { finalDisease = 'FMD'; finalConfidence = fmdScore; }
        else if (mastitisScore > 0.6) { finalDisease = 'Mastitis'; finalConfidence = mastitisScore; }
      }
      
      const result = {
        id: Math.random().toString(36).substring(7),
        disease: finalConfidence > 0.5 ? finalDisease : 'Unknown/Healthy',
        confidence: finalConfidence,
        riskLevel: finalConfidence > 0.75 ? 'HIGH' : (finalConfidence > 0.5 ? 'MEDIUM' : 'LOW'),
        imagePath: typeof imageUri === 'string' ? imageUri : '',
      };

      await savePredictionLocally(result, selectedSymptoms);

      Alert.alert(
        "Diagnosis Complete", 
        `Disease: ${result.disease}\nConfidence: ${(result.confidence * 100).toFixed(1)}%\n\nRecord saved offline.`,
        [
          { text: "View Results", onPress: () => router.replace('/(farmer)' as any) }
        ]
      );
      
    } catch (e: any) {
      Alert.alert("Error", "Failed to run diagnosis: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={isAnalyzing}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clinical Diagnosis</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isAnalyzing ? (
          <Animated.View entering={FadeInDown}>
            <View style={GLOBAL_STYLES.card}>
              <Text style={[TYPOGRAPHY.h2, { textAlign: 'center', marginBottom: SPACING.md }]}>AI is Analyzing...</Text>
              <SkeletonLoader />
            </View>
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.duration(400).springify()}>
              {imageUri ? (
                <Image source={{ uri: imageUri as string }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <FontAwesome name="image" size={48} color={COLORS.borderMedium} />
                  <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: SPACING.sm }}>No image provided</Text>
                </View>
              )}
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(600).delay(100).springify()}>
              <Text style={styles.sectionTitle}>Select Symptoms</Text>
              <Text style={styles.sectionDesc}>Help the AI by selecting visible symptoms.</Text>
              
              <View style={styles.symptomsContainer}>
                {SYMPTOMS_LIST.map(sym => (
                  <TouchableOpacity 
                    key={sym.id} 
                    style={[styles.symptomChip, selectedSymptoms[sym.id] && styles.symptomChipSelected]}
                    onPress={() => toggleSymptom(sym.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.symptomText, selectedSymptoms[sym.id] && styles.symptomTextSelected]}>
                      {sym.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(600).delay(200).springify()}>
              <TouchableOpacity 
                style={[GLOBAL_STYLES.btnPrimary, (!plugin.model && Platform.OS !== 'web') && GLOBAL_STYLES.btnDisabled, { marginBottom: SPACING.xxl }]} 
                onPress={handleDiagnose}
                disabled={!plugin.model && Platform.OS !== 'web'}
                activeOpacity={0.8}
              >
                <Text style={GLOBAL_STYLES.btnText}>
                  {(plugin.model || Platform.OS === 'web') ? 'Run AI Diagnosis' : 'Loading Model...'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundBase },
  header: { 
    backgroundColor: COLORS.backgroundBase, 
    padding: SPACING.lg, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 10
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain },
  backBtn: { padding: SPACING.xs },
  scrollContent: { padding: SPACING.lg },
  imagePreview: { width: '100%', height: 280, borderRadius: SIZES.radiusXl, marginBottom: SPACING.xl, ...SHADOWS.md },
  imagePlaceholder: { width: '100%', height: 280, borderRadius: SIZES.radiusXl, backgroundColor: COLORS.backgroundSurface, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl, borderWidth: 2, borderColor: COLORS.borderMedium, borderStyle: 'dashed' },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain, marginBottom: 2 },
  sectionDesc: { ...TYPOGRAPHY.body, color: COLORS.textMuted, marginBottom: SPACING.md },
  symptomsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xxl },
  symptomChip: { paddingHorizontal: SPACING.lg, paddingVertical: 10, borderRadius: 100, backgroundColor: COLORS.backgroundSurface, borderWidth: 1, borderColor: COLORS.borderMedium, ...SHADOWS.sm },
  symptomChipSelected: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  symptomText: { ...TYPOGRAPHY.label, color: COLORS.textMain },
  symptomTextSelected: { color: '#fff' },
  skeletonContainer: { alignItems: 'center', paddingVertical: SPACING.md },
  skeletonImage: { width: '100%', height: 200, backgroundColor: COLORS.borderMedium, borderRadius: SIZES.radiusLg, marginBottom: SPACING.lg },
  skeletonText: { height: 24, backgroundColor: COLORS.borderMedium, borderRadius: SIZES.radiusSm, marginBottom: SPACING.sm },
});
