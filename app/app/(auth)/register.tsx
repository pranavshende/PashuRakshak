import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const name = useRef('');
  const phone = useRef('');
  const password = useRef('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [, forceRender] = useState(0);

  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const { login } = useAuth();
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  const validate = useCallback((): boolean => {
    if (!name.current.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!phone.current.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (phone.current.trim().length < 10) {
      setError('Enter a valid 10-digit phone number');
      return false;
    }
    if (!password.current) {
      setError('Password is required');
      return false;
    }
    if (password.current.length < 4) {
      setError('Password must be at least 4 characters');
      return false;
    }
    return true;
  }, []);

  const handleRegister = useCallback(async () => {
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.current.trim(),
          phone: phone.current.trim(),
          password: password.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      Alert.alert('Registration Successful', 'Please log in with your new account.');
      router.replace('/login');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, router, validate]);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
    forceRender(n => n + 1);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundBase} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="leaf" size={36} color="#fff" />
          </View>
          <Text style={styles.appName}>PashuRakshak</Text>
          <Text style={styles.tagline}>Create your farmer account</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={18} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor="#94A3B8"
                defaultValue=""
                onChangeText={(t) => { name.current = t; if (error) setError(null); }}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                blurOnSubmit={false}
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={phoneRef}
                style={styles.textInput}
                placeholder="Enter your phone number"
                placeholderTextColor="#94A3B8"
                defaultValue=""
                onChangeText={(t) => { phone.current = t; if (error) setError(null); }}
                keyboardType="phone-pad"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.textInput}
                placeholder="Create a password"
                placeholderTextColor="#94A3B8"
                defaultValue=""
                onChangeText={(t) => { password.current = t; if (error) setError(null); }}
                secureTextEntry={!showPassword}
                returnKeyType="go"
                onSubmitEditing={handleRegister}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={togglePassword}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 8 }} />

          <TouchableOpacity
            style={[styles.signUpBtn, loading && styles.signUpBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.signUpText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>Already registered?</Text>
            <View style={styles.dividerLine} />
          </View>

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginBtn} activeOpacity={0.8}>
              <Ionicons name="log-in-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.backgroundBase,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 60 : 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...SHADOWS.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: COLORS.backgroundSurface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMain,
    paddingVertical: 0,
  },
  signUpBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  signUpBtnDisabled: {
    opacity: 0.7,
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderMedium,
  },
  dividerLabel: {
    marginHorizontal: 14,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  loginBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
