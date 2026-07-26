import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { getPendingSyncs, markAsSynced } from '../../database/localDb';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SyncScreen() {
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const records = await getPendingSyncs();
      setPendingRecords(records);
    } catch (e) {
      console.error("Failed to load pending syncs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (pendingRecords.length === 0) return;
    setLoading(true);
    
    try {
      // Get JWT token
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else {
        const SecureStore = require('expo-secure-store');
        token = await SecureStore.getItemAsync('userToken');
      }

      const backendUrl = Platform.OS === 'web' 
        ? 'http://127.0.0.1:5000/predict/sync'
        : 'http://10.0.2.2:5000/predict/sync';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ records: pendingRecords }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Mark locally as synced
        for (const id of data.syncedIds) {
          await markAsSynced(id);
        }
        await loadRecords();
        alert('Sync successful!');
      } else {
        alert(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.diseaseText}>{item.disease}</Text>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Pending Sync</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Records</Text>
        <View style={{ flex: 1 }} />
        {pendingRecords.length > 0 && !loading && (
          <TouchableOpacity onPress={handleSync} style={styles.syncBtn}>
            <Text style={styles.syncBtnText}>Sync Now</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : pendingRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="cloud-upload" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>All records are synced!</Text>
        </View>
      ) : (
        <FlatList
          data={pendingRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 16, fontSize: 18, color: '#6B7280' },
  card: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  diseaseText: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  dateText: { fontSize: 12, color: '#6B7280' },
  statusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#D97706', fontSize: 12, fontWeight: '600' },
  syncBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  syncBtnText: { color: '#fff', fontWeight: 'bold' },
});
