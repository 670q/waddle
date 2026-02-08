import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../i18n';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-between p-6">
            <View className="flex-1 items-center justify-center w-full">
                {/* Visual Polish: Local Mascot or Specific Fallback (No Rabbit) */}
                <Image
                    source={require('../../../assets/mascot/a1.png')}
                    className="w-64 h-64 mb-8"
                    resizeMode="contain"
                />

                <Text className="text-3xl font-bold text-center text-slate-800 mb-4 px-4">
                    {i18n.t('welcome.title')}
                </Text>
                <Text className="text-lg text-center text-slate-500 max-w-xs px-2">
                    {i18n.t('welcome.subtitle')}
                </Text>
            </View>

            <TouchableOpacity
                onPress={() => router.push('/(onboarding)/focus-area')}
                className="w-full bg-[#4A90E2] py-4 rounded-full items-center shadow-sm active:opacity-90"
            >
                <Text className="text-white text-lg font-bold">{i18n.t('welcome.btn')}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
