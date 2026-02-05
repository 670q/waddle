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
    quickReplies?: string[]; // Interactive chips
}

// Client-Side Key
const GEMINI_API_KEY = "AIzaSyA_vJBt2VPtdVNA186pyAcprbzzCrfc-Fw";

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

    const handleQuickReply = (reply: string) => {
        // Auto-send the selected reply
        sendMessage(reply);
    };

    const sendMessage = async (overrideText?: string) => {
        const textToSend = overrideText || inputText;
        if (!textToSend.trim()) return;

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
            // CONVERSATIONAL AI (Client-Side)

            // 1. Format History
            const history = newMessages
                .filter(m => m.id !== '1')
                .map(m => ({
                    role: m.isUser ? 'user' : 'model',
                    parts: [{ text: m.text }]
                }))
                .slice(-10);

            // 2. System Prompt (The "Happy Coach" Persona)
            const systemInstruction = `
            ROLE: You are "Waddle", a SUPER HAPPY, energetic, and supportive penguin coach! 🐧✨
            TONE: Brief, fun, encouraging. Use emojis!
            
            CRITICAL RULES:
            1. ASK LESS: Ask MAXIMUM 1 clarifying question before generating a plan. If you have a rough idea, just generate the plan!
            2. PROVIDE OPTIONS: When you ask a question, YOU MUST provide 2-4 "Quick Reply" options.
               Example: "How often?" -> Options: ["Daily ⚡️", "3x/Week", "Weekends"]
            3. BE FAST: Don't make the user type much.
            
            FORMATTING:
            - Output JSON for options/plan.
            Structure: 
              Running text first...
              \`\`\`json
              {
                "options": ["Option 1", "Option 2"], 
                "plan": [...] (ONLY if final plan is ready)
              }
              \`\`\`
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: systemInstruction }] },
                        ...history
                    ]
                })
            });

            if (!response.ok) throw new Error(`Google API Error: ${response.status}`);

            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) throw new Error("Empty response");

            // 3. Parse Response (Text + JSON Options/Plan)
            const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);

            let conversationalText = rawText;
            let parsedData: any = {};

            if (jsonMatch) {
                try {
                    const jsonString = jsonMatch[1] || jsonMatch[0];
                    parsedData = JSON.parse(jsonString);
                    conversationalText = rawText.replace(jsonMatch[0], '').trim();
                } catch (e) {
                    console.log("JSON Parse Error:", e);
                }
            }

            // Cleanup
            conversationalText = conversationalText.replace(/```/g, '').trim();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: conversationalText,
                isUser: false,
                isBlueprint: !!parsedData.plan,
                blueprintData: parsedData.plan,
                quickReplies: parsedData.options
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (err: any) {
            console.error('AI Error:', err);
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

    const handleAcceptPlan = (habits: any[]) => {
        habits.forEach((h, index) => {
            addHabit({
                id: Date.now().toString() + index,
                title: h.title,
                icon: h.icon || 'star',
                time: 'Morning',
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
                                                <Ionicons name={habit.icon || 'star'} size={18} color="#FCD34D" />
                                                <Text className={clsx("text-white font-bold mx-2 flex-1", isRTL ? "text-right" : "text-left")}>{habit.title}</Text>
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
                        onPress={() => sendMessage()}
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
