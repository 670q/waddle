import { View, Text, SectionList, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitCard } from '../../components/HabitCard';
import { WaddleMascot } from '../../components/WaddleMascot';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';

// Mock Data
const INITIAL_HABITS = [
    { id: '1', title: 'Drink Water', icon: 'water-outline', time: 'Morning', streak: 12, completed: false },
    { id: '2', title: 'Meditate', icon: 'leaf-outline', time: 'Morning', streak: 5, completed: true },
    { id: '3', title: 'Deep Work', icon: 'briefcase-outline', time: 'Afternoon', streak: 3, completed: false },
    { id: '4', title: 'No Sugar', icon: 'nutrition-outline', time: 'Afternoon', streak: 8, completed: false },
    { id: '5', title: 'Journal', icon: 'pencil-outline', time: 'Evening', streak: 45, completed: false },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardScreen() {
    const [habits, setHabits] = useState(INITIAL_HABITS);
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const toggleComplete = (id: string) => {
        setHabits(current =>
            current.map(h =>
                h.id === id ? { ...h, completed: !h.completed } : h
            )
        );
    };

    const sections = [
        { title: 'Morning', data: habits.filter(h => h.time === 'Morning') },
        { title: 'Afternoon', data: habits.filter(h => h.time === 'Afternoon') },
        { title: 'Evening', data: habits.filter(h => h.time === 'Evening') },
    ];

    // Generate week days (Scrollable Range: Past 3 days + Next 10 days)
    const today = new Date();
    const currentDay = today.getDate();
    const weekDays = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - 3 + i); // Start 3 days ago
        return {
            day: DAYS[d.getDay()], // "Sun", "Mon"
            date: d.getDate(),
            isToday: d.getDate() === currentDay
        };
    });

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>

            {/* Header: Title & Mascot */}
            <View className="flex-row justify-between items-center px-6 pt-2 mb-2">
                <View>
                    <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Feb 2026</Text>
                    <Text className="text-3xl font-black text-slate-800">Today</Text>
                </View>
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center overflow-hidden border border-blue-100">
                    <WaddleMascot size={32} mood="happy" />
                </View>
            </View>

            {/* Horizontal Calendar Strip (Capsule Style) - Scrollable */}
            <View className="mb-6">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    className="flex-row"
                >
                    {weekDays.map((d, index) => {
                        const isSelected = d.date === selectedDate;
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedDate(d.date)}
                                className={clsx(
                                    "items-center justify-center w-14 h-20 rounded-[28px] mr-2",
                                    isSelected ? "bg-[#1E293B]" : "bg-transparent"
                                )}
                            >
                                <Text className={clsx(
                                    "text-[10px] font-bold uppercase mb-1",
                                    isSelected ? "text-white" : "text-slate-400"
                                )}>
                                    {d.day.toUpperCase()}
                                </Text>
                                <Text className={clsx(
                                    "text-xl font-black",
                                    isSelected ? "text-white" : "text-slate-400"
                                )}>
                                    {d.date}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>

            {/* List */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
                renderSectionHeader={({ section: { title } }) => (
                    <View className="mb-3 mt-4 flex-row items-center">
                        <Text className="text-slate-500 font-bold uppercase text-xs tracking-widest pl-1">
                            {title}
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <HabitCard
                        title={item.title}
                        icon={item.icon}
                        time={item.time}
                        streak={item.streak}
                        completed={item.completed}
                        onToggle={() => toggleComplete(item.id)}
                    />
                )}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
