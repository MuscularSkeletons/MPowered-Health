/** Loads and edits the current reflection, including save feedback. */
import { getReflection, reflectionWeek, saveReflection } from './repository';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

/** Loads and edits the current reflection, including save feedback. */
export function useReflection(onSaved: () => void) {
  const [week] = useState(reflectionWeek);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    getReflection(week)
      .then((saved) => {
        if (active) setNotes(saved?.notes ?? '');
      })
      .catch(() => {
        if (active)
          setError('Unable to load your saved reflection. Please reopen this screen to retry.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [week]);

  /** Saves the reflection and reports whether the write succeeded. */
  const save = async () => {
    if (!notes.trim() || loading || error || busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      await saveReflection(notes, week);
      onSaved();
    } catch {
      Alert.alert('Reflection not saved', 'Your notes are still here. Please try saving again.');
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return { week, notes, setNotes, loading, saving, error, save };
}
