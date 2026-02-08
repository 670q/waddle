import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { WaddleMascot } from '../WaddleMascot'; // Ensure this path is correct based on folder structure
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../i18n';

const { width } = Dimensions.get('window');
const STEP_HEIGHT = 80;
const PATH_WIDTH = width - 48; // Padding
const ZIG_ZAG_AMPLITUDE = PATH_WIDTH / 2.5;

interface ChallengePathProps {
    currentDay: number; // 0 to 21
    status: 'active' | 'completed' | 'failed';
}

export const ChallengePath = ({ currentDay, status }: ChallengePathProps) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const steps = Array.from({ length: 22 }, (_, i) => i); // 0 to 21 (22 steps including start)

    useEffect(() => {
        // Scroll to current step
        if (scrollViewRef.current) {
            // Calculate position: (21 - currentDay) * STEP_HEIGHT helps center it
            // implementation detail: steps are rendered top-to-bottom (21 down to 0)
            const yPos = (21 - currentDay) * STEP_HEIGHT - (Dimensions.get('window').height / 3);
            scrollViewRef.current.scrollTo({ y: Math.max(0, yPos), animated: true });
        }
    }, [currentDay]);

    return (
        <View className="flex-1 bg-gradient-to-b from-indigo-50 to-white">
            <View className="items-center py-4 bg-white/80 z-20 shadow-sm">
                <Text className="font-black text-xl text-slate-800">
                    {i18n.t('challenge21.card_title', { defaultValue: 'My Journey' })}
                </Text>
                <Text className="text-slate-500 text-sm font-medium">
                    {i18n.t('challenge21.day')} {Math.min(currentDay + 1, 21)} / 21
                </Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{ paddingVertical: 100, alignItems: 'center' }}
                showsVerticalScrollIndicator={false}
            >
                {/* Render steps in reverse order (21 at top, 0 at bottom) */}
                {[...steps].reverse().map((step) => {
                    // Calculate horizontal position
                    // Sine wave pattern
                    const xOffset = Math.sin(step * 0.8) * (ZIG_ZAG_AMPLITUDE / 2);

                    const isCompleted = step <= currentDay;
                    const isCurrent = step === currentDay;
                    const isLocked = step > currentDay;

                    // Connector Line (only map if not the last step '0')
                    // Since we map reverse, 'step' goes 21 -> 0.
                    // We need line to *next* step (which is step-1).
                    // This is tricky in reverse map. Simpler: line from THIS to NEXT-LOWER.
                    // If step > 0, draw line to step-1.

                    return (
                        <View key={step} style={{ width: PATH_WIDTH, height: STEP_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
                            {/* The Step Node */}
                            <View
                                style={{ transform: [{ translateX: xOffset }] }}
                                className="items-center justify-center z-10"
                            >
                                {/* Connector Line downwards to step-1 */}
                                {step > 0 && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: STEP_HEIGHT / 2,
                                            height: STEP_HEIGHT,
                                            width: 4,
                                            backgroundColor: isCompleted ? '#6366F1' : '#E2E8F0',
                                            // Trigonometry to connect to next point (simplified mostly vertical for now, 
                                            // accurate angled lines require SVG or rotation math)
                                            // For "waddle" aesthetic, maybe simple dashed lines or dots?
                                            // Let's stick to simple vertical visual approximation or dots.
                                            // Actually, let's just use circles as stepping stones without lines for cleaner V1 
                                            // OR use a small connecting dot in between.
                                        }}
                                    />
                                )}

                                {/* CIRCLE */}
                                <View className={clsx(
                                    "w-12 h-12 rounded-full items-center justify-center border-4 shadow-sm bg-white",
                                    isCurrent ? "border-amber-400 scale-110" :
                                        isCompleted ? "border-indigo-500 bg-indigo-500" : "border-slate-200"
                                )}>
                                    {isCompleted && !isCurrent ? (
                                        <Ionicons name="checkmark" size={24} color="white" />
                                    ) : isCurrent ? (
                                        <View className="bg-amber-400 w-8 h-8 rounded-full items-center justify-center">
                                            <Text className="text-white font-bold">{step}</Text>
                                        </View>
                                    ) : (
                                        <Text className="text-slate-300 font-bold">{step}</Text>
                                    )}

                                    {/* Mascot on Current Step */}
                                    {isCurrent && (
                                        <View className="absolute -top-14">
                                            <WaddleMascot mood="happy" size={60} />
                                        </View>
                                    )}
                                </View>

                                {isCurrent && (
                                    <View className="absolute -right-24 bg-white px-3 py-1 rounded-full shadow-md">
                                        <Text className="text-xs font-bold text-indigo-600">You are here!</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};
