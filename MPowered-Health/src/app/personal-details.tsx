import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton, MhaHeader, PageIntro, palette } from '@/components/mha-ui';
import { emptyProfile, getProfile, Profile, profileErrors, saveProfile } from '@/constants/account';
import { diagnosisOptions, painConditions, sexOptions } from '@/constants/profile-options';

export default function PersonalDetails() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setLoadError('');
      getProfile()
        .then((saved) => {
          if (active) setProfile(saved ?? emptyProfile);
        })
        .catch(() => {
          if (active)
            setLoadError('Unable to load your answers. Go back and reopen this screen to retry.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );
  const errors = profileErrors(profile);
  const disabled = loading || saving || !!loadError;
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((previous) => ({ ...previous, [key]: value }));
    setSaveError('');
  };
  const save = async () => {
    if (disabled || Object.keys(errors).length) return;
    setSaving(true);
    try {
      await saveProfile(profile);
      router.replace('/settings');
    } catch {
      setSaveError('Your changes could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  const input = (
    key: 'email' | 'name' | 'birthYear' | 'otherConditions',
    label: string,
    optional = false,
  ) => (
    <View style={s.field}>
      <Text style={s.label}>
        {label}
        {optional ? ' (optional)' : ''}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholder={label}
        value={profile[key]}
        editable={!disabled}
        onChangeText={(value) => update(key, value)}
        style={s.input}
        autoCapitalize={key === 'email' ? 'none' : 'sentences'}
        autoCorrect={key !== 'email'}
        autoComplete={key === 'email' ? 'email' : 'off'}
        keyboardType={
          key === 'email' ? 'email-address' : key === 'birthYear' ? 'number-pad' : 'default'
        }
        inputMode={key === 'email' ? 'email' : key === 'birthYear' ? 'numeric' : 'text'}
        maxLength={key === 'email' ? 254 : key === 'birthYear' ? 4 : undefined}
      />
      {errors[key] ? <Text style={s.error}>{errors[key]}</Text> : null}
    </View>
  );
  const choices = (key: 'sex' | 'diagnosis' | 'conditions', label: string, options: string[]) => (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {key === 'conditions' ? (
        <Text style={s.help}>
          Optional. Select any that apply, or deselect all to leave unanswered.
        </Text>
      ) : null}
      {options.map((option) => {
        const selected =
          key === 'conditions' ? profile.conditions.includes(option) : profile[key] === option;
        return (
          <Pressable
            key={option}
            disabled={disabled}
            accessibilityRole={key === 'conditions' ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: selected, disabled }}
            style={[s.choice, selected && s.selected]}
            onPress={() =>
              key === 'conditions'
                ? update(
                    key,
                    selected
                      ? profile.conditions.filter((item) => item !== option)
                      : [...profile.conditions, option],
                  )
                : update(key, option)
            }
          >
            <Text style={s.choiceText}>{option}</Text>
            <Text style={s.check}>{selected ? '✓' : '○'}</Text>
          </Pressable>
        );
      })}
      {errors[key] ? <Text style={s.error}>{errors[key]}</Text> : null}
    </View>
  );
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content}>
        <Pressable
          disabled={saving}
          accessibilityRole="button"
          onPress={() => router.replace('/settings')}
        >
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <PageIntro
          title="Your onboarding answers"
          description="Update the information you shared when you joined. Leave optional answers blank if you prefer."
        />
        {loading ? (
          <Text style={s.help}>Loading your answers…</Text>
        ) : loadError ? (
          <Text style={s.error}>{loadError}</Text>
        ) : (
          <>
            {input('email', 'Your email address')}
            {input('name', 'Your name')}
            {choices('sex', 'Your sex', sexOptions)}
            {input('birthYear', 'Year of birth', true)}
            {choices(
              'diagnosis',
              'Do you have a musculoskeletal or chronic pain diagnosis from your doctor?',
              diagnosisOptions,
            )}
            {choices('conditions', 'Musculoskeletal or chronic pain conditions', painConditions)}
            {input('otherConditions', 'Other conditions', true)}
            <View style={s.footer}>
              <ActionButton
                label={saving ? 'Saving…' : 'Save changes'}
                disabled={disabled || !!Object.keys(errors).length}
                onPress={save}
              />
            </View>
            {saveError ? (
              <Text accessibilityLiveRegion="polite" style={s.error}>
                {saveError}
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 24, paddingBottom: 112 },
  back: { color: palette.primary, fontWeight: '700', paddingVertical: 14 },
  field: { marginTop: 22 },
  label: { fontSize: 14, fontWeight: '700', color: palette.text, marginBottom: 8 },
  input: {
    minHeight: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fff',
    padding: 15,
    fontSize: 15,
    color: palette.text,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 17,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  selected: { backgroundColor: '#F3EEFF', borderColor: '#BEA1F7' },
  choiceText: { flex: 1, color: palette.text, fontSize: 14 },
  check: { color: palette.primary, marginLeft: 12 },
  error: { color: palette.error, fontSize: 12, marginTop: 8 },
  help: { color: palette.muted, fontSize: 13, marginTop: 8, lineHeight: 20 },
  footer: { marginTop: 28 },
});
