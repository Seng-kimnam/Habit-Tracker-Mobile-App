import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

type Mode = 'signin' | 'signup';

export function SignInScreen() {
  const { signIn, signUp, configured } = useAuth();
  const theme = useTheme();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        const needsConfirmation = await signUp(email.trim(), password);
        if (needsConfirmation) {
          setNotice('Check your inbox for a confirmation email, then sign in.');
          setMode('signin');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (!configured) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle">Configuration required</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.configText}>
            Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment
            (app/.env.local for local, Vercel dashboard for the live site), then rebuild.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const switchMode: Mode = mode === 'signin' ? 'signup' : 'signin';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">{mode === 'signin' ? 'Sign in' : 'Create account'}</ThemedText>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            editable={!submitting}
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoComplete={mode === 'signin' ? 'password' : 'new-password'}
            secureTextEntry
            editable={!submitting}
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />

          {error ? (
            <ThemedText themeColor="textSecondary" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}
          {notice ? (
            <ThemedText themeColor="textSecondary" style={styles.notice}>
              {notice}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}>
            <ThemedText type="smallBold" style={styles.submitLabel}>
              {submitting
                ? 'Please wait...'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              setMode(switchMode);
              setError(null);
              setNotice(null);
            }}
            disabled={submitting}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.switchText}>
              {mode === 'signin' ? 'No account yet? Create one' : 'Already have an account? Sign in'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  card: {
    gap: Spacing.three,
  },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  error: {
    color: '#d9534f',
  },
  notice: {
    color: '#3c87f7',
  },
  submitButton: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  submitLabel: {
    color: '#ffffff',
  },
  switchText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  configText: {
    textAlign: 'center',
  },
});