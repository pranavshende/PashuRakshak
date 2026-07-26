import Constants from 'expo-constants';

// Central API base URL — reads from app/.env (EXPO_PUBLIC_API_URL)
// Falls back to production URL if not set
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://pashurakshak-z7hk.onrender.com';
