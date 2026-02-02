import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { WaddleMascot } from '../components/WaddleMascot';
import clsx from 'clsx';
import * as Haptics from 'expo-haptics';

export default function AIBlueprintScreen() {
    const router = useRouter();
    const activeBlueprint = useAppStore(state => state.activeBlueprint);
    const addHabit = useAppStore(state => state.addHabit);

    if (!activeBlueprint) {
        // Fallback if accessed directly without data
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
                <Text>No Blueprint Selected</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 p-4">
                    <Text className="text-blue-500">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleAccept = () => {
        // Add to Store
        addHabit({
            id: Date.now().toString(),
            title: activeBlueprint.title,
            icon: activeBlueprint.icon,
            time: activeBlueprint.time.split(' ')[0], // Simple parse for now
            streak: 0,
            completed: false
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Navigate to Dashboard (index)
        router.push('/(tabs)');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={16} color="#FCD34D" />
                    <Text className="text-slate-400 font-bold uppercase tracking-widest ml-2 text-xs">
                        AI HABIT ARCHITECT
                    </Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Hero Icon */}
                <View className="items-center mt-6 mb-8">
                    <View className="w-24 h-24 bg-slate-800 rounded-[32px] items-center justify-center shadow-lg border border-slate-700 mb-6">
                        <Ionicons name={activeBlueprint.icon as any} size={48} color="#FCD34D" />
                    </View>
                    <Text className="text-3xl font-black text-white text-center mb-2 leading-tight">
                        {activeBlueprint.title}
                    </Text>
                    <Text className="text-slate-400 text-center text-lg px-4">
                        {activeBlueprint.description}
                    </Text>
                </View>

                {/* AI Insight Card */}
                <View className="bg-slate-800 p-6 rounded-3xl border border-slate-700 mb-8 relative overflow-hidden">
                    <View className="flex-row items-start">
                        <View className="w-12 h-12 bg-blue-500/20 rounded-full items-center justify-center mr-4">
                            <WaddleMascot size={32} mood="focused" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-lg mb-1">Coach's Insight</Text>
                            <Text className="text-slate-300 leading-6">
                                "Building this habit will improve your overall system. I've scheduled it for <Text className="text-[#FCD34D] font-bold">{activeBlueprint.time}</Text> to match your natural rhythm."
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Plan Details Grid */}
                <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
                    <DetailItem label="Frequency" value={activeBlueprint.frequency} icon="calendar" />
                    <DetailItem label="Duration" value={activeBlueprint.duration} icon="timer" />
                    <DetailItem label="Time" value={activeBlueprint.time} icon="time" />
                    <DetailItem label="Intensity" value="Medium" icon="bar-chart" />
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View className="p-6 bg-slate-900 border-t border-slate-800">
                <TouchableOpacity
                    onPress={handleAccept}
                    className="w-full bg-[#FCD34D] h-16 rounded-full items-center justify-center shadow-lg active:opacity-90"
                >
                    <Text className="text-slate-900 font-bold text-lg uppercase tracking-wide">
                        Accept & Add to Dashboard
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

function DetailItem({ label, value, icon }: { label: string, value: string, icon: string }) {
    return (
        <View className="w-[48%] bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <Ionicons name={icon as any} size={20} color="#94A3B8" className="mb-2" />
            <Text className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">{label}</Text>
            <Text className="text-white font-bold text-base">{value}</Text>
        </View>
    );
}
