import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { BlurView } from 'expo-blur';
import { getLocales } from 'expo-localization';

interface AddHabitModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (habit: { title: string; icon: string; time: string; frequency: number[] }) => void;
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

export const AddHabitModal = ({ visible, onClose, onAdd }: AddHabitModalProps) => {
    const deviceLocales = getLocales();
    const isArabic = deviceLocales[0]?.languageCode === 'ar';

    const [title, setTitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('star');
    const [selectedTime, setSelectedTime] = useState('Anytime');
    const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day].sort());
        }
    };

    const handleAdd = () => {
        if (!title.trim()) return;
        onAdd({
            title: title.trim(),
            icon: selectedIcon,
            time: selectedTime,
            frequency: selectedDays.length > 0 ? selectedDays : [0, 1, 2, 3, 4, 5, 6]
        });
        // Reset form
        setTitle('');
        setSelectedIcon('star');
        setSelectedTime('Anytime');
        setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <BlurView intensity={20} tint="dark" className="flex-1">
                <View className="flex-1 justify-end">
                    <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={onClose} />

                    <View className="bg-white rounded-t-3xl p-6 shadow-2xl" style={{ maxHeight: '85%' }}>
                        {/* Header */}
                        <View className={clsx("mb-6 items-center justify-between", isArabic ? "flex-row-reverse" : "flex-row")}>
                            <Text className={clsx("text-2xl font-black text-slate-800", isArabic ? "text-right" : "text-left")}>
                                {isArabic ? 'إضافة عادة جديدة' : 'Add New Habit'}
                            </Text>
                            <TouchableOpacity onPress={onClose} className="bg-slate-100 p-2 rounded-full">
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Habit Name */}
                            <Text className={clsx("text-sm font-bold text-slate-600 mb-2", isArabic ? "text-right" : "text-left")}>
                                {isArabic ? 'اسم العادة' : 'Habit Name'}
                            </Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
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
                            disabled={!title.trim()}
                            onPress={handleAdd}
                            className={clsx(
                                "py-4 rounded-full items-center shadow-lg mt-4",
                                title.trim() ? "bg-indigo-600" : "bg-slate-200"
                            )}
                        >
                            <Text className={clsx("font-bold text-lg", title.trim() ? "text-white" : "text-slate-400")}>
                                {isArabic ? 'إضافة العادة' : 'Add Habit'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
};
