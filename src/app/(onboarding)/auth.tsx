import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import i18n, { isRTL } from '../../i18n';
import clsx from 'clsx';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export default function AuthScreen() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const setHasFinishedOnboarding = useAppStore(s => s.setHasFinishedOnboarding);

    useEffect(() => {
        GoogleSignin.configure({
            scopes: ['email', 'profile'],
            webClientId: '785903617233-91vrbkqufgiq0j3up2veketjtl2dise2.apps.googleusercontent.com',
            iosClientId: '785903617233-91vrbkqufgiq0j3up2veketjtl2dise2.apps.googleusercontent.com',
        });
    }, []);

    const performGoogleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data?.idToken) {
                setLoading(true);

                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: userInfo.data.idToken,
                });

                if (error) throw error;


                setHasFinishedOnboarding(true);
            } else {
                throw new Error('No ID token present!');
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {

            } else if (error.code === statusCodes.IN_PROGRESS) {

            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Google Play Services not available or outdated.');
            } else {

                Alert.alert('Google Sign-In Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async () => {


        // DEBUG: Check Environment Variables
        const sbUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const sbKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;


        if (!sbUrl || !sbKey) {
            Alert.alert('Config Error', 'Missing Supabase Configuration. Please contact support.');
            return;
        }

        if (!email || !password) {

            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        let error;



        try {
            if (isSignUp) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                error = signUpError;
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                error = signInError;
            }
        } catch (e) {

            Alert.alert('System Error', 'An unexpected error occurred.');
            setLoading(false);
            return;
        }

        if (error) {

            // ... existing error handling ...
            let title = isRTL ? 'خطأ' : 'Error';
            let message = error.message;

            // Map common Supabase errors to friendly messages
            if (error.message.includes('Invalid login credentials')) {
                message = isRTL
                    ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
                    : 'Invalid email or password.';
            } else if (error.message.includes('User already registered')) {
                message = isRTL
                    ? 'هذا البريد الإلكتروني مسجل بالفعل. حاول تسجيل الدخول.'
                    : 'This email is already registered. Try logging in.';
            } else if (error.message.includes('rate limit')) {
                message = isRTL
                    ? 'محاولات كثيرة جداً. حاول لاحقاً.'
                    : 'Too many attempts. Please try again later.';
            }

            Alert.alert(title, message);
            setLoading(false);
        } else {
            // Success!
            setHasFinishedOnboarding(true);
            // _layout will redirect to tabs
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="mb-8">
                        <Text className={clsx("text-3xl font-bold text-slate-800 mb-2", isRTL ? "text-right" : "text-left")}>
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </Text>
                        <Text className={clsx("text-slate-500", isRTL ? "text-right" : "text-left")}>
                            {isSignUp ? "Sign up to save your progress." : "Sign in to continue."}
                        </Text>
                    </View>

                    <View className="gap-4">
                        <View className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <TextInput
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                className={clsx("text-slate-800 font-medium", isRTL ? "text-right" : "text-left")}
                            />
                        </View>
                        <View className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <TextInput
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                className={clsx("text-slate-800 font-medium", isRTL ? "text-right" : "text-left")}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleAuth}
                        disabled={loading}
                        className={clsx(
                            "w-full py-4 rounded-full items-center mt-8 shadow-lg",
                            loading ? "bg-slate-300" : "bg-[#4A90E2]"
                        )}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">
                                {isSignUp ? "Sign Up" : "Log In"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Google Sign In */}
                    <View className="mt-8">
                        <View className="flex-row items-center mb-6">
                            <View className="flex-1 h-[1px] bg-slate-200" />
                            <Text className="mx-4 text-slate-400 font-medium">Or continue with</Text>
                            <View className="flex-1 h-[1px] bg-slate-200" />
                        </View>

                        <TouchableOpacity
                            onPress={performGoogleSignIn}
                            disabled={loading}
                            className="bg-white border border-slate-200 py-4 rounded-full flex-row items-center justify-center shadow-sm"
                        >
                            <Ionicons name="logo-google" size={24} color="#DB4437" style={{ marginRight: 12 }} />
                            <Text className="text-slate-700 font-bold text-lg">
                                Google
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => setIsSignUp(!isSignUp)}
                        className="mt-8 items-center"
                    >
                        <Text className="text-slate-500 font-medium">
                            {isSignUp ? "Already have an account? " : "Don't have an account? "}
                            <Text className="text-[#4A90E2] font-bold">
                                {isSignUp ? "Log In" : "Sign Up"}
                            </Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className={clsx("absolute top-0 w-10 h-10 bg-slate-100 rounded-full items-center justify-center", isRTL ? "right-0" : "left-0")}
                    >
                        <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#64748B" />
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
