import { View, TouchableOpacity, Text, Alert, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useEffect, useRef } from 'react';
import i18n, { isRTL } from '../../i18n';
import { LinearGradient } from 'expo-linear-gradient';
import clsx from 'clsx';
import { WaddleMascot } from '../../components/WaddleMascot';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const STEP_HEIGHT = 100;
const PATH_WIDTH = width - 48;
const ZIG_ZAG_AMPLITUDE = PATH_WIDTH / 3;

const AnimatedMascot = () => {
    const bounce = useSharedValue(0);

    useEffect(() => {
        bounce.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 500 }),
                withTiming(0, { duration: 500 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: bounce.value }]
    }));

    return (
        <Animated.View style={animatedStyle} className="absolute -top-16">
            <WaddleMascot mood="happy" size={70} />
        </Animated.View>
    );
};

export default function ChallengeDetailsScreen() {
    const router = useRouter();
    const { activeChallenge, fetchActiveChallenge, quitChallenge } = useAppStore();
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        fetchActiveChallenge();
    }, []);

    useEffect(() => {
        if (scrollViewRef.current && activeChallenge) {
            const yPos = (21 - activeChallenge.current_day) * STEP_HEIGHT - (height / 3);
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: Math.max(0, yPos), animated: true });
            }, 300);
        }
    }, [activeChallenge?.current_day]);

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

    const getStepColor = (step: number, isCompleted: boolean, isCurrent: boolean) => {
        if (isCurrent) return '#FCD34D';
        if (isCompleted) return '#10B981';
        return 'rgba(255,255,255,0.25)';
    };

    const getStepIcon = (step: number) => {
        if (step === 21) return 'trophy';
        if (step === 14) return 'star';
        if (step === 7) return 'flame';
        return null;
    };

    if (!activeChallenge) {
        return (
            <LinearGradient
                colors={['#6366F1', '#8B5CF6', '#A855F7']}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <WaddleMascot mood="sad" size={100} />
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginTop: 20 }}>
                        {i18n.t('challenge21.no_active', { defaultValue: 'No active challenge found.' })}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)/challenges')}
                        style={{ marginTop: 20, backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 }}
                    >
                        <Text style={{ color: '#6366F1', fontWeight: 'bold' }}>
                            {i18n.t('common.go_back', { defaultValue: 'Go Back' })}
                        </Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    const steps = Array.from({ length: 22 }, (_, i) => i);
    const currentDay = activeChallenge.current_day;

    return (
        <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#A855F7', '#C084FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            {/* Header - Fixed at top */}
            <SafeAreaView edges={['top']}>
                <View style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 8
                }}>
                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)/challenges')}
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 999 }}
                    >
                        <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="white" />
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' }}>
                            {activeChallenge.challenge_name || i18n.t('challenge21.card_title', { defaultValue: 'My Journey' })}
                        </Text>
                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>
                            {i18n.t('challenge21.day', { defaultValue: 'Day' })} {Math.min(currentDay + 1, 21)} / 21
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleQuit}
                        style={{ backgroundColor: 'rgba(239,68,68,0.8)', padding: 12, borderRadius: 999 }}
                    >
                        <Ionicons name="exit-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={{ marginHorizontal: 24, marginTop: 8 }}>
                    <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                        <View
                            style={{
                                height: '100%',
                                backgroundColor: '#FCD34D',
                                borderRadius: 999,
                                width: `${(currentDay / 21) * 100}%`
                            }}
                        />
                    </View>
                    <View style={{
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        justifyContent: 'space-between',
                        marginTop: 8
                    }}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' }}>
                            {i18n.t('challenge21.started', { defaultValue: 'Started' })}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' }}>
                            {21 - currentDay} {i18n.t('challenge21.days_left', { defaultValue: 'days left' })}
                        </Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* Challenge Path - Scrollable */}
            <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingVertical: 100, alignItems: 'center' }}
                showsVerticalScrollIndicator={false}
            >
                {[...steps].reverse().map((step, index) => {
                    const xOffset = Math.sin(step * 0.7) * ZIG_ZAG_AMPLITUDE;
                    const isCompleted = step <= currentDay;
                    const isCurrent = step === currentDay;
                    const isLocked = step > currentDay;
                    const specialIcon = getStepIcon(step);

                    return (
                        <Animated.View
                            key={step}
                            entering={FadeInDown.delay(index * 30).springify()}
                            style={{
                                width: PATH_WIDTH,
                                height: STEP_HEIGHT,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <View style={{ transform: [{ translateX: xOffset }], alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                {/* Connector Line */}
                                {step > 0 && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: 30,
                                            height: STEP_HEIGHT - 20,
                                            width: 4,
                                            backgroundColor: isCompleted ? '#10B981' : 'rgba(255,255,255,0.25)',
                                            borderRadius: 2,
                                        }}
                                    />
                                )}

                                {/* Step Circle */}
                                <View
                                    style={{
                                        width: isCurrent ? 64 : 48,
                                        height: isCurrent ? 64 : 48,
                                        borderRadius: 999,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: getStepColor(step, isCompleted, isCurrent),
                                        borderWidth: isCurrent ? 4 : 2,
                                        borderColor: isCurrent ? 'white' : 'rgba(255,255,255,0.3)',
                                        shadowColor: isCurrent ? '#FCD34D' : '#000',
                                        shadowOffset: { width: 0, height: isCurrent ? 0 : 2 },
                                        shadowOpacity: isCurrent ? 0.6 : 0.2,
                                        shadowRadius: isCurrent ? 16 : 4,
                                        elevation: isCurrent ? 10 : 2,
                                    }}
                                >
                                    {isCompleted && !isCurrent ? (
                                        <Ionicons name="checkmark" size={24} color="white" />
                                    ) : specialIcon && isLocked ? (
                                        <Ionicons name={specialIcon as any} size={20} color="rgba(255,255,255,0.6)" />
                                    ) : isCurrent ? (
                                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>{step}</Text>
                                    ) : (
                                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', fontSize: 14 }}>{step}</Text>
                                    )}

                                    {/* Mascot on Current Step */}
                                    {isCurrent && <AnimatedMascot />}
                                </View>

                                {/* Milestone Labels */}
                                {specialIcon && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            [isRTL ? 'left' : 'right']: -110,
                                            backgroundColor: step === 21 ? '#FCD34D' :
                                                step === 14 ? '#F472B6' : '#F97316',
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            borderRadius: 999,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 4,
                                        }}
                                    >
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>
                                            {step === 21 ? '🎉 ' + i18n.t('challenge21.finish', { defaultValue: 'Finish!' }) :
                                                step === 14 ? '⭐ ' + i18n.t('challenge21.milestone2', { defaultValue: 'Week 2!' }) :
                                                    '🔥 ' + i18n.t('challenge21.milestone1', { defaultValue: 'Week 1!' })}
                                        </Text>
                                    </View>
                                )}

                                {/* Current Position Label */}
                                {isCurrent && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            [isRTL ? 'left' : 'right']: -130,
                                            backgroundColor: '#FCD34D',
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 999,
                                            shadowColor: '#F59E0B',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.4,
                                            shadowRadius: 8,
                                        }}
                                    >
                                        <Text style={{ fontSize: 12, fontWeight: '900', color: 'white' }}>
                                            {i18n.t('challenge21.you_here', { defaultValue: 'You are here!' })}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    );
                })}
            </ScrollView>
        </LinearGradient>
    );
}
