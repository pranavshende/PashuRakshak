import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function MedicineScreen() {
  const [disease, setDisease] = useState('Lumpy Skin Disease');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchMedicine = async (selectedDisease: string) => {
    setDisease(selectedDisease);
    setLoading(true);
    try {
      // In production, point to your real backend URL
      const response = await fetch(`http://127.0.0.1:5000/medicine/${encodeURIComponent(selectedDisease)}`);
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
    fetchMedicine('Lumpy Skin Disease');
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Medicine & Treatments</Text>
      
      <View style={styles.tabContainer}>
        {['Lumpy Skin Disease', 'FMD', 'Mastitis'].map((d) => (
          <TouchableOpacity 
            key={d} 
            style={[styles.tab, disease === d && styles.activeTab]}
            onPress={() => fetchMedicine(d)}
          >
            <Text style={[styles.tabText, disease === d && styles.activeTabText]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
      ) : data ? (
        <View style={styles.card}>
          <Text style={styles.description}>{data.description}</Text>
          
          <Text style={styles.sectionTitle}><FontAwesome name="shield" size={16} /> Quarantine Rules</Text>
          <Text style={styles.quarantineText}>{data.quarantine}</Text>

          <Text style={styles.sectionTitle}><FontAwesome name="medkit" size={16} /> Treatment Plan</Text>
          {data.treatments.map((t: any, index: number) => (
            <View key={index} style={styles.treatmentItem}>
              <Text style={styles.medName}>{t.name}</Text>
              <Text style={styles.medDosage}>Dosage: {t.dosage}</Text>
              <Text style={styles.medNotes}>Note: {t.notes}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No data available.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, marginTop: 40 },
  tabContainer: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#E5E7EB' },
  activeTab: { backgroundColor: '#10B981' },
  tabText: { color: '#4B5563', fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, marginBottom: 40 },
  description: { fontSize: 16, color: '#374151', marginBottom: 20, lineHeight: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12, marginTop: 10 },
  quarantineText: { fontSize: 15, color: '#DC2626', backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, overflow: 'hidden' },
  treatmentItem: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  medName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  medDosage: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  medNotes: { fontSize: 13, color: '#6B7280', fontStyle: 'italic' }
});
