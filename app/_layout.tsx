import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {Platform.OS === 'web' ? (
        <View style={styles.gradientContainer}>
          <View style={styles.blurEffect}>
            {/* Use a simple gray background */}
            <View style={styles.grayBackground} />
          </View>
          <View style={styles.webContainer}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="manageJobs" options={{ headerShown: false }} />
              <Stack.Screen name="CustomerQuery" options={{ headerShown: false }} />
              <Stack.Screen name="activeJobs" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </View>
        </View>
      ) : (
        <View style={styles.defaultContainer}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="manageJobs" options={{ headerShown: false }} />
            <Stack.Screen name="CustomerQuery" options={{ headerShown: false }} />
            <Stack.Screen name="activeJobs" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </View>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1, // Full height for the container
    justifyContent: 'center', // Center content vertically
  },
  blurEffect: {
    position: 'absolute', // Positioning the gray background absolutely
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center', // Center gradient vertically
    backdropFilter: 'blur(10px)', // Apply blur effect
    WebkitBackdropFilter: 'blur(10px)', // Blur for webkit-based browsers
  },
  grayBackground: {
    flex: 1, // Full height for the gray background
    backgroundColor: 'rgba(211, 211, 211, 0.7)', // Slightly transparent white for better visibility

    // backgroundColor: '#d3d3d3', // Gray color
    
  },
  webContainer: {
    width: '80%', // 80% width of the content
    marginHorizontal: '10%', // Center the content horizontally
    flex: 1, // Make sure it takes full height
    justifyContent: 'center', // Center content vertically
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0, // Horizontal offset
      height:0, // Vertical offset
    },
    shadowOpacity: 0.5, // Shadow opacity
    shadowRadius: 15, // Shadow blur radius
    // elevation: 10, // Elevation for Android
  },
  defaultContainer: {
    flex: 1, // Full width for mobile
  },
});
