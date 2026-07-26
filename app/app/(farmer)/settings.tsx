import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView, Switch } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../constants/theme';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [clearing, setClearing] = useState(false);
  const [offlineSync, setOfflineSync] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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

  const renderRow = (icon: string, title: string, color: string, isDestructive = false, onPress?: () => void, rightElement?: React.ReactNode, isLast = false) => (
    <TouchableOpacity 
      style={[styles.row, !isLast && styles.rowBorder]} 
      onPress={onPress} 
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: isDestructive ? '#FEE2E2' : COLORS.backgroundBase }]}>
          <FontAwesome name={icon as any} size={18} color={isDestructive ? COLORS.error : color} />
        </View>
        <Text style={[styles.rowText, isDestructive && { color: COLORS.error }]}>{title}</Text>
      </View>
      {rightElement || <FontAwesome name="chevron-right" size={14} color={COLORS.borderMedium} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>App Preferences</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={GLOBAL_STYLES.card}>
            {renderRow('user-circle', 'Farmer Profile', COLORS.primaryDark, false, () => {})}
            {renderRow('language', 'Language (English)', COLORS.secondaryDark, false, () => {})}
            {renderRow('moon-o', 'Dark Mode', COLORS.textMain, false, undefined, 
              <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: COLORS.primary }} />, 
            true)}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(100).springify()}>
          <Text style={styles.sectionTitle}>Data & Sync</Text>
          <View style={GLOBAL_STYLES.card}>
            {renderRow('cloud-upload', 'Auto Cloud Sync', COLORS.primary, false, undefined, 
              <Switch value={offlineSync} onValueChange={setOfflineSync} trackColor={{ true: COLORS.primary }} />
            )}
            {renderRow('trash', 'Clear Offline Cache', COLORS.error, true, handleClearCache, clearing ? <ActivityIndicator color={COLORS.error} /> : undefined, true)}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(200).springify()}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={GLOBAL_STYLES.card}>
            {renderRow('question-circle', 'Help Center', COLORS.secondary, false, () => {})}
            {renderRow('shield', 'Privacy Policy', COLORS.textMuted, false, () => {}, undefined, true)}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(300).springify()}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>PashuRakshak v2.0.0</Text>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundBase },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: COLORS.backgroundBase, 
    padding: SPACING.lg, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 10
  },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.textMain, marginBottom: 2 },
  headerSubtitle: { ...TYPOGRAPHY.label, color: COLORS.primary },
  backBtn: { padding: SPACING.xs },
  content: { padding: SPACING.lg, paddingBottom: 120 },
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: SPACING.sm, paddingLeft: SPACING.xs, marginTop: SPACING.lg },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: SPACING.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconWrapper: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  rowText: { ...TYPOGRAPHY.body, color: COLORS.textMain, fontWeight: '500' },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    padding: SPACING.lg,
    borderRadius: SIZES.radiusXl,
    alignItems: 'center',
    marginTop: SPACING.xxl,
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  logoutText: { ...TYPOGRAPHY.h3, color: COLORS.error, fontSize: 16 },
  versionText: { ...TYPOGRAPHY.label, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.lg }
});
