import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';

export default function AnimalListScreen() {
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch('http://127.0.0.1:5000/animals', {
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

  const renderAnimal = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/(farmer)/animals/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.animalName}>{item.name || `Tag: ${item.tagId}`}</Text>
        <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>Breed: {item.breed || 'Unknown'}</Text>
        <Text style={styles.detailText}>Records: {item.predictions?.length || 0} Scans</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Herd (Digital Twin)</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" />
      ) : (
        <FlatList 
          data={animals}
          keyExtractor={(item) => item.id}
          renderItem={renderAnimal}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No animals found. Scan a QR code to add one!</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab}>
        <FontAwesome name="qrcode" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  animalName: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  cardDetails: { flexDirection: 'row', gap: 15 },
  detailText: { fontSize: 14, color: '#6B7280' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 40 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', elevation: 5 }
});
