// ... imports
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'General Notifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            description: 'Receive daily reminders and challenge updates.',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return;
    }

    // Get the token properly
    try {
        const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || Constants.expoConfig?.extra?.eas?.projectId;


        if (!projectId) {

            token = (await Notifications.getExpoPushTokenAsync()).data;
        } else {
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: projectId
            })).data;
        }


    } catch (e: any) {

        Alert.alert('Push Token Error', e.message || JSON.stringify(e));
    }

    // --- SYNC TO SUPABASE ---
    if (token) {
        try {
            const { data: { user } } = await supabase.auth.getUser();


            if (user) {
                const { error } = await supabase.from('user_push_tokens').upsert({
                    user_id: user.id,
                    token: token,
                    updated_at: new Date()
                });

            }
        } catch (e) {

        }
    }

    return token;
}

export async function scheduleHabitReminders() {
    // Cancel all existing to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Morning Reminder (8:00 AM)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "☀️ Good Morning!",
            body: "Time to waddle into your morning habits!",
            sound: true,
        },
        trigger: {
            hour: 8,
            minute: 0,
            repeats: true,
        } as any, // Type cast for simpler usage
    });

    // Afternoon Reminder (2:00 PM)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "🌤️ Afternoon Check-in",
            body: "Don't forget your afternoon tasks.",
            sound: true,
        },
        trigger: {
            hour: 14,
            minute: 0,
            repeats: true,
        } as any,
    });

    // Evening Reminder (8:00 PM)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "🌙 Evening Wrap-up",
            body: "Finish your day strong!",
            sound: true,
        },
        trigger: {
            hour: 20,
            minute: 0,
            repeats: true,
        } as any,
    });
}
