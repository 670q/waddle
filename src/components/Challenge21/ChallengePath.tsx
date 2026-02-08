import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { WaddleMascot } from '../WaddleMascot';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import i18n, { isRTL } from '../../i18n';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const STEP_HEIGHT = 100;
const PATH_WIDTH = width - 48;
const ZIG_ZAG_AMPLITUDE = PATH_WIDTH / 3;

interface ChallengePathProps {
    currentDay: number;
    status: 'active' | 'completed' | 'failed';
}

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

// Floating particle decoration
const FloatingParticle = ({ delay, x, size }: { delay: number; x: number; size: number }) => {
    const float = useSharedValue(0);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        float.value = withRepeat(
            withSequence(
                withTiming(-30, { duration: 3000 + delay }),
                withTiming(0, { duration: 3000 + delay })
            ),
            -1,
            true
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 2000 }),
                withTiming(0.2, { duration: 2000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: float.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[{
                position: 'absolute',
                left: x,
                top: delay % 400,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: 'rgba(255,255,255,0.4)',
            }, animatedStyle]}
        />
    );
};

export const ChallengePath = ({ currentDay, status }: ChallengePathProps) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const steps = Array.from({ length: 22 }, (_, i) => i);

    useEffect(() => {
        if (scrollViewRef.current) {
            const yPos = (21 - currentDay) * STEP_HEIGHT - (Dimensions.get('window').height / 3);
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: Math.max(0, yPos), animated: true });
            }, 300);
        }
    }, [currentDay]);

    const getStepColor = (step: number, isCompleted: boolean, isCurrent: boolean) => {
        if (isCurrent) return '#FCD34D'; // Amber
        if (isCompleted) return '#10B981'; // Green
        return 'rgba(255,255,255,0.3)';
    };

    const getStepIcon = (step: number) => {
        if (step === 21) return 'trophy';
        if (step === 14) return 'star';
        if (step === 7) return 'flame';
        return null;
    };

    return (
        <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#A855F7', '#C084FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 rounded-t-3xl overflow-hidden"
        >
            {/* Decorative floating particles */}
            <FloatingParticle delay={0} x={20} size={8} />
            <FloatingParticle delay={100} x={80} size={12} />
            <FloatingParticle delay={200} x={width - 50} size={6} />
            <FloatingParticle delay={300} x={width - 100} size={10} />
            <FloatingParticle delay={150} x={width / 2} size={8} />

            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{ paddingVertical: 120, alignItems: 'center' }}
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
                            <View style={{ transform: [{ translateX: xOffset }] }} className="items-center justify-center z-10">
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
                                    className={clsx(
                                        "items-center justify-center rounded-full",
                                        isCurrent ? "w-16 h-16" : "w-12 h-12"
                                    )}
                                    style={{
                                        backgroundColor: getStepColor(step, isCompleted, isCurrent),
                                        borderWidth: isCurrent ? 4 : 2,
                                        borderColor: isCurrent ? 'white' : 'rgba(255,255,255,0.3)',
                                        shadowColor: isCurrent ? '#FCD34D' : '#000',
                                        shadowOffset: { width: 0, height: isCurrent ? 0 : 2 },
                                        shadowOpacity: isCurrent ? 0.5 : 0.2,
                                        shadowRadius: isCurrent ? 12 : 4,
                                        elevation: isCurrent ? 8 : 2,
                                    }}
                                >
                                    {isCompleted && !isCurrent ? (
                                        <Ionicons name="checkmark" size={24} color="white" />
                                    ) : specialIcon && isLocked ? (
                                        <Ionicons name={specialIcon as any} size={20} color="rgba(255,255,255,0.6)" />
                                    ) : isCurrent ? (
                                        <Text className="text-white font-black text-xl">{step}</Text>
                                    ) : (
                                        <Text className="text-white/70 font-bold text-sm">{step}</Text>
                                    )}

                                    {/* Mascot on Current Step */}
                                    {isCurrent && <AnimatedMascot />}
                                </View>

                                {/* Milestone Labels */}
                                {specialIcon && (
                                    <View
                                        className={clsx(
                                            "absolute px-3 py-1 rounded-full shadow-lg",
                                            isRTL ? "-left-28" : "-right-28"
                                        )}
                                        style={{
                                            backgroundColor: step === 21 ? '#FCD34D' :
                                                step === 14 ? '#F472B6' : '#F97316',
                                        }}
                                    >
                                        <Text className="text-xs font-bold text-white">
                                            {step === 21 ? '🎉 ' + i18n.t('challenge21.finish', { defaultValue: 'Finish!' }) :
                                                step === 14 ? '⭐ ' + i18n.t('challenge21.milestone2', { defaultValue: 'Week 2!' }) :
                                                    '🔥 ' + i18n.t('challenge21.milestone1', { defaultValue: 'Week 1!' })}
                                        </Text>
                                    </View>
                                )}

                                {/* Current Position Label */}
                                {isCurrent && (
                                    <View
                                        className={clsx(
                                            "absolute bg-amber-400 px-4 py-2 rounded-full shadow-lg",
                                            isRTL ? "-left-32" : "-right-32"
                                        )}
                                        style={{
                                            shadowColor: '#F59E0B',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.4,
                                            shadowRadius: 8,
                                        }}
                                    >
                                        <Text className="text-xs font-black text-white">
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
};
