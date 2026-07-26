import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ManageVetsScreen() {
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  // New vet form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    fetchVets();
  }, []);

  const getBackendUrl = (path: string) => {
    return `${process.env.EXPO_PUBLIC_API_URL}${path}`;
  };

  const getToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('userToken');
    const SecureStore = require('expo-secure-store');
    return await SecureStore.getItemAsync('userToken');
  };

  const fetchVets = async () => {
    try {
      const token = await getToken();
      const response = await fetch(getBackendUrl('/admin/vets'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setVets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVet = async () => {
    if (!name || !phone || !lat || !lon) return Alert.alert('Error', 'Fill all fields');
    setAdding(true);
    try {
      const token = await getToken();
      const response = await fetch(getBackendUrl('/admin/vets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name, phone, 
          latitude: parseFloat(lat), longitude: parseFloat(lon)
        })
      });
      if (response.ok) {
        setName(''); setPhone(''); setLat(''); setLon('');
        fetchVets();
      } else {
        Alert.alert('Error', 'Failed to add vet');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      await fetch(getBackendUrl(`/admin/vets/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchVets();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Veterinarians</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add New Vet</Text>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Latitude" value={lat} onChangeText={setLat} keyboardType="numeric" />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Longitude" value={lon} onChangeText={setLon} keyboardType="numeric" />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddVet} disabled={adding}>
          {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add Veterinarian</Text>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={vets}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.vetCard}>
              <View>
                <Text style={styles.vetName}>{item.name}</Text>
                <Text style={styles.vetDetails}>{item.phone}</Text>
                <Text style={styles.vetDetails}>Lat: {item.latitude}, Lon: {item.longitude}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <FontAwesome name="trash" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
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
  formCard: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#374151' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  row: { flexDirection: 'row' },
  addBtn: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  vetCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vetName: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  vetDetails: { color: '#6B7280', fontSize: 14 }
});
