import { ClothingItemCard } from '@/src/components/ClothingItemCard';
import { WeatherCard } from '@/src/components/WeatherCard';
import { Colors } from '@/src/constants/Colors';
import { suggestOutfitFromClothingItems } from '@/src/services/aiStylist';
import { suggestOutfits } from '@/src/services/analytics';
import { getCurrentWeather } from '@/src/services/weather';
import { useClothingStore } from '@/src/store/useClothingStore';
import { WeatherData } from '@/src/types/ClothingItem';
import { OutfitRecommendation } from '@/src/types/closet';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Platform, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function TodayScreen() {
  const router = useRouter();
  const { items, wearLogs, loadItems, loadWearLogs } = useClothingStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [aiOutfit, setAiOutfit] = useState<OutfitRecommendation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
    loadWearLogs();
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      let latitude: number;
      let longitude: number;
      let locationName: string = 'Current Location';

      // Platform-specific location handling
      if (Platform.OS === 'web') {
        // Use browser geolocation API directly on web
        if (typeof window === 'undefined' || !('geolocation' in navigator)) {
          throw new Error('Geolocation is not available in this browser');
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { timeout: 10000 }
          );
        });

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        locationName = 'Current Location';
      } else {
        // Use expo-location on native (dynamic import to prevent web bundling)
        const Location = await import('expo-location');
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission denied');
        }

        const locationData = await Location.getCurrentPositionAsync({});
        latitude = locationData.coords.latitude;
        longitude = locationData.coords.longitude;

        // Get location name (simplified)
        const [name] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (name) {
          locationName = `${name.city || ''}, ${name.region || ''}`.trim() || 'Current Location';
        }
      }

      // Fetch weather data
      const weatherData = await getCurrentWeather(latitude, longitude);
      setWeather(weatherData);
      setLocation(locationName);
    } catch (error: any) {
      console.error('Error fetching weather:', error);
      setErrorMessage(error.message || 'Unable to load weather data');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (weather && items.length > 0) {
      const wearLogsByItem: Record<string, any[]> = {};
      wearLogs.forEach(log => {
        if (!wearLogsByItem[log.itemId]) {
          wearLogsByItem[log.itemId] = [];
        }
        wearLogsByItem[log.itemId].push(log);
      });

      // Generate rule-based outfit suggestions
      const suggestions = suggestOutfits(items, weather, wearLogsByItem);
      setOutfits(suggestions);

      // Generate AI-powered outfit suggestion
      if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        setAiLoading(true);
        suggestOutfitFromClothingItems(items, weather, wearLogsByItem)
          .then((recommendation) => {
            setAiOutfit(recommendation);
          })
          .catch((error) => {
            console.error('AI outfit suggestion failed:', error);
            // Don't show error to user, just don't show AI suggestion
          })
          .finally(() => {
            setAiLoading(false);
          });
      }
    }
  }, [weather, items, wearLogs]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : weather ? (
        <>
          <WeatherCard weather={weather} location={location} />

          {/* AI-Powered Outfit Suggestion */}
          {process.env.EXPO_PUBLIC_GEMINI_API_KEY && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>AI Stylist Suggestion</Text>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
              </View>
              {aiLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>AI is styling your outfit...</Text>
                </View>
              ) : aiOutfit ? (
                <View style={styles.aiOutfitCard}>
                  <View style={styles.outfitHeader}>
                    <Text style={styles.outfitTitle}>AI Recommended Outfit</Text>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.outfitItemsContainer}
                  >
                    {aiOutfit.outfit_ids.map((itemId) => {
                      const item = items.find(i => i.id === itemId);
                      if (!item) return null;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.outfitItem}
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
                  </ScrollView>
                  <View style={styles.aiAdviceContainer}>
                    <Text style={styles.aiAdviceTitle}>💡 Styling Advice</Text>
                    <Text style={styles.aiAdviceText}>{aiOutfit.styling_advice}</Text>
                  </View>
                  <View style={styles.aiAdviceContainer}>
                    <Text style={styles.aiAdviceTitle}>🌤️ Weather Rationale</Text>
                    <Text style={styles.aiAdviceText}>{aiOutfit.weather_rationale}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          )}

          {/* Rule-Based Outfit Suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Outfits</Text>
            {outfits.length > 0 ? (
              outfits.map((outfit, index) => (
                <View key={index} style={styles.outfitCard}>
                  <View style={styles.outfitHeader}>
                    <View style={styles.outfitTitleRow}>
                      <Text style={styles.outfitTitle}>
                        Outfit {index + 1}
                      </Text>
                      <Text style={styles.costPerWear}>
                        ${outfit.avgCostPerWear.toFixed(2)}/wear
                      </Text>
                    </View>
                    <Text style={styles.outfitReason}>{outfit.reason}</Text>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.outfitItemsContainer}
                  >
                    {outfit.items.map((item: any) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.outfitItem}
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
                  </ScrollView>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {items.length === 0 
                    ? 'Add items to your closet to get outfit suggestions!'
                    : items.filter(i => i.category === 'tops').length === 0 || items.filter(i => i.category === 'bottoms').length === 0
                    ? 'Add tops and bottoms to get outfit suggestions!'
                    : 'No outfit suggestions available. Try adding more items!'}
                </Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {errorMessage || 'Unable to load weather data'}
          </Text>
          {errorMessage?.includes('API key') && (
            <>
              <Text style={styles.helpText}>
                Your OpenWeatherMap API key appears to be invalid or missing.
              </Text>
              <Text style={styles.helpText}>
                Please check your .env file and ensure EXPO_PUBLIC_WEATHER_API_KEY is set correctly.
              </Text>
              <Text style={styles.helpText}>
                After updating, restart the dev server with: npx expo start --clear
              </Text>
            </>
          )}
          {errorMessage?.includes('Location permission') && (
            <Text style={styles.helpText}>
              Please grant location permissions to view weather data.
            </Text>
          )}
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setErrorMessage(null);
              fetchWeather();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  outfitCard: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  outfitHeader: {
    marginBottom: 12,
  },
  outfitTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  costPerWear: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  outfitReason: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.6,
  },
  outfitItemsContainer: {
    paddingRight: 16,
  },
  outfitItem: {
    marginRight: 12,
    width: 150,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  aiBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    color: Colors.cardBackground,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  aiOutfitCard: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  aiAdviceContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  aiAdviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  aiAdviceText: {
    fontSize: 13,
    color: Colors.text,
    opacity: 0.8,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.text,
    opacity: 0.6,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.cardBackground,
    fontSize: 16,
    fontWeight: '600',
  },
});
