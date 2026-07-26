import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Farmer'} 👋</Text>
          <Text style={styles.subtitle}>Let's check your cattle's health today.</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <FontAwesome name="sign-out" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Main Action Area */}
      <View style={styles.mainActionContainer}>
        <TouchableOpacity 
          style={styles.scanButton}
          activeOpacity={0.8}
          onPress={() => router.push('/capture')}
        >
          <View style={styles.scanIconContainer}>
            <FontAwesome name="camera" size={50} color="#fff" />
          </View>
          <Text style={styles.scanButtonTitle}>Scan Cattle</Text>
          <Text style={styles.scanButtonSubtitle}>Take a photo for instant AI analysis</Text>
        </TouchableOpacity>
      </View>

      {/* Stats/Quick Info */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <FontAwesome name="heartbeat" size={24} color="#10B981" />
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Healthy Scans</Text>
        </View>
        <View style={styles.statCard}>
          <FontAwesome name="warning" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Issues Found</Text>
        </View>
      </View>

      {/* New Features Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(farmer)/medicine')}>
          <FontAwesome name="medkit" size={24} color="#2563EB" />
          <Text style={styles.actionBtnText}>Medicines</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(farmer)/settings')}>
          <FontAwesome name="cog" size={24} color="#4B5563" />
          <Text style={styles.actionBtnText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTextContainer: {
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F766E',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  mainActionContainer: {
    padding: 24,
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  scanButton: {
    backgroundColor: '#10B981',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  scanIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  scanButtonSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '47%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 20,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  actionBtn: {
    backgroundColor: '#fff',
    width: '47%',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151'
  }
});
