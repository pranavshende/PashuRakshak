import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Animated, TextInputProps } from 'react-native';
import { COLORS, SPACING, SIZES } from '../constants/theme';

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
}

export default function FloatingLabelInput({ label, value, ...props }: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelTop = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -8],
  });

  const labelFontSize = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.textMuted, COLORS.primary],
  });

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <Animated.Text style={[styles.label, { top: labelTop, fontSize: labelFontSize, color: labelColor }]}>
        {label}
      </Animated.Text>
      <TextInput
        {...props}
        value={value}
        style={[styles.input, props.style]}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus && props.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur && props.onBlur(e);
        }}
        placeholderTextColor="transparent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SIZES.inputHeight,
    backgroundColor: COLORS.backgroundSurface,
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  focusedContainer: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    position: 'absolute',
    left: SPACING.lg,
    backgroundColor: COLORS.backgroundSurface,
    paddingHorizontal: 4,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMain,
    paddingTop: 8, // Adjust for the floating label space
  },
});
