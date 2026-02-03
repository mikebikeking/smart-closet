import { ClothingItemCard } from '@/src/components/ClothingItemCard';
import { FilterBar } from '@/src/components/FilterBar';
import { Colors } from '@/src/constants/Colors';
import { useClothingStore } from '@/src/store/useClothingStore';
import { ClothingItem } from '@/src/types/ClothingItem';
import { generateDemoItems } from '@/src/utils/generateDemoItems';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ClosetScreen() {
  const router = useRouter();
  const { items, isLoading, loadItems, addItem } = useClothingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingDemoItems, setAddingDemoItems] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [items, selectedCategory, searchQuery]);

  const handleItemPress = (item: ClothingItem) => {
    router.push({
      pathname: '/item-detail',
      params: { id: item.id },
    });
  };

  const handleAddDemoItems = async () => {
    Alert.alert(
      'Add Demo Items',
      'This will add 50 temporary demo items to showcase the app. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add Items',
          onPress: async () => {
            try {
              setAddingDemoItems(true);
              const demoItems = generateDemoItems();
              
              // Add items one by one to the store
              for (const item of demoItems) {
                await addItem(item);
              }
              
              // Reload items to refresh the list
              await loadItems();
              
              Alert.alert('Success', '50 demo items have been added to your closet!');
            } catch (error) {
              console.error('Error adding demo items:', error);
              Alert.alert('Error', 'Failed to add demo items. Please try again.');
            } finally {
              setAddingDemoItems(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Closet</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.demoButton, addingDemoItems && styles.demoButtonDisabled]}
            onPress={handleAddDemoItems}
            disabled={addingDemoItems}
          >
            {addingDemoItems ? (
              <ActivityIndicator size="small" color={Colors.cardBackground} />
            ) : (
              <Text style={styles.demoButtonText}>Demo</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-item')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor={Colors.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FilterBar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ClothingItemCard item={item} onPress={() => handleItemPress(item)} />
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadItems} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedCategory
                ? 'No items found'
                : 'Your closet is empty'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory
                ? 'Try adjusting your search or filters'
                : 'Add your first item to get started!'}
            </Text>
            {!searchQuery && !selectedCategory && (
              <TouchableOpacity
                style={styles.demoButtonLarge}
                onPress={handleAddDemoItems}
                disabled={addingDemoItems}
              >
                {addingDemoItems ? (
                  <ActivityIndicator size="small" color={Colors.cardBackground} />
                ) : (
                  <Text style={styles.demoButtonText}>Add 50 Demo Items</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.cardBackground,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.cardBackground,
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  demoButtonDisabled: {
    opacity: 0.6,
  },
  demoButtonText: {
    color: Colors.cardBackground,
    fontSize: 16,
    fontWeight: '600',
  },
  demoButtonLarge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
  },
  searchInput: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.text,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  cardWrapper: {
    width: '48%',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 20,
  },
});
