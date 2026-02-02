import React from 'react';
import { View, Text } from 'react-native';

interface HabitCardProps {
    title: string;
    icon?: string;
    color?: string;
    completed: boolean;
}

export function HabitCard({ title, icon, color = '#3B82F6', completed }: HabitCardProps) {
    return (
        <View className={`p-5 rounded-2xl flex-row items-center border ${completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 shadow-sm'}`}>
            <View
                className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${completed ? 'bg-green-100' : 'bg-blue-50'}`}
                style={{ backgroundColor: completed ? '#DCFCE7' : `${color}20` }}
            >
                {/* Placeholder for Icon (e.g. FontAwesome) */}
                <Text className="text-xl">{completed ? '✅' : '🐧'}</Text>
            </View>
            <View className="flex-1">
                <Text className={`text-lg font-semibold ${completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                    {title}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">{completed ? 'Completed!' : 'Swipe to complete'}</Text>
            </View>
        </View>
    );
}
