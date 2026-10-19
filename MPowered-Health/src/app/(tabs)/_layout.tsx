import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/constants/ui/styling";
import { HealthDataBoundary } from '@/components/my-health/healthDataBoundary';
import { useAuth } from '@/context/authcontext';
import { MedicationProvider } from '@/context/prescriptionsContext';

// Specifies layout for tabs 
export default function TabsLayout() {
    const { user } = useAuth();
    return (
        <HealthDataBoundary key={user?.id ?? 'signed-out'} userId={user?.id ?? 'signed-out'}>
            <MedicationProvider>
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
                        name="(assessment)" 
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
                        name="(myhealth)" 
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
                        name="(questions)" 
                        options={{
                            title: 'Questions',
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
                        name="(settings)" 
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
            </MedicationProvider>
        </HealthDataBoundary>
    );
}
