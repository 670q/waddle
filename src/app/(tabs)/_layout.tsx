import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '../../i18n';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#4A90E2',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 5,
                    height: 60 + insets.bottom,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginBottom: 5,
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: i18n.t('tabs.today'),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="calendar" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="challenges"
                options={{
                    title: i18n.t('tabs.challenges'),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="trophy" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="waddle-ai"
                options={{
                    title: i18n.t('tabs.ai'),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="chatbubble-ellipses" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: i18n.t('tabs.progress'),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="stats-chart" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: i18n.t('tabs.settings'),
                    href: null,
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="settings-sharp" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
