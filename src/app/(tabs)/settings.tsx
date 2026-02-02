import { View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';

const SettingRow = ({ label, icon, isDestructive = false, onPress }: any) => (
    <TouchableOpacity onPress={onPress} className="flex-row items-center py-4 border-b border-slate-100 bg-white px-4">
        <View className="w-8 items-center mr-3">
            <Ionicons name={icon} size={22} color={isDestructive ? "#EF4444" : "#64748B"} />
        </View>
        <Text className={`text-lg flex-1 ${isDestructive ? 'text-red-500 font-medium' : 'text-slate-700'}`}>
            {label}
        </Text>
        {!isDestructive && <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />}
    </TouchableOpacity>
);

export default function SettingsScreen() {
    const setHasFinishedOnboarding = useAppStore(s => s.setHasFinishedOnboarding);
    const setUserSession = useAppStore(s => s.setUserSession);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Error', error.message);
        else setUserSession(null);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView>
                <Text className="text-3xl font-bold text-slate-800 mb-6 px-6 mt-4">Settings</Text>

                <View className="bg-white border-y border-slate-200 mb-8">
                    <SettingRow label="Account" icon="person-outline" />
                    <SettingRow label="Notifications" icon="notifications-outline" />
                    <SettingRow label="Waddle Pro Subscription" icon="star-outline" />
                </View>

                <View className="bg-white border-y border-slate-200 mb-8">
                    <SettingRow label="Help & Support" icon="help-circle-outline" />
                    <SettingRow label="Terms & Privacy" icon="document-text-outline" />
                </View>

                <View className="bg-white border-y border-slate-200 mb-8">
                    <SettingRow
                        label="Log Out"
                        icon="log-out-outline"
                        isDestructive
                        onPress={handleLogout}
                    />
                </View>

                {/* Developer Tools */}
                <View className="px-6">
                    <Text className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2">Developer Area</Text>
                    <TouchableOpacity
                        onPress={() => setHasFinishedOnboarding(false)}
                        className="bg-slate-200 p-4 rounded-xl items-center"
                    >
                        <Text className="text-slate-600 font-medium">Reset Onboarding Flow</Text>
                    </TouchableOpacity>
                </View>

                <Text className="text-slate-300 text-center mt-12 mb-10">Waddle v3.0 ("Definitive")</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
