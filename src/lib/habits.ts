import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';

export type Habit = {
  id: string;
  user_id: string;
  title: string;
  completed_at: string | null;
  created_at: string;
};

const cacheKey = (userId: string) => `habits:${userId}`;

export async function loadCachedHabits(userId: string): Promise<Habit[] | null> {
  const raw = await AsyncStorage.getItem(cacheKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Habit[];
  } catch {
    return null;
  }
}

export async function saveCachedHabits(userId: string, habits: Habit[]) {
  await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(habits));
}

export async function clearCachedHabits(userId: string) {
  await AsyncStorage.removeItem(cacheKey(userId));
}

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase;
}

export async function fetchHabits(userId: string): Promise<Habit[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('habits')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const habits = (data ?? []) as Habit[];
  await saveCachedHabits(userId, habits);
  return habits;
}

export async function createHabit(userId: string, title: string): Promise<Habit> {
  const client = requireClient();
  const { data, error } = await client
    .from('habits')
    .insert({ user_id: userId, title })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Habit;
}

export async function toggleHabit(habit: Habit): Promise<Habit> {
  const client = requireClient();
  const { data, error } = await client
    .from('habits')
    .update({ completed_at: habit.completed_at ? null : new Date().toISOString() })
    .eq('id', habit.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Habit;
}

export async function deleteHabit(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('habits').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}