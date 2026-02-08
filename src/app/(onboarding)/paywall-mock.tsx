import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../i18n';

export default function PaywallMockScreen() {
    const router = useRouter();
    const setHasFinishedOnboarding = useAppStore(s => s.setHasFinishedOnboarding);

    const handleComplete = () => {
        router.push('/(onboarding)/auth');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Header */}
                <View className="items-center mb-8 mt-4">
                    <Image
                        source={{ uri: 'https://placehold.co/400x400/png?text=Waddle+Pro' }}
                        className="w-32 h-32 mb-4 rounded-full"
                        resizeMode="contain"
                    />
                    <Text className="text-3xl font-bold text-slate-800 text-center mt-4 px-4">
                        {i18n.t('paywall.title')}
                    </Text>
                </View>

                {/* Comparison Card */}
                <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8">
                    {[
                        i18n.t('paywall.f1'),
                        i18n.t('paywall.f2'),
                        i18n.t('paywall.f3'),
                        i18n.t('paywall.f4'),
                        i18n.t('paywall.f5')
                    ].map((feature, index) => (
                        <View key={index} className="flex-row items-center py-3 border-b border-slate-50 last:border-0">
                            <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-4">
                                <Ionicons name="checkmark" size={18} color="#FF9F43" />
                            </View>
                            <Text className="text-slate-700 font-bold text-lg">{feature}</Text>
                        </View>
                    ))}
                </View>

                {/* Offer */}
                <View className="bg-[#FF9F43] p-6 rounded-2xl items-center mb-6 shadow-lg shadow-orange-200">
                    <Text className="text-white font-black text-xl mb-1 uppercase tracking-wide">{i18n.t('paywall.trial')}</Text>
                    <Text className="text-white text-base opacity-90">{i18n.t('paywall.then')}</Text>
                </View>

            </ScrollView>

            {/* Sticky Bottom Actions */}
            <View className="absolute bottom-10 left-6 right-6 gap-4">
                <TouchableOpacity
                    onPress={handleComplete}
                    className="w-full bg-[#FF9F43] py-4 rounded-full items-center shadow-lg"
                >
                    <Text className="text-white text-lg font-bold">{i18n.t('paywall.btn')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleComplete}
                    className="items-center py-2"
                >
                    <Text className="text-slate-400 font-medium text-sm">{i18n.t('paywall.no_thanks')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
