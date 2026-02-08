import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { WaddleMascot } from '../WaddleMascot';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import i18n, { isRTL } from '../../i18n';
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
        <View className="flex-1 bg-white/10 rounded-t-3xl overflow-hidden">
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
                                            backgroundColor: isCompleted ? '#10B981' : 'rgba(255,255,255,0.2)',
                                            borderRadius: 2,
                                        }}
                                    />
                                )}

                                {/* Step Circle */}
                                <View
                                    className={clsx(
                                        "items-center justify-center rounded-full shadow-lg",
                                        isCurrent ? "w-16 h-16" : "w-12 h-12"
                                    )}
                                    style={{
                                        backgroundColor: getStepColor(step, isCompleted, isCurrent),
                                        borderWidth: isCurrent ? 4 : 0,
                                        borderColor: 'white',
                                    }}
                                >
                                    {isCompleted && !isCurrent ? (
                                        <Ionicons name="checkmark" size={24} color="white" />
                                    ) : specialIcon && isLocked ? (
                                        <Ionicons name={specialIcon as any} size={20} color="rgba(255,255,255,0.5)" />
                                    ) : isCurrent ? (
                                        <Text className="text-white font-black text-xl">{step}</Text>
                                    ) : (
                                        <Text className="text-white/60 font-bold text-sm">{step}</Text>
                                    )}

                                    {/* Mascot on Current Step */}
                                    {isCurrent && <AnimatedMascot />}
                                </View>

                                {/* Milestone Labels */}
                                {specialIcon && (
                                    <View
                                        className={clsx(
                                            "absolute bg-white/90 px-3 py-1 rounded-full shadow-md",
                                            isRTL ? "-left-28" : "-right-28"
                                        )}
                                    >
                                        <Text className="text-xs font-bold text-indigo-600">
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
        </View>
    );
};
