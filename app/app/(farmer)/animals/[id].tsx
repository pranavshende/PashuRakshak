import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import { storage } from '../../../context/AuthContext';

export default function AnimalProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimal();
  }, [id]);

  const fetchAnimal = async () => {
    try {
      const token = await storage.getItemAsync('userToken');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/animals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.animal) setAnimal(data.animal);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: COLORS.backgroundBase }}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!animal) return <Text style={{ textAlign: 'center', marginTop: 50, ...TYPOGRAPHY.body }}>Animal not found</Text>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.profileHeader}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active Profile</Text>
          </View>
        </View>

        <View style={styles.avatar}>
          <FontAwesome name="paw" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>{animal.name || 'Unnamed Animal'}</Text>
        <Text style={styles.tag}>Tag ID: <Text style={{ fontWeight: '700' }}>{animal.tagId}</Text></Text>
        
        <TouchableOpacity 
          style={styles.certBtn} 
          onPress={() => router.push(`/(farmer)/animals/certificate?id=${animal.id}` as any)}
          activeOpacity={0.8}
        >
          <FontAwesome name="file-pdf-o" size={16} color="#fff" />
          <Text style={styles.certBtnText}>Digital Health Certificate</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Digital Twin Timeline</Text>
        
        {animal.predictions?.length > 0 ? (
          animal.predictions.map((pred: any, index: number) => (
            <Animated.View 
              key={pred.id} 
              entering={FadeInRight.delay(index * 150).springify()}
              layout={Layout.springify()}
              style={styles.timelineItem}
            >
              <View style={styles.timelineDotContainer}>
                <View style={[styles.timelineDot, pred.recoveryStatus ? { backgroundColor: COLORS.success } : { backgroundColor: COLORS.warning }]} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
                  <Text style={styles.timelineDate}>{new Date(pred.createdAt).toLocaleDateString()}</Text>
                  {pred.recoveryStatus && <View style={styles.recoveryBadge}><Text style={styles.recoveryBadgeText}>{pred.recoveryStatus}</Text></View>}
                </View>
                <Text style={styles.timelineTitle}>AI Diagnosis Record</Text>
                
                <View style={styles.dataRow}>
                  <Text style={styles.timelineDesc}>Detected Issue:</Text>
                  <Text style={[styles.timelineDesc, { fontWeight: '700', color: COLORS.textMain }]}>{pred.disease}</Text>
                </View>
                
                <View style={styles.dataRow}>
                  <Text style={styles.timelineDesc}>Risk Level:</Text>
                  <Text style={[styles.timelineDesc, { color: COLORS.warning, fontWeight: '700' }]}>{pred.riskLevel}</Text>
                </View>
                
                {!pred.recoveryStatus && (
                  <TouchableOpacity style={styles.recoveryBtn} activeOpacity={0.8}>
                    <FontAwesome name="check-circle" size={14} color={COLORS.primaryDark} />
                    <Text style={styles.recoveryBtnText}>Log Recovery</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
             <FontAwesome name="heartbeat" size={40} color={COLORS.borderMedium} style={{ marginBottom: SPACING.md }} />
             <Text style={styles.emptyText}>No medical history yet.</Text>
             <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: 4 }}>This animal is currently healthy.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundBase },
  profileHeader: { 
    backgroundColor: COLORS.backgroundSurface, 
    padding: SPACING.xl, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center', 
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    borderBottomLeftRadius: SIZES.radiusXl * 1.5, 
    borderBottomRightRadius: SIZES.radiusXl * 1.5,
    ...SHADOWS.md
  },
  navRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundBase, borderRadius: 22, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.borderLight },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: 100 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primaryDark, marginRight: SPACING.sm },
  statusText: { ...TYPOGRAPHY.label, color: COLORS.primaryDark, fontWeight: '700' },
  avatar: { width: 110, height: 110, backgroundColor: COLORS.backgroundBase, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md, borderWidth: 2, borderColor: COLORS.primaryLight, ...SHADOWS.md },
  name: { ...TYPOGRAPHY.h2, color: COLORS.textMain },
  tag: { ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: 4 },
  certBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: SIZES.radiusXl, marginTop: SPACING.xl, gap: SPACING.sm, ...SHADOWS.md },
  certBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  section: { padding: SPACING.xl },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain, marginBottom: SPACING.xl },
  timelineItem: { flexDirection: 'row', marginBottom: SPACING.md },
  timelineDotContainer: { alignItems: 'center', marginRight: SPACING.md },
  timelineDot: { width: 16, height: 16, borderRadius: 8, marginTop: 4, borderWidth: 2, borderColor: '#fff', ...SHADOWS.sm },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.borderMedium, marginTop: 4 },
  timelineContent: { flex: 1, backgroundColor: COLORS.backgroundSurface, padding: SPACING.lg, borderRadius: SIZES.radiusLg, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.borderLight },
  timelineDate: { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  timelineTitle: { ...TYPOGRAPHY.h3, fontSize: 16, marginBottom: SPACING.md, color: COLORS.textMain },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  timelineDesc: { ...TYPOGRAPHY.body, fontSize: 14 },
  recoveryBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusMd },
  recoveryBadgeText: { color: '#065F46', fontSize: 12, fontWeight: '700' },
  recoveryBtn: { marginTop: SPACING.md, alignSelf: 'flex-start', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.backgroundBase, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.borderLight, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  recoveryBtnText: { fontSize: 14, color: COLORS.primaryDark, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, paddingVertical: 60, backgroundColor: COLORS.backgroundSurface, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.borderLight, borderStyle: 'dashed' },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textMain, fontWeight: '600' }
});
