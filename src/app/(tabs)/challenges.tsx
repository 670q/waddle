import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { WaddleMascot } from '../../components/WaddleMascot';

const CHALLENGES = [
    {
        id: '1',
        title: 'Musical Mashup Challenge',
        joinedCount: 10,
        timeLeft: '01:34:09',
        color: 'bg-slate-800',
        joined: false,
    },
    {
        id: '2',
        title: 'No Sugar 7-Day Sprint',
        joinedCount: 42,
        timeLeft: '04:12:00',
        color: 'bg-[#4A90E2]',
        joined: true,
    }
];

export default function ChallengesScreen() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Header */}
                <View className="mb-6 flex-row justify-between items-center">
                    <Text className="text-3xl font-bold text-slate-800">Challenges</Text>
                    <View className="bg-orange-100 px-3 py-1 rounded-full">
                        <Text className="text-orange-500 font-bold text-xs uppercase">Live Now</Text>
                    </View>
                </View>

                {CHALLENGES.map((challenge) => (
                    <View
                        key={challenge.id}
                        className={clsx(
                            "rounded-3xl p-6 mb-6 shadow-lg relative overflow-hidden",
                            challenge.color
                        )}
                        style={{ height: 200 }}
                    >
                        {/* Challenge Tag */}
                        <Text className="text-white/60 font-bold text-xs uppercase tracking-widest mb-2">
                            Real-Time 7-Day Challenge
                        </Text>

                        {/* Title */}
                        <Text className="text-3xl font-black text-white w-3/4 mb-4 leading-none tracking-tight">
                            {challenge.title}
                        </Text>

                        {/* Mascot/Image (Absolute Positioned) */}
                        <View className="absolute right-[-20] top-10 opacity-90">
                            <WaddleMascot size={140} mood="happy" />
                        </View>

                        {/* Bottom Row */}
                        <View className="absolute bottom-6 left-6 right-6 flex-row items-center justify-between">
                            {/* Join Button */}
                            <TouchableOpacity className={clsx(
                                "padding-horizontal-4 py-2 rounded-full items-center px-6",
                                challenge.joined ? "bg-white/20" : "bg-[#FCD34D]"
                            )}>
                                <Text className={clsx(
                                    "font-bold",
                                    challenge.joined ? "text-white" : "text-slate-900"
                                )}>
                                    {challenge.joined ? "Joined" : "Join Now"}
                                </Text>
                            </TouchableOpacity>

                            {/* Stats */}
                            <View>
                                <View className="flex-row items-center justify-end mb-1">
                                    <Ionicons name="people" size={12} color="white" style={{ opacity: 0.8, marginRight: 4 }} />
                                    <Text className="text-white font-bold text-xs">{challenge.joinedCount} joined</Text>
                                </View>
                                <Text className="text-white/80 font-mono text-xs text-right">
                                    Ends in {challenge.timeLeft}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}

                {/* Coming Soon */}
                <View className="items-center mt-8">
                    <Text className="text-slate-400 font-medium">New challenges drop every Monday.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
