# WearWise - Smart Closet App 👔

A React Native app built with Expo that helps you track your clothing items, calculate cost-per-wear, and get weather-based outfit suggestions.

## Features

- 📸 **Add Clothing Items**: Take photos and add details about your clothing
- 📊 **Track Wear History**: Log when you wear items to calculate cost-per-wear
- 📈 **Analytics Dashboard**: View insights on your most/least worn items
- 🌤️ **Weather Integration**: Get outfit suggestions based on current weather
- 🔍 **Search & Filter**: Easily find items in your closet by category or search term
- 🤖 **AI Image Recognition**: Auto-detect clothing category, colors, and brand (optional)

## Tech Stack

- **Framework**: Expo (React Native) with TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand with AsyncStorage persistence
- **Database**: Expo SQLite for local storage
- **Camera/Image**: Expo Image Picker
- **Image Recognition**: Google Cloud Vision API (optional)
- **Weather**: OpenWeatherMap API
- **Icons**: @expo/vector-icons

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables** (optional)

   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_GOOGLE_VISION_KEY=your_google_vision_api_key_here
   EXPO_PUBLIC_WEATHER_API_KEY=your_openweathermap_api_key_here
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   > Note: The app will work without these API keys, but image recognition and weather features will be disabled.

3. **Start the app**

   ```bash
   npx expo start
   ```

   Or use platform-specific commands:
   - `npm run ios` - iOS Simulator (macOS only)
   - `npm run android` - Android Emulator
   - `npm run web` - Web browser

## Getting API Keys (Optional)

### Google Cloud Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Vision API
4. Create credentials (API Key)
5. Add the key to your `.env` file

### OpenWeatherMap API
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add the key to your `.env` file

## Project Structure

```
/src
  /components      - Reusable UI components
  /screens         - Screen components (in app/ directory)
  /services        - API services and database
  /store           - Zustand state management
  /types           - TypeScript type definitions
  /utils           - Utility functions
  /constants       - App constants (colors, categories)
```

## Features in Detail

### Closet Screen
- View all your clothing items in a grid
- Search by name, brand, or tags
- Filter by category (tops, bottoms, outerwear, shoes, accessories)

### Today Screen
- Current weather display
- Weather-based outfit suggestions
- Location-based weather (requires location permission)

### Insights Screen
- Total items and wear statistics
- Cost-per-wear calculations
- Most worn items
- Items not worn recently (stagnant items)

### Add Item Screen
- Take or select photos
- Auto-detect category/colors with Google Vision (if configured)
- Add purchase price, date, brand, size, tags, etc.

### Item Detail Screen
- View item details and statistics
- Log wears to track usage
- Edit or delete items

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Zustand](https://github.com/pmndrs/zustand)
