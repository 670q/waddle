import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { WaddleMascot } from '../../components/WaddleMascot';
import clsx from 'clsx';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';

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
        { id: '1', text: "أهلاً بك! أنا وادل 🐧. أخبرني بهدفك وسأقوم بتصميم خطة عادات مخصصة لك.", isUser: false }
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
            // Real AI Call
            const { data, error } = await supabase.functions.invoke('generate-habits', {
                body: { goal: userText }
            });

            if (error) throw error;

            if (data && Array.isArray(data) && data.length > 0) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "لقد قمت بتصميم هذه الخطة بناءً على هدفك. اضغط على الزر أدناه لاعتمادها.",
                    isUser: false,
                    isBlueprint: true,
                    blueprintData: data
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    text: "عذراً، لم أستطع فهم ذلك. هل يمكنك المحاولة مرة أخرى بكلمات أوضح؟",
                    isUser: false
                }]);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "حدث خطأ أثناء الاتصال بالدماغ الإلكتروني. يرجى المحاولة لاحقاً.",
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
                keyboardVerticalOffset={80}
            >
                {/* Header (RTL) */}
                <View className="px-6 py-4 border-b border-slate-100 bg-white flex-row-reverse items-center justify-between z-10">
                    <Text className="text-xl font-bold text-slate-800">مساعد وادل</Text>
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
                        <View key={msg.id} className={clsx("mb-6 flex-row-reverse", msg.isUser ? "justify-start" : "justify-end")}>
                            {/* Avatar Logic: User Right, AI Left... wait. standard RTL: User Right? No. 
                                WhatsApp RTL: Me (Right), Others (Left). 
                                My User Box: justify-start (Left)? No.
                                Let's follow: User -> Right (End), AI -> Left (Start).
                                So flex-row-reverse + justify-start = Right?? No.
                                flex-row-reverse: Start is Right. End is Left.
                                msg.isUser (Me) -> Should be Right (Start). -> justify-start
                                msg.isAI (Bot) -> Should be Left (End). -> justify-end
                             */}

                            {!msg.isUser && (
                                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center ml-2 self-end mb-1">
                                    <WaddleMascot size={20} mood="happy" />
                                </View>
                            )}

                            <View
                                className={clsx(
                                    "p-4 rounded-2xl max-w-[85%]",
                                    msg.isUser
                                        ? "bg-[#4A90E2] rounded-tl-none self-end" // User Blue
                                        : "bg-white border border-slate-100 rounded-tr-none shadow-sm self-start" // AI White
                                )}
                            >
                                <Text className={clsx(
                                    "text-base leading-6 text-right", // RTL Text
                                    msg.isUser ? "text-white font-medium" : "text-slate-700"
                                )}>
                                    {msg.text}
                                </Text>

                                {/* Blueprint Card Attachment */}
                                {msg.isBlueprint && msg.blueprintData && (
                                    <View className="mt-3 bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700">
                                        <View className="flex-row-reverse items-center mb-2">
                                            <Ionicons name="sparkles" size={16} color="#FCD34D" />
                                            <Text className="text-white font-bold text-xs uppercase tracking-widest mr-2">
                                                خطة مقترحة
                                            </Text>
                                        </View>

                                        {/* Habits List */}
                                        {msg.blueprintData.map((habit: any, idx: number) => (
                                            <View key={idx} className="flex-row-reverse items-center mb-2 bg-slate-700/50 p-2 rounded-lg">
                                                <Ionicons name={habit.icon || 'star'} size={18} color="#FCD34D" />
                                                <Text className="text-white font-bold mx-2 text-right flex-1">{habit.title}</Text>
                                            </View>
                                        ))}

                                        <TouchableOpacity
                                            onPress={() => handleAcceptPlan(msg.blueprintData!)}
                                            className="bg-[#FCD34D] py-3 rounded-full items-center active:opacity-90 mt-2"
                                        >
                                            <Text className="text-slate-900 font-bold text-sm uppercase tracking-wide">
                                                اعتماد الخطة
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}

                    {isTyping && (
                        <View className="self-end mr-10 bg-slate-100 px-4 py-2 rounded-full mb-4">
                            <Text className="text-slate-400 text-xs font-bold tracking-widest">وادل يفكر...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Input Bar (RTL) */}
                <View className="p-4 bg-white border-t border-slate-100 flex-row-reverse items-center pb-6">
                    <TextInput
                        className="flex-1 bg-slate-50 px-4 py-3 rounded-2xl text-slate-800 ml-3 text-base border border-slate-200 min-h-[50px] text-right"
                        placeholder="تحدث مع وادل..."
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
