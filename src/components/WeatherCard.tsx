import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { WeatherData } from '@/src/types/ClothingItem';
import { Colors } from '@/src/constants/Colors';

interface WeatherCardProps {
  weather: WeatherData;
  location?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, location }) => {
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <View style={styles.card}>
      {location && (
        <Text style={styles.location}>{location}</Text>
      )}
      <View style={styles.mainInfo}>
        <View style={styles.tempContainer}>
          <Text style={styles.temp}>{Math.round(weather.temp)}°</Text>
          <Text style={styles.feelsLike}>
            Feels like {Math.round(weather.feelsLike)}°
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <Image source={{ uri: iconUrl }} style={styles.icon} />
          <Text style={styles.description}>
            {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Humidity</Text>
          <Text style={styles.detailValue}>{weather.humidity}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Wind</Text>
          <Text style={styles.detailValue}>{weather.windSpeed} mph</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  location: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    marginBottom: 12,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tempContainer: {
    flex: 1,
  },
  temp: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text,
  },
  feelsLike: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
