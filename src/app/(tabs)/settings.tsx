import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import i18n, { isRTL } from '../../i18n';
import clsx from 'clsx';
import { useAppStore } from '../../store/useAppStore';

export default function SettingsScreen() {
    const router = useRouter();
    const { userSession } = useAppStore();

    const handleLogout = async () => {
        Alert.alert(
            i18n.t('settings.logout'),
            i18n.t('settings.logout_confirm'),
            [
                { text: i18n.t('common.cancel'), style: 'cancel' },
                {
                    text: i18n.t('settings.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase.auth.signOut();
                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            // Router will auto-redirect due to _layout.tsx listener
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-6">
                <Text className={clsx("text-3xl font-bold text-slate-800 mb-8", isRTL ? "text-right" : "text-left")}>
                    {i18n.t('tabs.settings')}
                </Text>

                <View className="bg-white rounded-2xl p-4 shadow-sm">
                    {/* User Info */}
                    <View className={clsx("flex-row items-center mb-6", isRTL ? "flex-row-reverse" : "flex-row")}>
                        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                            <Ionicons name="person" size={24} color="#4A90E2" />
                        </View>
                        <View className={clsx("mx-4 flex-1", isRTL ? "items-end" : "items-start")}>
                            <Text className="text-lg font-bold text-slate-800">
                                {userSession?.user?.email || 'User'}
                            </Text>
                            <Text className="text-slate-500 text-sm">Basic Plan</Text>
                        </View>
                    </View>

                    {/* Settings Options */}
                    {/* Language (Mock) */}
                    <TouchableOpacity className={clsx("flex-row items-center py-4 border-b border-slate-100", isRTL ? "flex-row-reverse" : "flex-row")}>
                        <View className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                            <Ionicons name="globe-outline" size={18} color="#64748B" />
                        </View>
                        <Text className={clsx("flex-1 mx-3 text-slate-700 font-medium", isRTL ? "text-right" : "text-left")}>
                            {i18n.t('settings.language')}
                        </Text>
                        <Text className="text-slate-400 text-sm">{isRTL ? 'العربية' : 'English'}</Text>
                        <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#CBD5E1" className="ml-2" />
                    </TouchableOpacity>

                    {/* Notifications (Mock) */}
                    <TouchableOpacity className={clsx("flex-row items-center py-4 border-b border-slate-100", isRTL ? "flex-row-reverse" : "flex-row")}>
                        <View className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                            <Ionicons name="notifications-outline" size={18} color="#64748B" />
                        </View>
                        <Text className={clsx("flex-1 mx-3 text-slate-700 font-medium", isRTL ? "text-right" : "text-left")}>
                            {i18n.t('settings.notifications')}
                        </Text>
                        <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#CBD5E1" />
                    </TouchableOpacity>

                    {/* Logout */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        className={clsx("flex-row items-center py-4 mt-2", isRTL ? "flex-row-reverse" : "flex-row")}
                    >
                        <View className="w-8 h-8 bg-red-50 rounded-full items-center justify-center">
                            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                        </View>
                        <Text className={clsx("flex-1 mx-3 text-red-500 font-medium", isRTL ? "text-right" : "text-left")}>
                            {i18n.t('settings.logout')}
                        </Text>
                    </TouchableOpacity>

                    {/* DEBUG: Sync Push Token */}
                    <TouchableOpacity
                        className={clsx("flex-row items-center py-4 border-b border-slate-100", isRTL ? "flex-row-reverse" : "flex-row")}
                        onPress={async () => {
                            Alert.alert('Syncing...', 'Checking permissions...');
                            const { registerForPushNotificationsAsync } = require('../../lib/notifications');
                            const token = await registerForPushNotificationsAsync();
                            if (token) {
                                Alert.alert('Success', `Token: ${token.substring(0, 10)}...`);
                            } else {
                                Alert.alert('Failed', 'Could not get token. Check logs.');
                            }
                        }}
                    >
                        <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center">
                            <Ionicons name="refresh" size={18} color="#2563EB" />
                        </View>
                        <Text className={clsx("flex-1 mx-3 text-blue-600 font-medium", isRTL ? "text-right" : "text-left")}>
                            Sync Push Token (Debug)
                        </Text>
                    </TouchableOpacity>

                    {/* Delete Account */}
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                "Delete Account",
                                "Are you sure you want to delete your account? This action cannot be undone.",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: async () => {
                                            // 1. Try RPC
                                            const { error } = await supabase.rpc('delete_user');
                                            if (error) {
                                                console.error("RPC Delete failed", error);
                                                // Fallback: Delete data manually
                                                await supabase.from('habits').delete().eq('user_id', userSession?.user?.id);
                                            }

                                            // 2. Sign Out
                                            await supabase.auth.signOut();
                                        }
                                    }
                                ]
                            );
                        }}
                        className={clsx("flex-row items-center py-4", isRTL ? "flex-row-reverse" : "flex-row")}
                    >
                        <View className="w-8 h-8 bg-red-50 rounded-full items-center justify-center">
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </View>
                        <Text className={clsx("flex-1 mx-3 text-red-500 font-medium", isRTL ? "text-right" : "text-left")}>
                            Delete Account
                        </Text>
                    </TouchableOpacity>

                </View>

                <Text className="text-center text-slate-400 text-xs mt-8">
                    Version 1.0.0 (Build 42)
                </Text>
            </View>
        </SafeAreaView>
    );
}
