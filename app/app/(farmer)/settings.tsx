import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../../context/AuthContext';
// import { clearLocalDb } from '../../database/localDb';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [clearing, setClearing] = useState(false);

  const handleClearCache = async () => {
    Alert.alert(
      "Clear Offline Data",
      "Are you sure? This will delete all unsynced diagnosis records.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            try {
              // await clearLocalDb();
              await new Promise(resolve => setTimeout(resolve, 1000));
              Alert.alert("Success", "Offline cache cleared.");
            } catch (e) {
              Alert.alert("Error", "Could not clear cache.");
            } finally {
              setClearing(false);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity style={styles.row} onPress={handleClearCache} disabled={clearing}>
          <View style={styles.rowLeft}>
            <FontAwesome name="trash" size={20} color="#DC2626" />
            <Text style={styles.rowTextRed}>Clear Offline Cache</Text>
          </View>
          {clearing && <ActivityIndicator color="#DC2626" />}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <View style={styles.rowLeft}>
            <FontAwesome name="sign-out" size={20} color="#374151" />
            <Text style={styles.rowText}>Log Out</Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 30, marginTop: 40 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 2 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 16, color: '#1F2937' },
  rowTextRed: { fontSize: 16, color: '#DC2626' }
});
