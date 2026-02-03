import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useClothingStore } from '@/src/store/useClothingStore';
import { StatCard } from '@/src/components/StatCard';
import { WearButton } from '@/src/components/WearButton';
import { calculateItemAnalytics } from '@/src/utils/calculations';
import { formatDate } from '@/src/utils/dateHelpers';
import { Colors } from '@/src/constants/Colors';
import { ClothingItem } from '@/src/types/ClothingItem';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, wearLogs, loadItems, loadWearLogs, logWear, deleteItem } =
    useClothingStore();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<ClothingItem | null>(null);

  useEffect(() => {
    loadItems();
    loadWearLogs();
  }, []);

  useEffect(() => {
    if (id) {
      const foundItem = items.find((i) => i.id === id);
      setItem(foundItem || null);
    }
  }, [id, items]);

  const analytics = useMemo(() => {
    if (!item) return null;
    const itemWearLogs = wearLogs.filter((log) => log.itemId === item.id);
    return calculateItemAnalytics(item, itemWearLogs);
  }, [item, wearLogs]);

  const handleLogWear = async () => {
    if (!item) return;
    try {
      setLoading(true);
      await logWear(item.id);
      await loadWearLogs();
      Alert.alert('Success', 'Wear logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to log wear');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!item) return;
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Image source={{ uri: item.photoUri }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
        <Text style={styles.category}>{item.category}</Text>
      </View>

      {analytics && (
        <View style={styles.statsContainer}>
          <StatCard
            label="Times Worn"
            value={analytics.timesWorn}
            color={Colors.primary}
          />
          <StatCard
            label="Cost per Wear"
            value={`$${analytics.costPerWear.toFixed(2)}`}
            color={Colors.accent}
          />
          <StatCard
            label="Days Since Last Wear"
            value={analytics.daysSinceLastWear === -1 ? 'Never' : analytics.daysSinceLastWear}
            unit={analytics.daysSinceLastWear === -1 ? '' : 'days'}
            color={Colors.info}
          />
          <StatCard
            label="Days Owned"
            value={analytics.daysOwned}
            unit="days"
            color={Colors.success}
          />
        </View>
      )}

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Purchase Price:</Text>
          <Text style={styles.detailValue}>${item.purchasePrice.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Purchase Date:</Text>
          <Text style={styles.detailValue}>{formatDate(item.purchaseDate)}</Text>
        </View>
        {item.size && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size:</Text>
            <Text style={styles.detailValue}>{item.size}</Text>
          </View>
        )}
        {item.material && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Material:</Text>
            <Text style={styles.detailValue}>{item.material}</Text>
          </View>
        )}
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.detailLabel}>Tags:</Text>
            <View style={styles.tags}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <WearButton onPress={handleLogWear} loading={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
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
  backButton: {
    fontSize: 16,
    color: Colors.text,
  },
  deleteButton: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  info: {
    padding: 16,
    backgroundColor: Colors.cardBackground,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  brand: {
    fontSize: 18,
    color: Colors.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  details: {
    padding: 16,
    backgroundColor: Colors.cardBackground,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  tagsContainer: {
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: Colors.cardBackground,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
});
