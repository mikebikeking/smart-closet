import { Redirect } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function Index() {
  // Direct redirect - simplest approach
  return <Redirect href="/(tabs)/today" />;
}
