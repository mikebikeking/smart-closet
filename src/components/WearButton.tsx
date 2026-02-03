import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/src/constants/Colors';

interface WearButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const WearButton: React.FC<WearButtonProps> = ({ 
  onPress, 
  loading = false, 
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={Colors.cardBackground} />
      ) : (
        <Text style={styles.buttonText}>Log Wear</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.cardBackground,
    fontSize: 16,
    fontWeight: '600',
  },
});
