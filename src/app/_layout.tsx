import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { registerForPushNotificationsAsync, scheduleHabitReminders } from '../lib/notifications';
import * as Notifications from 'expo-notifications';
import { MaintenanceScreen } from '../components/MaintenanceScreen';

import "../global.css";

const queryClient = new QueryClient();

function RootLayoutNav() {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const hasFinishedOnboarding = useAppStore(s => s.hasFinishedOnboarding);
    const setUserSession = useAppStore(s => s.setUserSession);
    const segments = useSegments();
    const router = useRouter();

    // 1. Auth & Session Listener + Maintenance Check
    useEffect(() => {
        // Notifications Setup
        registerForPushNotificationsAsync().then(() => {
            scheduleHabitReminders();
        });

        // Check Maintenance Mode
        const checkMaintenance = async () => {
            const { data } = await supabase
                .from('app_config')
                .select('value')
                .eq('key', 'maintenance_mode')
                .single();

            if (data?.value === 'true') {
                setIsMaintenanceMode(true);
            }
        };
        checkMaintenance();

        // Subscribe to maintenance mode changes (realtime)
        const channel = supabase
            .channel('maintenance_updates')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'app_config', filter: 'key=eq.maintenance_mode' },
                (payload) => {
                    setIsMaintenanceMode(payload.new.value === 'true');
                }
            )
            .subscribe();

        // Subscribe to Announcements (Simulator / In-App Notification)
        const announcementChannel = supabase
            .channel('announcements_updates')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'announcements' },
                async (payload) => {
                    const newAnnouncement = payload.new;
                    // Trigger Local Notification
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: newAnnouncement.title,
                            body: newAnnouncement.body,
                            sound: true,
                            data: { data: newAnnouncement },
                        },
                        trigger: null, // As soon as possible
                    });
                }
            )
            .subscribe();

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUserSession(session);
            if (session) {
                useAppStore.setState({ hasFinishedOnboarding: true });
            }
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUserSession(session);
            if (session) {
                useAppStore.setState({ hasFinishedOnboarding: true });
            }
        });

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(channel);
            supabase.removeChannel(announcementChannel);
        };
    }, []);

    // 2. The Gatekeeper Logic
    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(onboarding)';
        const inTabsGroup = segments[0] === '(tabs)';

        if (!session) {
            // No user -> Force Onboarding (which includes Login)
            if (!inAuthGroup) router.replace('/(onboarding)/welcome');
        } else {
            // User exists
            if (!hasFinishedOnboarding) {
                // User but no onboarding -> Force Onboarding path
                if (!inAuthGroup) router.replace('/(onboarding)/welcome');
            } else {
                // User AND Onboarding done -> Force Tabs
                if (inAuthGroup) router.replace('/(tabs)');
            }
        }
    }, [session, isLoading, hasFinishedOnboarding, segments]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    // Show maintenance screen if enabled
    if (isMaintenanceMode) {
        return <MaintenanceScreen />;
    }

    return <Slot />;
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nManager } from 'react-native';

export default function RootLayout() {
    // Dynamic RTL Enforcement
    // We import isRTL from our i18n logic which uses getLocales()
    const { isRTL } = require('../i18n');

    if (isRTL && !I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        // Updates.reloadAsync(); // Uncomment if instant reload needed, but usually next launch is fine
    } else if (!isRTL && I18nManager.isRTL) {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
    }

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
