import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import Animated, { FadeIn, FadeInDown, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  
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
        [{ resize: { width: 400, height: 400 } }], // Better resolution for the new premium UI
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      router.push({
        pathname: '/(farmer)/diagnose',
        params: { imageUri: resized.uri }
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
            <FontAwesome name="times" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.instructionPill}>
            <Text style={styles.instructionText}>Center the lesion in frame</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleFlash}>
            <FontAwesome name={flash === 'on' ? 'flash' : 'bolt'} size={24} color={flash === 'on' ? COLORS.warning : '#fff'} />
          </TouchableOpacity>
        </Animated.View>

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
              <ActivityIndicator size="large" color={COLORS.primaryLight} />
              <Text style={styles.analyzingText}>AI Processing...</Text>
            </Animated.View>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.sideBtn} onPress={pickImage}>
                <FontAwesome name="photo" size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.captureBtn} onPress={takePicture} activeOpacity={0.8}>
                <View style={styles.captureInnerBtn} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.sideBtn} onPress={toggleFacing}>
                <FontAwesome name="refresh" size={24} color="#fff" />
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
    paddingBottom: SPACING.xxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'transparent',
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    fontSize: 14,
  },
  scannerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  scanLine: { width: '100%', height: 2, backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: COLORS.primary, borderWidth: 0 },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  bottomControls: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.xl,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'transparent',
  },
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  captureInnerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  analyzingContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: SPACING.xl,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    minWidth: 200,
  },
  analyzingText: {
    color: '#fff',
    marginTop: SPACING.md,
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.backgroundBase,
  },
  permissionIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    alignSelf: 'center'
  }
});
