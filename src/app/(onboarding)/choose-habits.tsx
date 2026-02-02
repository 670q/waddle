import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';

const SUGGESTED_HABITS = [
    { id: '1', title: 'Drink Water', icon: 'water-outline' },
    { id: '2', title: 'Read 10 pages', icon: 'book-outline' },
    { id: '3', title: 'Meditate 5 mins', icon: 'leaf-outline' },
    { id: '4', title: 'Go for a walk', icon: 'walk-outline' },
    { id: '5', title: 'No Sugar', icon: 'nutrition-outline' },
    { id: '6', title: 'Sleep by 11 PM', icon: 'moon-outline' },
];

export default function ChooseHabitsScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);

    const toggleHabit = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6">
            <View className="flex-1">
                <Text className="text-3xl font-bold text-slate-800 mb-2">
                    Let's pick your first habits.
                </Text>
                <Text className="text-lg text-slate-500 mb-8">
                    Start small to build momentum.
                </Text>

                <FlatList
                    data={SUGGESTED_HABITS}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const isSelected = selected.includes(item.id);
                        return (
                            <TouchableOpacity
                                onPress={() => toggleHabit(item.id)}
                                className="flex-row items-center bg-white p-4 mb-3 rounded-2xl shadow-sm border border-slate-100"
                            >
                                <View className="bg-slate-50 w-10 h-10 rounded-full items-center justify-center mr-4">
                                    <Ionicons
                                        name={item.icon as any}
                                        size={20}
                                        color="#64748B"
                                    />
                                </View>
                                <Text className="text-lg font-semibold text-slate-700 flex-1">
                                    {item.title}
                                </Text>

                                {/* Circular Checkbox */}
                                <View className={clsx(
                                    "w-6 h-6 rounded-full border-2 items-center justify-center",
                                    isSelected
                                        ? "bg-[#4A90E2] border-[#4A90E2]"
                                        : "bg-transparent border-slate-300"
                                )}>
                                    {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            <TouchableOpacity
                onPress={() => router.push('/(onboarding)/paywall-mock')}
                className={clsx(
                    "w-full py-4 rounded-full items-center shadow-sm",
                    selected.length > 0 ? "bg-[#4A90E2]" : "bg-slate-200"
                )}
                disabled={selected.length === 0}
            >
                <Text className={clsx(
                    "text-lg font-bold",
                    selected.length > 0 ? "text-white" : "text-slate-400"
                )}>
                    Continue ({selected.length})
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
