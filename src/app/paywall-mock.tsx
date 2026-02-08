import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import clsx from 'clsx';
import { WaddleMascot } from '../components/WaddleMascot';
import i18n, { isRTL } from '../i18n';

export default function PaywallScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-slate-900">
            {/* Background Gradient Effect */}
            <View className="absolute top-0 left-0 right-0 h-1/2 bg-indigo-900 opacity-50 rounded-b-full scale-x-150" />

            <SafeAreaView className="flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View className="items-center pt-8 pb-6">
                        <View className="w-24 h-24 bg-white/10 rounded-full items-center justify-center mb-6 border border-white/20 shadow-lg backdrop-blur-md">
                            <WaddleMascot size={60} mood="happy" />
                        </View>
                        <Text className="text-3xl font-black text-white text-center px-8 mb-2">
                            {i18n.t('paywall.title')}
                        </Text>
                        <Text className="text-indigo-200 text-center px-10 font-medium">
                            {i18n.t('paywall.subtitle', { defaultValue: "Choose the plan that fits your waddle." })}
                        </Text>
                    </View>

                    {/* Features List */}
                    <View className="px-8 mt-4 space-y-4">
                        {[
                            { icon: 'infinite', text: i18n.t('paywall.f1') },
                            { icon: 'stats-chart', text: i18n.t('paywall.f2') },
                            { icon: 'cloud-upload', text: i18n.t('paywall.f3') },
                            { icon: 'color-palette', text: i18n.t('paywall.f4') },
                            { icon: 'headset', text: i18n.t('paywall.f5') },
                        ].map((feature, idx) => (
                            <View key={idx} className={clsx("flex-row items-center", isRTL ? "flex-row-reverse" : "flex-row")}>
                                <View className="w-8 h-8 rounded-full bg-indigo-500/20 items-center justify-center">
                                    <Ionicons name={feature.icon as any} size={16} color="#818CF8" />
                                </View>
                                <Text className={clsx("text-white font-medium text-lg mx-4", isRTL ? "text-right" : "text-left")}>
                                    {feature.text}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Pricing Card */}
                    <View className="mx-6 mt-10 bg-white rounded-3xl p-6 shadow-xl">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="bg-indigo-100 px-3 py-1 rounded-full">
                                <Text className="text-indigo-600 font-bold text-xs uppercase tracking-wide">Most Popular</Text>
                            </View>
                        </View>

                        <Text className="text-slate-900 text-2xl font-bold mb-1">
                            {i18n.t('paywall.trial')}
                        </Text>
                        <Text className="text-slate-500 text-sm mb-6">
                            {i18n.t('paywall.then')}
                        </Text>

                        <TouchableOpacity
                            className="bg-indigo-600 py-4 rounded-xl items-center shadow-lg active:bg-indigo-700"
                            onPress={() => router.back()} // Mock action: go back
                        >
                            <Text className="text-white font-bold text-lg">
                                {i18n.t('paywall.btn')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.back()} className="mt-4 py-2 items-center">
                            <Text className="text-slate-400 font-medium text-sm">
                                {i18n.t('paywall.no_thanks')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-white/30 text-xs text-center mt-8 px-10">
                        {isRTL ? "الدفع سيتم عن طريق حساب آبل الخاص بك." : "Payment will be charged to your Apple ID account at confirmation of purchase."}
                    </Text>

                </ScrollView>

                {/* Close Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className={clsx(
                        "absolute top-12 p-2 bg-black/20 rounded-full backdrop-blur-md",
                        isRTL ? "left-6" : "right-6"
                    )}
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
}
