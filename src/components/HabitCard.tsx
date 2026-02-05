import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';

interface HabitCardProps {
    title: string;
    icon: string;
    time: string;
    streak: number;
    completed: boolean;
    onToggle: () => void;
    isRTL?: boolean;
}

export function HabitCard({ title, icon, time, streak, completed, onToggle, isRTL = false }: HabitCardProps) {
    const swipeableRef = useRef<Swipeable>(null);

    const renderRightActions = (progress: any, dragX: any) => {
        return (
            <View className="flex-1 bg-green-500 justify-center items-end px-6 rounded-3xl mb-3 h-24">
                <Ionicons name="checkmark-sharp" size={32} color="white" />
            </View>
        );
    };

    const handleSwipeOpen = (direction: 'left' | 'right') => {
        if (direction === 'right') {
            onToggle();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            swipeableRef.current?.close();
        }
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            onSwipeableOpen={handleSwipeOpen}
            containerStyle={{ marginBottom: 16, backgroundColor: '#F8FAFC', borderRadius: 32 }}
            friction={2}
            rightThreshold={60}
        >
            <View
                className={clsx(
                    "bg-white p-6 rounded-[32px] items-center justify-between shadow-lg border h-32 w-full mb-1",
                    isRTL ? "flex-row-reverse" : "flex-row",
                    completed ? "border-green-500 bg-green-50" : "border-slate-100"
                )}
            >
                <View className={clsx("items-center flex-1", isRTL ? "flex-row-reverse" : "flex-row")}>
                    {/* Icon Box */}
                    <View className={clsx(
                        "w-20 h-20 rounded-[28px] items-center justify-center",
                        isRTL ? "ml-6" : "mr-6",
                        completed ? "bg-green-100" : "bg-[#F1F5F9]"
                    )}>
                        <Ionicons
                            name={icon as any}
                            size={36}
                            color={completed ? "#22c55e" : "#334155"}
                        />
                    </View>

                    {/* Text Info */}
                    <View className={clsx("justify-center flex-1", isRTL ? "items-end" : "items-start")}>
                        <Text className={clsx(
                            "text-2xl font-black text-slate-800 mb-1",
                            isRTL ? "text-right" : "text-left",
                            completed && "line-through text-slate-400"
                        )}>
                            {title}
                        </Text>
                        <View className={clsx("items-center", isRTL ? "flex-row-reverse" : "flex-row")}>
                            <Ionicons name="flame" size={12} color="#FF9F43" />
                            <Text className={clsx(
                                "text-xs text-slate-400 font-bold uppercase tracking-wider",
                                isRTL ? "mr-1" : "ml-1"
                            )}>
                                {streak} {isRTL ? "أيام متتالية" : "Days Streak"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Checkbox */}
                <TouchableOpacity onPress={() => {
                    onToggle();
                    Haptics.selectionAsync();
                }}>
                    <View className={clsx(
                        "w-8 h-8 rounded-full border-2 items-center justify-center",
                        completed
                            ? "bg-green-500 border-green-500"
                            : "bg-transparent border-slate-200"
                    )}>
                        {completed && <Ionicons name="checkmark" size={18} color="white" />}
                    </View>
                </TouchableOpacity>
            </View>
        </Swipeable>
    );
}
