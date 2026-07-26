import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen() {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am your AI Veterinary Assistant. How can I help you and your livestock today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userMsg, language })
      });
      const data = await res.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to the server.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Network error. Please try again later.' }]);
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
        <Text style={styles.headerTitle}>AI Veterinary Assistant</Text>
        <View style={styles.langToggle}>
          {['English', 'Hindi', 'Marathi'].map(lang => (
            <TouchableOpacity key={lang} onPress={() => setLanguage(lang)}>
              <Text style={[styles.langText, language === lang && styles.langTextActive]}>{lang.substring(0,2)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 20 }}>
        {messages.map((msg, index) => (
          <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>{msg.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <ActivityIndicator color="#10B981" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Ask a veterinary question..." 
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
          <FontAwesome name="paper-plane" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, paddingTop: 50, elevation: 3 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  langToggle: { flexDirection: 'row', gap: 10 },
  langText: { color: '#9CA3AF', fontSize: 14, fontWeight: 'bold' },
  langTextActive: { color: '#10B981' },
  chatArea: { flex: 1 },
  messageBubble: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 15 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2563EB', borderBottomRightRadius: 5 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 5, elevation: 1 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#374151' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', elevation: 10 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, fontSize: 16 },
  sendBtn: { backgroundColor: '#10B981', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});
