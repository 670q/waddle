import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WaddleMascot } from './WaddleMascot';
import i18n, { isRTL } from '../i18n';
import clsx from 'clsx';

interface MaintenanceScreenProps {
    message?: string;
}

export function MaintenanceScreen({ message }: MaintenanceScreenProps) {
    return (
        <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center px-8">
            {/* Animated Background */}
            <View className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-slate-900 opacity-50" />

            {/* Content */}
            <View className="items-center z-10">
                {/* Mascot */}
                <View className="w-32 h-32 bg-white/10 rounded-full items-center justify-center mb-8 border border-white/20">
                    <WaddleMascot size={80} mood="idle" />
                </View>

                {/* Title */}
                <Text className="text-3xl font-black text-white text-center mb-4">
                    {isRTL ? "التطبيق تحت الصيانة 🛠️" : "Under Maintenance 🛠️"}
                </Text>

                {/* Message */}
                <Text className={clsx(
                    "text-white/70 text-center text-lg leading-7",
                    isRTL ? "text-right" : "text-left"
                )}>
                    {message || (isRTL
                        ? "نحن نعمل على تحسين التطبيق! عد قريباً 🐧"
                        : "We're making Waddle even better! Be back soon 🐧"
                    )}
                </Text>

                {/* Fun Animation */}
                <View className="mt-12 flex-row items-center gap-2">
                    <View className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse" />
                    <View className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse delay-100" />
                    <View className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse delay-200" />
                </View>
            </View>
        </SafeAreaView>
    );
}
