import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, GLOBAL_STYLES, SHADOWS, SIZES } from '../../constants/theme';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  const validate = () => {
    setError(null);
    if (!phone) {
      setError('Phone number is required');
      return false;
    }
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }
      
      if (data.token) {
        await login(data.token, data.user);
        router.replace('/(farmer)' as any);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="leaf" size={40} color={COLORS.primary} />
            </View>
            <Text style={TYPOGRAPHY.h1}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to PashuRakshak</Text>
          </Animated.View>

          <View style={styles.formContainer}>
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <FloatingLabelInput
              label="Phone Number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (error) setError(null);
              }}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            <FloatingLabelInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              secureTextEntry
            />
            
            <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={{ height: SPACING.lg }} />

            <TouchableOpacity 
              style={[GLOBAL_STYLES.btnPrimary, styles.loginBtn]} 
              onPress={handleLogin} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={GLOBAL_STYLES.btnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <Link href="/register" asChild>
              <TouchableOpacity style={GLOBAL_STYLES.btnSecondary} activeOpacity={0.7}>
                <Text style={[GLOBAL_STYLES.btnText, { color: COLORS.textMain }]}>Create New Account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundBase,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: COLORS.error,
    marginLeft: SPACING.sm,
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.xs,
  },
  forgotPasswordText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '600',
  },
  loginBtn: {
    ...SHADOWS.hover,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderMedium,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
