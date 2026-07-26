import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

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
      // Leveraging the existing /animals/:id endpoint since it includes all relations
      const res = await fetch(`http://127.0.0.1:5000/animals/${id}`, {
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

  if (loading) return <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />;
  if (!animal) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Animal not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#1F2937" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePrint} style={styles.printBtn}>
          <FontAwesome name="download" size={16} color="#fff" />
          <Text style={styles.printBtnText}>Save PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.certificate}>
        <View style={styles.certHeader}>
          <FontAwesome name="shield" size={40} color="#10B981" />
          <Text style={styles.certTitle}>LIVESTOCK HEALTH CERTIFICATE</Text>
          <Text style={styles.certSubtitle}>PashuRakshak Verified Document</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ANIMAL DETAILS</Text>
          <View style={styles.row}><Text style={styles.label}>Tag ID:</Text><Text style={styles.value}>{animal.tagId}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{animal.name || 'N/A'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Breed:</Text><Text style={styles.value}>{animal.breed || 'N/A'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Weight:</Text><Text style={styles.value}>{animal.weight ? `${animal.weight} kg` : 'N/A'}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>VACCINATION RECORD</Text>
          {animal.vaccinations?.length > 0 ? (
            animal.vaccinations.map((vax: any) => (
              <View key={vax.id} style={styles.row}>
                <Text style={styles.value}>{vax.vaccineName}</Text>
                <Text style={styles.value}>{new Date(vax.dateAdministered).toLocaleDateString()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No vaccinations recorded.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>MEDICAL HISTORY (AI DIAGNOSES)</Text>
          {animal.predictions?.length > 0 ? (
            animal.predictions.map((pred: any) => (
              <View key={pred.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>{new Date(pred.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.value}>{pred.disease} ({pred.recoveryStatus || 'Unknown'})</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Clean bill of health.</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>This is a digitally generated certificate based on AI scanning and farmer records. For official insurance claims, secondary verification by a licensed veterinarian may be required.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  printBtn: { flexDirection: 'row', backgroundColor: '#10B981', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignItems: 'center', gap: 5 },
  printBtnText: { color: '#fff', fontWeight: 'bold' },
  certificate: { backgroundColor: '#fff', margin: 20, padding: 30, borderRadius: 8, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  certHeader: { alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#10B981', paddingBottom: 20, marginBottom: 20 },
  certTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 10, textAlign: 'center' },
  certSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 5 },
  section: { marginBottom: 25 },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#374151', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 5, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 14, color: '#6B7280', flex: 1 },
  value: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 2 },
  historyRow: { marginBottom: 10 },
  historyDate: { fontSize: 12, color: '#6B7280' },
  emptyText: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic' },
  footer: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerText: { fontSize: 10, color: '#9CA3AF', textAlign: 'justify', lineHeight: 14 }
});
