import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export async function requestAndGetLocation() {
  // 1) request permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    // user denied
    return { error: 'permission-denied' };
  }

  // 2) get position (adjust accuracy if you want)
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High, // High accuracy for exact location
    maximumAge: 10000,
    timeout: 10000,
  });

  const { coords } = position; // position is an object have properties => { latitude, longitude, altitude, accuracy, heading, speed }
  return { coords };
}

export async function reverseGeocode(coords) {
    // Location.reverseGeocodeAsync() → Expo ka built-in function hai jo given latitude/longitude ko address details ma badal deta hai.
    try {
    const [address] = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    // address may contain: name, street, city, region, postalCode, country
    return address || null;
  } catch (e) {
    return null;
  }
}

export function openAppSettings() {
  if (Platform.OS === 'ios') Linking.openURL('app-settings:');
  else Linking.openSettings();
}
