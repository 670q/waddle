import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
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
    quickReplies?: string[]; // Interactive chips
}

// Client-Side Key
// Client-Side Key
// Client-Side Key Removed
// const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const sanitizeFrequency = (raw: any): number[] => {
    if (!Array.isArray(raw) || raw.length === 0) {
        // Default to every day if missing or empty
        return [0, 1, 2, 3, 4, 5, 6];
    }

    return raw.map(day => {
        if (typeof day === 'number') return day;
        if (typeof day === 'string') {
            // Try parsing number string first "0"
            const parsed = parseInt(day, 10);
            if (!isNaN(parsed)) return parsed;

            // Map common names (just in case AI ignores instructions)
            const lower = day.toLowerCase();
            if (lower.includes('sun')) return 0;
            if (lower.includes('mon')) return 1;
            if (lower.includes('tue')) return 2;
            if (lower.includes('wed')) return 3;
            if (lower.includes('thu')) return 4;
            if (lower.includes('fri')) return 5;
            if (lower.includes('sat')) return 6;
        }
        return -1;
    }).filter(d => d >= 0 && d <= 6);
};

export default function WaddleAIScreen() {
    const router = useRouter();
    const addHabit = useAppStore(state => state.addHabit);
    const overwriteHabits = useAppStore(state => state.overwriteHabits);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: i18n.t('ai.welcome_msg'), isUser: false }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [processingPlan, setProcessingPlan] = useState(false); // Moved here
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleQuickReply = (reply: string) => {
        // Auto-send the selected reply
        sendMessage(reply);
    };

    const sendMessage = async (overrideText?: string) => {
        const textToSend = overrideText || inputText;
        if (!textToSend.trim()) return;

        // Key check removed (handled by backend)
        // if (!GEMINI_API_KEY) { ... }

        const userMsg: Message = {
            id: Date.now().toString(),
            text: textToSend.trim(),
            isUser: true,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputText('');
        scrollToBottom();
        setIsTyping(true);

        try {
            // CONVERSATIONAL AI (Edge Function)

            // 1. Format History for Edge Function
            // It expects: [{ role: 'user'|'model', text: '...' }]
            const history = newMessages
                .map(m => ({
                    role: m.isUser ? 'user' : 'model',
                    text: m.text
                }))
                .slice(-10); // Keep last 10 messages for context

            // 2. Invoke Supabase Edge Function
            const response = await supabase.functions.invoke('waddle-ai', {
                body: {
                    messages: history,
                    isRTL: isRTL
                }
            });

            if (response.error) {
                // Check if it's a Limit Exceeded error (403)
                // supabase-js functions invoke returns error object for non-2xx usually, 
                // but we need to check the context property or the error body if available.
                // Actually supabase-js might wrap it. Let's check the error details.

                // If the function returned 403, supabase-js populates `error`.
                // We need to see if we can extract the body.
                // However, standard supabase invoke might hide the body in `context`.

                // Alternative: The Edge Function returns the error in the body.
                // If Supabase throws, we might need to handle it.

                // Let's assume the error object has details.
                // If not, we might need to use `fetch` manually or inspect `response`.

                // Correction: supabase.functions.invoke returns { data, error }.
                // If 403, error will be populated.

                try {
                    // Try to parse the error context/message if it's JSON string
                    // But typically `error` is a FunctionsHttpError.

                    // Let's assume standard behavior:
                    if (response.error.context && response.error.context.status === 403) {
                        const body = await response.error.context.json();
                        if (body.error === 'LIMIT_EXCEEDED') {
                            Alert.alert(
                                isRTL ? "عفواً، انتهى رصيدك اليومي! 🐧" : "Daily Limit Reached! 🐧",
                                isRTL
                                    ? "تبي تسولف أكثر؟ اشترك في الباقة المدفوعة وخذ راحتك!"
                                    : "Want to chat more? Upgrade to Premium for specific advice!",
                                [
                                    { text: isRTL ? "إلغاء" : "Cancel", style: "cancel" },
                                    {
                                        text: isRTL ? "ترقية الباقة 💎" : "Upgrade 💎",
                                        onPress: () => router.push('/paywall-mock')
                                    }
                                ]
                            );
                            return;
                        }
                    }
                } catch (e) {
                    // Silently handle parse error
                }

                throw response.error;
            }

            const { data } = response;

            if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                const aiResponseText = data.candidates[0].content.parts[0].text;

                // Attempt to parse JSON from the response
                let conversationalText = aiResponseText;
                let parsedData: { options?: string[], plan?: any[] } = {};

                const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch && jsonMatch[1]) {
                    try {
                        parsedData = JSON.parse(jsonMatch[1]);
                        conversationalText = aiResponseText.replace(jsonMatch[0], '').trim();
                    } catch (jsonError) {
                        console.warn("Failed to parse JSON from AI response:", jsonError);
                        // If JSON parsing fails, treat the whole response as conversational text
                    }
                }

                // Cleanup
                conversationalText = conversationalText.replace(/```/g, '').trim();

                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: conversationalText,
                    isUser: false,
                    isBlueprint: !!parsedData.plan && Array.isArray(parsedData.plan) && parsedData.plan.length > 0,
                    blueprintData: parsedData.plan,
                    quickReplies: parsedData.options
                };
                setMessages(prev => [...prev, aiMsg]);

            } else if (data?.promptFeedback?.blockReason) {
                console.warn("AI response blocked:", data.promptFeedback.blockReason);
                Alert.alert("AI Blocked", "Your message was blocked by the AI safety system. Please try rephrasing.");
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: isRTL ? "رسالتك تم حظرها بواسطة نظام الأمان. حاول إعادة صياغتها." : "Your message was blocked by the AI safety system. Please try rephrasing.",
                    isUser: false
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                console.error("Unexpected AI response structure:", data);
                Alert.alert("AI Error", "Received an unexpected response from the AI.");
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: isRTL ? "حدث خطأ غير متوقع 😅 حاول مرة أخرى!" : "An unexpected error occurred! 🐧 Try again!",
                    isUser: false
                };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (err: any) {
            console.error('AI Error Catch:', err);
            Alert.alert("AI Error", err.message || "Unknown error"); // Show user the specific error for debugging
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: isRTL ? "حدث خطأ بسيط 😅 حاول مرة أخرى!" : "Oops, a little glitch! 🐧 Try again!",
                isUser: false
            };
            setMessages(prev => [...prev, aiMsg]);
        } finally {
            setIsTyping(false);
            scrollToBottom();
        }
    };

    const handleAcceptPlan = async (habits: any[]) => {
        if (processingPlan) return;
        setProcessingPlan(true);

        const newHabits = habits.map((h, index) => ({
            id: Date.now().toString() + index,
            title: h.title,
            icon: h.icon || 'star',
            time: 'Morning',
            streak: 0,
            completed: false,
            frequency: sanitizeFrequency(h.frequency)
        }));

        // Append instead of overwrite
        for (const habit of newHabits) {
            await addHabit(habit);
        }

        setProcessingPlan(false);
        router.push('/(tabs)');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Header (Dynamic RTL) */}
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
                    <View className="items-center mb-6 opacity-50">
                        <WaddleMascot size={80} mood={isTyping ? "focused" : "idle"} />
                    </View>

                    {messages.map((msg) => (
                        <View key={msg.id} className={clsx(
                            "mb-6",
                            isRTL ? "flex-row-reverse" : "flex-row",
                            msg.isUser ? "justify-end" : "justify-start"
                        )}>

                            {!msg.isUser && (
                                <View className={clsx(
                                    "w-8 h-8 bg-blue-100 rounded-full items-center justify-center self-end mb-1",
                                    isRTL ? "ml-2" : "mr-2"
                                )}>
                                    <WaddleMascot size={20} mood="happy" />
                                </View>
                            )}

                            <View className={clsx("max-w-[85%]", msg.isUser && "items-end", !msg.isUser && "items-start")}>
                                <View
                                    className={clsx(
                                        "p-4 rounded-2xl",
                                        msg.isUser
                                            ? clsx("bg-[#4A90E2]", isRTL ? "rounded-tl-none" : "rounded-tr-none")
                                            : clsx("bg-white border border-slate-100 shadow-sm", isRTL ? "rounded-tr-none" : "rounded-tl-none")
                                    )}
                                >
                                    <Text className={clsx(
                                        "text-base leading-6",
                                        isRTL ? "text-right" : "text-left",
                                        msg.isUser ? "text-white font-medium" : "text-slate-700"
                                    )}>
                                        {msg.text}
                                    </Text>
                                </View>

                                {/* Quick Replies Chips (Tamara Style Buttons) */}
                                {msg.quickReplies && (
                                    <View className="flex-col mt-3 w-full gap-2">
                                        {msg.quickReplies.map((reply, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                onPress={() => handleQuickReply(reply)}
                                                className="bg-[#4A90E2] py-3 px-6 rounded-full shadow-md active:bg-[#357ABD] items-center justify-center w-full"
                                            >
                                                <Text className="text-white font-bold text-base text-center">{reply}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Blueprint Card */}
                                {msg.isBlueprint && msg.blueprintData && (
                                    <View className="mt-3 bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700 w-full">
                                        <View className={clsx("items-center mb-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                                            <Ionicons name="sparkles" size={16} color="#FCD34D" />
                                            <Text className={clsx("text-white font-bold text-xs uppercase tracking-widest", isRTL ? "mr-2" : "ml-2")}>
                                                {i18n.t('ai.plan_card_title')}
                                            </Text>
                                        </View>

                                        {msg.blueprintData.map((habit: any, idx: number) => (
                                            <View key={idx} className={clsx("items-center mb-2 bg-slate-700/50 p-2 rounded-lg", isRTL ? "flex-row-reverse" : "flex-row")}>
                                                <Ionicons name={habit.icon || 'star'} size={24} color="#FCD34D" />
                                                <View className={clsx("flex-1 mx-3", isRTL ? "items-end" : "items-start")}>
                                                    <Text className={clsx("text-white font-bold text-base", isRTL ? "text-right" : "text-left")}>
                                                        {habit.title}
                                                    </Text>
                                                    {habit.details && (
                                                        <Text className={clsx("text-slate-300 text-xs mt-0.5", isRTL ? "text-right" : "text-left")}>
                                                            {habit.details}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        ))}

                                        <TouchableOpacity
                                            onPress={() => handleAcceptPlan(msg.blueprintData!)}
                                            disabled={processingPlan}
                                            className={clsx(
                                                "py-3 rounded-full items-center active:opacity-90 mt-2",
                                                processingPlan ? "bg-slate-300" : "bg-[#FCD34D]"
                                            )}
                                        >
                                            {processingPlan ? (
                                                <ActivityIndicator size="small" color="#1e293b" />
                                            ) : (
                                                <Text className="text-slate-900 font-bold text-sm uppercase tracking-wide">
                                                    {i18n.t('ai.accept_btn')}
                                                </Text>
                                            )}
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
                        onPress={() => sendMessage()}
                        disabled={!inputText.trim()}
                        className={clsx(
                            "w-12 h-12 rounded-full items-center justify-center shadow-sm",
                            inputText.trim() ? "bg-[#4A90E2]" : "bg-slate-200"
                        )}
                    >
                        <Ionicons name="arrow-up" size={24} color="white" />
                    </TouchableOpacity>
                </View >

            </KeyboardAvoidingView >
        </SafeAreaView >
    );
}
