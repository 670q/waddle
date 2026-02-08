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

            generateChallenges: async (forceRefresh = false) => {
                const { challenges, lastDailyGenDate, lastWeeklyGenDate } = get();
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const isMonday = now.getDay() === 1; // 1 = Monday
                const ONE_DAY = 24 * 60 * 60 * 1000;

                const needsDaily = forceRefresh || lastDailyGenDate !== todayStr;
                const needsWeekly = forceRefresh || (isMonday && lastWeeklyGenDate !== todayStr) || !challenges.find(c => c.type === 'weekly');

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
                            const isArabic = i18n.locale.startsWith('ar');
                            dbDaily = {
                                id: dailyRow.id,
                                title: (isArabic ? dailyRow.title_ar : dailyRow.title_en) || dailyRow.title,
                                description: (isArabic ? dailyRow.description_ar : dailyRow.description_en) || dailyRow.description,
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
                            const isArabic = i18n.locale.startsWith('ar');
                            dbWeekly = {
                                id: weeklyRow.id,
                                title: (isArabic ? weeklyRow.title_ar : weeklyRow.title_en) || weeklyRow.title,
                                description: (isArabic ? weeklyRow.description_ar : weeklyRow.description_en) || weeklyRow.description,
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
                    // If forcing refresh, we still prioritize DB, but we might re-fetch AI if DB is missing and we forced clear
                    let askForDaily = needsDaily && !dbDaily;
                    let askForWeekly = needsWeekly && !dbWeekly;

                    // Optimization: If not forcing, and we have cache, don't ask AI again
                    if (!forceRefresh) {
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
                    } else {
                        // If forcing refresh, and DB is empty, we generally want to re-run AI only if the day changed or we really want new content.
                        // For now, let's assume forceRefresh (from DB change) only cares about DB content. 
                        // If DB is empty, we keep existing AI content unless it's expired.
                        // Simplify: If forceRefresh is TRUE (DB update), we don't want to re-generate AI, just re-fetch DB.
                        askForDaily = false;
                        askForWeekly = false;
                    }


                    if (askForDaily || askForWeekly) {
                        // Only run AI if strictly needed (not on simple DB update)
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
                        // ... (Fetch logic would go here, but omitted for simplicity in this replacement if logic unchanged)
                        // Wait, I need to keep the fetch logic if I'm replacing the whole block. 
                        // To minimize code churn and errors, I will just call the original logic if needed, 
                        // but for DB updates, we usually just want to see the DB item.

                        // RE-INSERTING AI FETCH LOGIC CAREFULLY
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

                        // Update cache with new AI results
                        // ... (merging below)
                        // This is getting complicated to replace in one chunk. 
                        // Let me stick to the logic: forceRefresh = true -> Just get from DB.
                        // But the "updatedChallenges" logic below relies on `aiChallenges` variable if it exists.
                    }

                    // ... This replace is too risky for a single block due to local variables.
                    // I will restart the tool call and use multi_replace to target specific lines.

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
                            get().generateChallenges(true);
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
