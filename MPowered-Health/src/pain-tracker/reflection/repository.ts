/** Loads and saves reflection notes separately for each week. */
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeeklyReflection = { week: string; notes: string; savedAt: string };

/**
 * Builds the key used to group a reflection by week.
 *
 * Use the local Monday date as the storage key for a week. Avoid UTC conversion, which can shift the calendar date; local dates also handle daylight-saving changes.
 */
export function reflectionWeek(date = new Date()) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

/**
 * Loads the reflection saved for a particular week.
 *
 * No record means a new reflection. Invalid data or a storage failure is surfaced to the screen so it cannot silently replace an unreadable reflection with blank notes.
 */
export async function getReflection(week = reflectionWeek()): Promise<WeeklyReflection | null> {
  const stored = await AsyncStorage.getItem(`mpowered:reflection:${week}`);
  if (!stored) return null;
  const reflection = JSON.parse(stored) as WeeklyReflection;
  if (reflection.week !== week || typeof reflection.notes !== 'string') {
    throw new Error('Invalid saved reflection');
  }
  return reflection;
}

/**
 * Saves the reflection for a particular week.
 *
 * One record per week: editing replaces that week’s notes and preserves other weeks. Await the write so callers can distinguish a completed save from a failed attempt.
 *
 * @param notes - Reflection text; blank notes are rejected.
 * @param week - Local Monday date used as the storage key.
 * @returns The saved reflection after the storage write succeeds.
 * @throws If notes are blank or saving fails.
 */
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
