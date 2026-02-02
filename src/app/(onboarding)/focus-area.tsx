import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';

const FOCUS_AREAS = [
    { id: 'health', title: 'Health & Fitness', icon: 'fitness-outline' },
    { id: 'work', title: 'Deep Work', icon: 'briefcase-outline' },
    { id: 'mindfulness', title: 'Mindfulness', icon: 'leaf-outline' },
    { id: 'sleep', title: 'Better Sleep', icon: 'moon-outline' },
    { id: 'learning', title: 'Learning', icon: 'book-outline' },
    { id: 'social', title: 'Social', icon: 'people-outline' },
];

export default function FocusAreaScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);

    const toggleSelection = (id: string) => {
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
                    What brings you here today?
                </Text>
                <Text className="text-lg text-slate-500 mb-8">
                    Select all that apply.
                </Text>

                <View className="flex-row flex-wrap justify-between">
                    {FOCUS_AREAS.map((item) => {
                        const isSelected = selected.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => toggleSelection(item.id)}
                                className={clsx(
                                    "w-[48%] aspect-square rounded-2xl mb-4 p-4 items-center justify-center shadow-sm border-2",
                                    isSelected
                                        ? "bg-blue-50 border-[#4A90E2]"
                                        : "bg-slate-50 border-transparent"
                                )}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={40}
                                    color={isSelected ? "#4A90E2" : "#94A3B8"}
                                    style={{ marginBottom: 12 }}
                                />
                                <Text className={clsx(
                                    "text-base font-semibold text-center",
                                    isSelected ? "text-[#4A90E2]" : "text-slate-600"
                                )}>
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <TouchableOpacity
                onPress={() => router.push('/(onboarding)/choose-habits')}
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
                    Continue
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
