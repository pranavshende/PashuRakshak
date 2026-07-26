import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CertificateScreen() {
  const { id } = useLocalSearchParams();
  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAnimal();
  }, [id]);

  const fetchAnimal = async () => {
    try {
      const token = localStorage.getItem('userToken');
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

  const handlePrint = () => {
    // In a real app, this would use expo-print to generate a PDF
    Alert.alert("Print PDF", "This would trigger the native share sheet or save as PDF.");
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: COLORS.backgroundBase }}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!animal) return <Text style={{ textAlign: 'center', marginTop: 50, ...TYPOGRAPHY.body }}>Animal not found</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Digital Certificate</Text>
        </View>
        <TouchableOpacity onPress={handlePrint} style={styles.printBtn} activeOpacity={0.8}>
          <FontAwesome name="share-alt" size={16} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.certificate}>
          
          {/* Watermark */}
          <View style={styles.watermarkContainer}>
            <FontAwesome name="shield" size={300} color="rgba(22, 163, 74, 0.05)" />
          </View>

          <View style={styles.certHeader}>
            <View style={styles.certHeaderLeft}>
              <View style={styles.certIconWrapper}>
                <FontAwesome name="shield" size={32} color="#fff" />
              </View>
              <View>
                <Text style={styles.certTitle}>HEALTH CERTIFICATE</Text>
                <Text style={styles.certSubtitle}>PashuRakshak Verified ID</Text>
              </View>
            </View>
            <View style={styles.qrPlaceholder}>
              <FontAwesome name="qrcode" size={40} color={COLORS.textMain} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>ANIMAL IDENTIFICATION</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Tag ID Number:</Text>
              <Text style={styles.valuePrimary}>{animal.tagId}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Name / Alias:</Text>
              <Text style={styles.value}>{animal.name || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Breed:</Text>
              <Text style={styles.value}>{animal.breed || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Current Weight:</Text>
              <Text style={styles.value}>{animal.weight ? `${animal.weight} kg` : 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>VACCINATION RECORD</Text>
            {animal.vaccinations?.length > 0 ? (
              animal.vaccinations.map((vax: any) => (
                <View key={vax.id} style={styles.historyRow}>
                  <Text style={[styles.value, { flex: 2 }]}>{vax.vaccineName}</Text>
                  <Text style={[styles.value, { flex: 1, textAlign: 'right', color: COLORS.textMuted }]}>{new Date(vax.dateAdministered).toLocaleDateString()}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No verified vaccinations recorded.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>MEDICAL CLEARANCE</Text>
            {animal.predictions?.length > 0 ? (
              animal.predictions.map((pred: any) => (
                <View key={pred.id} style={styles.historyRow}>
                  <Text style={[styles.value, { flex: 2 }]}>{pred.disease}</Text>
                  <Text style={[styles.value, { flex: 1, textAlign: 'right', color: pred.recoveryStatus === 'Recovered' ? COLORS.success : COLORS.warning }]}>
                    {pred.recoveryStatus || 'Active Issue'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Clean bill of health. No diseases detected.</Text>
            )}
          </View>

          <View style={styles.stampContainer}>
            <View style={styles.verifiedStamp}>
              <FontAwesome name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.verifiedText}>DIGITALLY VERIFIED</Text>
            </View>
            <Text style={styles.timestamp}>Generated: {new Date().toLocaleDateString()}</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>This is a digitally generated certificate based on AI scanning and farmer records. For official insurance claims, secondary verification by a licensed veterinarian may be required.</Text>
          </View>
        </Animated.View>

        <TouchableOpacity style={GLOBAL_STYLES.btnPrimary} onPress={handlePrint}>
          <Text style={GLOBAL_STYLES.btnText}>Download PDF</Text>
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 10
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain, fontSize: 18 },
  backBtn: { padding: SPACING.xs },
  printBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.backgroundSurface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.borderLight },
  scrollContent: { padding: SPACING.lg, paddingBottom: 120 },
  certificate: { 
    backgroundColor: '#fff', 
    padding: SPACING.xl, 
    borderRadius: SIZES.radiusLg, 
    ...SHADOWS.md, 
    borderWidth: 1, 
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.xl,
    overflow: 'hidden'
  },
  watermarkContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', zIndex: -1 },
  certHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.primaryDark, paddingBottom: SPACING.lg, marginBottom: SPACING.xl },
  certHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  certIconWrapper: { width: 60, height: 60, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  certTitle: { ...TYPOGRAPHY.h2, color: COLORS.primaryDark, fontSize: 18, letterSpacing: 0.5 },
  certSubtitle: { ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: 2 },
  qrPlaceholder: { width: 60, height: 60, backgroundColor: COLORS.backgroundBase, justifyContent: 'center', alignItems: 'center', borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: COLORS.borderLight },
  section: { marginBottom: SPACING.xl },
  sectionHeader: { ...TYPOGRAPHY.label, color: COLORS.primary, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, paddingBottom: SPACING.xs, marginBottom: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  label: { ...TYPOGRAPHY.body, color: COLORS.textMuted, flex: 1 },
  value: { ...TYPOGRAPHY.body, color: COLORS.textMain, fontWeight: '600', flex: 1.5, textAlign: 'right' },
  valuePrimary: { ...TYPOGRAPHY.body, color: COLORS.primaryDark, fontWeight: '700', flex: 1.5, textAlign: 'right' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm, paddingBottom: SPACING.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.borderLight },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textMuted, fontStyle: 'italic', paddingVertical: SPACING.sm },
  stampContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, paddingVertical: SPACING.md },
  verifiedStamp: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 2, borderColor: COLORS.success, borderRadius: SIZES.radiusSm, transform: [{ rotate: '-2deg' }] },
  verifiedText: { color: COLORS.success, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  timestamp: { ...TYPOGRAPHY.label, color: COLORS.textMuted, fontSize: 10 },
  footer: { marginTop: SPACING.sm, paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.borderMedium },
  footerText: { fontSize: 10, color: COLORS.textMuted, textAlign: 'justify', lineHeight: 16 }
});
