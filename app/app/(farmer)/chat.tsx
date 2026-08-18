import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS, GLOBAL_STYLES } from '../../constants/theme';
import TopHeaderBanner from '../../components/TopHeaderBanner';
import { useRouter } from 'expo-router';
import { storage } from '../../context/AuthContext';
import { Audio } from 'expo-av';
import Animated, { FadeInUp, FadeInRight, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, cancelAnimation } from 'react-native-reanimated';
import { API_BASE_URL } from '../../config/api';
import { useTranslation } from 'react-i18next';

const SUGGESTIONS = [
  'What are the signs of Lumpy Skin Disease?',
  'How to treat FMD in cattle?',
  'Best vaccination schedule for calves?',
  'How to prevent mastitis?',
];

const WELCOME_MESSAGE = `Namaste! I am the **PashuRakshak AI Veterinary Assistant**. I am here to help you care for your livestock.

I can assist you with:
* Identifying symptoms of illness.
* Providing first-aid advice.
* Explaining diseases like Lumpy Skin Disease (LSD), Foot and Mouth Disease (FMD), and Mastitis.

Please describe any symptoms you are noticing.

*(Note: For serious conditions, always consult your local veterinary officer immediately.)*`;

const MarkdownText = ({ text, style }: { text: string, style?: any }) => {
  const parseLine = (line: string, index: number) => {
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
      <Text key={index} style={style}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <Text key={i} style={[style, { fontWeight: 'bold' }]}>{part.slice(2, -2)}</Text>;
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return <Text key={i} style={[style, { fontStyle: 'italic' }]}>{part.slice(1, -1)}</Text>;
          }
          return part;
        })}
      </Text>
    );
  };

  const lines = (text || '').split('\n');
  return (
    <View>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <View key={idx} style={{ flexDirection: 'row', paddingLeft: 16, marginBottom: 4 }}>
              <Text style={[style, { marginRight: 8 }]}>•</Text>
              <View style={{ flex: 1 }}>{parseLine(trimmed.substring(2), idx)}</View>
            </View>
          );
        }
        return <View key={idx} style={{ marginBottom: 4 }}>{parseLine(line, idx)}</View>;
      })}
    </View>
  );
};

export default function ChatScreen() {
  const { t } = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, id: string, isCard?: boolean}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('English');
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const pulseScale = useSharedValue(1);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = await storage.getItemAsync('userToken');
      const res = await fetch(`${API_BASE_URL}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.conversation && data.conversation.messages.length > 0) {
        const mappedMessages = data.conversation.messages.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'ai',
          text: m.text,
          id: m.id || Math.random().toString()
        }));
        setMessages(mappedMessages);
      } else {
        setMessages([{ role: 'ai', text: WELCOME_MESSAGE, id: 'msg-welcome' }]);
      }
    } catch (e) {
      console.error(e);
      setMessages([{ role: 'ai', text: WELCOME_MESSAGE, id: 'msg-welcome' }]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleNewSession = () => {
    Alert.alert(
      "New Consultation",
      "Are you sure you want to start a new consultation? This will clear current session history.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Start New", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await storage.getItemAsync('userToken');
              const res = await fetch(`${API_BASE_URL}/chat/clear`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                setMessages([{ role: 'ai', text: WELCOME_MESSAGE, id: 'msg-welcome' }]);
              }
            } catch (e) {
              console.error(e);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Permission to access microphone is required for voice chat!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setIsRecording(true);
      
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    cancelAnimation(pulseScale);
    pulseScale.value = 1;

    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      if (!uri) return;
      await uploadAudioFile(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const uploadAudioFile = async (uri: string) => {
    setLoading(true);
    
    // Append a temporary user message so they see a mic/voice bubble immediately
    const userMsgId = Math.random().toString();
    setMessages(prev => [...prev, { role: 'user', text: "🎤 Processing audio...", id: userMsgId }]);

    try {
      const token = await storage.getItemAsync('userToken');

      const formData = new FormData();
      const filename = uri.split('/').pop() || 'recording.m4a';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `audio/${match[1]}` : `audio/m4a`;

      // @ts-ignore
      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: type,
      });
      formData.append('language', language);

      const res = await fetch(`${API_BASE_URL}/chat/audio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      });

      const data = await res.json();
      
      if (res.ok && data.transcript) {
        // Replace the temporary user bubble with the actual transcription
        setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, text: `🎤 ${data.transcript}` } : m));
        
        // Append AI response
        const aiMsgId = Math.random().toString();
        const isActionable = data.transcript.toLowerCase().includes('fever') || data.transcript.toLowerCase().includes('sick');
        setMessages(prev => [...prev, { role: 'ai', text: data.response, id: aiMsgId, isCard: isActionable }]);
      } else {
        setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, text: "🎤 (Failed to transcribe)" } : m));
        setMessages(prev => [...prev, { role: 'ai', text: data.error || 'Sorry, I had trouble processing your voice query.', id: Math.random().toString() }]);
      }
    } catch (e) {
      console.error('Audio upload error:', e);
      setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, text: "🎤 (Network error)" } : m));
      setMessages(prev => [...prev, { role: 'ai', text: 'Network error. Please try again.', id: Math.random().toString() }]);
    } finally {
      setLoading(false);
    }
  };

  const animatedMicStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  const sendQuickQuery = (queryText: string) => {
    sendMessageDirect(queryText);
  };

  const sendMessageDirect = async (userMsg: string) => {
    if (!userMsg.trim()) return;
    const newId = Math.random().toString();
    setMessages(prev => [...prev, { role: 'user', text: userMsg, id: newId }]);
    setInput('');
    setLoading(true);

    try {
      const token = await storage.getItemAsync('userToken');
      
      const res = await fetch(`${API_BASE_URL}/chat`, {
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
        const isActionable = userMsg.toLowerCase().includes('fever') || userMsg.toLowerCase().includes('sick') || userMsg.toLowerCase().includes('milk');
        setMessages(prev => [...prev, { role: 'ai', text: data.response, id: resId, isCard: isActionable }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.error || 'Sorry, I am having trouble connecting to the server.', id: resId }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'First-Aid Advisory: Keep the animal sheltered, maintain hydration with ORS solution, and contact your nearest veterinary officer.', id: Math.random().toString(), isCard: true }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    await sendMessageDirect(input.trim());
  };

  const renderMessageContent = (msg: any) => {
    if (msg.role === 'ai' && msg.isCard) {
      return (
        <View style={styles.actionCard}>
          <View style={styles.actionCardHeader}>
            <FontAwesome name="medkit" size={16} color="#fff" />
            <Text style={styles.actionCardTitle}>First-Aid Recommendation</Text>
          </View>
          <Text style={styles.aiText}>{msg.text}</Text>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionBtnPrimary} 
              activeOpacity={0.8}
              onPress={() => router.push('/(farmer)/vets' as any)}
            >
              <FontAwesome name="user-md" size={14} color="#FFFFFF" />
              <Text style={styles.actionBtnPrimaryText}>Find Nearest Vet</Text>
              <FontAwesome name="chevron-right" size={12} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionBtnSecondary} 
              activeOpacity={0.8}
              onPress={() => router.push('/(farmer)/medicine' as any)}
            >
              <FontAwesome name="medkit" size={14} color="#059669" />
              <Text style={styles.actionBtnSecondaryText}>Order Medicines</Text>
              <FontAwesome name="chevron-right" size={12} color="#059669" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return <MarkdownText text={msg.text} style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]} />;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopHeaderBanner title={t('chat.title', 'PashuRakshak AI Vet')} subtitle={t('chat.subtitle', '24/7 Intelligent Veterinary Assistant')} />

      <View style={{ backgroundColor: '#FFFBEB', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#FDE68A' }}>
        <FontAwesome name="exclamation-circle" size={16} color="#D97706" />
        <Text style={{ fontSize: 12, color: '#B45309', fontWeight: '500', flex: 1 }}>
          {t('chat.disclaimer', 'AI-generated information is for guidance only and does not replace professional veterinary diagnosis.')}
        </Text>
      </View>

      {/* Language Selector Sub-Bar */}
      <View style={styles.langBarContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.langBarLabel}>{t('chat.language', 'Language:')}</Text>
          <View style={styles.langToggle}>
            {['English', 'Hindi', 'Marathi'].map(lang => (
              <TouchableOpacity key={lang} onPress={() => setLanguage(lang)} style={[styles.langPill, language === lang && styles.langPillActive]}>
                <Text style={[styles.langText, language === lang && styles.langTextActive]}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity onPress={handleNewSession} style={{ padding: 6, backgroundColor: '#F1F5F9', borderRadius: 8 }}>
          <FontAwesome name="refresh" size={14} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea} 
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 110 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length <= 1 && (
          <View style={styles.chipScroll}>
            {[
              t('chat.suggestion1', 'What are the signs of Lumpy Skin Disease?'),
              t('chat.suggestion2', 'How to treat FMD in cattle?'),
              t('chat.suggestion3', 'Best vaccination schedule for calves?'),
              t('chat.suggestion4', 'How to prevent mastitis?')
            ].map((sug, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.chipBtn} 
                activeOpacity={0.8}
                onPress={() => sendQuickQuery(sug)}
                disabled={loading}
              >
                <Text style={styles.chipText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.dateStamp}>Today</Text>

        {historyLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          messages.map((msg, index) => (
            <Animated.View 
              key={msg.id} 
              entering={msg.role === 'user' ? FadeInRight.springify() : FadeInUp.springify()} 
              style={[styles.messageRow, msg.role === 'user' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}
            >
              {msg.role === 'ai' && !msg.isCard && (
                <View style={styles.avatarAi}>
                  <FontAwesome name="stethoscope" size={16} color={COLORS.primaryDark} />
                </View>
              )}
              
              <View style={[
                styles.messageBubble, 
                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                msg.isCard && styles.cardBubble
              ]}>
                {renderMessageContent(msg)}
              </View>
            </Animated.View>
          ))
        )}
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

      <View style={[
        styles.inputArea, 
        isKeyboardVisible && { paddingBottom: SPACING.md }
      ]}>
        {isRecording && (
          <Animated.View entering={FadeInUp} style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Listening ({language})...</Text>
          </Animated.View>
        )}
        
        <View style={styles.inputWrapper}>
          <TextInput 
            style={styles.input} 
            placeholder={t('chat.inputPlaceholder', 'Describe symptoms or ask a question...')} 
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            editable={!isRecording}
          />
          
          <View style={styles.actionButtonsRow}>
            {input.trim() === '' ? (
              <TouchableOpacity 
                style={[styles.micBtn, isRecording && styles.micBtnActive]} 
                onPress={isRecording ? () => stopRecording() : startRecording}
                activeOpacity={0.8}
              >
                <Animated.View style={animatedMicStyle}>
                  <FontAwesome name="microphone" size={18} color={isRecording ? "#fff" : COLORS.primaryDark} />
                </Animated.View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.sendBtn} 
                onPress={sendMessage} 
                disabled={loading} 
                activeOpacity={0.8}
              >
                <FontAwesome name="paper-plane" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundBase },
  chipScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  chipBtn: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  langBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  langBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 3,
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  langPillActive: {
    backgroundColor: '#059669',
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  langTextActive: {
    color: '#FFFFFF',
  },
  chatArea: { flex: 1 },
  dateStamp: { textAlign: 'center', ...TYPOGRAPHY.label, color: COLORS.textMuted, marginBottom: SPACING.xl },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.lg, gap: SPACING.sm },
  avatarAi: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  messageBubble: { maxWidth: '78%', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: 20 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 4, ...SHADOWS.sm },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#F8FAFC', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.borderLight },
  cardBubble: { maxWidth: '90%', paddingHorizontal: 0, paddingVertical: 0, overflow: 'hidden', backgroundColor: COLORS.backgroundSurface },
  messageText: { ...TYPOGRAPHY.body, fontSize: 15 },
  userText: { color: '#fff' },
  aiText: { color: COLORS.textMain, lineHeight: 22 },
  actionCard: { width: '100%', padding: SPACING.md },
  actionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#f59e0b', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 10, marginBottom: SPACING.sm },
  actionCardTitle: { ...TYPOGRAPHY.body, color: '#fff', fontWeight: '800', fontSize: 13 },
  actionButtonsContainer: {
    marginTop: SPACING.md,
    gap: SPACING.xs + 2,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
  },
  actionBtnSecondaryText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '800',
  },
  inputArea: { 
    padding: SPACING.md, 
    backgroundColor: COLORS.backgroundSurface, 
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.error },
  recordingText: { ...TYPOGRAPHY.label, color: COLORS.error, fontWeight: '700' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundBase,
    borderRadius: 100, 
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
    paddingLeft: SPACING.lg,
    paddingRight: 6,
    height: 56,
  },
  input: { 
    flex: 1, 
    fontSize: 16,
    color: COLORS.textMain,
  },
  actionButtonsRow: { flexDirection: 'row', gap: SPACING.sm },
  micBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  micBtnActive: { backgroundColor: COLORS.error },
  sendBtn: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm }
});
