import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { CategoryOptions } from '@/src/constants/Categories';

interface FilterBarProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[styles.filterButton, selectedCategory === null && styles.filterButtonActive]}
          onPress={() => onCategoryChange(null)}
        >
          <Text style={[
            styles.filterText,
            selectedCategory === null && styles.filterTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {CategoryOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              selectedCategory === option.value && styles.filterButtonActive
            ]}
            onPress={() => onCategoryChange(option.value)}
          >
            <Text style={[
              styles.filterText,
              selectedCategory === option.value && styles.filterTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.cardBackground,
    fontWeight: '600',
  },
});
