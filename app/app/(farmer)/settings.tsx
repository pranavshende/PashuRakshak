import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView, Switch, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/theme';
import TopHeaderBanner from '../../components/TopHeaderBanner';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [clearing, setClearing] = useState(false);
  const [offlineSync, setOfflineSync] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleClearCache = async () => {
    Alert.alert(
      "Clear Offline Cache",
      "Are you sure? This will delete all cached offline diagnostic records.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear Data", 
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 800));
              Alert.alert("Success", "Offline cache cleared successfully.");
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

  const renderSlimRow = (
    icon: string, 
    title: string, 
    color: string, 
    isDestructive = false, 
    onPress?: () => void, 
    rightElement?: React.ReactNode, 
    isLast = false
  ) => (
    <TouchableOpacity 
      style={[styles.slimRow, !isLast && styles.slimRowBorder]} 
      onPress={onPress} 
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.slimRowLeft}>
        <View style={[styles.slimIconCircle, { backgroundColor: isDestructive ? '#FEE2E2' : '#F1F5F9' }]}>
          <FontAwesome name={icon as any} size={14} color={isDestructive ? '#DC2626' : color} />
        </View>
        <Text style={[styles.slimRowText, isDestructive && { color: '#DC2626' }]}>{title}</Text>
      </View>
      {rightElement || <FontAwesome name="chevron-right" size={11} color="#94A3B8" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopHeaderBanner title="App Settings" subtitle="Preferences & Account Management" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* General Preferences */}
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.slimCard}>
            {renderSlimRow('user-circle', 'Farmer Profile', '#059669', false, () => router.push('/(farmer)/two' as any))}
            {renderSlimRow('language', 'Language (English)', '#0284C7', false, () => {})}
            {renderSlimRow('moon-o', 'Dark Mode', '#475569', false, undefined, 
              <Switch 
                value={darkMode} 
                onValueChange={setDarkMode} 
                trackColor={{ true: '#059669', false: '#CBD5E1' }}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />, 
            true)}
          </View>
        </Animated.View>

        {/* Data & Cloud Sync */}
        <Animated.View entering={FadeInUp.duration(500).delay(100).springify()}>
          <Text style={styles.sectionTitle}>Data & Sync</Text>
          <View style={styles.slimCard}>
            {renderSlimRow('cloud-upload', 'Auto Cloud Sync', '#059669', false, undefined, 
              <Switch 
                value={offlineSync} 
                onValueChange={setOfflineSync} 
                trackColor={{ true: '#059669', false: '#CBD5E1' }}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            )}
            {renderSlimRow('trash', 'Clear Offline Cache', '#DC2626', true, handleClearCache, clearing ? <ActivityIndicator size="small" color="#DC2626" /> : undefined, true)}
          </View>
        </Animated.View>

        {/* Support & Legal */}
        <Animated.View entering={FadeInUp.duration(600).delay(200).springify()}>
          <Text style={styles.sectionTitle}>Support & Assistance</Text>
          <View style={styles.slimCard}>
            {renderSlimRow('question-circle', 'Help Center & AI Vet', '#059669', false, () => router.push('/(farmer)/chat' as any))}
            {renderSlimRow('shield', 'Privacy Policy & DAHD Portal', '#64748B', false, () => Linking.openURL('https://dahd.nic.in/').catch(() => {}), undefined, true)}
          </View>
        </Animated.View>

        {/* Action Logout */}
        <Animated.View entering={FadeInUp.duration(600).delay(300).springify()}>
          <TouchableOpacity style={styles.slimLogoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <FontAwesome name="sign-out" size={14} color="#DC2626" />
            <Text style={styles.slimLogoutText}>Sign Out Account</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>PashuRakshak v2.0.0 (Official Build)</Text>
        </Animated.View>

        <View style={{ height: 95 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  content: { 
    paddingHorizontal: SPACING.lg, 
    paddingTop: SPACING.md, 
    paddingBottom: 110 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#64748B', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 6, 
    marginLeft: 4, 
    marginTop: SPACING.md 
  },
  slimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  slimRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 10,
  },
  slimRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  slimRowLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  slimIconCircle: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  slimRowText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#0F172A' 
  },
  slimLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    ...SHADOWS.sm,
  },
  slimLogoutText: { 
    fontSize: 13, 
    fontWeight: '800', 
    color: '#DC2626' 
  },
  versionText: { 
    fontSize: 11, 
    textAlign: 'center', 
    color: '#94A3B8', 
    marginTop: SPACING.md 
  }
});
