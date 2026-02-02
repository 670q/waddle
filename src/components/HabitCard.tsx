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
}

export function HabitCard({ title, icon, time, streak, completed, onToggle }: HabitCardProps) {
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
            containerStyle={{ marginBottom: 16 }}
            friction={2}
            rightThreshold={60}
        >
            <View
                className={clsx(
                    "bg-white p-5 rounded-3xl flex-row items-center justify-between shadow-sm border h-24 w-full",
                    completed ? "border-green-500 bg-green-50" : "border-slate-100"
                )}
            >
                <View className="flex-row items-center flex-1">
                    {/* Icon Box - Larger (w-12 h-12 -> w-14 h-14) */}
                    <View className={clsx(
                        "w-14 h-14 rounded-2xl items-center justify-center mr-4",
                        completed ? "bg-green-100" : "bg-slate-50"
                    )}>
                        <Ionicons
                            name={icon as any}
                            size={28}
                            color={completed ? "#22c55e" : "#64748B"}
                        />
                    </View>

                    {/* Text Info */}
                    <View className="justify-center flex-1">
                        <Text className={clsx(
                            "text-xl font-bold text-slate-800 mb-1",
                            completed && "line-through text-slate-400"
                        )}>
                            {title}
                        </Text>
                        <View className="flex-row items-center">
                            <Ionicons name="flame" size={12} color="#FF9F43" />
                            <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-1">
                                {streak} Day Streak
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Checkbox - Purely Visual if Swipe is primary, but stick to design */}
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
