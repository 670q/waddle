import { View, Text, SectionList, Image, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitCard } from '../../components/HabitCard';
import { WaddleMascot } from '../../components/WaddleMascot';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useAppStore } from '../../store/useAppStore';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import i18n, { isRTL } from '../../i18n';

export default function DashboardScreen() {
    const habits = useAppStore(state => state.habits);
    const toggleHabit = useAppStore(state => state.toggleHabit);
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const toggleComplete = (id: string) => {
        toggleHabit(id);
    };

    const sections = [
        { title: i18n.t('dashboard.morning'), data: habits.filter(h => h.time === 'Morning') },
        { title: i18n.t('dashboard.afternoon'), data: habits.filter(h => h.time === 'Afternoon') },
        { title: i18n.t('dashboard.evening'), data: habits.filter(h => h.time === 'Evening') },
    ];

    // Determine current locale for dates
    const currentDateLocale = i18n.locale.startsWith('ar') ? ar : enUS;

    // Generate Infinite Dates: Past 30 days + Next 335 days (Total 365)
    const today = new Date();
    const currentDay = today.getDate();
    // Start from -30 days
    const DATES = Array.from({ length: 365 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - 30 + i);
        return {
            id: i.toString(),
            day: format(d, 'EEE', { locale: currentDateLocale }), // Dynamic Day
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
                    {item.day}
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

    const currentMonth = format(new Date(), 'MMM yyyy', { locale: currentDateLocale });

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>

            {/* Header: Title & Mascot (Dynamic RTL) */}
            <View className={clsx(
                "justify-between items-center px-6 pt-2 mb-2",
                isRTL ? "flex-row-reverse" : "flex-row"
            )}>
                <View className={isRTL ? "items-end" : "items-start"}>
                    <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">
                        {currentMonth}
                    </Text>
                    <Text className="text-3xl font-black text-slate-800">{i18n.t('dashboard.title')}</Text>
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
                    inverted={isRTL} // Dynamic RTL Scrolling
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
                    <View className={clsx(
                        "mb-3 mt-4 items-center",
                        isRTL ? "flex-row-reverse" : "flex-row"
                    )}>
                        <Text className="text-slate-500 font-bold uppercase text-xs tracking-widest px-2">
                            {title}
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <HabitCard
                        title={item.title} // Should ideally translate habitual titles too if they are static ones
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
