import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { WaddleMascot } from '../../components/WaddleMascot';
import { useChallengesStore, Challenge } from '../../hooks/useChallenges';
import { useEffect, useState } from 'react';
import i18n, { isRTL } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';
import { StartChallengeModal } from '../../components/Challenge21/StartChallengeModal';
import { useRouter } from 'expo-router';

const ChallengeCard = ({ challenge, onJoin }: { challenge: Challenge; onJoin: (id: string) => void }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = Date.now();
            const diff = challenge.expiresAt - now;

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h`);
            } else {
                setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [challenge.expiresAt]);

    // Extract hex color from bg_color (it might be a hex like #3B82F6 or a tailwind class like bg-[#3B82F6])
    const getBgColor = (color: string) => {
        if (color.startsWith('#')) return color;
        const match = color.match(/#[0-9A-Fa-f]{6}/);
        return match ? match[0] : '#334155'; // Default to slate-800
    };

    const bgColor = getBgColor(challenge.color);

    return (
        <View
            className="rounded-3xl p-6 mb-6 shadow-lg relative overflow-hidden"
            style={{ height: 220, backgroundColor: bgColor }}
        >
            {/* Background Image / Mascot */}
            {challenge.image_url ? (
                <View className="absolute inset-0 w-full h-full z-0">
                    <Image
                        source={{ uri: challenge.image_url }}
                        className="w-full h-full opacity-60"
                        resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-black/40" />
                </View>
            ) : (
                <View className={clsx("absolute top-10 opacity-90 z-0", isRTL ? "left-[-30]" : "right-[-30]")}>
                    <WaddleMascot size={150} mood="happy" />
                </View>
            )}

            {/* Content Container - Limited width to avoid mascot overlap */}
            <View className={clsx("relative z-10 w-[60%]", isRTL ? "self-end items-end" : "self-start items-start")}>
                {/* Challenge Tag */}
                <Text className={clsx("text-white/60 font-bold text-xs uppercase mb-2", isRTL ? "text-right" : "text-left")}>
                    {challenge.type === 'daily' ? i18n.t('challenges.daily_tag') : i18n.t('challenges.weekly_tag')}
                </Text>

                {/* Title */}
                <Text className={clsx("text-2xl font-black text-white mb-2 leading-tight", isRTL ? "text-right" : "text-left")}>
                    {challenge.title}
                </Text>

                {/* Description */}
                <Text
                    className={clsx("text-white/80 text-xs mb-4 font-medium", isRTL ? "text-right" : "text-left")}
                    numberOfLines={3}
                >
                    {challenge.description}
                </Text>
            </View>

            {/* Bottom Row - Full Width */}
            <View className={clsx("absolute bottom-6 left-6 right-6 items-center justify-between z-20", isRTL ? "flex-row-reverse" : "flex-row")}>
                {/* Join Button */}
                <TouchableOpacity
                    onPress={() => onJoin(challenge.id)}
                    disabled={challenge.joined}
                    className={clsx(
                        "py-2 rounded-full items-center px-6 shadow-sm",
                        challenge.joined ? "bg-white/20" : "bg-[#FCD34D]"
                    )}>
                    <Text className={clsx(
                        "font-bold",
                        challenge.joined ? "text-white" : "text-slate-900"
                    )}>
                        {challenge.joined ? i18n.t('challenges.joined') : i18n.t('challenges.join')}
                    </Text>
                </TouchableOpacity>

                {/* Stats */}
                <View>
                    <View className={clsx("items-center justify-end mb-1", isRTL ? "flex-row-reverse" : "flex-row")}>
                        <Ionicons name="people" size={12} color="white" style={{ opacity: 0.8, marginHorizontal: 4 }} />
                        <Text className="text-white font-bold text-xs">{challenge.joinedCount} {i18n.t('challenges.joined_count')}</Text>
                    </View>
                    <Text className={clsx("text-white/80 font-mono text-xs", isRTL ? "text-left" : "text-right")}>
                        {i18n.t('challenges.ends_in')} {timeLeft}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default function ChallengesScreen() {
    const { challenges, generateChallenges, joinChallenge, loading, hasHydrated, subscribeToUpdates } = useChallengesStore();
    const { activeChallenge, fetchActiveChallenge, startChallenge } = useAppStore();
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchActiveChallenge();
    }, []);

    useEffect(() => {
        if (hasHydrated) {
            generateChallenges();
            const unsubscribe = subscribeToUpdates();
            return () => unsubscribe();
        }
    }, [hasHydrated]);

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={generateChallenges} />
                }
            >
                {/* 21-Day Challenge Section */}
                <View className="mb-8">
                    <Text className={clsx("text-2xl font-black text-slate-800 mb-4", isRTL ? "text-right" : "text-left")}>
                        {i18n.t('challenge21.title')}
                    </Text>

                    <View className="bg-indigo-600 rounded-3xl p-6 shadow-lg overflow-hidden relative">
                        {/* Background Pattern */}
                        <View className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50" />
                        <View className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50" />

                        <View className={clsx("flex-row items-center justify-between", isRTL ? "flex-row-reverse" : "flex-row")}>
                            <View>
                                <Text className="text-white/80 font-medium mb-1">
                                    {activeChallenge ? i18n.t('challenge21.card_title') : i18n.t('challenge21.modal_title')}
                                </Text>
                                <Text className="text-white text-3xl font-black mb-4">
                                    {activeChallenge
                                        ? `${Math.min(activeChallenge.current_day + 1, 21)} / 21 ${i18n.t('challenge21.day')}`
                                        : "Start Your Journey"
                                    }
                                </Text>
                            </View>
                            <View className="bg-white/20 p-3 rounded-full">
                                <Ionicons name="trophy" size={32} color="white" />
                            </View>
                        </View>

                        {activeChallenge ? (
                            <View>
                                <View className="h-2 bg-black/20 rounded-full mb-4 overflow-hidden">
                                    <View
                                        className="h-full bg-amber-400 rounded-full"
                                        style={{ width: `${(activeChallenge.current_day / 21) * 100}%` }}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => router.push('/challenge/details')}
                                    className="bg-white py-3 rounded-xl items-center"
                                >
                                    <Text className="text-indigo-600 font-bold">Continue Journey</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                className="bg-amber-400 py-3 rounded-xl items-center shadow-md"
                            >
                                <Text className="text-slate-900 font-bold">{i18n.t('challenge21.start_btn')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Header */}
                <View className={clsx("mb-6 items-center justify-between", isRTL ? "flex-row-reverse" : "flex-row")}>
                    <Text className="text-3xl font-bold text-slate-800">{i18n.t('tabs.challenges')}</Text>
                    <View className="bg-orange-100 px-3 py-1 rounded-full">
                        <Text className="text-orange-500 font-bold text-xs uppercase">{i18n.t('challenges.live')}</Text>
                    </View>
                </View>

                {loading && challenges.length === 0 ? (
                    <View className="items-center justify-center p-10">
                        <ActivityIndicator size="large" color="#4A90E2" />
                        <Text className="text-slate-400 mt-4">Cooking up new challenges...</Text>
                    </View>
                ) : (
                    challenges.map((challenge) => (
                        <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            onJoin={joinChallenge}
                        />
                    ))
                )}

                {/* Coming Soon */}
                <View className="items-center mt-8">
                    <Text className="text-slate-400 font-medium">{i18n.t('challenges.footer')}</Text>
                </View>

            </ScrollView>


            <StartChallengeModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onStart={(habitId) => {
                    startChallenge(habitId);
                    // Optionally navigate to details immediately
                    setTimeout(() => router.push('/challenge/details'), 500);
                }}
            />
        </SafeAreaView >
    );
}
