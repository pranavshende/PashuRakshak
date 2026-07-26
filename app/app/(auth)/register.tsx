import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, GLOBAL_STYLES } from '../../constants/theme';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      
      Alert.alert('Registration Successful', 'Please log in with your new account.');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.content}>
        <View style={styles.header}>
          <Text style={TYPOGRAPHY.h1}>PashuRakshak</Text>
          <Text style={styles.subtitle}>Create your farmer account</Text>
        </View>

        <FloatingLabelInput
          label="Full Name"
          value={name}
          onChangeText={setName}
        />

        <FloatingLabelInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        <FloatingLabelInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <View style={{ height: SPACING.md }} />

        <TouchableOpacity 
          style={GLOBAL_STYLES.btnPrimary} 
          onPress={handleRegister} 
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={GLOBAL_STYLES.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.linkButton} activeOpacity={0.7}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundBase,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.sm,
  },
  linkButton: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  linkText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
  },
});
