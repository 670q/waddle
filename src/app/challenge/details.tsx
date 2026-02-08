import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ChallengePath } from '../../components/Challenge21/ChallengePath';
import { useAppStore } from '../../store/useAppStore';
import { useEffect } from 'react';
import i18n, { isRTL } from '../../i18n';
import { LinearGradient } from 'expo-linear-gradient';
import clsx from 'clsx';

export default function ChallengeDetailsScreen() {
    const router = useRouter();
    const { activeChallenge, fetchActiveChallenge, quitChallenge } = useAppStore();

    useEffect(() => {
        fetchActiveChallenge();
    }, []);

    const handleQuit = () => {
        Alert.alert(
            i18n.t('challenge21.quit_title', { defaultValue: 'Quit Challenge?' }),
            i18n.t('challenge21.quit_message', { defaultValue: 'Are you sure you want to quit? Your progress will be lost.' }),
            [
                { text: i18n.t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
                {
                    text: i18n.t('challenge21.quit_confirm', { defaultValue: 'Quit' }),
                    style: 'destructive',
                    onPress: async () => {
                        await quitChallenge();
                        router.replace('/(tabs)/challenges');
                    }
                }
            ]
        );
    };

    if (!activeChallenge) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text className="text-slate-400 font-medium">{i18n.t('challenge21.no_active', { defaultValue: 'No active challenge found.' })}</Text>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/challenges')} className="mt-4">
                    <Text className="text-indigo-600 font-bold">{i18n.t('common.go_back', { defaultValue: 'Go Back' })}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1">
            <LinearGradient
                colors={['#6366F1', '#8B5CF6', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute inset-0"
            />

            {/* Header */}
            <SafeAreaView edges={['top']} className="z-50">
                <View className={clsx("px-4 py-2 items-center justify-between", isRTL ? "flex-row-reverse" : "flex-row")}>
                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)/challenges')}
                        className="bg-white/20 p-3 rounded-full"
                    >
                        <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="white" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-white/80 text-sm font-medium">
                            {activeChallenge.challenge_name || i18n.t('challenge21.card_title', { defaultValue: 'My Journey' })}
                        </Text>
                        <Text className="text-white font-black text-xl">
                            {i18n.t('challenge21.day', { defaultValue: 'Day' })} {Math.min(activeChallenge.current_day + 1, 21)} / 21
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleQuit}
                        className="bg-red-500/80 p-3 rounded-full"
                    >
                        <Ionicons name="exit-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View className="mx-6 mt-2">
                    <View className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${(activeChallenge.current_day / 21) * 100}%` }}
                        />
                    </View>
                    <View className={clsx("mt-2 items-center justify-between", isRTL ? "flex-row-reverse" : "flex-row")}>
                        <Text className="text-white/70 text-xs font-medium">
                            {i18n.t('challenge21.started', { defaultValue: 'Started' })}
                        </Text>
                        <Text className="text-white/70 text-xs font-medium">
                            {21 - activeChallenge.current_day} {i18n.t('challenge21.days_left', { defaultValue: 'days left' })}
                        </Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* Challenge Path */}
            <View className="flex-1 mt-4">
                <ChallengePath
                    currentDay={activeChallenge.current_day}
                    status={activeChallenge.status}
                />
            </View>
        </View>
    );
}
