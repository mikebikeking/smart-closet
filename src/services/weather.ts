import axios from 'axios';
import { WeatherData } from '@/src/types/ClothingItem';

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

let cachedWeather: { data: WeatherData; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const getCurrentWeather = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  // Check cache
  if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_DURATION) {
    return cachedWeather.data;
  }

  if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_key_here' || WEATHER_API_KEY.trim() === '') {
    throw new Error('Weather API key not configured. Please add EXPO_PUBLIC_WEATHER_API_KEY to your .env file.');
  }

  try {
    const url = `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`;
    const response = await axios.get(url);

    const weatherData: WeatherData = {
      temp: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind?.speed || 0,
    };

    // Cache the result
    cachedWeather = {
      data: weatherData,
      timestamp: Date.now(),
    };

    return weatherData;
  } catch (error: any) {
    console.error('Weather API error:', error);
    
    // Provide more specific error messages
    if (error.response) {
      // API returned an error response
      if (error.response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
      } else if (error.response.status === 404) {
        throw new Error('Location not found. Please try again.');
      } else {
        throw new Error(`Weather API error: ${error.response.data?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to weather service. Please check your internet connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'Failed to fetch weather data');
    }
  }
};
