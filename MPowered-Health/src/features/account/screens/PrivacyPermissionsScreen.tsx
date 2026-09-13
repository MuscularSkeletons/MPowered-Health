import { s } from '../styles/PrivacyPermissionsScreen';
// This screen explains privacy choices and lets the user open related settings.
import { MhaHeader } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Keep the official privacy source in one place so every link opens the same page.
const oaicUrl = 'https://www.oaic.gov.au/privacy/australian-privacy-principles';

// Reuse one heading and spacing pattern for each policy topic.
function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionBody}>{children}</Text>
    </View>
  );
}

// Show a permission's purpose and whether the user has enabled it.
function PermissionRow({
  icon,
  title,
  status,
  description,
}: {
  icon: string;
  title: string;
  status: string;
  description: string;
}) {
  return (
    <View style={s.permissionRow}>
      <View style={s.permissionIcon}>
        <Text style={s.permissionIconText}>{icon}</Text>
      </View>
      <View style={s.permissionCopy}>
        <Text style={s.permissionTitle}>{title}</Text>
        <Text style={s.permissionDescription}>{description}</Text>
      </View>
      <Text style={s.permissionStatus}>{status}</Text>
    </View>
  );
}

// Explain privacy choices and link to the relevant device or public settings.
export default function PrivacyPermissions() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/settings')}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <Text style={s.eyebrow}>YOUR RIGHTS</Text>
        <Text style={s.title}>Privacy &amp; permissions</Text>
        <Text style={s.intro}>
          We want you to understand what information MPowered Health uses, why we use it, and the
          choices you have.
        </Text>

        <View style={s.notice}>
          <Text style={s.noticeIcon}>✓</Text>
          <View style={s.noticeCopy}>
            <Text style={s.noticeTitle}>Your data stays on this device</Text>
            <Text style={s.noticeText}>
              This prototype stores your profile and health information locally. It does not send
              your information to a server or share it with another organisation.
            </Text>
          </View>
        </View>

        <Text style={s.label}>APP PERMISSIONS</Text>
        <View style={s.card}>
          <PermissionRow
            icon="●"
            title="Microphone"
            status="Ask first"
            description="Used only when you choose to record a voice answer."
          />
          <View style={s.divider} />
          <PermissionRow
            icon="⌖"
            title="Camera & location"
            status="Not used"
            description="MPowered Health does not request access to your camera or location."
          />
          <View style={s.divider} />
          <PermissionRow
            icon="▣"
            title="Device storage"
            status="On device"
            description="Used for your saved profile, reflections, and health records."
          />
        </View>

        <Text style={s.label}>AUSTRALIAN PRIVACY POLICY</Text>
        <View style={s.policyCard}>
          <Text style={s.lastUpdated}>Last updated: 3 September 2026</Text>
          <PolicySection title="Who we are">
            MPowered Health is the provider of this app. For privacy questions, contact the support
            contact provided by your healthcare service or organisation.
          </PolicySection>
          <PolicySection title="What we collect">
            We collect information you enter directly, including your email address, name, sex, year
            of birth, musculoskeletal or chronic pain information, reflections, prescriptions,
            appointments, and voice recordings that you choose to make. Health information is
            sensitive information under Australian privacy law.
          </PolicySection>
          <PolicySection title="Why we collect it">
            We use this information to set up your profile, help you track pain and its impacts,
            prepare appointment questions, save reflections, and show you the features you request.
            We do not use your information for advertising in this prototype.
          </PolicySection>
          <PolicySection title="How we hold and disclose it">
            This prototype holds the information in the app’s local storage on your device. It does
            not disclose it to overseas recipients or other organisations. If the product later adds
            cloud services, this policy must be updated before that change.
          </PolicySection>
          <PolicySection title="Access, correction and deletion">
            You can review and correct your onboarding answers through Edit profile. You can delete
            local account data from Settings → Delete account. If you need help accessing or
            correcting information, use the support contact provided by your healthcare service or
            organisation.
          </PolicySection>
          <PolicySection title="Security and retention">
            We take reasonable steps to protect information from misuse, interference, loss, and
            unauthorised access. Information remains on your device until you delete it or remove
            the app. Delete account removes the MPowered Health data stored by this app.
          </PolicySection>
          <PolicySection title="Complaints">
            Please contact the support contact provided by your healthcare service or organisation
            first so the issue can be investigated. If you are not satisfied with the response, you
            can contact the Office of the Australian Information Commissioner (OAIC).
          </PolicySection>
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(oaicUrl)}>
            <Text style={s.link}>Read the Australian Privacy Principles on oaic.gov.au ↗</Text>
          </Pressable>
        </View>
        <Text style={s.footerNote}>
          This in-app summary is written for the current prototype’s local-only data handling. It
          should be reviewed against the operating organisation’s complete APP Privacy Policy before
          public release.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Group policy and permission styles below the readable content structure.
