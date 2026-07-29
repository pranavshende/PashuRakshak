import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import TopHeaderBanner from '../../components/TopHeaderBanner';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { storage } from '../../context/AuthContext';

export default function DebuggerScreen() {
  const [nodeStatus, setNodeStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [mlStatus, setMlStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  const [apiPath, setApiPath] = useState('/predict');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('POST');
  const [apiBody, setApiBody] = useState('{\n  "model": "localml"\n}');
  
  const [loading, setLoading] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('API Console Initialized...\nReady for requests.');
  
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
  const ML_URL = process.env.EXPO_PUBLIC_ML_URL || 'http://localhost:8000';

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setNodeStatus('checking');
    setMlStatus('checking');

    // Check Node API (expects a 404 on / if running, or 200 on /health)
    try {
      const res = await fetch(`${API_URL}/`);
      setNodeStatus('online');
    } catch (err) {
      setNodeStatus('offline');
    }

    // Check ML API (expects 200 on /health)
    try {
      const res = await fetch(`${ML_URL}/health`);
      if (res.ok) {
        setMlStatus('online');
      } else {
        setMlStatus('offline');
      }
    } catch (err) {
      // If it throws, try just the root
      try {
        await fetch(`${ML_URL}/`);
        setMlStatus('online');
      } catch (err2) {
        setMlStatus('offline');
      }
    }
  };

  const sendRequest = async () => {
    setLoading(true);
    setConsoleOutput(prev => prev + `\n\n> Sending ${apiMethod} request to ${API_URL}${apiPath}...`);
    
    try {
      const token = await storage.getItemAsync('userToken');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: any = {
        method: apiMethod,
        headers,
      };

      if (apiMethod === 'POST') {
        try {
          // Verify valid JSON
          JSON.parse(apiBody);
          options.body = apiBody;
        } catch (e) {
          setConsoleOutput(prev => prev + `\n[ERROR] Invalid JSON in Request Body`);
          setLoading(false);
          return;
        }
      }

      const startTime = Date.now();
      const response = await fetch(`${API_URL}${apiPath}`, options);
      const endTime = Date.now();
      
      const responseText = await response.text();
      let formattedRes = responseText;
      try {
        formattedRes = JSON.stringify(JSON.parse(responseText), null, 2);
      } catch (e) {
        // Not JSON
      }

      setConsoleOutput(prev => prev + `\n[STATUS: ${response.status}] (${endTime - startTime}ms)\n${formattedRes}`);
    } catch (err: any) {
      setConsoleOutput(prev => prev + `\n[NETWORK ERROR]\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const StatusDot = ({ status }: { status: string }) => (
    <View style={[
      styles.statusDot,
      { backgroundColor: status === 'online' ? '#10B981' : status === 'offline' ? '#EF4444' : '#F59E0B' }
    ]} />
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopHeaderBanner title="API Debugger" subtitle="Network & Endpoint Monitoring" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Server Status Dashboard */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>Server Status</Text>
            <TouchableOpacity onPress={checkHealth} style={styles.refreshBtn}>
              <FontAwesome name="refresh" size={12} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusRow}>
            <View style={styles.serverInfo}>
              <FontAwesome name="server" size={16} color="#0EA5E9" />
              <View>
                <Text style={styles.serverName}>Node.js API</Text>
                <Text style={styles.serverUrl}>{API_URL}</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <StatusDot status={nodeStatus} />
              <Text style={styles.statusText}>{nodeStatus.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusRow}>
            <View style={styles.serverInfo}>
              <FontAwesome name="microchip" size={16} color="#8B5CF6" />
              <View>
                <Text style={styles.serverName}>Python ML Engine</Text>
                <Text style={styles.serverUrl}>{ML_URL}</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <StatusDot status={mlStatus} />
              <Text style={styles.statusText}>{mlStatus.toUpperCase()}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Request Builder */}
        <Animated.View entering={FadeInUp.duration(500).delay(100).springify()} style={styles.builderCard}>
          <Text style={styles.sectionTitle}>Command Prompt</Text>
          
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={styles.methodBtn}
              onPress={() => setApiMethod(apiMethod === 'GET' ? 'POST' : 'GET')}
            >
              <Text style={[styles.methodText, { color: apiMethod === 'GET' ? '#10B981' : '#F59E0B' }]}>
                {apiMethod}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.pathInput}
              value={apiPath}
              onChangeText={setApiPath}
              placeholder="/api/endpoint"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {apiMethod === 'POST' && (
            <View style={styles.bodyContainer}>
              <Text style={styles.bodyLabel}>JSON Body</Text>
              <TextInput
                style={styles.bodyInput}
                value={apiBody}
                onChangeText={setApiBody}
                multiline
                placeholder="{}"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.sendBtn, loading && { opacity: 0.7 }]}
            onPress={sendRequest}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <FontAwesome name="paper-plane" size={14} color="#fff" />}
            <Text style={styles.sendBtnText}>{loading ? 'Sending...' : 'Execute Request'}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Console Output */}
        <Animated.View entering={FadeInUp.duration(600).delay(200).springify()} style={styles.consoleCard}>
          <View style={styles.consoleHeader}>
            <Text style={styles.consoleTitle}>Terminal Output</Text>
            <TouchableOpacity onPress={() => setConsoleOutput('API Console Cleared.')}>
              <FontAwesome name="trash" size={12} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View style={styles.consoleWindow}>
            <Text style={styles.consoleText}>{consoleOutput}</Text>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  
  // Status Card
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshBtn: {
    padding: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serverName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  serverUrl: {
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  statusDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },

  // Builder Card
  builderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  methodBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pathInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  bodyContainer: {
    marginBottom: SPACING.md,
  },
  bodyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  bodyInput: {
    backgroundColor: '#1E293B',
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 10,
    ...SHADOWS.sm,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Console Card
  consoleCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  consoleTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  consoleWindow: {
    padding: SPACING.md,
    minHeight: 200,
  },
  consoleText: {
    color: '#A7F3D0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    lineHeight: 16,
  }
});
