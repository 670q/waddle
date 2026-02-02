import { create } from 'zustand';
import { MascotMood } from '../constants/mascotAssets';

export interface Habit {
    id: string;
    title: string;
    icon: string;
    time: string;
    streak: number;
    completed: boolean;
}

export interface Blueprint {
    id: string;
    title: string;
    icon: string;
    description: string;
    frequency: string;
    duration: string;
    time: string;
}

interface AppState {
    mascotMood: MascotMood;
    setMascotMood: (mood: MascotMood) => void;
    userSession: any | null;
    setUserSession: (session: any | null) => void;
    hasFinishedOnboarding: boolean;
    setHasFinishedOnboarding: (finished: boolean) => void;

    // Habits
    habits: Habit[];
    addHabit: (habit: Habit) => void;
    toggleHabit: (id: string) => void;

    // AI Architect
    activeBlueprint: Blueprint | null;
    setActiveBlueprint: (blueprint: Blueprint | null) => void;
}

import i18n from '../i18n';

export const useAppStore = create<AppState>((set) => ({
    mascotMood: 'idle',
    setMascotMood: (mood) => set({ mascotMood: mood }),
    userSession: null,
    setUserSession: (session) => set({ userSession: session }),
    hasFinishedOnboarding: false,
    setHasFinishedOnboarding: (finished) => set({ hasFinishedOnboarding: finished }),

    habits: [
        { id: '1', title: i18n.t('habits.drink_water'), icon: 'water-outline', time: 'Morning', streak: 12, completed: false },
        { id: '2', title: i18n.t('habits.meditate'), icon: 'leaf-outline', time: 'Morning', streak: 5, completed: true },
        { id: '3', title: i18n.t('habits.deep_work'), icon: 'briefcase-outline', time: 'Afternoon', streak: 3, completed: false },
    ],
    addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
    toggleHabit: (id) => set((state) => ({
        habits: state.habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h)
    })),

    activeBlueprint: null,
    setActiveBlueprint: (blueprint) => set({ activeBlueprint: blueprint }),
    // Helper to refresh habits on language change? (Not requested but good practice if dynamic language switch was a feature. 
    // Here we just follow "based on current locale" instruction).
}));
