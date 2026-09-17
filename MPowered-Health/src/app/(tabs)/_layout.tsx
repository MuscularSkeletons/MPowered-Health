import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/constants/profile/ui";

// Specifies layout for tabs 
// TODO: change placeholder icons to actual icons for each tab

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
            headerShown: false,
            sceneStyle: { backgroundColor: palette.background },
            tabBarStyle: {
                height: 76,
                paddingTop: 4,
                paddingBottom: 12,
                paddingHorizontal: 18,
                backgroundColor: palette.background,
                borderTopWidth: 1,
                borderTopColor: palette.line,
                elevation: 0,
                shadowOpacity: 0,
            },
            tabBarItemStyle: { paddingVertical: 2 },
            tabBarIconStyle: { marginTop: 2 },
            tabBarLabelStyle: { marginTop: 2, fontSize: 11, fontWeight: '600' },
            tabBarInactiveTintColor: palette.muted,
            tabBarActiveTintColor: palette.primary,
        }}>

        <Tabs.Screen 
            name="index" 
            options={{
                title: 'Pain Tracker',
                tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                    name={focused ? "accessibility" : "accessibility-outline"}
                    color={color}
                    size={size}  
                />
                ),
            }}
        />
        <Tabs.Screen 
            name="myhealth" 
            options={{
                title: 'My Health',
                tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                    name={focused ? "folder" : "folder-outline"}
                    color={color}
                    size={size}  
                />
                ),
            }}
        />
        <Tabs.Screen 
            name="careplanner" 
            options={{
                title: 'Care Planner',
                tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                    name={focused ? "clipboard" : "clipboard-outline"}
                    color={color}
                    size={size}  
                />
                ),
            }}
        />
        <Tabs.Screen 
            name="settings" 
            options={{
                title: 'Settings',
                tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                    name={focused ? "settings" : "settings-outline"}
                    color={color}
                    size={size}  
                />
                ),
            }}
        />
    </Tabs>
  );
}
