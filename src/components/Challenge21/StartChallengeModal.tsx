import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useAppStore, Habit } from '../../store/useAppStore';
import i18n, { isRTL } from '../../i18n';
import { BlurView } from 'expo-blur';
import { getLocales } from 'expo-localization';

interface StartChallengeModalProps {
    visible: boolean;
    onClose: () => void;
    onStart: (habitId: string, challengeName?: string) => void;
}

const ICONS = [
    'water', 'fitness', 'book', 'bed', 'walk', 'bicycle', 'cafe', 'leaf',
    'heart', 'medkit', 'nutrition', 'barbell', 'moon', 'sunny', 'musical-notes', 'pencil'
];

const TIMES = [
    { key: 'Anytime', en: 'Anytime', ar: 'أي وقت' },
    { key: 'Morning', en: 'Morning', ar: 'الصباح' },
    { key: 'Afternoon', en: 'Afternoon', ar: 'بعد الظهر' },
    { key: 'Evening', en: 'Evening', ar: 'المساء' },
];

const DAYS = [
    { label: 'S', labelAr: 'ح', value: 0 },
    { label: 'M', labelAr: 'ن', value: 1 },
    { label: 'T', labelAr: 'ث', value: 2 },
    { label: 'W', labelAr: 'ر', value: 3 },
    { label: 'T', labelAr: 'خ', value: 4 },
    { label: 'F', labelAr: 'ج', value: 5 },
    { label: 'S', labelAr: 'س', value: 6 },
];

export const StartChallengeModal = ({ visible, onClose, onStart }: StartChallengeModalProps) => {
    const { habits, addHabit } = useAppStore();
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [challengeName, setChallengeName] = useState('');

    // Add Habit Form States
    const [showAddForm, setShowAddForm] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('star');
    const [selectedTime, setSelectedTime] = useState('Anytime');
    const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

    const deviceLocales = getLocales();
    const isArabic = deviceLocales[0]?.languageCode === 'ar';

    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day].sort());
        }
    };

    const handleStart = () => {
        if (selectedHabitId) {
            onStart(selectedHabitId, challengeName || undefined);
            onClose();
            setChallengeName('');
            setSelectedHabitId(null);
        }
    };

    const handleAddHabit = () => {
        if (!newHabitTitle.trim()) return;

        const newHabit: Habit = {
            id: Date.now().toString(),
            title: newHabitTitle.trim(),
            icon: selectedIcon,
            time: selectedTime,
            streak: 0,
            completed: false,
            frequency: selectedDays.length > 0 ? selectedDays : [0, 1, 2, 3, 4, 5, 6]
        };
        addHabit(newHabit);
        setSelectedHabitId(newHabit.id);

        // Reset form and go back
        setNewHabitTitle('');
        setSelectedIcon('star');
        setSelectedTime('Anytime');
        setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
        setShowAddForm(false);
    };

    const handleClose = () => {
        setShowAddForm(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <BlurView intensity={20} tint="dark" className="flex-1">
                <View className="flex-1 justify-end">
                    <TouchableOpacity
                        className="absolute inset-0"
                        activeOpacity={1}
                        onPress={handleClose}
                    />

                    <View className="bg-white rounded-t-3xl h-[85%] p-6 shadow-2xl">
                        {!showAddForm ? (
                            /* ===== MAIN SCREEN: Challenge Setup ===== */
                            <>
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
                                    <TouchableOpacity onPress={handleClose} className="bg-slate-100 p-2 rounded-full">
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

                                {/* Habit Selection Header with Add Button */}
                                <View className={clsx("mb-4 items-center justify-between", isRTL ? "flex-row-reverse" : "flex-row")}>
                                    <Text className={clsx("text-lg font-bold text-slate-800", isRTL ? "text-right" : "text-left")}>
                                        {i18n.t('challenge21.select_habit')}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setShowAddForm(true)}
                                        className="bg-indigo-100 px-3 py-2 rounded-full flex-row items-center"
                                    >
                                        <Ionicons name="add" size={18} color="#4F46E5" />
                                        <Text className={clsx("text-indigo-600 font-bold text-sm", isRTL ? "mr-1" : "ml-1")}>
                                            {isArabic ? 'إضافة' : 'Add'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                                    <View className="space-y-3 pb-8">
                                        {habits.length === 0 ? (
                                            <View className="items-center py-8">
                                                <Ionicons name="add-circle-outline" size={48} color="#CBD5E1" />
                                                <Text className="text-slate-400 mt-2 text-center">
                                                    {isArabic ? 'لا توجد عادات، أضف واحدة!' : 'No habits found. Add one!'}
                                                </Text>
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
                                                        isRTL ? "flex-row-reverse" : "flex-row"
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
                            </>
                        ) : (
                            /* ===== ADD HABIT SCREEN ===== */
                            <>
                                {/* Header */}
                                <View className={clsx("mb-6 items-center justify-between", isArabic ? "flex-row-reverse" : "flex-row")}>
                                    <TouchableOpacity onPress={() => setShowAddForm(false)} className="bg-slate-100 p-2 rounded-full">
                                        <Ionicons name={isArabic ? "arrow-forward" : "arrow-back"} size={24} color="#64748B" />
                                    </TouchableOpacity>
                                    <Text className="text-2xl font-black text-slate-800">
                                        {isArabic ? 'إضافة عادة جديدة' : 'Add New Habit'}
                                    </Text>
                                    <View className="w-10" />
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                    {/* Habit Name */}
                                    <Text className={clsx("text-sm font-bold text-slate-600 mb-2", isArabic ? "text-right" : "text-left")}>
                                        {isArabic ? 'اسم العادة' : 'Habit Name'}
                                    </Text>
                                    <TextInput
                                        value={newHabitTitle}
                                        onChangeText={setNewHabitTitle}
                                        placeholder={isArabic ? 'مثال: شرب الماء' : 'e.g. Drink Water'}
                                        placeholderTextColor="#94a3b8"
                                        className={clsx(
                                            "bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 mb-6 text-slate-800 font-medium",
                                            isArabic ? "text-right" : "text-left"
                                        )}
                                    />

                                    {/* Icon Selection */}
                                    <Text className={clsx("text-sm font-bold text-slate-600 mb-2", isArabic ? "text-right" : "text-left")}>
                                        {isArabic ? 'اختر أيقونة' : 'Choose Icon'}
                                    </Text>
                                    <View className="flex-row flex-wrap gap-2 mb-6">
                                        {ICONS.map(icon => (
                                            <TouchableOpacity
                                                key={icon}
                                                onPress={() => setSelectedIcon(icon)}
                                                className={clsx(
                                                    "w-12 h-12 rounded-xl items-center justify-center",
                                                    selectedIcon === icon ? "bg-indigo-500" : "bg-slate-100"
                                                )}
                                            >
                                                <Ionicons name={icon as any} size={24} color={selectedIcon === icon ? "white" : "#64748B"} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Time Selection */}
                                    <Text className={clsx("text-sm font-bold text-slate-600 mb-2", isArabic ? "text-right" : "text-left")}>
                                        {isArabic ? 'وقت اليوم' : 'Time of Day'}
                                    </Text>
                                    <View className="flex-row gap-2 mb-6">
                                        {TIMES.map(time => (
                                            <TouchableOpacity
                                                key={time.key}
                                                onPress={() => setSelectedTime(time.key)}
                                                className={clsx(
                                                    "flex-1 py-3 rounded-xl items-center",
                                                    selectedTime === time.key ? "bg-indigo-500" : "bg-slate-100"
                                                )}
                                            >
                                                <Text className={clsx("font-bold text-xs", selectedTime === time.key ? "text-white" : "text-slate-600")}>
                                                    {isArabic ? time.ar : time.en}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Days Selection */}
                                    <Text className={clsx("text-sm font-bold text-slate-600 mb-2", isArabic ? "text-right" : "text-left")}>
                                        {isArabic ? 'تكرار في' : 'Repeat on'}
                                    </Text>
                                    <View className="flex-row justify-between mb-8">
                                        {DAYS.map(day => (
                                            <TouchableOpacity
                                                key={day.value}
                                                onPress={() => toggleDay(day.value)}
                                                className={clsx(
                                                    "w-10 h-10 rounded-full items-center justify-center",
                                                    selectedDays.includes(day.value) ? "bg-indigo-500" : "bg-slate-100"
                                                )}
                                            >
                                                <Text className={clsx("font-bold", selectedDays.includes(day.value) ? "text-white" : "text-slate-600")}>
                                                    {isArabic ? day.labelAr : day.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>

                                {/* Add Button */}
                                <TouchableOpacity
                                    disabled={!newHabitTitle.trim()}
                                    onPress={handleAddHabit}
                                    className={clsx(
                                        "py-4 rounded-full items-center shadow-lg mt-4",
                                        newHabitTitle.trim() ? "bg-indigo-600" : "bg-slate-200"
                                    )}
                                >
                                    <Text className={clsx("font-bold text-lg", newHabitTitle.trim() ? "text-white" : "text-slate-400")}>
                                        {isArabic ? 'إضافة العادة' : 'Add Habit'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
};
