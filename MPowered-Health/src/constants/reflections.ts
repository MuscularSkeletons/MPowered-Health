import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeeklyReflection = { week: string; notes: string; savedAt: string };

// Local calendar dates keep the week consistent across daylight-saving changes.
export function reflectionWeek(date = new Date()) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

export async function getReflection(week = reflectionWeek()): Promise<WeeklyReflection | null> {
  const stored = await AsyncStorage.getItem(`mpowered:reflection:${week}`);
  if (!stored) return null;
  const reflection = JSON.parse(stored) as WeeklyReflection;
  if (reflection.week !== week || typeof reflection.notes !== 'string') {
    throw new Error('Invalid saved reflection');
  }
  return reflection;
}

export async function saveReflection(notes: string, week = reflectionWeek()) {
  if (!notes.trim()) throw new Error('Please write a reflection before saving.');
  const reflection: WeeklyReflection = {
    week,
    notes: notes.trim(),
    savedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(`mpowered:reflection:${week}`, JSON.stringify(reflection));
  return reflection;
}
