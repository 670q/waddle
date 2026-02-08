import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import i18n from '../i18n';

// Reusing key for now (ideally in env)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly';
    joinedCount: number;
    timeLeft: string; // Calculated
    color: string;
    image_url?: string;
    joined: boolean;
    expiresAt: number;
    is_active?: boolean;
}

interface ChallengesState {
    challenges: Challenge[];
    hasHydrated: boolean;
    todayStr: string; // YYYY-MM-DD
    lastDailyGenDate: string;
    lastWeeklyGenDate: string;
    loading: boolean;
    setHasHydrated: (state: boolean) => void;
    joinChallenge: (id: string) => void;
    generateChallenges: (forceRefresh?: boolean) => Promise<void>;
    subscribeToUpdates: () => () => void;
}

export const useChallengesStore = create<ChallengesState>()(
    persist(
        (set, get) => ({
            hasHydrated: false,
            challenges: [],
            todayStr: '',
            lastDailyGenDate: '',
            lastWeeklyGenDate: '',
            loading: false,

            setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

            joinChallenge: async (id) => {
                const { challenges } = get();
                const challenge = challenges.find(c => c.id === id);

                if (!challenge) return;

                // 1. Optimistic Update
                set((state) => ({
                    challenges: state.challenges.map((c) =>
                        c.id === id ? { ...c, joined: true, joinedCount: c.joinedCount + 1 } : c
                    ),
                }));

                // 2. Add to Habits (Local/Store)
                useAppStore.getState().addHabit({
                    id: `challenge-${id}-${Date.now()}`,
                    title: challenge.title,
                    icon: 'trophy',
                    time: 'Anytime',
                    streak: 0,
                    completed: false,
                    frequency: [0, 1, 2, 3, 4, 5, 6]
                });

                // 3. Persist to DB
                try {
                    const { error } = await supabase
                        .from('user_challenges')
                        .insert({
                            user_id: (await supabase.auth.getUser()).data.user?.id,
                            challenge_id: id
                        });

                    if (error) {
                        console.error("Failed to join challenge in DB:", error);
                    }
                } catch (e) {
                    console.error("Join challenge exception:", e);
                }
            },

            generateChallenges: async (forceRefresh = false) => {
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const ONE_DAY = 24 * 60 * 60 * 1000;
                const isArabic = i18n.locale.startsWith('ar');

                set({ loading: true });

                try {
                    // Always fetch from Database
                    const { data: dbChallenges, error } = await supabase
                        .from('challenges')
                        .select('*')
                        .eq('is_active', true)
                        .lte('start_date', todayStr)
                        .gte('end_date', todayStr);

                    console.log('[Challenges] Fetched from DB:', dbChallenges?.length, 'error:', error);

                    if (error) {
                        console.error('[Challenges] DB Error:', error);
                        set({ loading: false });
                        return;
                    }

                    // Get user's joined challenges
                    const user = await supabase.auth.getUser();
                    const userId = user.data.user?.id;
                    let joinedIds = new Set<string>();

                    if (userId) {
                        const { data: userJoins } = await supabase
                            .from('user_challenges')
                            .select('challenge_id')
                            .eq('user_id', userId);
                        joinedIds = new Set(userJoins?.map(j => j.challenge_id) || []);
                    }

                    // Map DB challenges to app format
                    const mappedChallenges: Challenge[] = (dbChallenges || []).map(row => ({
                        id: row.id,
                        title: (isArabic ? row.title_ar : row.title_en) || row.title,
                        description: (isArabic ? row.description_ar : row.description_en) || row.description,
                        type: row.type,
                        joinedCount: row.type === 'daily'
                            ? 120 + Math.floor(Math.random() * 50)
                            : 540 + Math.floor(Math.random() * 100),
                        timeLeft: row.type === 'daily' ? '24:00:00' : '7 Days',
                        color: row.bg_color || (row.type === 'daily' ? 'bg-[#4A90E2]' : 'bg-slate-800'),
                        image_url: row.image_url,
                        joined: joinedIds.has(row.id),
                        expiresAt: Date.now() + (row.type === 'daily' ? ONE_DAY : ONE_DAY * 7),
                        is_active: row.is_active
                    }));

                    // Sort: daily first, then weekly
                    mappedChallenges.sort((a, b) => {
                        if (a.type === 'daily' && b.type === 'weekly') return -1;
                        if (a.type === 'weekly' && b.type === 'daily') return 1;
                        return 0;
                    });

                    console.log('[Challenges] Mapped challenges:', mappedChallenges.length);

                    set({
                        challenges: mappedChallenges,
                        loading: false,
                        lastDailyGenDate: todayStr,
                        lastWeeklyGenDate: todayStr
                    });

                } catch (error) {
                    console.error("Failed to generate challenges", error);
                    set({ loading: false });
                }
            },

            subscribeToUpdates: () => {
                const channel = supabase
                    .channel('challenges_updates')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'challenges' },
                        (payload) => {
                            console.log('[Challenges] Realtime event:', payload.eventType);
                            // Force re-fetch from DB
                            get().generateChallenges(true);
                        }
                    )
                    .subscribe((status) => {
                        console.log('[Challenges] Subscription status:', status);
                    });

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        }),
        {
            name: 'waddle-challenges-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            }
        }
    )
);
