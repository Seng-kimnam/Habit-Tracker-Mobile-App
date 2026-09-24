import { Platform, Share } from 'react-native';

const shareText = Platform.select({
  web: async (title: string, text: string) => {
    if (typeof navigator === 'undefined' || !navigator.share) {
      throw new Error('Sharing is not supported in this browser');
    }
    await navigator.share({ title, text });
  },
  default: async (title: string, message: string) => {
    await Share.share({ title, message });
  },
})!;

export async function shareHabit(name: string, completed: boolean): Promise<void> {
  const message = completed
    ? `I completed "${name}" today with Habit Tracker!`
    : `I'm building the habit "${name}" with Habit Tracker.`;
  await shareText('Habit Tracker', message);
}