import { View, Text, SectionList, Image, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitCard } from '../../components/HabitCard';
import { WaddleMascot } from '../../components/WaddleMascot';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useAppStore, Habit } from '../../store/useAppStore';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { getLocales } from 'expo-localization';
import CalendarItem from '../../components/CalendarItem';
import { useRouter } from 'expo-router';
import { AddHabitModal } from '../../components/AddHabitModal';

export default function DashboardScreen() {
    const habits = useAppStore(state => state.habits);
    const habitLogs = useAppStore(state => state.habitLogs);
    const toggleHabit = useAppStore(state => state.toggleHabit);
    const deleteHabit = useAppStore(state => state.deleteHabit);
    const addHabit = useAppStore(state => state.addHabit);
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();
    const [showAddModal, setShowAddModal] = useState(false);

    // Determine Logic
    const deviceLocales = getLocales();
    const currentLocale = deviceLocales[0]?.languageCode ?? 'en';
    const isArabic = currentLocale === 'ar';
    const dateLocale = isArabic ? ar : enUS;

    const toggleComplete = (id: string) => {
        toggleHabit(id, selectedDateStr);
    };

    // Generate Infinite Dates: Past 30 days + Next 335 days (Total 365)
    // Memoize the start date to ensure stable references
    const { dates: DATES, todayStr } = useMemo(() => {
        const _today = new Date();
        const _todayStr = format(_today, 'yyyy-MM-dd');

        const _dates = Array.from({ length: 365 }, (_, i) => {
            const d = new Date(_today);
            d.setDate(_today.getDate() - 30 + i);
            return {
                id: i.toString(),
                day: format(d, 'EEE', { locale: dateLocale }),
                date: d.getDate(),
                fullDateStr: format(d, 'yyyy-MM-dd'),
                dayIndex: d.getDay(), // 0=Sun, 1=Mon...
                fullDate: d,
                isToday: format(d, 'yyyy-MM-dd') === _todayStr
            };
        });
        return { dates: _dates, todayStr: _todayStr };
    }, [dateLocale]);

    // Initial State: Today's date string
    const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

    // Filter Logic: Get selected day index (0-6)
    const selectedDayObj = DATES.find(d => d.fullDateStr === selectedDateStr);
    const selectedDayIndex = selectedDayObj ? selectedDayObj.dayIndex : new Date().getDay();

    const sections = [
        {
            title: isArabic ? 'في أي وقت' : 'Anytime',
            data: habits.filter(h => h.time === 'Anytime' && (h.frequency ? h.frequency.includes(selectedDayIndex) : true))
        },
        {
            title: isArabic ? 'الصباح' : 'Morning',
            data: habits.filter(h => h.time === 'Morning' && (h.frequency ? h.frequency.includes(selectedDayIndex) : true))
        },
        {
            title: isArabic ? 'بعد الظهر' : 'Afternoon',
            data: habits.filter(h => h.time === 'Afternoon' && (h.frequency ? h.frequency.includes(selectedDayIndex) : true))
        },
        {
            title: isArabic ? 'المساء' : 'Evening',
            data: habits.filter(h => h.time === 'Evening' && (h.frequency ? h.frequency.includes(selectedDayIndex) : true))
        },
    ];

    // Find index of today to auto-scroll
    const TODAY_INDEX = 30;

    // Fallback scroll to ensure we land on today
    useEffect(() => {
        const timer = setTimeout(() => {
            if (flatListRef.current) {
                const ITEM_WIDTH = 64; // w-14 (56) + mx-1 (8)
                const SCREEN_WIDTH = Dimensions.get('window').width;
                // Calculate offset to center the item
                const offset = (TODAY_INDEX * ITEM_WIDTH) - (SCREEN_WIDTH / 2) + (ITEM_WIDTH / 2);

                flatListRef.current.scrollToOffset({ offset, animated: true });
            }
        }, 500); // 500ms delay to ensure layout is ready
        return () => clearTimeout(timer);
    }, []);

    const renderCalendarItem = useCallback(({ item }: { item: any }) => (
        <CalendarItem
            item={item}
            isSelected={item.fullDateStr === selectedDateStr}
            onPress={setSelectedDateStr}
        />
    ), [selectedDateStr]);

    const currentMonth = format(new Date(), 'MMM yyyy', { locale: dateLocale });

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>

            {/* Header: Title & Mascot */}
            <View className={clsx(
                "justify-between items-center px-6 pt-2 mb-2",
                isArabic ? "flex-row-reverse" : "flex-row"
            )}>
                <View className={clsx(isArabic ? "items-end" : "items-start")}>
                    <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">
                        {currentMonth}
                    </Text>
                    <Text className="text-3xl font-black text-slate-800">
                        {isArabic ? "اليوم" : "Today"}
                    </Text>
                </View>
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center overflow-hidden border border-blue-100">
                    <WaddleMascot size={32} mood="happy" />
                </View>
            </View>

            {/* Infinite Calendar Strip */}
            <View className="mb-6">
                <FlatList
                    ref={flatListRef}
                    data={DATES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCalendarItem}
                    extraData={selectedDateStr}
                    initialNumToRender={7}
                    windowSize={5}
                    maxToRenderPerBatch={5}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews={true}
                    getItemLayout={(data, index) => (
                        { length: 64, offset: 64 * index, index }
                    )}
                    onScrollToIndexFailed={(info) => {
                        console.warn("Scroll to index failed:", info);
                        // Fallback: retry scrolling after a small delay
                        setTimeout(() => {
                            const ITEM_WIDTH = 64;
                            const SCREEN_WIDTH = Dimensions.get('window').width;
                            const offset = (info.index * ITEM_WIDTH) - (SCREEN_WIDTH / 2) + (ITEM_WIDTH / 2);
                            flatListRef.current?.scrollToOffset({ offset, animated: true });
                        }, 500);
                    }}
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
                        isArabic ? "flex-row-reverse" : "flex-row"
                    )}>
                        <Text className="text-slate-500 font-bold uppercase text-xs tracking-widest px-2">
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
                        completed={habitLogs[item.id]?.includes(selectedDateStr) ?? false}
                        onToggle={() => toggleComplete(item.id)}
                        onDelete={() => deleteHabit(item.id)}
                        isRTL={isArabic}
                    />
                )}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20 opacity-80">
                        <WaddleMascot size={120} mood="happy" />
                        <Text className="text-slate-400 font-bold text-lg mt-4 text-center px-10">
                            {isArabic
                                ? "يا هلا! ما عندك عادات لهذا اليوم.. اضف عادة جديدة عشان نبدأ! 🐧"
                                : "No habits for today! Start by adding a new one. 🐧"}
                        </Text>
                    </View>
                }
            />

            {/* Floating Add Habit Button */}
            <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
                style={{ elevation: 8 }}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* Add Habit Modal */}
            <AddHabitModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={(habitData) => {
                    const newHabit: Habit = {
                        id: Date.now().toString(),
                        title: habitData.title,
                        icon: habitData.icon,
                        time: habitData.time,
                        streak: 0,
                        completed: false,
                        frequency: habitData.frequency
                    };
                    addHabit(newHabit);
                }}
            />
        </SafeAreaView>
    );
}
