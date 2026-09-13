import { NavIcon } from '@/shared/navigation/TabIcon';
import { s } from '@/shared/navigation/tab-styles';
import { Tabs } from 'expo-router';
export default function MainTabs() {
  return (
    <Tabs
      initialRouteName="(pain)"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5E17EB',
        tabBarInactiveTintColor: '#6B5C7A',
        tabBarStyle: s.tabBar,
        tabBarItemStyle: s.tabItem,
        tabBarLabelStyle: s.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="(pain)"
        options={{
          title: 'Pain Tracker',
          href: '/dashboard',
          tabBarIcon: ({ focused, color }) => (
            <NavIcon focused={focused} color={String(color)} name="accessibility" />
          ),
        }}
      />
      <Tabs.Screen
        name="(health)"
        options={{
          title: 'My Health',
          href: '/explore',
          tabBarIcon: ({ focused, color }) => (
            <NavIcon focused={focused} color={String(color)} name="folder" />
          ),
        }}
      />
      <Tabs.Screen
        name="(care)"
        options={{
          title: 'Care Planner',
          href: '/care',
          tabBarIcon: ({ focused, color }) => (
            <NavIcon focused={focused} color={String(color)} name="clipboard" />
          ),
        }}
      />
      <Tabs.Screen
        name="(account)"
        options={{
          title: 'Settings',
          href: '/settings',
          tabBarIcon: ({ focused, color }) => (
            <NavIcon focused={focused} color={String(color)} name="settings" />
          ),
        }}
      />
    </Tabs>
  );
}
