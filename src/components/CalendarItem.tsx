/// <reference types="nativewind/types" />
import React, { memo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import clsx from 'clsx';
import * as Haptics from 'expo-haptics';

interface CalendarItemProps {
    item: any;
    isSelected: boolean;
    onPress: (dateStr: string) => void;
}

const CalendarItem = memo(({ item, isSelected, onPress }: CalendarItemProps) => {
    return (
        <TouchableOpacity
            onPress={() => {
                Haptics.selectionAsync();
                onPress(item.fullDateStr);
            }}
            className={clsx(
                "items-center justify-center w-14 h-20 rounded-[28px] mx-1",
                isSelected ? "bg-[#4A90E2]" : "bg-transparent",
                item.isToday && !isSelected && "bg-blue-50 border border-blue-100"
            )}
        >
            <Text className={clsx(
                "text-[10px] font-bold uppercase mb-1",
                isSelected ? "text-white" : "text-slate-400"
            )}>
                {item.day}
            </Text>
            <Text className={clsx(
                "text-xl font-black",
                isSelected ? "text-white" : "text-slate-400"
            )}>
                {item.date}
            </Text>
        </TouchableOpacity>
    );
});

export default CalendarItem;
