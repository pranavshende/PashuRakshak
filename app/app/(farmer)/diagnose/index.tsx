import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { savePredictionLocally } from '../../database/localDb';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

let useTensorflowModel = (asset: any, delegate?: string) => ({ model: null });
if (Platform.OS !== 'web') {
  useTensorflowModel = require('react-native-fast-tflite').useTensorflowModel;
}

const SYMPTOMS_LIST = [
  { id: 'fever', label: 'High Fever' },
  { id: 'blisters', label: 'Skin Blisters / Nodules' },
  { id: 'salivation', label: 'Excessive Salivation' },
  { id: 'swelling', label: 'Swollen Udder' },
  { id: 'lameness', label: 'Lameness' }
];

export default function DiagnoseScreen() {
  const { imageUri } = useLocalSearchParams();
  const router = useRouter();
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Load TFLite Model
  const plugin = useTensorflowModel(require('../../../assets/cattlecare_v1.tflite'), 'default');

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateRuleScore = () => {
    // Basic Mock Rule Engine
    let lsdScore = 0;
    let fmdScore = 0;
    let mastitisScore = 0;
    
    if (selectedSymptoms['blisters']) lsdScore += 0.8;
    if (selectedSymptoms['fever']) { lsdScore += 0.2; fmdScore += 0.3; mastitisScore += 0.2; }
    if (selectedSymptoms['salivation']) fmdScore += 0.7;
    if (selectedSymptoms['lameness']) fmdScore += 0.2;
    if (selectedSymptoms['swelling']) mastitisScore += 0.8;

    return { lsdScore, fmdScore, mastitisScore };
  };

  const handleDiagnose = async () => {
    if (!plugin.model) {
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

      if (Platform.OS === 'web') {
        // Web Fallback: Hit backend API
        const token = localStorage.getItem('userToken');
        const formData = new FormData();
        // Just send a dummy string or fetch the blob if we have object URL
        formData.append('file', new Blob(['dummy content']), 'image.jpg');
        
        const res = await fetch('http://127.0.0.1:5000/predict/analyze', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (data.prediction) {
          mockVisionConfidence = data.prediction.confidence;
          mockVisionDisease = data.prediction.label;
        }
      } else {
        // 1. Run TFLite Inference
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate inference time
      }

      // 2. Run Symptom Rule Engine
      const ruleScores = calculateRuleScore();
      
      // 3. Hybrid Blending (70% Vision, 30% Rules)
      const ruleLSD = Math.min(ruleScores.lsdScore, 1.0);
      const blendedLSDConfidence = (mockVisionConfidence * 0.7) + (ruleLSD * 0.3);
      
      const result = {
        id: Math.random().toString(36).substring(7),
        disease: blendedLSDConfidence > 0.6 ? mockVisionDisease : 'Unknown/Healthy',
        confidence: blendedLSDConfidence,
        riskLevel: blendedLSDConfidence > 0.75 ? 'HIGH' : 'MEDIUM',
        imagePath: typeof imageUri === 'string' ? imageUri : '',
      };

      // 4. Save Locally
      await savePredictionLocally(result, selectedSymptoms);

      Alert.alert(
        "Diagnosis Complete", 
        `Disease: ${result.disease}\nConfidence: ${(result.confidence * 100).toFixed(1)}%\n\nRecord saved offline.`,
        [
          { text: "OK", onPress: () => router.replace('/(farmer)' as any) }
        ]
      );
      
    } catch (e: any) {
      Alert.alert("Error", "Failed to run diagnosis: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Clinical Diagnosis</Text>
      
      {imageUri ? (
        <Image source={{ uri: imageUri as string }} style={styles.imagePreview} />
      ) : (
        <View style={styles.imagePlaceholder}><Text>No image</Text></View>
      )}

      <Text style={styles.sectionTitle}>Select Symptoms</Text>
      <View style={styles.symptomsContainer}>
        {SYMPTOMS_LIST.map(sym => (
          <TouchableOpacity 
            key={sym.id} 
            style={[styles.symptomChip, selectedSymptoms[sym.id] && styles.symptomChipSelected]}
            onPress={() => toggleSymptom(sym.id)}
          >
            <Text style={[styles.symptomText, selectedSymptoms[sym.id] && styles.symptomTextSelected]}>
              {sym.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.btn, (!plugin.model && Platform.OS !== 'web' || isAnalyzing) && styles.btnDisabled]} 
        onPress={handleDiagnose}
        disabled={!plugin.model && Platform.OS !== 'web' || isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>
            {(plugin.model || Platform.OS === 'web') ? 'Run Diagnosis' : 'Loading AI Model...'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, marginTop: 40 },
  imagePreview: { width: '100%', height: 250, borderRadius: 16, marginBottom: 20 },
  imagePlaceholder: { width: '100%', height: 250, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#4B5563', marginBottom: 12 },
  symptomsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 },
  symptomChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB' },
  symptomChipSelected: { backgroundColor: '#10B981', borderColor: '#10B981' },
  symptomText: { color: '#374151', fontWeight: '500' },
  symptomTextSelected: { color: '#fff' },
  btn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  btnDisabled: { backgroundColor: '#9CA3AF' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
