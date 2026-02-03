// Web location service - uses browser geolocation API
// This file exists to prevent expo-location from being imported on web

export const requestForegroundPermissionsAsync = async () => {
  return { status: 'granted' };
};

export const getCurrentPositionAsync = async (options?: any): Promise<{ coords: { latitude: number; longitude: number } }> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocation not available'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => reject(error),
      { timeout: 10000 }
    );
  });
};

export const reverseGeocodeAsync = async (options?: { latitude: number; longitude: number }): Promise<Array<{ city?: string; region?: string }>> => {
  // On web, we can't easily reverse geocode without an API
  // Return a simple location name
  return [{ city: 'Current Location', region: '' }];
};
