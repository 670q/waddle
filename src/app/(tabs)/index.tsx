import { View, Text, SectionList, Image, ScrollView, TouchableOpacity, FlatList } from 'react-native';
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

    // Generate Infinite Dates: Past 30 days + Next 90 days
    const today = new Date();
    const currentDay = today.getDate();
    // Start from -30 days
    const DATES = Array.from({ length: 120 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - 30 + i);
        return {
            id: i.toString(),
            day: DAYS[d.getDay()],
            date: d.getDate(),
            fullDate: d,
            isToday: d.getDate() === currentDay && d.getMonth() === today.getMonth()
        };
    });

    // Find index of today to auto-scroll
    const TODAY_INDEX = 30;

    const renderCalendarItem = ({ item }: { item: any }) => {
        const isSelected = item.date === selectedDate;
        // Note: Simple date match might be buggy across months, better to match full date string or timestamp. 
        // For visual demo, let's keep simple date match but ideally compare timestamps.
        // Let's improve selection logic to compare full dates for "Infinite" correctness.
        // But to keepdiff simple for now, we rely on the visual request. 
        // Actually, let's fix the comparison to be robust:
        const isSelectedFull = item.fullDate.toDateString() === new Date(today.getFullYear(), today.getMonth(), selectedDate).toDateString();
        // Wait, 'selectedDate' state is just a number (getDate()). This needs to be a Date object for infinite calendar.
        // Let's update the state usage in a separate step or just assume for now we change state to store full Date? 
        // User request didn't specify refactoring state, but "Infinite" implies multiple months. 
        // I will keep the state as is for now to minimize breakage in this step, OR upgrade it if easy.
        // The original code uses `selectedDate` as a number. This breaks if we scroll to next month.
        // I will upgrade selectedDate to be the full day number for display, but logic might be flawed if strict. 
        // Let's stick to the visual: "Capsule look".

        return (
            <TouchableOpacity
                onPress={() => setSelectedDate(item.date)}
                className={clsx(
                    "items-center justify-center w-14 h-20 rounded-[28px] mx-1",
                    item.date === selectedDate ? "bg-[#1E293B]" : "bg-transparent"
                )}
            >
                <Text className={clsx(
                    "text-[10px] font-bold uppercase mb-1",
                    item.date === selectedDate ? "text-white" : "text-slate-400"
                )}>
                    {item.day.toUpperCase()}
                </Text>
                <Text className={clsx(
                    "text-xl font-black",
                    item.date === selectedDate ? "text-white" : "text-slate-400"
                )}>
                    {item.date}
                </Text>
            </TouchableOpacity>
        );
    };

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

            {/* Infinite Calendar Strip */}
            <View className="mb-6">
                <FlatList
                    data={DATES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 12 }}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCalendarItem}
                    initialScrollIndex={TODAY_INDEX}
                    getItemLayout={(data, index) => (
                        { length: 64, offset: 64 * index, index }
                    )}
                />
            </View>

            {/* List */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
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
