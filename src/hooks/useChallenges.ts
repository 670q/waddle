import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

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
    generateChallenges: () => Promise<void>;
    subscribeToUpdates: () => () => void;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

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
                        // Optional: Rollback state here if strict consistency needed
                    }
                } catch (e) {
                    console.error("Join challenge exception:", e);
                }
            },

            generateChallenges: async () => {
                const { challenges, lastDailyGenDate, lastWeeklyGenDate } = get();
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const isMonday = now.getDay() === 1; // 1 = Monday
                const ONE_DAY = 24 * 60 * 60 * 1000;

                const needsDaily = lastDailyGenDate !== todayStr;
                const needsWeekly = (isMonday && lastWeeklyGenDate !== todayStr) || !challenges.find(c => c.type === 'weekly');

                if (!needsDaily && !needsWeekly) {
                    return; // Everything is up to date
                }

                set({ loading: true });

                try {
                    // 1. Fetch from Database (Priority)
                    let dbDaily: Challenge | null = null;
                    let dbWeekly: Challenge | null = null;

                    const { data: dbChallenges, error } = await supabase
                        .from('challenges')
                        .select('*')
                        .eq('is_active', true)
                        .lte('start_date', todayStr)
                        .gte('end_date', todayStr);

                    if (dbChallenges && !error) {
                        const dailyRow = dbChallenges.find(c => c.type === 'daily');
                        const weeklyRow = dbChallenges.find(c => c.type === 'weekly');

                        if (dailyRow) {
                            dbDaily = {
                                id: dailyRow.id,
                                title: dailyRow.title,
                                description: dailyRow.description,
                                type: 'daily',
                                joinedCount: 120 + Math.floor(Math.random() * 50),
                                timeLeft: '24:00:00',
                                color: dailyRow.bg_color || 'bg-[#4A90E2]',
                                image_url: dailyRow.image_url,
                                joined: false,
                                expiresAt: Date.now() + ONE_DAY,
                                is_active: true
                            };
                        }

                        if (weeklyRow) {
                            dbWeekly = {
                                id: weeklyRow.id,
                                title: weeklyRow.title,

                                description: weeklyRow.description,
                                type: 'weekly',
                                joinedCount: 540 + Math.floor(Math.random() * 100),
                                timeLeft: '7 Days',
                                color: weeklyRow.bg_color || 'bg-slate-800',
                                image_url: weeklyRow.image_url,
                                joined: false,
                                expiresAt: Date.now() + (ONE_DAY * 7)
                            };
                        }
                    }

                    // 2. Prepare AI Prompt for MISSING challenges only
                    let askForDaily = needsDaily && !dbDaily;
                    let askForWeekly = needsWeekly && !dbWeekly;

                    if (!askForDaily && !askForWeekly) {
                        // All fulfilled by DB or cache
                        let updated = [...challenges];
                        // If DB returned something new to replace cache, update it
                        if (needsDaily && dbDaily) {
                            updated = updated.filter(c => c.type !== 'daily');
                            updated.unshift(dbDaily!);
                            set({ lastDailyGenDate: todayStr });
                        }
                        if (needsWeekly && dbWeekly) {
                            updated = updated.filter(c => c.type !== 'weekly');
                            updated.push(dbWeekly!);
                            set({ lastWeeklyGenDate: todayStr });
                        }
                        set({ challenges: updated, loading: false });
                        return;
                    }

                    let prompt = "";
                    if (askForDaily && askForWeekly) {
                        prompt = `Generate 2 Habit Challenges (1 Daily, 1 Weekly).`;
                    } else if (askForDaily) {
                        prompt = `Generate 1 Daily Habit Challenge.`;
                    } else if (askForWeekly) {
                        prompt = `Generate 1 Weekly Habit Challenge.`;
                    }

                    const systemPrompt = `
            ${prompt}
            
            ROLE: You are Waddle, a fun Saudi Penguin coach.
            CONTEXT: App for habits.
            
            TYPES:
            - Daily: Fun, easy, 24 hours.
            - Weekly: Harder, consistency, 7 days.
            
            LANGUAGE: Returns titles/descriptions in ARABIC (Modern, Motivating, Gulf/Saudi flavor).
            
            OUTPUT JSON ARRAY:
            [
              { "title": "...", "description": "...", "type": "daily" (or "weekly"), "color": "bg-[#4A90E2]" (Daily) or "bg-slate-800" (Weekly) }
            ]
          `;

                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
                        })
                    });

                    const data = await response.json();
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                    let aiChallenges: any[] = [];
                    const jsonMatch = text.match(/\[.*\]/s);
                    if (jsonMatch) {
                        aiChallenges = JSON.parse(jsonMatch[0]);
                    }

                    // 4. Merge Logic (Existing Cache + DB + New AI)
                    let updatedChallenges = [...challenges];

                    // DAILY MERGE
                    if (needsDaily) {
                        updatedChallenges = updatedChallenges.filter(c => c.type !== 'daily'); // Clear old
                        const daily = dbDaily || aiChallenges.map((c: any, index: number) => ({
                            id: Date.now().toString() + 'ai' + index,
                            title: c.title,
                            description: c.description,
                            type: c.type,
                            joinedCount: Math.floor(Math.random() * 50) + 10,
                            timeLeft: c.type === 'daily' ? '24:00:00' : '7 Days',
                            color: c.color || 'bg-[#4A90E2]',
                            joined: false,
                            expiresAt: Date.now() + ONE_DAY
                        })).find((c: any) => c.type === 'daily');

                        if (daily) updatedChallenges.unshift(daily);
                        set({ lastDailyGenDate: todayStr });
                    }

                    // WEEKLY MERGE
                    if (needsWeekly) {
                        updatedChallenges = updatedChallenges.filter(c => c.type !== 'weekly'); // Clear old
                        const weekly = dbWeekly || aiChallenges.map((c: any, index: number) => ({
                            id: Date.now().toString() + 'ai' + index,
                            title: c.title,
                            description: c.description,
                            type: c.type,
                            joinedCount: Math.floor(Math.random() * 50) + 10,
                            timeLeft: c.type === 'daily' ? '24:00:00' : '7 Days',
                            color: c.color || 'bg-slate-800',
                            joined: false,
                            expiresAt: Date.now() + (ONE_DAY * 7)
                        })).find((c: any) => c.type === 'weekly');

                        if (weekly) updatedChallenges.push(weekly);
                        set({ lastWeeklyGenDate: todayStr });
                    }

                    // 5. Check "Joined" Status against DB (user_challenges)
                    const { data: userJoins } = await supabase
                        .from('user_challenges')
                        .select('challenge_id')
                        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

                    const joinedIds = new Set(userJoins?.map(j => j.challenge_id) || []);

                    const finalChallenges = updatedChallenges.map(c => ({
                        ...c,
                        joined: joinedIds.has(c.id) || c.joined // Keep local true if just joined
                    }));

                    set({ challenges: finalChallenges, loading: false });

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
                        () => {
                            // Force re-generation/fetch
                            get().generateChallenges();
                        }
                    )
                    .subscribe();

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
