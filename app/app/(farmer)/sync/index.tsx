import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { getPendingSyncs, markAsSynced } from '../../database/localDb';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import Animated, { FadeInRight, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';

export default function SyncScreen() {
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const rotation = useSharedValue(0);
  
  const animatedSyncStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  const startRotation = () => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  };

  const stopRotation = () => {
    cancelAnimation(rotation);
    rotation.value = 0;
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const records = await getPendingSyncs();
      setPendingRecords(records);
    } catch (e) {
      console.error("Failed to load pending syncs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (pendingRecords.length === 0) return;
    setLoading(true);
    startRotation();
    
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else {
        const SecureStore = require('expo-secure-store');
        token = await SecureStore.getItemAsync('userToken');
      }

      const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/predict/sync`;

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ records: pendingRecords }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        for (const id of data.syncedIds) {
          await markAsSynced(id);
        }
        await loadRecords();
        alert('Sync successful!');
      } else {
        alert(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to connect to the backend server.');
    } finally {
      setLoading(false);
      stopRotation();
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()} style={GLOBAL_STYLES.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <View style={styles.iconWrapper}>
            <FontAwesome name="file-text-o" size={20} color={COLORS.primaryDark} />
          </View>
          <View>
            <Text style={styles.diseaseText}>{item.disease}</Text>
            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Sync Center</Text>
            <Text style={styles.headerSubtitle}>Offline Data Manager</Text>
          </View>
        </View>
      </View>

      <View style={styles.syncStatusContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>Unsynced Records</Text>
          <Text style={styles.statusSub}>{pendingRecords.length} items ready to upload</Text>
        </View>
        <TouchableOpacity 
          style={[styles.syncBtn, loading || pendingRecords.length === 0 ? styles.syncBtnDisabled : null]} 
          onPress={handleSync}
          disabled={loading || pendingRecords.length === 0}
          activeOpacity={0.8}
        >
          <Animated.View style={loading ? animatedSyncStyle : undefined}>
            <FontAwesome name="refresh" size={16} color="#fff" />
          </Animated.View>
          <Text style={styles.syncBtnText}>{loading ? 'Syncing...' : 'Sync Now'}</Text>
        </TouchableOpacity>
      </View>

      {loading && pendingRecords.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : pendingRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <FontAwesome name="cloud-check" size={48} color={COLORS.success} />
          </View>
          <Text style={styles.emptyText}>All Caught Up!</Text>
          <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: SPACING.xs }}>Your data is securely backed up to the cloud.</Text>
        </View>
      ) : (
        <FlatList
          data={pendingRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  syncStatusContainer: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.backgroundSurface, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  statusTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain },
  statusSub: { ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: 2 },
  syncBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: SIZES.radiusXl, gap: SPACING.sm, ...SHADOWS.sm },
  syncBtnDisabled: { backgroundColor: COLORS.borderMedium, ...SHADOWS.none },
  syncBtnText: { color: '#fff', fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyIconWrapper: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  emptyText: { ...TYPOGRAPHY.h2, color: COLORS.textMain },
  iconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  diseaseText: { ...TYPOGRAPHY.h3, fontSize: 16, color: COLORS.textMain, marginBottom: 2 },
  dateText: { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  statusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusMd },
  statusText: { color: '#D97706', fontSize: 12, fontWeight: '700' }
});
