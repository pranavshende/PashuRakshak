import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import TopHeaderBanner from '../../components/TopHeaderBanner';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/theme';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TopHeaderBanner title={t('profile.title', 'Farmer Profile')} subtitle={t('profile.subtitle', 'Account details & farm information')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header Slim Card */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.profileSlimCard}>
          <View style={styles.avatarCircleSlim}>
            <Text style={styles.avatarTxtSlim}>{user?.name?.charAt(0) || 'P'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileNameSlim}>{user?.name || 'Pranav Shende'}</Text>
            <Text style={styles.profileRoleSlim}>{t('profile.farmInfo', 'Registered Dairy & Livestock Farmer')}</Text>

            <View style={styles.badgeRowSlim}>
              <View style={styles.badgeGreenSlim}>
                <FontAwesome name="check-circle" size={10} color="#059669" />
                <Text style={styles.badgeGreenTxtSlim}>{t('profile.verified', 'Verified Farmer')}</Text>
              </View>
              <View style={styles.badgeBlueSlim}>
                <FontAwesome name="shield" size={10} color="#0284C7" />
                <Text style={styles.badgeBlueTxtSlim}>NAIP ID #8849</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Account Details Slim Card */}
        <Animated.View entering={FadeInUp.duration(500).delay(100).springify()} style={styles.sectionSlimCard}>
          <Text style={styles.sectionTitleSlim}>{t('profile.personalInfo', 'Account & Farm Info')}</Text>

          <View style={styles.infoSlimRow}>
            <View style={styles.infoIconCircle}>
              <FontAwesome name="phone" size={13} color="#059669" />
            </View>
            <Text style={styles.infoLabelSlim}>{t('profile.contactNo', 'Phone Number:')}</Text>
            <Text style={styles.infoValueSlim}>+91 98765 43210</Text>
          </View>

          <View style={styles.infoSlimRow}>
            <View style={styles.infoIconCircle}>
              <FontAwesome name="envelope" size={12} color="#059669" />
            </View>
            <Text style={styles.infoLabelSlim}>{t('profile.email', 'Email:')}</Text>
            <Text style={styles.infoValueSlim}>{user?.email || 'farmer@pashurakshak.gov.in'}</Text>
          </View>

          <View style={styles.infoSlimRow}>
            <View style={styles.infoIconCircle}>
              <FontAwesome name="map-marker" size={13} color="#059669" />
            </View>
            <Text style={styles.infoLabelSlim}>{t('profile.district', 'District:')}</Text>
            <Text style={styles.infoValueSlim}>Nagpur, Maharashtra</Text>
          </View>

          <View style={[styles.infoSlimRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIconCircle}>
              <FontAwesome name="paw" size={13} color="#059669" />
            </View>
            <Text style={styles.infoLabelSlim}>{t('terminology.herd', 'Registered Herd:')}</Text>
            <Text style={styles.infoValueSlim}>14 Cattle (Gir & Sahiwal)</Text>
          </View>
        </Animated.View>

        {/* Action Logout */}
        <Animated.View entering={FadeInUp.duration(500).delay(200).springify()}>
          <TouchableOpacity style={styles.logoutSlimBtn} activeOpacity={0.8} onPress={logout}>
            <FontAwesome name="sign-out" size={14} color="#DC2626" />
            <Text style={styles.logoutTxtSlim}>{t('profile.logout', 'Sign Out of Account')}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 95 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 110,
  },
  profileSlimCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  avatarCircleSlim: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxtSlim: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileNameSlim: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileRoleSlim: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  badgeRowSlim: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  badgeGreenSlim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeGreenTxtSlim: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  badgeBlueSlim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeBlueTxtSlim: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },

  sectionSlimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  sectionTitleSlim: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  infoSlimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabelSlim: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValueSlim: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    marginLeft: 'auto',
  },

  logoutSlimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
    ...SHADOWS.sm,
  },
  logoutTxtSlim: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
});
