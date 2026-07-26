import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#16A34A', // Emerald Green
  primaryDark: '#0F766E', // Deep Teal
  primaryLight: '#DCFCE7', // Light Green
  primaryGlow: 'rgba(22, 163, 74, 0.2)',

  secondary: '#38BDF8', // Sky Blue
  secondaryDark: '#0369A1', // Dark Blue/Sky 700
  secondaryLight: '#E0F2FE', // Light Blue

  backgroundBase: '#FFFFFF', // Pure White
  backgroundSurface: '#F8FAFC', // Soft Gray

  textMain: '#0F172A', // Slate 900
  textMuted: '#64748B', // Slate 500

  borderLight: '#F1F5F9', // Slate 100
  borderMedium: '#E2E8F0', // Slate 200

  error: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 64,
};

export const SIZES = {
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 18, // 18-24px as per guideline
  radiusXl: 24,
  buttonHeight: 48, // Medium sized
  inputHeight: 48,
};

export const SHADOWS = StyleSheet.create({
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 5,
  },
  hover: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
});

export const TYPOGRAPHY = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textMain,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMain,
  },
});

export const GLOBAL_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundBase,
  },
  section: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.backgroundSurface,
    borderRadius: SIZES.radiusXl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    height: SIZES.buttonHeight,
    borderRadius: 100, // Pill shaped
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.sm,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    height: SIZES.buttonHeight,
    borderRadius: 100, // Pill shaped
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  btnDisabled: {
    backgroundColor: COLORS.borderMedium,
    height: SIZES.buttonHeight,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  input: {
    height: SIZES.inputHeight,
    backgroundColor: COLORS.backgroundSurface,
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SPACING.lg,
    fontSize: 16,
    color: COLORS.textMain,
  },
});
