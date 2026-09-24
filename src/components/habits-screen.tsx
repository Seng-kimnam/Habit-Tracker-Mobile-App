import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import {
  clearCachedHabits,
  deleteHabit,
  fetchHabits,
  loadCachedHabits,
  saveCachedHabits,
  toggleHabit,
  type Habit,
} from '@/lib/habits';
import { shareHabit } from '@/lib/share';

export function HabitsScreen() {
  const { session, signOut } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);

  const userId = session?.user.id;

  const refresh = useCallback(async () => {
    if (!userId || !session) {
      return;
    }
    setError(null);
    const cached = await loadCachedHabits(userId);
    if (cached) {
      setHabits(cached);
    }
    try {
      const fresh = await fetchHabits(userId);
      setHabits(fresh);
      setEmpty(fresh.length === 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load habits');
      setEmpty(false);
    } finally {
      setLoading(false);
    }
  }, [userId, session]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        return;
      }
      void refresh();
    }, [userId, refresh]),
  );

  if (!session?.user.id) {
    return null;
  }

  const activeUserId = session.user.id;

  async function handleToggle(target: Habit) {
    setError(null);
    try {
      const toggled = await toggleHabit(target);
      const next = habits.map((h) => (h.id === toggled.id ? toggled : h));
      setHabits(next);
      await saveCachedHabits(activeUserId, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update habit');
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteHabit(id);
      const next = habits.filter((h) => h.id !== id);
      setHabits(next);
      await saveCachedHabits(activeUserId, next);
      setEmpty(next.length === 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete habit');
    }
  }

  async function handleShare(target: Habit) {
    setError(null);
    try {
      await shareHabit(target.name, Boolean(target.completed_at));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not share habit');
    }
  }

  async function handleSignOut() {
    await clearCachedHabits(activeUserId).catch(() => {});
    await signOut().catch(() => {});
  }

  return (
    <View className="flex-1 flex-row justify-center bg-white dark:bg-black">
      <View className="max-w-[800px] flex-1">
        <View
          className="flex-row items-center justify-between px-6 pb-4"
          style={{ paddingTop: insets.top + 24 }}>
          <Text className="text-3xl font-semibold text-black dark:text-white">My Habits</Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/add')}
              className="rounded-2xl bg-surface px-3 py-1 active:opacity-70 dark:bg-surface-dark">
              <Text className="text-sm font-bold text-black dark:text-white">New</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleSignOut}
              className="rounded-2xl bg-surface px-3 py-1 active:opacity-70 dark:bg-surface-dark">
              <Text className="text-sm text-muted dark:text-muted-dark">Sign out</Text>
            </Pressable>
          </View>
        </View>

        {error ? <Text className="mt-4 px-6 text-sm text-[#d9534f]">{error}</Text> : null}

        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          className="mt-5"
          contentContainerClassName="gap-2 px-6 pb-24"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between gap-2 rounded-2xl bg-surface px-3 py-3 dark:bg-surface-dark">
              <Pressable
                accessibilityRole="button"
                onPress={() => handleToggle(item)}
                className="flex-1 flex-row items-center gap-2">
                <SymbolView
                  tintColor={item.completed_at ? theme.textSecondary : theme.text}
                  name={{
                    ios: item.completed_at ? 'checkmark.circle.fill' : 'circle',
                    android: item.completed_at ? 'check_circle' : 'radio_button_unchecked',
                    web: item.completed_at ? 'check_circle' : 'radio_button_unchecked',
                  }}
                  size={22}
                />
                <Text
                  className={
                    item.completed_at
                      ? 'flex-1 text-sm text-black line-through dark:text-white'
                      : 'flex-1 text-sm text-black dark:text-white'
                  }>
                  {item.name}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Share ${item.name}`}
                onPress={() => handleShare(item)}
                hitSlop={8}
                className="active:opacity-70">
                <SymbolView
                  tintColor={theme.textSecondary}
                  name={{
                    ios: 'square.and.arrow.up',
                    android: 'share',
                    web: 'share',
                  }}
                  size={18}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => handleDelete(item.id)}
                hitSlop={8}
                className="active:opacity-70">
                <SymbolView
                  tintColor={theme.textSecondary}
                  name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                  size={18}
                />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            loading && habits.length === 0 ? (
              <View className="items-center py-10">
                <ActivityIndicator />
              </View>
            ) : (
              <Text className="py-10 text-center text-sm text-muted dark:text-muted-dark">
                {empty
                  ? 'No habits yet. Tap New to get started.'
                  : 'Habits are stored on your device until you reconnect.'}
              </Text>
            )
          }
        />
      </View>
    </View>
  );
}