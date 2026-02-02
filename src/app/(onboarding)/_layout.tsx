import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="focus-area" />
            <Stack.Screen name="choose-habits" />
            <Stack.Screen name="paywall-mock" />
        </Stack>
    );
}
