import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../constants/theme';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight, FadeInUp, Layout } from 'react-native-reanimated';

export default function MedicineScreen() {
  const [diseases, setDiseases] = useState<string[]>([]);
  const [disease, setDisease] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTabs, setFetchingTabs] = useState(true);
  
  // Modal Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [newDisease, setNewDisease] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newQuarantine, setNewQuarantine] = useState('');
  const [newTreatments, setNewTreatments] = useState<{ name: string; dosage: string; notes: string }[]>([
    { name: '', dosage: '', notes: '' }
  ]);
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.4:5000';

  const fetchDiseases = async (selectDefault?: boolean, defaultToSelect?: string) => {
    setFetchingTabs(true);
    try {
      const res = await fetch(`${API_URL}/medicine`);
      const result = await res.json();
      if (result.success && result.data) {
        setDiseases(result.data);
        if (selectDefault) {
          const toSelect = defaultToSelect || result.data[0] || '';
          if (toSelect) {
            setDisease(toSelect);
            fetchMedicine(toSelect);
          }
        }
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setDiseases(['Lumpy Skin Disease', 'FMD', 'Mastitis']);
      if (selectDefault) {
        setDisease('Lumpy Skin Disease');
        fetchMedicine('Lumpy Skin Disease');
      }
    } finally {
      setFetchingTabs(false);
    }
  };

  const fetchMedicine = async (selectedDisease: string) => {
    setDisease(selectedDisease);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/medicine/${encodeURIComponent(selectedDisease)}`);
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
    fetchDiseases(true);
  }, []);

  const handleAddTreatmentField = () => {
    setNewTreatments([...newTreatments, { name: '', dosage: '', notes: '' }]);
  };

  const handleRemoveTreatmentField = (index: number) => {
    const updated = newTreatments.filter((_, i) => i !== index);
    setNewTreatments(updated.length > 0 ? updated : [{ name: '', dosage: '', notes: '' }]);
  };

  const handleTreatmentChange = (index: number, key: 'name' | 'dosage' | 'notes', value: string) => {
    const updated = [...newTreatments];
    updated[index][key] = value;
    setNewTreatments(updated);
  };

  const handleSavePlan = async () => {
    if (!newDisease.trim()) {
      alert('Please enter a disease name.');
      return;
    }
    const filteredTreatments = newTreatments.filter(t => t.name.trim() !== '');
    if (filteredTreatments.length === 0) {
      alert('Please add at least one treatment medicine.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/medicine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease: newDisease.trim(),
          description: newDescription.trim(),
          quarantine: newQuarantine.trim(),
          treatments: filteredTreatments
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        // Reset Form
        setNewDisease('');
        setNewDescription('');
        setNewQuarantine('');
        setNewTreatments([{ name: '', dosage: '', notes: '' }]);
        setModalVisible(false);
        
        // Reload list of diseases and select new one
        await fetchDiseases(true, result.data.disease || newDisease.trim());
      } else {
        alert(result.error || 'Failed to save treatment plan.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error. Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <FontAwesome name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>Add Plan</Text>
        </TouchableOpacity>
      </View>
      
      {/* Horizontal Segmented Control */}
      <View style={{ backgroundColor: COLORS.backgroundBase, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight }}>
        {fetchingTabs ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ paddingVertical: SPACING.md }} />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            {diseases.map((d) => (
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
        )}
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
              <Text style={styles.sectionTitle}>Quarantine & Biosafety</Text>
            </View>
            <View style={styles.quarantineContainer}>
              <FontAwesome name="exclamation-circle" size={16} color={COLORS.error} style={{ marginTop: 2 }} />
              <Text style={styles.quarantineText}>{data.quarantine}</Text>
            </View>

            <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
              <View style={[styles.iconWrapper, { backgroundColor: COLORS.secondaryLight }]}>
                <FontAwesome name="medkit" size={16} color={COLORS.secondary} />
              </View>
              <Text style={styles.sectionTitle}>Treatment Plan</Text>
            </View>
            
            <View style={{ marginTop: SPACING.sm }}>
              {data.treatments && data.treatments.length > 0 ? (
                data.treatments.map((t: any, index: number) => (
                  <Animated.View 
                    key={index} 
                    entering={FadeInRight.delay(index * 100).springify()}
                    layout={Layout.springify()}
                    style={styles.classicItem}
                  >
                    <View style={styles.classicHeader}>
                      <FontAwesome name="flask" size={13} color={COLORS.primaryDark} style={styles.classicIcon} />
                      <Text style={styles.classicName}>{t.name}</Text>
                    </View>
                    <Text style={styles.classicDosage}><Text style={styles.boldText}>Dosage:</Text> {t.dosage}</Text>
                    {t.notes && t.notes !== 'None' && (
                      <Text style={styles.classicNotes}><Text style={styles.boldText}>Notes:</Text> {t.notes}</Text>
                    )}
                  </Animated.View>
                ))
              ) : (
                <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, textAlign: 'center', padding: SPACING.lg }}>No specific medicines mapped yet.</Text>
              )}
            </View>
          </Animated.View>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <FontAwesome name="folder-open-o" size={48} color={COLORS.borderMedium} />
            <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: SPACING.md }}>No data available.</Text>
          </View>
        )}
      </ScrollView>

      {/* Creation Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Treatment Plan</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <FontAwesome name="times" size={20} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <Text style={styles.fieldLabel}>Disease Name</Text>
              <TextInput 
                style={styles.formInput} 
                placeholder="e.g., Babesiosis" 
                placeholderTextColor={COLORS.textMuted}
                value={newDisease}
                onChangeText={setNewDisease}
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput 
                style={[styles.formInput, styles.textArea]} 
                placeholder="Brief description of the disease..." 
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                value={newDescription}
                onChangeText={setNewDescription}
              />

              <Text style={styles.fieldLabel}>Quarantine & Biosafety Protocol</Text>
              <TextInput 
                style={[styles.formInput, styles.textArea]} 
                placeholder="Rules for isolation, sanitation, etc..." 
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={2}
                value={newQuarantine}
                onChangeText={setNewQuarantine}
              />

              <View style={styles.treatmentsSectionHeader}>
                <Text style={styles.sectionLabel}>Required Medicines</Text>
                <TouchableOpacity style={styles.addFieldBtn} onPress={handleAddTreatmentField}>
                  <FontAwesome name="plus" size={12} color={COLORS.primaryDark} />
                  <Text style={styles.addFieldText}>Add Medicine</Text>
                </TouchableOpacity>
              </View>

              {newTreatments.map((treatment, idx) => (
                <View key={idx} style={styles.formTreatmentCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
                    <Text style={styles.treatmentIndexText}>Medicine #{idx + 1}</Text>
                    {newTreatments.length > 1 && (
                      <TouchableOpacity onPress={() => handleRemoveTreatmentField(idx)}>
                        <FontAwesome name="trash" size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput 
                    style={styles.treatmentInput}
                    placeholder="Medicine / Vaccine Name"
                    placeholderTextColor={COLORS.textMuted}
                    value={treatment.name}
                    onChangeText={(val) => handleTreatmentChange(idx, 'name', val)}
                  />
                  <TextInput 
                    style={styles.treatmentInput}
                    placeholder="Dosage & Frequency (e.g. 10ml, twice daily)"
                    placeholderTextColor={COLORS.textMuted}
                    value={treatment.dosage}
                    onChangeText={(val) => handleTreatmentChange(idx, 'dosage', val)}
                  />
                  <TextInput 
                    style={styles.treatmentInput}
                    placeholder="Usage Notes / Precautions"
                    placeholderTextColor={COLORS.textMuted}
                    value={treatment.notes}
                    onChangeText={(val) => handleTreatmentChange(idx, 'notes', val)}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSavePlan} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Record</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, ...SHADOWS.sm },
  addBtnText: { ...TYPOGRAPHY.label, color: '#fff', fontWeight: '700', fontSize: 13 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 120 },
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
  classicItem: { 
    backgroundColor: COLORS.backgroundSurface, 
    padding: SPACING.md, 
    borderRadius: SIZES.radiusMd, 
    marginBottom: SPACING.sm, 
    borderWidth: 1, 
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm
  },
  classicHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.xs,
    marginBottom: 4
  },
  classicIcon: { marginRight: 2 },
  classicName: { 
    ...TYPOGRAPHY.label, 
    fontSize: 15,
    fontWeight: '700', 
    color: COLORS.textMain 
  },
  classicDosage: { 
    ...TYPOGRAPHY.body, 
    fontSize: 13, 
    color: COLORS.textMuted,
    lineHeight: 18,
    marginLeft: 18,
    marginBottom: 2
  },
  classicNotes: { 
    ...TYPOGRAPHY.body, 
    fontSize: 12, 
    color: COLORS.textMuted,
    lineHeight: 16,
    marginLeft: 18,
    fontStyle: 'italic'
  },
  boldText: {
    fontWeight: '600',
    color: COLORS.textMain
  },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.backgroundSurface, borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%', padding: SPACING.xl, ...SHADOWS.card },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  modalTitle: { ...TYPOGRAPHY.h2, color: COLORS.textMain },
  closeBtn: { padding: 4 },
  formScroll: { paddingTop: SPACING.lg, paddingBottom: SPACING.xxl },
  fieldLabel: { ...TYPOGRAPHY.label, color: COLORS.textMain, fontWeight: '700', marginBottom: SPACING.xs, marginTop: SPACING.md },
  formInput: { backgroundColor: COLORS.backgroundBase, borderWidth: 1, borderColor: COLORS.borderMedium, borderRadius: SIZES.radiusMd, padding: SPACING.md, fontSize: 16, color: COLORS.textMain },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  treatmentsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.md },
  sectionLabel: { ...TYPOGRAPHY.h3, fontSize: 18, color: COLORS.textMain },
  addFieldBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  addFieldText: { ...TYPOGRAPHY.label, color: COLORS.primaryDark, fontWeight: '700', fontSize: 12 },
  formTreatmentCard: { backgroundColor: COLORS.backgroundBase, padding: SPACING.md, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.borderMedium, marginBottom: SPACING.md },
  treatmentIndexText: { ...TYPOGRAPHY.label, color: COLORS.textMuted, fontWeight: '700' },
  treatmentInput: { backgroundColor: COLORS.backgroundSurface, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: SIZES.radiusSm, padding: SPACING.sm, fontSize: 14, color: COLORS.textMain, marginBottom: SPACING.xs },
  formActions: { flexDirection: 'row', gap: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: SPACING.lg },
  cancelBtn: { flex: 1, paddingVertical: SPACING.lg, borderRadius: 100, borderWidth: 1, borderColor: COLORS.borderMedium, alignItems: 'center' },
  cancelBtnText: { ...TYPOGRAPHY.label, color: COLORS.textMain, fontWeight: '700' },
  saveBtn: { flex: 2, paddingVertical: SPACING.lg, borderRadius: 100, backgroundColor: COLORS.primary, alignItems: 'center', ...SHADOWS.sm },
  saveBtnText: { ...TYPOGRAPHY.label, color: '#fff', fontWeight: '700' }
});
