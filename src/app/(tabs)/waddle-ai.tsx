import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { WaddleMascot } from '../../components/WaddleMascot';
import clsx from 'clsx';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import i18n, { isRTL } from '../../i18n';

// Message Type
interface Message {
    id: string;
    text: string;
    isUser: boolean;
    isBlueprint?: boolean;
    blueprintData?: any[]; // Array of habits from AI
}

export default function WaddleAIScreen() {
    const router = useRouter();
    const addHabit = useAppStore(state => state.addHabit);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: i18n.t('ai.welcome_msg'), isUser: false }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userText = inputText.trim();
        const userMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            isUser: true,
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        scrollToBottom();
        setIsTyping(true);

        try {
            console.log('Sending goal to AI:', userText);

            // Real AI Call
            const { data, error } = await supabase.functions.invoke('generate-habits', {
                body: { goal: userText }
            });

            if (error) {
                console.error('Supabase Function Error:', error);
                throw error;
            }

            console.log('AI Response:', data);

            if (data && Array.isArray(data) && data.length > 0) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: i18n.t('ai.plan_card_title'), // "Plan Generated..."
                    isUser: false,
                    isBlueprint: true,
                    blueprintData: data
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    text: i18n.t('ai.error_msg'),
                    isUser: false
                }]);
            }
        } catch (err: any) {
            console.error('Catch Error:', err);
            Alert.alert('AI Error', err.message || JSON.stringify(err));

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "Connection error. Please try again.", // Fallback text
                isUser: false
            }]);
        } finally {
            setIsTyping(false);
            scrollToBottom();
        }
    };

    const handleAcceptPlan = (habits: any[]) => {
        // Add all habits to store
        habits.forEach((h, index) => {
            addHabit({
                id: Date.now().toString() + index,
                title: h.title,
                icon: h.icon || 'star', // fallback
                time: 'Morning', // default for now, AI could provide this
                streak: 0,
                completed: false
            });
        });

        router.push('/(tabs)');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={80} // Adjust based on tab bar height
            >
                {/* Header */}
                <View className={clsx(
                    "px-6 py-4 border-b border-slate-100 bg-white items-center justify-between z-10",
                    isRTL ? "flex-row-reverse" : "flex-row"
                )}>
                    <Text className="text-xl font-bold text-slate-800">{i18n.t('ai.title')}</Text>
                    <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center overflow-hidden border border-blue-100">
                        <WaddleMascot size={24} mood="focused" />
                    </View>
                </View>

                {/* Messages List */}
                <ScrollView
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    className="flex-1 px-4"
                    contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Waddle Intro Animation */}
                    <View className="items-center mb-6 opacity-50">
                        <WaddleMascot size={80} mood={isTyping ? "focused" : "idle"} />
                    </View>

                    {messages.map((msg) => (
                        <View key={msg.id} className={clsx(
                            "mb-6",
                            isRTL ? "flex-row-reverse" : "flex-row",
                            msg.isUser ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")
                        )}>
                            {!msg.isUser && (
                                <View className={clsx(
                                    "w-8 h-8 bg-blue-100 rounded-full items-center justify-center mb-1",
                                    isRTL ? "ml-2 self-end" : "mr-2 self-end"
                                )}>
                                    <WaddleMascot size={20} mood="happy" />
                                </View>
                            )}

                            <View
                                className={clsx(
                                    "p-4 rounded-2xl max-w-[85%]",
                                    msg.isUser
                                        ? "bg-[#4A90E2] self-end" + (isRTL ? " rounded-tl-none" : " rounded-tr-none")
                                        : "bg-white border border-slate-100 shadow-sm self-start" + (isRTL ? " rounded-tr-none" : " rounded-tl-none")
                                )}
                            >
                                <Text className={clsx(
                                    "text-base leading-6",
                                    isRTL ? "text-right" : "text-left",
                                    msg.isUser ? "text-white font-medium" : "text-slate-700"
                                )}>
                                    {msg.text}
                                </Text>

                                {/* Blueprint Card Attachment */}
                                {msg.isBlueprint && msg.blueprintData && (
                                    <View className="mt-3 bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700">
                                        <View className={clsx("items-center mb-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                                            <Ionicons name="sparkles" size={16} color="#FCD34D" />
                                            <Text className={clsx(
                                                "text-white font-bold text-xs uppercase tracking-widest",
                                                isRTL ? "mr-2" : "ml-2"
                                            )}>
                                                {i18n.t('ai.plan_card_title')}
                                            </Text>
                                        </View>

                                        {/* Habits List */}
                                        {msg.blueprintData.map((habit: any, idx: number) => (
                                            <View key={idx} className={clsx(
                                                "items-center mb-2 bg-slate-700/50 p-2 rounded-lg",
                                                isRTL ? "flex-row-reverse" : "flex-row"
                                            )}>
                                                <Ionicons name={habit.icon || 'star'} size={18} color="#FCD34D" />
                                                <Text className={clsx(
                                                    "text-white font-bold mx-2 flex-1",
                                                    isRTL ? "text-right" : "text-left"
                                                )}>
                                                    {habit.title}
                                                </Text>
                                            </View>
                                        ))}

                                        <TouchableOpacity
                                            onPress={() => handleAcceptPlan(msg.blueprintData!)}
                                            className="bg-[#FCD34D] py-3 rounded-full items-center active:opacity-90 mt-2"
                                        >
                                            <Text className="text-slate-900 font-bold text-sm uppercase tracking-wide">
                                                {i18n.t('ai.accept_btn')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}

                    {isTyping && (
                        <View className={clsx(
                            "bg-slate-100 px-4 py-2 rounded-full mb-4",
                            isRTL ? "self-end mr-10" : "self-start ml-10"
                        )}>
                            <Text className="text-slate-400 text-xs font-bold tracking-widest">{i18n.t('ai.typing')}</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Input Bar */}
                <View className={clsx(
                    "p-4 bg-white border-t border-slate-100 items-center pb-6",
                    isRTL ? "flex-row-reverse" : "flex-row"
                )}>
                    <TextInput
                        className={clsx(
                            "flex-1 bg-slate-50 px-4 py-3 rounded-2xl text-slate-800 text-base border border-slate-200 min-h-[50px]",
                            isRTL ? "ml-3 text-right" : "mr-3 text-left"
                        )}
                        placeholder={i18n.t('ai.placeholder')}
                        placeholderTextColor="#94A3B8"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={!inputText.trim()}
                        className={clsx(
                            "w-12 h-12 rounded-full items-center justify-center shadow-sm",
                            inputText.trim() ? "bg-[#4A90E2]" : "bg-slate-200"
                        )}
                    >
                        <Ionicons name="arrow-up" size={24} color="white" />
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
