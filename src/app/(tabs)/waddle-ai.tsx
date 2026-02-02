import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { WaddleMascot } from '../../components/WaddleMascot';
import clsx from 'clsx';

// Message Type
interface Message {
    id: string;
    text: string;
    isUser: boolean;
}

export default function WaddleAIScreen() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hi there! I'm Waddle. How are you feeling right now?", isUser: false }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        scrollToBottom();
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm just a demo penguin for now, but I believe in you! 🐧 Keep waddling forward!",
                isUser: false,
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
            scrollToBottom();
        }, 1500);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Header */}
                <View className="px-6 py-4 border-b border-slate-100 bg-white flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-slate-800">My Waddle</Text>
                    <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center overflow-hidden border border-blue-100">
                        <WaddleMascot size={24} mood="focused" />
                    </View>
                </View>

                {/* Chat Area */}
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Waddle Intro Animation/Avatar could go here */}
                    <View className="items-center mb-6 opacity-50">
                        <WaddleMascot size={80} mood={isTyping ? "focused" : "idle"} />
                    </View>

                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            className={clsx(
                                "mb-4 max-w-[80%] p-4 rounded-2xl",
                                msg.isUser
                                    ? "self-end bg-[#4A90E2] rounded-tr-none"
                                    : "self-start bg-white border border-slate-100 rounded-tl-none shadow-sm"
                            )}
                        >
                            <Text className={clsx(
                                "text-base",
                                msg.isUser ? "text-white font-medium" : "text-slate-700"
                            )}>
                                {msg.text}
                            </Text>
                        </View>
                    ))}

                    {isTyping && (
                        <View className="self-start bg-slate-100 px-4 py-2 rounded-full mb-4">
                            <Text className="text-slate-400 text-xs font-bold tracking-widest">WADDLE IS TYPING...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View className="p-4 bg-white border-t border-slate-100 pb-8">
                    <View className="flex-row items-center bg-slate-50 rounded-3xl px-4 py-2 border border-slate-200">
                        <TextInput
                            className="flex-1 text-base text-slate-800 mr-2 min-h-[44px]"
                            placeholder="Type a message..."
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
                                "w-10 h-10 rounded-full items-center justify-center",
                                inputText.trim() ? "bg-[#4A90E2]" : "bg-slate-200"
                            )}
                        >
                            <Ionicons name="arrow-up" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
