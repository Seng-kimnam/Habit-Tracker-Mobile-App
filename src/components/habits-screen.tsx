import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import {
  clearCachedHabits,
  createHabit,
  deleteHabit,
  fetchHabits,
  loadCachedHabits,
  saveCachedHabits,
  toggleHabit,
  type Habit,
} from '@/lib/habits';

export function HabitsScreen() {
  const { session, signOut } = useAuth();
  const theme = useTheme();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      return;
    }

    let active = true;

    (async () => {
      setError(null);
      const cached = await loadCachedHabits(userId);
      if (active && cached) {
        setHabits(cached);
      }
      try {
        const fresh = await fetchHabits(userId);
        if (active) {
          setHabits(fresh);
          setEmpty(fresh.length === 0);
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Could not load habits');
          setEmpty(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  if (!session?.user.id) {
    return null;
  }

  const activeUserId = session.user.id;

  async function handleAdd() {
    const title = draft.trim();
    if (!title) {
      return;
    }
    setError(null);
    try {
      const habit = await createHabit(activeUserId, title);
      const next = [...habits, habit];
      setHabits(next);
      await saveCachedHabits(activeUserId, next);
      setEmpty(false);
      setDraft('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add habit');
    }
  }

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

  async function handleSignOut() {
    await clearCachedHabits(activeUserId).catch(() => {});
    await signOut().catch(() => {});
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">My Habits</ThemedText>
          <Pressable onPress={handleSignOut} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="backgroundElement" style={styles.signOutButton}>
              <ThemedText type="small">Sign out</ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.addRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a habit..."
            placeholderTextColor={theme.textSecondary}
            onSubmitEditing={handleAdd}
            style={[styles.addInput, { color: theme.text }]}
          />
          <Pressable onPress={handleAdd} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="backgroundSelected" style={styles.addButton}>
              <ThemedText type="smallBold">Add</ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        {error ? (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          contentInset={{ bottom: BottomTabInset + Spacing.three }}>
          {loading && habits.length === 0 ? (
            <ThemedView style={styles.stateRow}>
              <ActivityIndicator />
            </ThemedView>
          ) : habits.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyState}>
              {empty
                ? 'No habits yet. Add one above to get started.'
                : 'Habits are stored on your device until you reconnect.'}
            </ThemedText>
          ) : (
            habits.map((habit) => (
              <ThemedView key={habit.id} type="backgroundElement" style={styles.habitRow}>
                <Pressable
                  onPress={() => handleToggle(habit)}
                  style={({ pressed }) => [
                    styles.habitToggle,
                    pressed && styles.pressed,
                  ]}>
                  <SymbolView
                    tintColor={habit.completed_at ? theme.textSecondary : theme.text}
                    name={{
                      ios: habit.completed_at ? 'checkmark.circle.fill' : 'circle',
                      android: habit.completed_at ? 'check_circle' : 'radio_button_unchecked',
                      web: habit.completed_at ? 'check_circle' : 'radio_button_unchecked',
                    }}
                    size={22}
                  />
                  <ThemedText
                    type="small"
                    style={habit.completed_at ? styles.completedText : undefined}>
                    {habit.title}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(habit.id)}
                  hitSlop={8}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <SymbolView
                    tintColor={theme.textSecondary}
                    name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                    size={18}
                  />
                </Pressable>
              </ThemedView>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  signOutButton: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  addInput: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  error: {
    color: '#d9534f',
    marginTop: Spacing.three,
  },
  list: {
    marginTop: Spacing.three,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  stateRow: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  habitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  pressed: {
    opacity: 0.7,
  },
});