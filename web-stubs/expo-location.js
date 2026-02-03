
// Web stub for expo-location - prevents import.meta error
export const requestForegroundPermissionsAsync = async () => ({ status: 'granted' });
export const getCurrentPositionAsync = async () => ({ coords: { latitude: 0, longitude: 0 } });
export const reverseGeocodeAsync = async () => [{ city: '', region: '' }];
export default {};
