import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

// Keys match src/i18n/index.ts
const SUGGESTED_HABITS = [
    { id: '1', i18nKey: 'habits.drink_water', icon: 'water-outline' },
    { id: '2', i18nKey: 'habits.read', icon: 'book-outline' },
    { id: '3', i18nKey: 'habits.meditate', icon: 'leaf-outline' },
    { id: '4', i18nKey: 'habits.walk', icon: 'walk-outline' },
    { id: '5', i18nKey: 'habits.no_sugar', icon: 'nutrition-outline' },
    { id: '6', i18nKey: 'habits.sleep', icon: 'moon-outline' },
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
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="flex-1">
                <View className="px-6 pt-6">
                    <Text className="text-3xl font-bold text-slate-800 mb-2">
                        {i18n.t('onboarding_habits.title')}
                    </Text>
                    <Text className="text-lg text-slate-500 mb-4">
                        {i18n.t('onboarding_habits.subtitle')}
                    </Text>
                </View>

                <FlatList
                    data={SUGGESTED_HABITS}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 200, paddingTop: 24 }}
                    showsVerticalScrollIndicator={true}
                    renderItem={({ item }) => {
                        const isSelected = selected.includes(item.id);
                        return (
                            <TouchableOpacity
                                onPress={() => toggleHabit(item.id)}
                                className={clsx(
                                    "bg-white p-6 rounded-[32px] items-center justify-between shadow-lg border mb-5 w-full flex-row",
                                    isSelected ? "border-[#4A90E2] bg-blue-50" : "border-slate-100"
                                )}
                                style={{ height: 120, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className={clsx(
                                        "w-20 h-20 rounded-[28px] items-center justify-center mr-6",
                                        isSelected ? "bg-blue-100" : "bg-[#F1F5F9]"
                                    )}>
                                        <Ionicons
                                            name={item.icon as any}
                                            size={36}
                                            color={isSelected ? "#4A90E2" : "#334155"}
                                        />
                                    </View>
                                    <Text className={clsx(
                                        "text-2xl font-black flex-1 mr-2",
                                        isSelected ? "text-[#4A90E2]" : "text-slate-800"
                                    )} numberOfLines={2}>
                                        {i18n.t(item.i18nKey)}
                                    </Text>
                                </View>

                                {/* Circular Checkbox */}
                                <View className={clsx(
                                    "w-8 h-8 rounded-full border-2 items-center justify-center",
                                    isSelected
                                        ? "bg-[#4A90E2] border-[#4A90E2]"
                                        : "bg-transparent border-slate-300"
                                )}>
                                    {isSelected && <Ionicons name="checkmark" size={18} color="white" />}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            <View className="absolute bottom-10 left-0 right-0 px-6">
                <TouchableOpacity
                    onPress={async () => {
                        const { addHabit } = useAppStore.getState();

                        // Add selected habits
                        for (const id of selected) {
                            const habitData = SUGGESTED_HABITS.find(h => h.id === id);
                            if (habitData) {
                                await addHabit({
                                    id: `onboarding-${id}-${Date.now()}`,
                                    title: i18n.t(habitData.i18nKey),
                                    icon: habitData.icon,
                                    time: 'Anytime',
                                    streak: 0,
                                    completed: false,
                                    frequency: [0, 1, 2, 3, 4, 5, 6] // Daily
                                });
                            }
                        }

                        router.push('/(onboarding)/paywall-mock');
                    }}
                    className={clsx(
                        "w-full py-5 rounded-full items-center shadow-xl",
                        selected.length > 0 ? "bg-[#4A90E2]" : "bg-slate-200"
                    )}
                    disabled={selected.length === 0}
                >
                    <Text className={clsx(
                        "text-xl font-bold",
                        selected.length > 0 ? "text-white" : "text-slate-400"
                    )}>
                        {i18n.t('onboarding_habits.continue')} ({selected.length})
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
