import { View, Text, SectionList, Image, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitCard } from '../../components/HabitCard';
import { WaddleMascot } from '../../components/WaddleMascot';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useAppStore } from '../../store/useAppStore';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardScreen() {
    const habits = useAppStore(state => state.habits);
    const toggleHabit = useAppStore(state => state.toggleHabit);
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const toggleComplete = (id: string) => {
        toggleHabit(id);
    };

    const sections = [
        { title: 'Morning', data: habits.filter(h => h.time === 'Morning') },
        { title: 'Afternoon', data: habits.filter(h => h.time === 'Afternoon') },
        { title: 'Evening', data: habits.filter(h => h.time === 'Evening') },
    ];

    // Generate Infinite Dates: Past 30 days + Next 335 days (Total 365)
    const today = new Date();
    const currentDay = today.getDate();
    // Start from -30 days
    const DATES = Array.from({ length: 365 }, (_, i) => {
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
                    contentContainerStyle={{ paddingHorizontal: 16 }}
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
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
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
