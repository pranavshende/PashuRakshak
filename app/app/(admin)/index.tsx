import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else {
        const SecureStore = require('expo-secure-store');
        token = await SecureStore.getItemAsync('userToken');
      }

      const backendUrl = Platform.OS === 'web' 
        ? 'http://127.0.0.1:5000/admin/stats'
        : 'http://10.0.2.2:5000/admin/stats';

      const response = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        alert(data.error || 'Failed to fetch stats');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Analytics Dashboard</Text>
      
      <View style={styles.grid}>
        <View style={styles.card}>
          <FontAwesome name="heartbeat" size={32} color="#3B82F6" />
          <Text style={styles.statNumber}>{stats?.totalPredictions || 0}</Text>
          <Text style={styles.statLabel}>Total Predictions</Text>
        </View>

        <View style={styles.card}>
          <FontAwesome name="users" size={32} color="#10B981" />
          <Text style={styles.statNumber}>{stats?.totalFarmers || 0}</Text>
          <Text style={styles.statLabel}>Farmers Registered</Text>
        </View>

        <View style={styles.card}>
          <FontAwesome name="user-md" size={32} color="#8B5CF6" />
          <Text style={styles.statNumber}>{stats?.totalVets || 0}</Text>
          <Text style={styles.statLabel}>Vets Available</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(admin)/vets' as any)}>
        <Text style={styles.actionBtnText}>Manage Veterinarians</Text>
        <FontAwesome name="chevron-right" size={16} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 24, marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 30 },
  card: { flex: 1, minWidth: 150, backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginVertical: 8 },
  statLabel: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  actionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#4F46E5', padding: 20, borderRadius: 16 },
  actionBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
