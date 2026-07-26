import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../constants/theme';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

export default function ChatScreen() {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, id: string}[]>([
    { role: 'ai', text: 'Hello! I am your AI Veterinary Assistant. How can I help you and your livestock today?', id: 'msg-0' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    const newId = Math.random().toString();
    setMessages(prev => [...prev, { role: 'user', text: userMsg, id: newId }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userMsg, language })
      });
      const data = await res.json();
      
      const resId = Math.random().toString();
      if (data.response) {
        setMessages(prev => [...prev, { role: 'ai', text: data.response, id: resId }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to the server.', id: resId }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Network error. Please try again later.', id: Math.random().toString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>AI Vet Assistant</Text>
            <Text style={styles.headerSubtitle}>Online & Ready to Help</Text>
          </View>
        </View>
        <View style={styles.langToggle}>
          {['English', 'Hindi', 'Marathi'].map(lang => (
            <TouchableOpacity key={lang} onPress={() => setLanguage(lang)} style={[styles.langPill, language === lang && styles.langPillActive]}>
              <Text style={[styles.langText, language === lang && styles.langTextActive]}>{lang.substring(0,2)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea} 
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <Text style={styles.dateStamp}>Today</Text>

        {messages.map((msg, index) => (
          <Animated.View 
            key={msg.id} 
            entering={msg.role === 'user' ? FadeInRight.springify() : FadeInUp.springify()} 
            style={[styles.messageRow, msg.role === 'user' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}
          >
            {msg.role === 'ai' && (
              <View style={styles.avatarAi}>
                <FontAwesome name="stethoscope" size={16} color={COLORS.primaryDark} />
              </View>
            )}
            <View style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>{msg.text}</Text>
            </View>
          </Animated.View>
        ))}
        {loading && (
          <Animated.View entering={FadeInUp} style={[styles.messageRow, { justifyContent: 'flex-start' }]}>
            <View style={styles.avatarAi}>
              <FontAwesome name="stethoscope" size={16} color={COLORS.primaryDark} />
            </View>
            <View style={[styles.messageBubble, styles.aiBubble, { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl }]}>
              <ActivityIndicator color={COLORS.primary} size="small" />
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <View style={styles.inputWrapper}>
          <TextInput 
            style={styles.input} 
            placeholder="Ask about symptoms, diet, etc..." 
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !input.trim() && { backgroundColor: COLORS.borderMedium, opacity: 0.8 }]} 
            onPress={sendMessage} 
            disabled={loading || !input.trim()} 
            activeOpacity={0.8}
          >
            <FontAwesome name="paper-plane" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundBase },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: COLORS.backgroundSurface, 
    padding: SPACING.lg, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 10
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMain, marginBottom: 2 },
  headerSubtitle: { ...TYPOGRAPHY.label, fontSize: 12, color: COLORS.success },
  langToggle: { flexDirection: 'row', gap: SPACING.xs, backgroundColor: COLORS.backgroundBase, padding: 4, borderRadius: SIZES.radiusXl },
  langPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusLg },
  langPillActive: { backgroundColor: COLORS.backgroundSurface, ...SHADOWS.sm },
  langText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  langTextActive: { color: COLORS.primaryDark },
  chatArea: { flex: 1 },
  dateStamp: { textAlign: 'center', ...TYPOGRAPHY.label, color: COLORS.textMuted, marginBottom: SPACING.xl },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.lg, gap: SPACING.sm },
  avatarAi: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  messageBubble: { maxWidth: '78%', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: 20 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 4, ...SHADOWS.sm },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#F1F5F9', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.borderLight },
  messageText: { ...TYPOGRAPHY.body, fontSize: 15 },
  userText: { color: '#fff' },
  aiText: { color: COLORS.textMain },
  inputArea: { 
    padding: SPACING.md, 
    backgroundColor: COLORS.backgroundSurface, 
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.md,
    ...SHADOWS.md,
    elevation: 20
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundBase,
    borderRadius: 100, // Pill shaped input area
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.xs,
    height: 56,
  },
  input: { 
    flex: 1, 
    fontSize: 16,
    color: COLORS.textMain,
  },
  sendBtn: { 
    backgroundColor: COLORS.primary, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...SHADOWS.sm
  }
});
