import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

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
      const token = localStorage.getItem('userToken');
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

  if (loading) return <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />;
  if (!animal) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Animal not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <FontAwesome name="paw" size={40} color="#10B981" />
        </View>
        <Text style={styles.name}>{animal.name || 'Unnamed Animal'}</Text>
        <Text style={styles.tag}>Tag: {animal.tagId}</Text>
        
        <TouchableOpacity 
          style={styles.certBtn} 
          onPress={() => router.push(`/(farmer)/animals/certificate?id=${animal.id}` as any)}
        >
          <FontAwesome name="file-pdf-o" size={16} color="#10B981" />
          <Text style={styles.certBtnText}>Health Certificate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Digital Twin Timeline</Text>
        
        {/* Mocking a timeline UI */}
        {animal.predictions?.length > 0 ? (
          animal.predictions.map((pred: any) => (
            <View key={pred.id} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.timelineDate}>{new Date(pred.createdAt).toLocaleDateString()}</Text>
                  {pred.recoveryStatus && <Text style={styles.recoveryBadge}>{pred.recoveryStatus}</Text>}
                </View>
                <Text style={styles.timelineTitle}>AI Diagnosis</Text>
                <Text style={styles.timelineDesc}>Detected: {pred.disease} (Risk: {pred.riskLevel})</Text>
                
                {!pred.recoveryStatus && (
                  <TouchableOpacity style={styles.recoveryBtn}>
                    <Text style={styles.recoveryBtnText}>Log Recovery</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No medical history.</Text>
        )}
      </View>
      
      {/* Space for future sections like Vaccinations and Milk Production */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  profileHeader: { backgroundColor: '#10B981', padding: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatar: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  tag: { fontSize: 16, color: '#E5E7EB', marginTop: 4 },
  certBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 15, gap: 8 },
  certBtnText: { color: '#10B981', fontWeight: 'bold' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563EB', marginTop: 5, marginRight: 15 },
  timelineContent: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, elevation: 1 },
  timelineDate: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  timelineTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  timelineDesc: { fontSize: 14, color: '#4B5563' },
  recoveryBadge: { fontSize: 12, backgroundColor: '#D1FAE5', color: '#065F46', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  recoveryBtn: { marginTop: 10, alignSelf: 'flex-start', padding: 5, backgroundColor: '#F3F4F6', borderRadius: 5 },
  recoveryBtnText: { fontSize: 12, color: '#2563EB', fontWeight: 'bold' },
  emptyText: { color: '#6B7280' }
});
