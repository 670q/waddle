import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useAppStore } from '../../store/useAppStore';
import i18n, { isRTL } from '../../i18n';
import { BlurView } from 'expo-blur';

interface StartChallengeModalProps {
    visible: boolean;
    onClose: () => void;
    onStart: (habitId: string, challengeName?: string) => void;
}

export const StartChallengeModal = ({ visible, onClose, onStart }: StartChallengeModalProps) => {
    const { habits } = useAppStore();
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [challengeName, setChallengeName] = useState('');

    const handleStart = () => {
        if (selectedHabitId) {
            onStart(selectedHabitId, challengeName || undefined);
            onClose();
            setChallengeName('');
            setSelectedHabitId(null);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <BlurView intensity={20} tint="dark" className="flex-1">
                <View className="flex-1 justify-end">
                    <TouchableOpacity
                        className="absolute inset-0"
                        activeOpacity={1}
                        onPress={onClose}
                    />

                    <View className="bg-white rounded-t-3xl h-[80%] p-6 shadow-2xl">
                        {/* Header */}
                        <View className={clsx("mb-6 items-center justify-between", isRTL ? "flex-row-reverse" : "flex-row")}>
                            <View>
                                <Text className={clsx("text-2xl font-black text-slate-800", isRTL ? "text-right" : "text-left")}>
                                    {i18n.t('challenge21.modal_title')}
                                </Text>
                                <Text className={clsx("text-slate-500 mt-1", isRTL ? "text-right" : "text-left")}>
                                    {i18n.t('challenge21.subtitle')}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} className="bg-slate-100 p-2 rounded-full">
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {/* Rule Card */}
                        <View className="bg-indigo-50 p-4 rounded-xl mb-6 flex-row items-center space-x-4">
                            <View className="bg-indigo-100 p-2 rounded-lg">
                                <Ionicons name="flame" size={24} color="#6366F1" />
                            </View>
                            <Text className={clsx("flex-1 text-indigo-900 font-medium leading-5 mx-3", isRTL ? "text-right" : "text-left")}>
                                {i18n.t('challenge21.rule')}
                            </Text>
                        </View>

                        {/* Challenge Name Input */}
                        <Text className={clsx("text-lg font-bold text-slate-800 mb-2", isRTL ? "text-right" : "text-left")}>
                            {i18n.t('challenge21.name_label', { defaultValue: 'Name Your Challenge' })}
                        </Text>
                        <TextInput
                            value={challengeName}
                            onChangeText={setChallengeName}
                            placeholder={i18n.t('challenge21.name_placeholder', { defaultValue: 'My 21-Day Journey' })}
                            placeholderTextColor="#94a3b8"
                            className={clsx(
                                "bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 mb-6 text-slate-800 font-medium",
                                isRTL ? "text-right" : "text-left"
                            )}
                        />

                        {/* Habit Selection */}
                        <Text className={clsx("text-lg font-bold text-slate-800 mb-4", isRTL ? "text-right" : "text-left")}>
                            {i18n.t('challenge21.select_habit')}
                        </Text>

                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            <View className="space-y-3 pb-8">
                                {habits.length === 0 ? (
                                    <View className="items-center py-8">
                                        <Text className="text-slate-400">No habits found. Create one first!</Text>
                                    </View>
                                ) : (
                                    habits.map((habit) => (
                                        <TouchableOpacity
                                            key={habit.id}
                                            onPress={() => setSelectedHabitId(habit.id)}
                                            className={clsx(
                                                "p-4 rounded-2xl border-2 flex-row items-center",
                                                selectedHabitId === habit.id
                                                    ? "border-indigo-500 bg-indigo-50"
                                                    : "border-slate-100 bg-white",
                                                isRTL ? "flex-row-reverse" : "flex-row" // Adjust item direction
                                            )}
                                        >
                                            <View className={clsx(
                                                "w-12 h-12 rounded-full items-center justify-center",
                                                selectedHabitId === habit.id ? "bg-indigo-200" : "bg-slate-100"
                                            )}>
                                                <Ionicons
                                                    name={habit.icon as any}
                                                    size={24}
                                                    color={selectedHabitId === habit.id ? "#4F46E5" : "#64748B"}
                                                />
                                            </View>

                                            <View className={clsx("flex-1 px-4", isRTL ? "items-end" : "items-start")}>
                                                <Text className={clsx(
                                                    "font-bold text-lg",
                                                    selectedHabitId === habit.id ? "text-indigo-900" : "text-slate-700"
                                                )}>
                                                    {habit.title}
                                                </Text>
                                                <Text className="text-slate-400 text-xs">{habit.time}</Text>
                                            </View>

                                            <View className={clsx(
                                                "w-6 h-6 rounded-full border-2 items-center justify-center",
                                                selectedHabitId === habit.id
                                                    ? "border-indigo-500 bg-indigo-500"
                                                    : "border-slate-300"
                                            )}>
                                                {selectedHabitId === habit.id && (
                                                    <Ionicons name="checkmark" size={14} color="white" />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        </ScrollView>

                        {/* Action Button */}
                        <View className="pt-4 border-t border-slate-100">
                            <TouchableOpacity
                                disabled={!selectedHabitId}
                                onPress={handleStart}
                                className={clsx(
                                    "py-4 rounded-full items-center shadow-lg",
                                    selectedHabitId ? "bg-indigo-600" : "bg-slate-200"
                                )}
                            >
                                <Text className={clsx(
                                    "font-bold text-lg",
                                    selectedHabitId ? "text-white" : "text-slate-400"
                                )}>
                                    {i18n.t('challenge21.confirm_btn')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
};
