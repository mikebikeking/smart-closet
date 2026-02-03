// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure resolver to exclude problematic packages on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, prevent expo-location and expo-sqlite from being bundled
  if (platform === 'web') {
    if (moduleName === 'expo-location') {
      // Return empty module for web
      return {
        type: 'empty',
      };
    }
    if (moduleName === 'expo-sqlite') {
      // Return empty module for web
      return {
        type: 'empty',
      };
    }
  }
  
  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
