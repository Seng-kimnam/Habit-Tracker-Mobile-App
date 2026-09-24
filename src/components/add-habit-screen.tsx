import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { createHabit } from '@/lib/habits';

export function AddHabitScreen() {
  const { session } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user.id;

  async function handleSave() {
    const name = draft.trim();
    if (!name || !userId || saving) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createHabit(userId, name);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add habit');
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
          <Text className="text-3xl font-semibold text-black dark:text-white">New Habit</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => router.back()}
            hitSlop={8}
            className="active:opacity-70">
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={22}
            />
          </Pressable>
        </View>

        <TextInput
          autoFocus
          value={draft}
          onChangeText={setDraft}
          placeholder="Habit name"
          placeholderTextColor={theme.textSecondary}
          onSubmitEditing={handleSave}
          editable={!saving}
          className="mx-6 mt-5 rounded-2xl bg-surface px-4 py-3 text-base text-black dark:bg-surface-dark dark:text-white"
        />

        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          disabled={saving || !draft.trim()}
          className="mx-6 mt-4 items-center rounded-xl bg-surface-selected py-3 active:opacity-70 disabled:opacity-50 dark:bg-surface-darkSelected">
          <Text className="text-sm font-bold text-black dark:text-white">
            {saving ? 'Adding...' : 'Add Habit'}
          </Text>
        </Pressable>

        {error ? <Text className="mt-4 px-6 text-sm text-[#d9534f]">{error}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
}