import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { WaddleMascot } from '../../components/WaddleMascot';
import clsx from 'clsx';
import { useRouter } from 'expo-router';
import { useAppStore, Blueprint } from '../../store/useAppStore';

// Message Type
interface Message {
    id: string;
    text: string;
    isUser: boolean;
    isBlueprint?: boolean;
    blueprintData?: Blueprint;
}

export default function WaddleAIScreen() {
    const router = useRouter();
    const setActiveBlueprint = useAppStore(state => state.setActiveBlueprint);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hi there! I'm Waddle. Tell me a goal like 'I want to sleep better' or 'I want to read more'.", isUser: false }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const generateBlueprint = (text: string): Blueprint | null => {
        const lower = text.toLowerCase();
        if (lower.includes('sleep')) {
            return {
                id: 'sleep-protocol',
                title: 'Deep Sleep Protocol',
                icon: 'moon',
                description: 'Optimized rhythm to improve recovery by 30%.',
                frequency: 'Daily',
                duration: '45 Mins',
                time: 'Evening (10 PM)'
            };
        }
        if (lower.includes('workout') || lower.includes('gym') || lower.includes('exercise')) {
            return {
                id: 'strength-foundation',
                title: 'Strength Foundation',
                icon: 'barbell',
                description: 'Compound movements to build core stability.',
                frequency: '3x / Week',
                duration: '60 Mins',
                time: 'Morning'
            };
        }
        if (lower.includes('read') || lower.includes('book')) {
            return {
                id: 'mind-expansion',
                title: 'Mind Expansion',
                icon: 'book',
                description: 'Daily reading block to boost focus and clarity.',
                frequency: 'Daily',
                duration: '20 Mins',
                time: 'Evening'
            };
        }
        if (lower.includes('focus') || lower.includes('work')) {
            return {
                id: 'deep-work-block',
                title: 'Deep Work Block',
                icon: 'laptop-outline',
                description: 'Distraction-free session for peak productivity.',
                frequency: 'Daily',
                duration: '90 Mins',
                time: 'Morning'
            };
        }
        return null; // No specific blueprint
    };

    const sendMessage = () => {
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

        // AI Logic
        setTimeout(() => {
            const blueprint = generateBlueprint(userText);
            let aiMsg: Message;

            if (blueprint) {
                // Determine AI response text based on blueprint
                aiMsg = {
                    id: (Date.now() + 1).toString(),
                    text: "I've designed a custom plan for that. It's built to fit your rhythm. Tap below to see the details!",
                    isUser: false,
                    isBlueprint: true,
                    blueprintData: blueprint
                };
            } else {
                // Generic response
                aiMsg = {
                    id: (Date.now() + 1).toString(),
                    text: "That sounds like a great goal! I'm still learning how to build plans for that, but try asking me about Sleep, Reading, or Workouts! 🐧",
                    isUser: false,
                };
            }

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
            scrollToBottom();
        }, 1500);
    };

    const handleViewBlueprint = (blueprint: Blueprint) => {
        setActiveBlueprint(blueprint);
        router.push('/ai-blueprint');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={80}
            >
                {/* Header */}
                <View className="px-6 py-4 border-b border-slate-100 bg-white flex-row items-center justify-between z-10">
                    <Text className="text-xl font-bold text-slate-800">My Waddle</Text>
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
                        <View key={msg.id} className={clsx("mb-6 flex-row", msg.isUser ? "justify-end" : "justify-start")}>
                            {!msg.isUser && (
                                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-2 self-end mb-1">
                                    <WaddleMascot size={20} mood="happy" />
                                </View>
                            )}

                            <View
                                className={clsx(
                                    "p-4 rounded-2xl max-w-[85%]",
                                    msg.isUser
                                        ? "bg-[#4A90E2] rounded-tr-none"
                                        : "bg-white border border-slate-100 rounded-tl-none shadow-sm"
                                )}
                            >
                                <Text className={clsx(
                                    "text-base leading-6",
                                    msg.isUser ? "text-white font-medium" : "text-slate-700"
                                )}>
                                    {msg.text}
                                </Text>

                                {/* Blueprint Card Attachment */}
                                {msg.isBlueprint && msg.blueprintData && (
                                    <View className="mt-3 bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700">
                                        <View className="flex-row items-center mb-2">
                                            <Ionicons name="sparkles" size={16} color="#FCD34D" />
                                            <Text className="text-white font-bold text-xs uppercase tracking-widest ml-2">
                                                HABIT ARCHITECT
                                            </Text>
                                        </View>
                                        <Text className="text-white font-bold text-lg mb-1">
                                            {msg.blueprintData.title}
                                        </Text>
                                        <Text className="text-slate-400 text-sm mb-4">
                                            {msg.blueprintData.description}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => handleViewBlueprint(msg.blueprintData!)}
                                            className="bg-[#FCD34D] py-3 rounded-full items-center active:opacity-90"
                                        >
                                            <Text className="text-slate-900 font-bold text-sm uppercase tracking-wide">
                                                View Full Plan
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}

                    {isTyping && (
                        <View className="self-start ml-10 bg-slate-100 px-4 py-2 rounded-full mb-4">
                            <Text className="text-slate-400 text-xs font-bold tracking-widest">WADDLE IS THINKING...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Input Bar */}
                <View className="p-4 bg-white border-t border-slate-100 flex-row items-center pb-6">
                    <TextInput
                        className="flex-1 bg-slate-50 px-4 py-3 rounded-2xl text-slate-800 mr-3 text-base border border-slate-200 min-h-[50px]"
                        placeholder="Talk to Waddle..."
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
