import { create } from 'zustand';
import { MascotMood } from '../constants/mascotAssets';

interface AppState {
    mascotMood: MascotMood;
    setMascotMood: (mood: MascotMood) => void;
    userSession: any | null; // Replace with Supabase Session type later
    setUserSession: (session: any | null) => void;
    hasFinishedOnboarding: boolean;
    setHasFinishedOnboarding: (finished: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    mascotMood: 'idle',
    setMascotMood: (mood) => set({ mascotMood: mood }),
    userSession: null,
    setUserSession: (session) => set({ userSession: session }),
    hasFinishedOnboarding: false,
    setHasFinishedOnboarding: (finished) => set({ hasFinishedOnboarding: finished }),
}));
