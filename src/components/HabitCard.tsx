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
            containerStyle={{ marginBottom: 16, backgroundColor: '#F8FAFC', borderRadius: 32 }}
            friction={2}
            rightThreshold={60}
        >
            <View
                className={clsx(
                    "bg-white p-6 rounded-[32px] flex-row-reverse items-center justify-between shadow-lg border h-32 w-full mb-1",
                    completed ? "border-green-500 bg-green-50" : "border-slate-100"
                )}
            >
                <View className="flex-row-reverse items-center flex-1">
                    {/* Icon Box - Grand Luxury (Right Side in RTL) */}
                    <View className={clsx(
                        "w-20 h-20 rounded-[28px] items-center justify-center ml-6", // changed mr-6 to ml-6 for RTL
                        completed ? "bg-green-100" : "bg-[#F1F5F9]"
                    )}>
                        <Ionicons
                            name={icon as any}
                            size={36}
                            color={completed ? "#22c55e" : "#334155"}
                        />
                    </View>

                    {/* Text Info (Left of Icon in RTL) */}
                    <View className="justify-center flex-1 items-end">
                        <Text className={clsx(
                            "text-2xl font-black text-slate-800 mb-1 text-right",
                            completed && "line-through text-slate-400"
                        )}>
                            {title}
                        </Text>
                        <View className="flex-row-reverse items-center">
                            <Ionicons name="flame" size={12} color="#FF9F43" />
                            <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
                                {streak} أيام متتالية
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
