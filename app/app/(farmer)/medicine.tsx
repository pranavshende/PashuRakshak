import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../constants/theme';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight, FadeInUp, Layout } from 'react-native-reanimated';

const DISEASES = ['Lumpy Skin Disease', 'FMD', 'Mastitis'];

export default function MedicineScreen() {
  const [disease, setDisease] = useState(DISEASES[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const fetchMedicine = async (selectedDisease: string) => {
    setDisease(selectedDisease);
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/medicine/${encodeURIComponent(selectedDisease)}`);
      const result = await response.json();
      if (result.data) {
        setData(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicine(DISEASES[0]);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Medical Records</Text>
            <Text style={styles.headerSubtitle}>Treatment Plans</Text>
          </View>
        </View>
      </View>
      
      {/* Horizontal Segmented Control */}
      <View style={{ backgroundColor: COLORS.backgroundBase, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          {DISEASES.map((d) => (
            <TouchableOpacity 
              key={d} 
              style={[styles.tab, disease === d && styles.activeTab]}
              onPress={() => fetchMedicine(d)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, disease === d && styles.activeTabText]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ marginTop: 100, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: SPACING.sm }}>Loading treatment plan...</Text>
          </View>
        ) : data ? (
          <Animated.View entering={FadeInUp.springify()} style={GLOBAL_STYLES.card}>
            <Text style={styles.description}>{data.description}</Text>
            
            <View style={styles.sectionHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FEE2E2' }]}>
                <FontAwesome name="shield" size={16} color={COLORS.error} />
              </View>
              <Text style={styles.sectionTitle}>Quarantine Rules</Text>
            </View>
            <View style={styles.quarantineContainer}>
              <FontAwesome name="exclamation-circle" size={16} color={COLORS.error} style={{ marginTop: 2 }} />
              <Text style={styles.quarantineText}>{data.quarantine}</Text>
            </View>

            <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
              <View style={[styles.iconWrapper, { backgroundColor: COLORS.secondaryLight }]}>
                <FontAwesome name="medkit" size={16} color={COLORS.secondaryDark} />
              </View>
              <Text style={styles.sectionTitle}>Treatment Plan</Text>
            </View>
            
            <View style={{ marginTop: SPACING.sm }}>
              {data.treatments.map((t: any, index: number) => (
                <Animated.View 
                  key={index} 
                  entering={FadeInRight.delay(index * 100).springify()}
                  layout={Layout.springify()}
                  style={styles.treatmentItem}
                >
                  <View style={styles.treatmentHeader}>
                    <Text style={styles.medName}>{t.name}</Text>
                  </View>
                  <View style={styles.dosageRow}>
                    <FontAwesome name="clock-o" size={14} color={COLORS.textMuted} style={{ width: 16 }} />
                    <Text style={styles.medDosage}>{t.dosage}</Text>
                  </View>
                  <View style={styles.noteRow}>
                    <FontAwesome name="info-circle" size={14} color={COLORS.primaryDark} style={{ width: 16 }} />
                    <Text style={styles.medNotes}>{t.notes}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <FontAwesome name="folder-open-o" size={48} color={COLORS.borderMedium} />
            <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: SPACING.md }}>No data available.</Text>
          </View>
        )}
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
    backgroundColor: COLORS.backgroundBase, 
    padding: SPACING.lg, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: SPACING.md,
    zIndex: 10
  },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.textMain, marginBottom: 2 },
  headerSubtitle: { ...TYPOGRAPHY.label, color: COLORS.primary },
  backBtn: { padding: SPACING.xs },
  scrollContent: { padding: SPACING.lg, paddingBottom: 120 }, // Extra padding for floating tab bar
  tabContainer: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  tab: { paddingVertical: 10, paddingHorizontal: SPACING.xl, borderRadius: 100, backgroundColor: COLORS.backgroundSurface, borderWidth: 1, borderColor: COLORS.borderMedium, ...SHADOWS.sm },
  activeTab: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  tabText: { ...TYPOGRAPHY.label, color: COLORS.textMain, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  description: { ...TYPOGRAPHY.body, color: COLORS.textMain, marginBottom: SPACING.xl, lineHeight: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
  iconWrapper: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { ...TYPOGRAPHY.h3, fontSize: 18, color: COLORS.textMain },
  quarantineContainer: { flexDirection: 'row', gap: SPACING.sm, backgroundColor: '#FEF2F2', padding: SPACING.lg, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: '#FCA5A5' },
  quarantineText: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.error, fontWeight: '500' },
  treatmentItem: { backgroundColor: COLORS.backgroundBase, padding: SPACING.lg, borderRadius: SIZES.radiusLg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm },
  treatmentHeader: { marginBottom: SPACING.xs },
  medName: { ...TYPOGRAPHY.h3, fontSize: 16, color: COLORS.textMain },
  dosageRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm },
  medDosage: { ...TYPOGRAPHY.body, color: COLORS.textMain, fontWeight: '500' },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.xs, backgroundColor: COLORS.primaryLight, padding: SPACING.md, borderRadius: SIZES.radiusMd },
  medNotes: { flex: 1, ...TYPOGRAPHY.label, color: COLORS.primaryDark, lineHeight: 20 }
});
