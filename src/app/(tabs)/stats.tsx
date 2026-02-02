import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Mock Data for Heatmap
const MOCK_HEATMAP = Array.from({ length: 90 }, () => Math.floor(Math.random() * 4));

export default function StatsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text className="text-3xl font-bold text-slate-800 mb-6">Your Progress</Text>

                {/* Main Streak Card */}
                <View className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 mb-8 items-center">
                    <View className="w-20 h-20 bg-orange-50 rounded-full items-center justify-center mb-4">
                        <Ionicons name="flame" size={48} color="#FF9F43" />
                    </View>
                    <Text className="text-5xl font-black text-slate-800">5</Text>
                    <Text className="text-[#FF9F43] font-bold uppercase tracking-widest text-sm mt-1">Day Streak! Keep waddling!</Text>
                </View>

                {/* Heatmap Section */}
                <View className="bg-white p-6 rounded-3xl shadow-sm mb-8">
                    <Text className="text-lg font-bold text-slate-700 mb-4">Consistency Heatmap</Text>
                    <View className="flex-row flex-wrap gap-1">
                        {MOCK_HEATMAP.map((level, index) => (
                            <View
                                key={index}
                                className={`w-3 h-3 rounded-sm ${level === 0 ? 'bg-slate-100' :
                                        level === 1 ? 'bg-blue-200' :
                                            level === 2 ? 'bg-blue-400' :
                                                'bg-[#4A90E2]'
                                    }`}
                            />
                        ))}
                    </View>
                </View>

                {/* Grid Stats */}
                <View className="flex-row flex-wrap justify-between">
                    <View className="w-[48%] bg-white p-5 rounded-2xl mb-4 shadow-sm">
                        <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Total Habits</Text>
                        <Text className="text-2xl font-bold text-slate-800">14</Text>
                    </View>
                    <View className="w-[48%] bg-white p-5 rounded-2xl mb-4 shadow-sm">
                        <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Perfect Days</Text>
                        <Text className="text-2xl font-bold text-slate-800">3</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
