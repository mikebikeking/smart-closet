import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useClothingStore } from '@/src/store/useClothingStore';
import { StatCard } from '@/src/components/StatCard';
import { ClothingItemCard } from '@/src/components/ClothingItemCard';
import { calculateItemAnalytics, identifyStagnantItems } from '@/src/utils/calculations';
import { Colors } from '@/src/constants/Colors';
import { ClothingItem } from '@/src/types/ClothingItem';

export default function InsightsScreen() {
  const router = useRouter();
  const { items, wearLogs, loadItems, loadWearLogs } = useClothingStore();

  useEffect(() => {
    loadItems();
    loadWearLogs();
  }, []);

  const analytics = useMemo(() => {
    const wearLogsByItem: Record<string, any[]> = {};
    wearLogs.forEach(log => {
      if (!wearLogsByItem[log.itemId]) {
        wearLogsByItem[log.itemId] = [];
      }
      wearLogsByItem[log.itemId].push(log);
    });

    const itemAnalytics = items.map(item =>
      calculateItemAnalytics(item, wearLogsByItem[item.id] || [])
    );

    const totalItems = items.length;
    const totalWears = wearLogs.length;
    const totalSpent = items.reduce((sum, item) => sum + item.purchasePrice, 0);
    const avgCostPerWear = totalWears > 0
      ? totalSpent / totalWears
      : totalSpent;

    const stagnantItems = identifyStagnantItems(items, wearLogsByItem);

    return {
      totalItems,
      totalWears,
      totalSpent,
      avgCostPerWear,
      stagnantItems,
      itemAnalytics,
    };
  }, [items, wearLogs]);

  const topItems = useMemo(() => {
    return analytics.itemAnalytics
      .sort((a, b) => b.timesWorn - a.timesWorn)
      .slice(0, 5)
      .map(a => items.find(item => item.id === a.itemId))
      .filter(Boolean) as ClothingItem[];
  }, [analytics, items]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Items"
          value={analytics.totalItems}
          color={Colors.primary}
        />
        <StatCard
          label="Total Wears"
          value={analytics.totalWears}
          color={Colors.accent}
        />
        <StatCard
          label="Total Spent"
          value={`$${analytics.totalSpent.toFixed(0)}`}
          color={Colors.info}
        />
        <StatCard
          label="Avg Cost/Wear"
          value={`$${analytics.avgCostPerWear.toFixed(2)}`}
          color={Colors.success}
        />
      </View>

      {topItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Worn Items</Text>
          {topItems.map(item => {
            const itemAnalytics = analytics.itemAnalytics.find(
              a => a.itemId === item.id
            );
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: '/item-detail',
                    params: { id: item.id },
                  })
                }
              >
                <ClothingItemCard item={item} onPress={() => {}} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {analytics.stagnantItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Items Not Worn Recently ({analytics.stagnantItems.length})
          </Text>
          <Text style={styles.sectionSubtitle}>
            Consider wearing these items or donating them
          </Text>
          {analytics.stagnantItems.slice(0, 5).map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: '/item-detail',
                  params: { id: item.id },
                })
              }
            >
              <ClothingItemCard item={item} onPress={() => {}} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    marginBottom: 12,
  },
});
