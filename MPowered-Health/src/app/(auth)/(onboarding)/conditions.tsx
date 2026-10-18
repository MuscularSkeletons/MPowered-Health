import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import { painConditionsOptions } from '@/constants/profile/profile-options';
import {
  Intro,
  Screen,
  ChoiceButton,
  PrimaryButton,
  commonStyles,
} from '@/components/ui/common';

/** Stores the selected pain conditions locally. */
export default function StorePainConditions() {
  const [painConditions, setPainConditions] = useState<string[]>([]);
  const router = useRouter();
  const { user, updateUserDraft } = useAuth();

  const toggleCondition = (condition: string) => {
    setPainConditions((selected) =>
      selected.includes(condition)
        ? selected.filter((item) => item !== condition)
        : [...selected, condition],
    );
  };
  const handleComplete = () => {
    if (!user) throw new Error('User not authenticated');
    if (painConditions.length) updateUserDraft({ painConditions });
    router.push('/(auth)/(onboarding)/miscconditions');
  };

  return (
    <Screen compact>
      <Text onPress={() => router.back()} style={commonStyles.back}>‹ Back</Text>
      <Intro
        sectionLabel="YOUR PROFILE"
        progress="5 of 6"
        title="Tell us about the pain you’re experiencing"
        description="Select any musculoskeletal or chronic pain conditions that apply."
      />
      <View style={commonStyles.choices}>
        {painConditionsOptions.map((condition) => (
          <ChoiceButton
            key={condition}
            label={condition}
            multiple
            selected={painConditions.includes(condition)}
            onPress={() => toggleCondition(condition)}
          />
        ))}
      </View>
      <View style={commonStyles.actions}>
        <PrimaryButton label="Continue" disabled={!painConditions.length} onPress={handleComplete} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(auth)/(onboarding)/miscconditions')}
          style={commonStyles.secondaryAction}
        >
          <Text style={commonStyles.secondaryText}>Skip</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
