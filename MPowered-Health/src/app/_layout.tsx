import { Tabs, router, usePathname, useGlobalSearchParams } from 'expo-router';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { getAccountSnapshot, initializeAccount, subscribeAccount } from '@/constants/account';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavGlyph, NavIconName } from '@/components/nav-icon';

function NavIcon({ focused, color, name }: { focused: boolean; color: string; name: NavIconName }) {
  return (
    <View style={[s.iconPill, focused && s.iconPillActive]}>
      <NavGlyph name={name} color={color} filled={focused} />
    </View>
  );
}

export default function TabLayout() {
  const account = useSyncExternalStore(subscribeAccount, getAccountSnapshot, getAccountSnapshot);
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ flow?: string }>();
  const [startupError, setStartupError] = useState(false);
  const start = () => {
    setStartupError(false);
    initializeAccount().catch(() => setStartupError(true));
  };
  useEffect(() => {
    initializeAccount().catch(() => setStartupError(true));
  }, []);
  useEffect(() => {
    // Deleted accounts cannot reopen old patient screens through tab/browser history.
    const publicScreen =
      ['/', '/splash', '/onboarding-loading'].includes(pathname) ||
      (pathname === '/workflow' && (params.flow ?? 'onboarding') === 'onboarding');
    if (account.ready && account.deleted && !publicScreen) router.replace('/splash');
  }, [account.ready, account.deleted, pathname, params.flow]);
  if (!account.ready)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>{startupError ? 'Unable to load account data.' : 'Loading…'}</Text>
        {startupError ? (
          <Pressable accessibilityRole="button" onPress={start}>
            <Text>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    );
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        key={account.revision}
        initialRouteName="index"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#5E17EB',
          tabBarInactiveTintColor: '#6B5C7A',
          // Workflow is shared by onboarding and in-app forms. Only onboarding/sign-in
          // hide the tabs; a missing flow parameter also means onboarding.
          tabBarStyle:
            route.name === 'workflow' &&
            ['onboarding', 'login'].includes(
              (route.params as { flow?: string } | undefined)?.flow ?? 'onboarding',
            )
              ? { display: 'none' }
              : s.tabBar,
          tabBarItemStyle: s.tabItem,
          tabBarLabelStyle: s.tabLabel,
          tabBarHideOnKeyboard: true,
        })}
      >
        <Tabs.Screen name="index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Pain Tracker',
            tabBarIcon: ({ focused, color }) => (
              <NavIcon focused={focused} color={color} name="accessibility" />
            ),
          }}
        />
        <Tabs.Screen name="pain" options={{ href: null }} />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'My Health',
            tabBarIcon: ({ focused, color }) => (
              <NavIcon focused={focused} color={color} name="folder" />
            ),
          }}
        />
        <Tabs.Screen
          name="care"
          options={{
            title: 'Care Planner',
            tabBarIcon: ({ focused, color }) => (
              <NavIcon focused={focused} color={color} name="clipboard" />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused, color }) => (
              <NavIcon focused={focused} color={color} name="settings" />
            ),
          }}
        />
        <Tabs.Screen name="splash" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="login" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="personal-details" options={{ href: null }} />
        <Tabs.Screen name="privacy-permissions" options={{ href: null }} />
        <Tabs.Screen name="detail" options={{ href: null }} />
        <Tabs.Screen name="assessment" options={{ href: null }} />
        <Tabs.Screen name="workflow" options={{ href: null }} />
        <Tabs.Screen
          name="onboarding-loading"
          options={{ href: null, tabBarStyle: { display: 'none' } }}
        />
        <Tabs.Screen name="health-records" options={{ href: null }} />
        <Tabs.Screen name="appointment-review" options={{ href: null }} />
      </Tabs>
    </>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#ECE7F3',
    borderTopWidth: 1,
    height: 88,
    paddingTop: 9,
    paddingBottom: 9,
    paddingHorizontal: 14,
    shadowColor: '#32165C',
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    borderRadius: 16,
    marginHorizontal: 1,
    paddingVertical: 1,
  },
  tabLabel: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 4,
  },
  iconPill: {
    width: 58,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: { backgroundColor: '#D8C7FA' },
});
