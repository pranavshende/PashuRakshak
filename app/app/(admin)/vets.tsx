import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../constants/theme';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { storage } from '../../context/AuthContext';

const IS_WEB = Platform.OS === 'web';

// Mock data
const MOCK_VETS = [
  { id: '1', name: 'Dr. Ramesh Kumar', phone: '+91 9876543210', district: 'Pune', status: 'verified', casesHandled: 142 },
  { id: '2', name: 'Dr. Sunita Sharma', phone: '+91 9876543211', district: 'Satara', status: 'verified', casesHandled: 89 },
  { id: '3', name: 'Dr. Amit Patel', phone: '+91 9876543212', district: 'Nashik', status: 'pending', casesHandled: 0 },
  { id: '4', name: 'Dr. Priya Singh', phone: '+91 9876543213', district: 'Nagpur', status: 'suspended', casesHandled: 34 },
];

export default function VetManagementScreen() {
  const [loading, setLoading] = useState(true);
  const [vets, setVets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const token = await storage.getItemAsync('userToken');
        const res = await fetch(`${API_URL}/admin/vets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          // Map DB schema to UI format
          const mapped = data.map((v: any) => ({
            id: v.id,
            name: v.name,
            phone: v.phone,
            district: v.clinic || 'Pune', // Mocking district since it isn't in DB yet
            status: v.status || 'verified', // Assuming all are verified for now if not in DB
            casesHandled: Math.floor(Math.random() * 200) // Mocking
          }));
          setVets(mapped.length > 0 ? mapped : MOCK_VETS);
        } else {
          setVets(MOCK_VETS);
        }
      } catch (err) {
        console.error('Error fetching vets:', err);
        setVets(MOCK_VETS);
      } finally {
        setLoading(false);
      }
    };

    fetchVets();
  }, []);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    // Optimistic UI update
    const newStatus = currentStatus === 'verified' ? 'suspended' : 'verified';
    setVets(prev => prev.map(vet => vet.id === id ? { ...vet, status: newStatus } : vet));
  };

  const filteredVets = vets.filter(vet => 
    vet.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    vet.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundBase }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.headerArea}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or district..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={GLOBAL_STYLES.btnPrimary}>
          <FontAwesome name="plus" size={14} color="#fff" style={{ marginRight: 8 }} />
          <Text style={GLOBAL_STYLES.btnText}>Invite Vet</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.tableContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.tableCard}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>VETERINARIAN</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>CONTACT & LOCATION</Text>
            {IS_WEB && <Text style={[styles.tableHeaderCell, { flex: 1 }]}>CASES</Text>}
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>STATUS</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>ACTIONS</Text>
          </View>

          {/* Table Body */}
          {filteredVets.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome name="inbox" size={40} color={COLORS.borderMedium} />
              <Text style={{ ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: SPACING.md }}>No veterinarians found.</Text>
            </View>
          ) : (
            filteredVets.map((vet, index) => (
              <Animated.View 
                key={vet.id} 
                entering={FadeInUp.delay(index * 100).springify()}
                layout={Layout.springify()}
                style={styles.tableRow}
              >
                <View style={[styles.tableCell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: SPACING.md }]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{vet.name.charAt(4)}</Text>
                  </View>
                  <View>
                    <Text style={styles.vetName}>{vet.name}</Text>
                    <Text style={styles.vetId}>ID: VET-{vet.id.padStart(4, '0')}</Text>
                  </View>
                </View>

                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.cellTextPrimary}>{vet.phone}</Text>
                  <Text style={styles.cellTextSecondary}>{vet.district} District</Text>
                </View>

                {IS_WEB && (
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={styles.cellTextPrimary}>{vet.casesHandled}</Text>
                  </View>
                )}

                <View style={[styles.tableCell, { flex: 1 }]}>
                  <View style={[
                    styles.statusBadge,
                    vet.status === 'verified' ? styles.statusVerified :
                    vet.status === 'pending' ? styles.statusPending :
                    styles.statusSuspended
                  ]}>
                    <Text style={[
                      styles.statusText,
                      vet.status === 'verified' ? styles.textVerified :
                      vet.status === 'pending' ? styles.textPending :
                      styles.textSuspended
                    ]}>
                      {vet.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.tableCell, { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm }]}>
                  {vet.status === 'pending' ? (
                    <TouchableOpacity style={styles.actionBtnApprove} onPress={() => handleToggleStatus(vet.id, 'pending')}>
                      <Text style={styles.actionBtnTextApprove}>Approve</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.actionBtnToggle} 
                      onPress={() => handleToggleStatus(vet.id, vet.status)}
                    >
                      <Text style={styles.actionBtnTextToggle}>
                        {vet.status === 'verified' ? 'Suspend' : 'Reactivate'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundBase },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.backgroundSurface, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, zIndex: 10 },
  searchBar: { flex: 1, maxWidth: 400, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundBase, paddingHorizontal: SPACING.md, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.borderLight, marginRight: SPACING.lg },
  searchInput: { flex: 1, paddingVertical: Platform.OS === 'ios' ? 12 : 8, paddingHorizontal: SPACING.sm, ...TYPOGRAPHY.body, color: COLORS.textMain },
  tableContainer: { padding: SPACING.xl, paddingBottom: 100 },
  tableCard: { backgroundColor: COLORS.backgroundSurface, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm, overflow: 'hidden' },
  tableHeaderRow: { flexDirection: 'row', padding: SPACING.lg, backgroundColor: COLORS.backgroundBase, borderBottomWidth: 1, borderBottomColor: COLORS.borderMedium },
  tableHeaderCell: { ...TYPOGRAPHY.label, color: COLORS.textMuted, fontWeight: '700', fontSize: 11, letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  tableCell: { justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 16 },
  vetName: { ...TYPOGRAPHY.body, color: COLORS.textMain, fontWeight: '600' },
  vetId: { ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: 2 },
  cellTextPrimary: { ...TYPOGRAPHY.body, color: COLORS.textMain, fontSize: 14 },
  cellTextSecondary: { ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusVerified: { backgroundColor: '#D1FAE5' },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusSuspended: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  textVerified: { color: '#065F46' },
  textPending: { color: '#B45309' },
  textSuspended: { color: '#991B1B' },
  actionBtnApprove: { backgroundColor: COLORS.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusSm },
  actionBtnTextApprove: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionBtnToggle: { backgroundColor: COLORS.backgroundBase, borderWidth: 1, borderColor: COLORS.borderMedium, paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusSm },
  actionBtnTextToggle: { color: COLORS.textMain, fontSize: 12, fontWeight: '600' },
  emptyState: { padding: SPACING.xxl * 2, alignItems: 'center', justifyContent: 'center' }
});
