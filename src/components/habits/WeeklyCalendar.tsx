import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

interface WeeklyCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export function WeeklyCalendar({ selectedDate, onSelectDate }: WeeklyCalendarProps) {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

    return (
        <View className="py-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                {weekDays.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <TouchableOpacity
                            key={date.toISOString()}
                            onPress={() => onSelectDate(date)}
                            className={`items-center justify-center w-14 h-20 mr-3 rounded-2xl ${isSelected ? 'bg-blue-600' : 'bg-white border border-gray-100'
                                }`}
                        >
                            <Text className={`text-xs mb-1 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                                {format(date, 'EEE')}
                            </Text>
                            <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                {format(date, 'd')}
                            </Text>
                            {isToday && (
                                <View className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
