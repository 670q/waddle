import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { WaddleMascot } from '../../components/WaddleMascot';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import i18n, { isRTL } from '../../i18n';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
    const router = useRouter();
    const habits = useAppStore(s => s.habits);
    const habitLogs = useAppStore(s => s.habitLogs);

    // 1. Calculate Real Stats based on TODAY
    const todayStr = new Date().toISOString().split('T')[0];
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => habitLogs[h.id]?.includes(todayStr)).length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    // Average streak of active habits
    const avgStreak = totalHabits > 0
        ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / totalHabits)
        : 0;

    // 2. Real Stats Calculation (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const weeklyData = last7Days.map(dateStr => {
        if (totalHabits === 0) return 0;
        const completedCount = habits.filter(h => habitLogs[h.id]?.includes(dateStr)).length;
        return Math.round((completedCount / totalHabits) * 100);
    });

    const days = isRTL
        ? ['الجمعة', 'الخميس', 'الأربعاء', 'الثلاثاء', 'الأثنين', 'الأحد', 'السبت'] // NOTE: specific day names might not align with `last7Days` without dynamic mapping. kept simple for now. 
        : last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' }));


    // Determine Mascot Mood based on performance
    const mascotMood = completionRate >= 80 ? 'happy' : completionRate >= 40 ? 'focused' : 'idle';

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                {/* Header Section */}
                <View className={clsx(
                    "px-6 pt-2 pb-6 flex-row items-center justify-between",
                    isRTL ? "flex-row-reverse" : "flex-row"
                )}>
                    <View className="flex-1">
                        <Text className={clsx(
                            "text-3xl font-black text-slate-800",
                            isRTL ? "text-right" : "text-left"
                        )}>
                            {i18n.t('stats.title')}
                        </Text>
                        <Text className={clsx(
                            "text-slate-500 font-medium mt-1",
                            isRTL ? "text-right" : "text-left"
                        )}>
                            {completionRate >= 100 ? "🎉 Perfect score!" : i18n.t('stats.streak_sub')}
                        </Text>
                    </View>

                    <View className={clsx("flex-row items-center gap-3", isRTL ? "flex-row-reverse" : "flex-row")}>
                        <TouchableOpacity
                            onPress={() => router.push('/settings')}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100 shadow-sm"
                        >
                            <Ionicons name="settings-outline" size={24} color="#64748B" />
                        </TouchableOpacity>

                        <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center border-2 border-white shadow-sm">
                            <WaddleMascot size={40} mood={mascotMood} />
                        </View>
                    </View>
                </View>

                {/* Summary Cards Row */}
                <View className={clsx(
                    "px-6 flex-row flex-wrap justify-between mb-8",
                    isRTL ? "flex-row-reverse" : "flex-row"
                )}>
                    {/* Completion Rate */}
                    <View className="bg-white p-4 rounded-3xl w-[48%] shadow-sm border border-slate-100 mb-4 items-center justify-center aspect-[1.4]">
                        <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="pie-chart" size={20} color="#10B981" />
                        </View>
                        <Text className="text-3xl font-black text-slate-800">{completionRate}%</Text>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider text-center">
                            Completion
                        </Text>
                    </View>

                    {/* Current Streak (Avg) */}
                    <View className="bg-white p-4 rounded-3xl w-[48%] shadow-sm border border-slate-100 mb-4 items-center justify-center aspect-[1.4]">
                        <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="flame" size={20} color="#F59E0B" />
                        </View>
                        <Text className="text-3xl font-black text-slate-800">{avgStreak}</Text>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider text-center">
                            {i18n.t('habits.streak')}
                        </Text>
                    </View>
                </View>

                {/* Weekly Chart - Scrollable & Interactive */}
                <View className="mx-6 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-8">
                    <View className={clsx("flex-row items-center justify-between mb-6", isRTL ? "flex-row-reverse" : "flex-row")}>
                        <Text className="text-lg font-bold text-slate-800">{i18n.t('stats.heatmap')}</Text>
                        <View className="bg-slate-100 px-3 py-1 rounded-full">
                            <Text className="text-xs font-bold text-slate-500">Last 30 Days</Text>
                        </View>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 10, alignItems: 'flex-end' }}
                        className="h-40"
                    >
                        {/* Real 30-Day Heatmap */}
                        {Array.from({ length: 30 }).map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() - (29 - i));
                            const dateStr = d.toISOString().split('T')[0];
                            // Calc daily completion
                            const count = habits.filter(h => habitLogs[h.id]?.includes(dateStr)).length;
                            const dailyRate = totalHabits > 0 ? (count / totalHabits) * 100 : 0;
                            const isToday = i === 29;

                            return (
                                <View key={i} className="items-center mr-3 ml-1">
                                    <View
                                        className={clsx(
                                            "w-6 rounded-full",
                                            isToday ? "bg-[#4A90E2]" : "bg-slate-100" // Use blue for today, grey for others
                                        )}
                                        style={{
                                            height: `${Math.max(dailyRate, 15)}%`, // Min height 15%
                                            width: 12,
                                            backgroundColor: dailyRate > 0 ? (isToday ? '#4A90E2' : '#CBD5E1') : '#F1F5F9' // Darker grey if active
                                        }}
                                    />
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Detailed Habit Stats */}
                <View className="px-6">
                    <Text className={clsx(
                        "text-lg font-bold text-slate-800 mb-4",
                        isRTL ? "text-right" : "text-left"
                    )}>
                        Habit Insights
                    </Text>

                    {habits.map((habit) => (
                        <View key={habit.id} className={clsx(
                            "bg-white p-5 rounded-3xl mb-4 border border-slate-100 shadow-sm flex-row items-center",
                            isRTL ? "flex-row-reverse" : "flex-row"
                        )}>
                            <View className={clsx(
                                "w-12 h-12 rounded-2xl items-center justify-center mr-4",
                                habitLogs[habit.id]?.includes(todayStr) ? "bg-green-100" : "bg-blue-50",
                                isRTL ? "ml-4 mr-0" : "mr-4 ml-0"
                            )}>
                                <Ionicons
                                    name={habit.icon as any}
                                    size={24}
                                    color={habitLogs[habit.id]?.includes(todayStr) ? "#10B981" : "#4A90E2"}
                                />
                            </View>

                            <View className="flex-1">
                                <Text className={clsx(
                                    "text-base font-bold text-slate-800",
                                    isRTL ? "text-right" : "text-left"
                                )}>
                                    {habit.title}
                                </Text>
                                <View className={clsx("flex-row items-center mt-1", isRTL ? "justify-end" : "justify-start")}>
                                    <Ionicons name="flame" size={14} color="#F59E0B" />
                                    <Text className="text-xs font-bold text-slate-400 mx-1">
                                        {habit.streak} {i18n.t('habits.days')} streak
                                    </Text>
                                </View>
                            </View>

                            <View className="w-12 h-12 rounded-full border-4 border-slate-50 items-center justify-center">
                                <Text className="text-xs font-black text-slate-300">
                                    {habitLogs[habit.id]?.includes(todayStr) ? "100" : "0"}%
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
