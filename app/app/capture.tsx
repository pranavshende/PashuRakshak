import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as ImageManipulator from 'expo-image-manipulator';

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const cameraRef = useRef<any>(null);
  const router = useRouter();

  if (!permission) return <View />;
  
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    setIsAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      
      // Resize to save bandwidth, keeping it small as ML model expects 224x224
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 500 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Get JWT token (Web fallback)
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else {
        token = await SecureStore.getItemAsync('userToken');
      }

      // Create Form Data
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        // On Web, FormData expects a true Blob or File object
        const response = await fetch(resized.uri);
        const blob = await response.blob();
        formData.append('file', blob, 'cattle.jpg');
      } else {
        // On Native (Android/iOS), React Native expects this specific object format
        formData.append('file', {
          uri: resized.uri,
          name: 'cattle.jpg',
          type: 'image/jpeg'
        } as any);
      }

      // Call Backend Proxy. Web needs localhost, Emulator needs 10.0.2.2
      const backendUrl = Platform.OS === 'web' 
        ? 'http://127.0.0.1:5000/predict/analyze'
        : 'http://10.0.2.2:5000/predict/analyze';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.prediction);
      } else {
        alert(data.error || 'Prediction failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error analyzing image. Please ensure the backend and ML service are running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (result) {
    return (
      <View style={styles.resultContainer}>
        <FontAwesome name="check-circle" size={80} color="#10B981" />
        <Text style={styles.resultTitle}>Analysis Complete</Text>
        
        <View style={styles.resultCard}>
          <Text style={styles.label}>Detected Condition:</Text>
          <Text style={styles.value}>{result.label}</Text>
          
          <Text style={styles.label}>Confidence:</Text>
          <Text style={styles.value}>{(result.confidence * 100).toFixed(1)}%</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back" />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.bottomControls}>
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.analyzingText}>Analyzing...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <View style={styles.captureInnerBtn} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInnerBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  analyzingContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  analyzingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 30,
  },
  resultCard: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 20,
  },
});
