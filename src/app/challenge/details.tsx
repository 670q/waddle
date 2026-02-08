import { View, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ChallengePath } from '../../components/Challenge21/ChallengePath';
import { useAppStore } from '../../store/useAppStore';
import { useEffect } from 'react';

export default function ChallengeDetailsScreen() {
    const router = useRouter();
    const { activeChallenge, fetchActiveChallenge } = useAppStore();

    useEffect(() => {
        fetchActiveChallenge();
    }, []);

    if (!activeChallenge) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text className="text-slate-400 font-medium">No active challenge found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-indigo-600 font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* Custom Header */}
            <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
                <View className="flex-row items-center justify-between px-4 pb-2 pointer-events-auto">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-white/80 p-2 rounded-full shadow-sm"
                    >
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <View className="bg-white/80 px-4 py-1 rounded-full shadow-sm">
                        <Text className="font-bold text-slate-800">21 Days</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ChallengePath
                currentDay={activeChallenge.current_day}
                status={activeChallenge.status}
            />
        </View>
    );
}
