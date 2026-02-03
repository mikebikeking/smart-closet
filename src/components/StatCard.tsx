import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/Colors';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  unit = '', 
  color = Colors.primary 
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  unit: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.6,
    marginLeft: 4,
  },
});
