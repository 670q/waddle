import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';

import "../global.css";

const queryClient = new QueryClient();

function RootLayoutNav() {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasFinishedOnboarding = useAppStore(s => s.hasFinishedOnboarding);
    const setUserSession = useAppStore(s => s.setUserSession);
    const segments = useSegments();
    const router = useRouter();

    // 1. Auth & Session Listener
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUserSession(session);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUserSession(session);
        });

        return () => subscription.unsubscribe();
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
                // (Ideally check if they are deep in onboarding, but usually redirect to welcome or focus)
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

    return <Slot />;
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
