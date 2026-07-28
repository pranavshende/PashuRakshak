import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Dimensions, View, Text, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, SIZES, SHADOWS, GLOBAL_STYLES, TYPOGRAPHY } from '../../../constants/theme';
import Animated, { FadeIn, FadeInDown, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

type ModelId = 'gemini' | 'localml' | 'nano' | 'edge';

interface AIModel {
  id: ModelId;
  label: string;
  icon: string;
  color: string;
  badge: string;
  desc: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'gemini',
    label: 'Gemini 2.0 Flash',
    icon: 'flash',
    color: '#2563EB',
    badge: 'Cloud',
    desc: 'Google Gemini multimodal vision AI via cloud API'
  },
  {
    id: 'localml',
    label: 'Local ML Model',
    icon: 'server',
    color: '#059669',
    badge: 'Local',
    desc: 'TensorFlow Lite model running on your local server'
  }
];

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [selectedModel, setSelectedModel] = useState<ModelId>('gemini');
  const [showModelPicker, setShowModelPicker] = useState(false);

  const cameraRef = useRef<any>(null);
  const router = useRouter();

  // Scanning animation
  const scanLineY = useSharedValue(0);
  useEffect(() => {
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(SCANNER_SIZE, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);
  const scanLineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scanLineY.value }] }));

  const currentModel = AI_MODELS.find(m => m.id === selectedModel)!;

  if (!permission) return <View style={{ flex: 1, backgroundColor: COLORS.backgroundBase }} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Animated.View entering={FadeInDown.springify()} style={GLOBAL_STYLES.card}>
          <View style={styles.permissionIconWrapper}>
            <FontAwesome name="camera" size={48} color={COLORS.primaryDark} />
          </View>
          <Text style={[TYPOGRAPHY.h2, { textAlign: 'center' }]}>Camera Access Required</Text>
          <Text style={[TYPOGRAPHY.body, { textAlign: 'center', marginVertical: SPACING.lg, color: COLORS.textMuted }]}>
            PashuRakshak requires camera access to use the AI disease detection scanner.
          </Text>
          <TouchableOpacity style={GLOBAL_STYLES.btnPrimary} onPress={requestPermission}>
            <Text style={GLOBAL_STYLES.btnText}>Grant Permission</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  const toggleFacing = () => setFacing(f => f === 'back' ? 'front' : 'back');
  const toggleFlash = () => setFlash(f => f === 'off' ? 'on' : 'off');

  const processImage = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const resized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      router.push({
        pathname: '/(farmer)/diagnose',
        params: { imageUri: resized.uri, model: selectedModel }
      } as any);
    } catch (err) {
      alert('Error processing image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync();
      await processImage(photo.uri);
    } catch (err) {
      alert('Error capturing image.');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
        enableTorch={flash === 'on'}
      />

      {/* Scanner Overlay */}
      <View style={styles.overlay}>

        {/* Top Controls */}
        <Animated.View entering={FadeInDown} style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <FontAwesome name="times" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.instructionPill}>
            <Text style={styles.instructionText}>Center the lesion in frame</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleFlash}>
            <FontAwesome name={flash === 'on' ? 'flash' : 'bolt'} size={20} color={flash === 'on' ? '#FCD34D' : '#fff'} />
          </TouchableOpacity>
        </Animated.View>

        {/* AI Model Selector Badge */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.modelSelectorRow}>
          <TouchableOpacity
            style={[styles.modelBadge, { borderColor: currentModel.color }]}
            onPress={() => setShowModelPicker(!showModelPicker)}
            activeOpacity={0.85}
          >
            <FontAwesome name={currentModel.icon as any} size={12} color={currentModel.color} />
            <Text style={[styles.modelBadgeText, { color: currentModel.color }]}>{currentModel.label}</Text>
            <View style={[styles.modelBadgePill, { backgroundColor: currentModel.color }]}>
              <Text style={styles.modelBadgePillText}>{currentModel.badge}</Text>
            </View>
            <FontAwesome name={showModelPicker ? 'chevron-up' : 'chevron-down'} size={9} color={currentModel.color} />
          </TouchableOpacity>
        </Animated.View>

        {/* Model Picker Dropdown */}
        {showModelPicker && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.modelPickerCard}>
            <Text style={styles.modelPickerTitle}>Select AI Diagnosis Model</Text>
            {AI_MODELS.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[styles.modelOption, selectedModel === model.id && { backgroundColor: model.color + '18', borderColor: model.color }]}
                onPress={() => { setSelectedModel(model.id); setShowModelPicker(false); }}
                activeOpacity={0.8}
              >
                <View style={[styles.modelOptionIcon, { backgroundColor: model.color + '22' }]}>
                  <FontAwesome name={model.icon as any} size={14} color={model.color} />
                </View>
                <View style={styles.modelOptionText}>
                  <View style={styles.modelOptionRow}>
                    <Text style={[styles.modelOptionLabel, { color: selectedModel === model.id ? model.color : '#F8FAFC' }]}>{model.label}</Text>
                    <View style={[styles.modelOptionBadge, { backgroundColor: model.color }]}>
                      <Text style={styles.modelOptionBadgeText}>{model.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.modelOptionDesc}>{model.desc}</Text>
                </View>
                {selectedModel === model.id && (
                  <FontAwesome name="check-circle" size={16} color={model.color} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Scanner Frame */}
        <View style={styles.scannerWrapper}>
          <View style={styles.scannerFrame}>
            <Animated.View style={[styles.scanLine, scanLineStyle]} />
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        {/* Bottom Controls */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.bottomControls}>
          {isAnalyzing ? (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.analyzingText}>Analyzing with {currentModel.label}...</Text>
            </Animated.View>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.sideBtn} onPress={pickImage}>
                <FontAwesome name="photo" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureBtn} onPress={takePicture} activeOpacity={0.8}>
                <View style={styles.captureInnerBtn} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.sideBtn} onPress={toggleFacing}>
                <FontAwesome name="refresh" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 110,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'transparent',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radiusXl,
  },
  instructionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  // Model Selector
  modelSelectorRow: {
    alignItems: 'center',
    paddingTop: 8,
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  modelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modelBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  modelBadgePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Model Picker Dropdown
  modelPickerCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(15,23,42,0.97)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 6,
  },
  modelPickerTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modelOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelOptionText: {
    flex: 1,
    gap: 2,
  },
  modelOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modelOptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  modelOptionBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  modelOptionBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modelOptionDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 13,
  },

  // Scanner
  scannerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5
  },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: COLORS.primary, borderWidth: 0, backgroundColor: 'transparent' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },

  // Bottom controls
  bottomControls: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.xl,
  },
  analyzingContainer: {
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
  },
  analyzingText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'transparent',
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  captureInnerBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },

  // Permission
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundBase,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  permissionIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundSurface,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
});
