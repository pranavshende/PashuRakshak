import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth, storage } from '../../../context/AuthContext';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../../constants/theme';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function AnimalListScreen() {
  const [animals, setAnimals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  // Add Animal Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [tagId, setTagId] = useState('');
  const [breed, setBreed] = useState('');
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const token = await storage.getItemAsync('userToken');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/animals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.animals) setAnimals(data.animals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnimal = async () => {
    if (!tagId.trim()) {
      Alert.alert("Error", "Please enter a Tag ID.");
      return;
    }
    setSubmitting(true);
    try {
      const token = await storage.getItemAsync('userToken');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/animals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tagId: tagId.trim(),
          name: name.trim() || null,
          breed: breed.trim() || null,
          dateOfBirth: dob.trim() && !isNaN(Date.parse(dob.trim())) ? new Date(dob.trim()).toISOString() : null,
          weight: weight.trim() ? parseFloat(weight.trim()) : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalVisible(false);
        setName('');
        setTagId('');
        setBreed('');
        setDob('');
        setWeight('');
        fetchAnimals();
        Alert.alert("Success", "Animal registered successfully!");
      } else {
        Alert.alert("Error", data.error || "Failed to register animal.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to reach server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnimals = animals.filter(a => 
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.tagId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAnimal = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
      <TouchableOpacity 
        style={GLOBAL_STYLES.card}
        onPress={() => router.push(`/(farmer)/animals/${item.id}` as any)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
            <View style={styles.avatar}>
              <FontAwesome name="paw" size={20} color={COLORS.primaryDark} />
            </View>
            <View>
              <Text style={styles.animalName}>{item.name || `Tag: ${item.tagId}`}</Text>
              <Text style={styles.animalBreed}>{item.breed || 'Mixed Breed'}</Text>
            </View>
          </View>
          <View style={styles.chevronWrapper}>
            <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
          </View>
        </View>
        <View style={styles.cardDetails}>
          <View style={[styles.detailPill, { backgroundColor: COLORS.primaryLight }]}>
            <Text style={[styles.detailText, { color: COLORS.primaryDark, fontWeight: '600' }]}>{item.predictions?.length || 0} Scans</Text>
          </View>
          <View style={[styles.detailPill, { backgroundColor: COLORS.secondaryLight }]}>
            <Text style={[styles.detailText, { color: COLORS.secondaryDark, fontWeight: '600' }]}>Healthy</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Herd</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by name or tag ID..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList 
          data={filteredAnimals}
          keyExtractor={(item) => item.id}
          renderItem={renderAnimal}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }} // Space for FAB + Tabs
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <FontAwesome name="paw" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No animals found</Text>
              <Text style={styles.emptyText}>Add your first animal to start tracking their health and history.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.extendedFab} 
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome name="plus" size={18} color="#fff" style={{ marginRight: SPACING.sm }} />
        <Text style={styles.fabText}>Add Animal</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Animal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <FontAwesome name="times" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Tag ID *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. RFID-982-110"
                placeholderTextColor={COLORS.textMuted}
                value={tagId}
                onChangeText={setTagId}
              />

              <Text style={styles.label}>Animal Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ganga, Laxmi"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Breed</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Holstein Friesian, Gir"
                placeholderTextColor={COLORS.textMuted}
                value={breed}
                onChangeText={setBreed}
              />

              <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2024-03-15"
                placeholderTextColor={COLORS.textMuted}
                value={dob}
                onChangeText={setDob}
              />

              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 450"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, submitting ? styles.submitBtnDisabled : null]}
                onPress={handleAddAnimal}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Add to Herd</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.textMain },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSurface, borderRadius: SIZES.radiusXl, borderWidth: 1.5, borderColor: COLORS.borderMedium, height: SIZES.inputHeight, paddingHorizontal: SPACING.md },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.textMain, paddingTop: 0, paddingBottom: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  animalName: { ...TYPOGRAPHY.h3, fontSize: 18, color: COLORS.textMain, marginBottom: 2 },
  animalBreed: { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  chevronWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.backgroundBase, justifyContent: 'center', alignItems: 'center' },
  cardDetails: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: SPACING.md },
  detailPill: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: SIZES.radiusXl },
  detailText: { ...TYPOGRAPHY.label, fontSize: 13 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyIconWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl },
  emptyTitle: { ...TYPOGRAPHY.h2, marginBottom: SPACING.sm },
  emptyText: { ...TYPOGRAPHY.body, textAlign: 'center', color: COLORS.textMuted, paddingHorizontal: SPACING.xl },
  extendedFab: { position: 'absolute', bottom: 110, right: SPACING.xl, flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: 100, alignItems: 'center', ...SHADOWS.hover },
  fabText: { ...TYPOGRAPHY.label, color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.backgroundBase,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    padding: SPACING.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textMain,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalForm: {
    marginBottom: SPACING.xl,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMain,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.backgroundSurface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    height: SIZES.inputHeight,
    paddingHorizontal: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.textMain,
    marginBottom: SPACING.md,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radiusXl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.borderMedium,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
