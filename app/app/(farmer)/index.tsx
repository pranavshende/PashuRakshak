import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Text, Platform, Image, Dimensions, Linking, Modal } from 'react-native';
import { useAuth, storage } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import Animated, { FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

function MovingNewsTicker({ newsList }: { newsList: any[] }) {
  const translateX = useSharedValue(0);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  const defaultHeadlines = [
    { title: 'NADCP Free Vaccination Drive Active in local districts', category: 'DISEASE ALERT', source: 'DAHD', url: 'https://dahd.nic.in/', details: 'Free vaccination drives for FMD and Brucellosis are currently active in all local veterinary centers. Get your cattle vaccinated now.' },
    { title: 'Lumpy Skin Disease Prevention Advisory for Cattle Farmers', category: 'HEALTH ADVISORY', source: 'ICAR', url: 'https://icar.org.in/', details: 'Isolate affected animals immediately and disinfect cattle shed premises. Apply neem oil on skin lesions to prevent insect transmission.' },
    { title: 'Pashu Kisan Credit Card Scheme: Up to ₹1.6 Lakh @ 4% Interest', category: 'GOVT SCHEME', source: 'NABARD', url: 'https://nabard.org/', details: 'Avail collateral-free loans up to ₹1.6 Lakhs at a subsidized interest rate of 4% per annum for livestock maintenance and dairy farm expansion.' },
    { title: 'Rashtriya Gokul Mission: Subsidies for Indigenous Livestock', category: 'POLICY', source: 'DAHD', url: 'https://dahd.nic.in/', details: 'Financial assistance and breed multiplication farm subsidies available for indigenous cow breeds (Gir, Sahiwal, Red Sindhi).' }
  ];

  const activeNews = newsList && newsList.length > 0 ? newsList : defaultHeadlines;
  const singleTicker = activeNews.map(n => `🚨 [${n.category}] ${n.title} (${n.source})`).join('     ★     ');
  const fullTickerText = `${singleTicker}     ★     ${singleTicker}     ★     ${singleTicker}     ★     ${singleTicker}`;

  useEffect(() => {
    if (!selectedNews) {
      translateX.value = 0;
      translateX.value = withRepeat(
        withTiming(-width * 2, { duration: 7500, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(translateX);
    }
    return () => cancelAnimation(translateX);
  }, [newsList, selectedNews]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  return (
    <>
      <TouchableOpacity 
        style={styles.newsTickerBannerRed}
        activeOpacity={0.9}
        onPress={() => {
          setSelectedNews(activeNews[0]);
        }}
      >
        <View style={styles.newsBadgeRed}>
          <View style={styles.newsPulseDotGold} />
          <Text style={styles.newsBadgeTextWhite}>FLASH NEWS</Text>
        </View>

        <View style={styles.marqueeMask}>
          <Animated.View style={[{ flexDirection: 'row', alignItems: 'center' }, animatedStyle]}>
            <Text style={styles.marqueeTextWhite} numberOfLines={1}>
              {fullTickerText}
            </Text>
          </Animated.View>
        </View>
        
        <FontAwesome name="chevron-right" size={10} color="#FFFFFF" style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      {/* Red News Detail React Native Modal */}
      <Modal
        visible={!!selectedNews}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNews(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.newsModalBoxRed}>
            <View style={styles.modalHeaderRed}>
              <View style={styles.modalBadgeRow}>
                <FontAwesome name="bullhorn" size={14} color="#FFFFFF" />
                <Text style={styles.modalBadgeText}>FLASH NEWS ADVISORY</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedNews(null)} style={styles.modalCloseBtn}>
                <FontAwesome name="times" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalTagRow}>
                <Text style={styles.modalTagCategory}>{selectedNews?.category || 'ADVISORY'}</Text>
                <Text style={styles.modalTagSource}>Source: {selectedNews?.source || 'Govt'}</Text>
              </View>
              
              <Text style={styles.modalTitleText}>{selectedNews?.title}</Text>
              <Text style={styles.modalDescText}>
                {selectedNews?.details || 'Official advisory issued for cattle health, disease prevention, and government support schemes. Click below to read full advisory notes.'}
              </Text>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity 
                  style={styles.modalOpenLinkBtn}
                  onPress={() => {
                    const url = selectedNews?.url || 'https://dahd.nic.in/';
                    Linking.openURL(url).catch(() => {});
                  }}
                >
                  <FontAwesome name="external-link" size={12} color="#FFFFFF" />
                  <Text style={styles.modalOpenLinkText}>Read Source</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalDismissBtn}
                  onPress={() => setSelectedNews(null)}
                >
                  <Text style={styles.modalDismissText}>Close & Resume</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [newsList, setNewsList] = useState<any[]>([]);
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.4:5000';

  useEffect(() => {
    const fetchLiveNews = async () => {
      try {
        const token = await storage.getItemAsync('userToken');
        const res = await fetch(`${API_URL}/farm/news`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.news && data.news.length > 0) {
          setNewsList(data.news);
        }
      } catch (e) {
        console.warn('Live news fetch notice: Using default news advisories.');
      }
    };
    fetchLiveNews();
  }, []);

  return (
    <View style={styles.container}>
      
      {/* Unified Full-Bleed Green Top Header Banner */}
      <View style={styles.topHeaderGreen}>
        <View style={styles.headerTopBar}>
          {/* Left: Govt Emblem + PashuRakshak Title (Clickable) */}
          <TouchableOpacity 
            style={styles.headerGovBrand} 
            activeOpacity={0.8}
            onPress={() => Linking.openURL('https://dahd.nic.in/').catch(() => {})}
          >
            <View style={styles.emblemCircle}>
              <FontAwesome name="university" size={16} color="#15803D" />
            </View>
            <View>
              <Text style={styles.headerGovTitle}>पशुरक्षक</Text>
              <Text style={styles.headerGovSub}>पशुपालन विभाग, भारत सरकार</Text>
            </View>
          </TouchableOpacity>

          {/* Right: User Avatar + Bell Button (Clickable) */}
          <View style={styles.headerActionsRow}>
            <TouchableOpacity style={styles.headerBellBtn} onPress={() => router.push('/(farmer)/community' as any)} activeOpacity={0.8}>
              <FontAwesome name="bell-o" size={16} color="#15803D" />
              <View style={styles.headerBellDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAvatarCircle} onPress={() => router.push('/(farmer)/two' as any)} activeOpacity={0.8}>
              <Text style={styles.headerAvatarText}>{user?.name?.charAt(0) || 'P'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Greeting & Location Sub-Row (Clickable) */}
        <View style={styles.headerUserRow}>
          <TouchableOpacity onPress={() => router.push('/(farmer)/two' as any)} activeOpacity={0.9}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerGreeting}>Hello, {user?.name?.split(' ')[0] || 'Pranav'}</Text>
              <Text style={{ fontSize: 16 }}>👋</Text>
            </View>
            <Text style={styles.headerSubtext}>Welcome back to PashuRakshak</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerLocationTag} onPress={() => router.push('/(farmer)/community' as any)} activeOpacity={0.8}>
            <FontAwesome name="map-marker" size={11} color="#DCFCE7" />
            <Text style={styles.headerLocationTxt}>Nagpur, Maharashtra</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Live Red Moving News Ticker Bar */}
        <Animated.View entering={FadeInUp.duration(500).springify()}>
          <MovingNewsTicker newsList={newsList} />
        </Animated.View>

        {/* Disease Alert Banner (Light Red Box) */}
        <Animated.View entering={FadeInUp.duration(600).delay(100).springify()}>
          <TouchableOpacity 
            style={styles.alertBanner} 
            activeOpacity={0.9}
            onPress={() => router.push('/(farmer)/community' as any)}
          >
            <View style={styles.alertIconBadge}>
              <FontAwesome name="exclamation-triangle" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1, paddingHorizontal: SPACING.xs }}>
              <Text style={styles.alertTitle}>Disease Alert: Lumpy Skin Disease reported</Text>
              <Text style={styles.alertSub}>2 active cases within 5 km of your location</Text>
            </View>
            <View style={styles.alertLinkRow}>
              <Text style={styles.alertLinkText}>View Details</Text>
              <FontAwesome name="chevron-right" size={10} color="#DC2626" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Main "Scan Cattle" Banner Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(200).springify()}>
          <TouchableOpacity 
            style={styles.scanCattleCard}
            activeOpacity={0.9}
            onPress={() => router.push('/capture')}
          >
            <View style={styles.scanCamBox}>
              <FontAwesome name="camera" size={24} color="#059669" />
            </View>
            <View style={{ flex: 1, paddingHorizontal: SPACING.md }}>
              <Text style={styles.scanCardTitle}>Scan Cattle</Text>
              <Text style={styles.scanCardSub}>Instant AI health analysis</Text>
              <Text style={styles.scanCardDesc}>Detect diseases early and protect your herd</Text>
            </View>
            <View style={styles.scanArrowBtn}>
              <FontAwesome name="chevron-right" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Services Section */}
        <Animated.View entering={FadeInUp.duration(600).delay(300).springify()} style={styles.sectionMargin}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Quick Services</Text>
            <TouchableOpacity onPress={() => router.push('/(farmer)/animals' as any)}>
              <Text style={styles.sectionLink}>View All Services ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.servicesWrapCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
              
              {/* 1. My Herd */}
              <TouchableOpacity style={styles.serviceItem} onPress={() => router.push('/(farmer)/animals' as any)}>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <FontAwesome name="paw" size={22} color="#8B5CF6" />
                </View>
                <Text style={styles.serviceItemTitle}>My Herd</Text>
                <Text style={styles.serviceItemSub}>Herd List</Text>
              </TouchableOpacity>

              {/* 2. Medicines */}
              <TouchableOpacity style={styles.serviceItem} onPress={() => router.push('/(farmer)/medicine' as any)}>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#E0F2FE' }]}>
                  <FontAwesome name="medkit" size={20} color="#0284C7" />
                </View>
                <Text style={styles.serviceItemTitle}>Medicines</Text>
                <Text style={styles.serviceItemSub}>Stock</Text>
              </TouchableOpacity>

              {/* 3. AI Vet */}
              <TouchableOpacity style={styles.serviceItem} onPress={() => router.push('/(farmer)/chat' as any)}>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <FontAwesome name="comments" size={20} color="#059669" />
                </View>
                <Text style={styles.serviceItemTitle}>AI Vet</Text>
                <Text style={styles.serviceItemSub}>Consultation</Text>
              </TouchableOpacity>

              {/* 4. Alerts */}
              <TouchableOpacity style={styles.serviceItem} onPress={() => router.push('/(farmer)/community' as any)}>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <FontAwesome name="bell" size={20} color="#D97706" />
                </View>
                <Text style={styles.serviceItemTitle}>Alerts</Text>
                <Text style={styles.serviceItemSub}>& Updates</Text>
              </TouchableOpacity>

              {/* 5. Nearby Vets */}
              <TouchableOpacity style={styles.serviceItem} onPress={() => router.push('/(farmer)/vets' as any)}>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#FEE2E2' }]}>
                  <FontAwesome name="map-marker" size={22} color="#DC2626" />
                </View>
                <Text style={styles.serviceItemTitle}>Nearby Vets</Text>
                <Text style={styles.serviceItemSub}>& Clinics</Text>
              </TouchableOpacity>

              {/* 6. Reports */}
              <TouchableOpacity style={styles.serviceItem} onPress={() => router.push('/(farmer)/score' as any)}>
                <View style={[styles.serviceIconCircle, { backgroundColor: '#E6F4EA' }]}>
                  <FontAwesome name="file-text" size={18} color="#16A34A" />
                </View>
                <Text style={styles.serviceItemTitle}>Reports</Text>
                <Text style={styles.serviceItemSub}>& Records</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </Animated.View>

        {/* Weekly Scans Section */}
        <Animated.View entering={FadeInUp.duration(600).delay(400).springify()} style={styles.sectionMargin}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Weekly Scans</Text>
            <TouchableOpacity onPress={() => router.push('/capture')}>
              <Text style={styles.sectionLink}>View History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weeklyScansCard}>
            
            {/* Left Prompt Column */}
            <View style={styles.scanPromptCol}>
              <View style={styles.clipboardIconBox}>
                <FontAwesome name="clipboard" size={32} color="#10B981" />
              </View>
              <Text style={styles.promptTitle}>No scan data this week.</Text>
              <Text style={styles.promptSub}>Start scanning your cattle for health insights.</Text>
              <TouchableOpacity style={styles.scanNowBtn} onPress={() => router.push('/capture')}>
                <FontAwesome name="camera" size={12} color="#fff" />
                <Text style={styles.scanNowText}>Scan Now</Text>
              </TouchableOpacity>
            </View>

            {/* Right Health Tip Column */}
            <TouchableOpacity style={styles.healthTipCol} activeOpacity={0.9} onPress={() => router.push('/(farmer)/chat' as any)}>
              <View style={styles.tipHeaderRow}>
                <FontAwesome name="lightbulb-o" size={16} color="#059669" />
                <Text style={styles.tipHeaderTitle}>Health Tip of the Day</Text>
              </View>
              <Text style={styles.tipBodyText}>Keep your animals clean and provide nutritious feed to boost immunity.</Text>
              <View style={{ marginTop: SPACING.xs }}>
                <Text style={styles.tipLearnMore}>Learn More ›</Text>
              </View>
            </TouchableOpacity>

          </View>
        </Animated.View>

        {/* Recent Activity Section */}
        <Animated.View entering={FadeInUp.duration(600).delay(500).springify()} style={styles.sectionMargin}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(farmer)/community' as any)}>
              <Text style={styles.sectionLink}>View All ›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.activityCard} activeOpacity={0.9} onPress={() => router.push('/(farmer)/community' as any)}>
            <View style={styles.activityIconWrapper}>
              <FontAwesome name="list-alt" size={32} color="#A7F3D0" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityTitle}>No recent activity right now.</Text>
              <Text style={styles.activitySub}>Your activities and updates will appear here.</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Government Initiative Footer Banner */}
        <Animated.View entering={FadeInUp.duration(600).delay(600).springify()}>
          <TouchableOpacity 
            style={styles.footerBanner} 
            activeOpacity={0.8}
            onPress={() => Linking.openURL('https://dahd.nic.in/').catch(() => {})}
          >
            <View style={styles.footerShield}>
              <FontAwesome name="shield" size={16} color="#059669" />
            </View>
            <Text style={styles.footerText}>
              PashuRakshak is an initiative of Department of Animal Husbandry & Dairying, Government of India.
            </Text>
            <View style={styles.digitalIndiaBadge}>
              <Text style={styles.digitalIndiaText}>Digital India</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: SPACING.lg,
  },
  newsModalBoxRed: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#DC2626',
    ...SHADOWS.md,
  },
  modalHeaderRed: {
    backgroundColor: '#DC2626',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalTagRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.xs + 2,
  },
  modalTagCategory: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalTagSource: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: SPACING.xs,
  },
  modalDescText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 4,
  },
  modalOpenLinkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalOpenLinkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modalDismissBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalDismissText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '800',
  },

  /* Moving News Ticker Red Strip */
  newsTickerBannerRed: {
    backgroundColor: '#DC2626',
    borderRadius: SIZES.radiusLg,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#B91C1C',
    marginBottom: SPACING.md,
    height: 38,
    ...SHADOWS.sm,
  },
  newsBadgeRed: {
    backgroundColor: '#991B1B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: SPACING.xs,
    zIndex: 10,
  },
  newsPulseDotGold: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FACC15',
  },
  newsBadgeTextWhite: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  marqueeMask: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  marqueeTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Full Bleed Unified Green Header */
  topHeaderGreen: {
    backgroundColor: '#15803D',
    paddingTop: Platform.OS === 'ios' ? 55 : 42,
    paddingBottom: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...SHADOWS.md,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md - 2,
  },
  headerGovBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  emblemCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGovTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerGovSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DCFCE7',
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 4,
  },
  headerBellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerBellDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  headerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#14532D',
  },
  headerUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerGreeting: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerLocationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerLocationTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emblemContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  govTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  govSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  govSub2: {
    fontSize: 9,
    color: '#64748B',
  },
  userCard: {
    flex: 1.25,
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: SPACING.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  userSub: {
    fontSize: 10,
    color: '#64748B',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },

  /* Disease Alert Banner */
  alertBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  alertIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
  },
  alertSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  alertLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },

  /* Main Scan Cattle Card */
  scanCattleCard: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  scanCamBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  scanCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scanCardSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  scanCardDesc: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  scanArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Section Styling */
  sectionMargin: {
    marginBottom: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },

  /* Services Card Wrap */
  servicesWrapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  servicesScroll: {
    gap: 12,
    paddingHorizontal: SPACING.xs,
  },
  serviceItem: {
    alignItems: 'center',
    width: 72,
  },
  serviceIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceItemTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  serviceItemSub: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
  },

  /* Weekly Scans Section */
  weeklyScansCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  scanPromptCol: {
    flex: 1.2,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    paddingRight: SPACING.sm,
  },
  clipboardIconBox: {
    marginBottom: SPACING.xs,
  },
  promptTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  promptSub: {
    fontSize: 11,
    color: '#64748B',
    marginVertical: 4,
  },
  scanNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  scanNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  healthTipCol: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: SPACING.md,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tipHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  tipBodyText: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  tipLearnMore: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },

  /* Recent Activity */
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  activityIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  activitySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  /* Footer Banner */
  footerBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  footerShield: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    flex: 1,
    fontSize: 10,
    color: '#047857',
    fontWeight: '600',
    lineHeight: 14,
  },
  digitalIndiaBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  digitalIndiaText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
