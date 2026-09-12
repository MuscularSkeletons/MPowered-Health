import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Specifies layout for tabs 
// TODO: change placeholder icons to actual icons for each tab

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false}}>
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
