import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { SignInScreen } from '@/components/sign-in-screen';
import { ThemedView } from '@/components/themed-view';
import { AuthProvider, useAuth } from '@/context/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {loading ? (
        <ThemedView style={styles.loading}>
          <ActivityIndicator />
        </ThemedView>
      ) : session ? (
        <>
          <AnimatedSplashOverlay />
          <AppTabs />
        </>
      ) : (
        <SignInScreen />
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});