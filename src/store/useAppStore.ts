import { create } from 'zustand';
import { MascotMood } from '../constants/mascotAssets';
import { supabase } from '../lib/supabase';
import i18n from '../i18n';
import { scheduleChallengeReminder, cancelChallengeReminder } from '../lib/notifications';

export interface Habit {
    id: string;
    title: string;
    icon: string;
    time: string;
    streak: number;
    completed: boolean;
    frequency?: number[]; // 0=Sun, 1=Mon...
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

export interface HabitChallenge {
    id: string;
    habit_id: string;
    challenge_name?: string;
    start_date: string;
    end_date: string; // generated
    status: 'active' | 'completed' | 'failed';
    current_day: number;
    longest_streak: number;
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
    habitLogs: Record<string, string[]>; // habitId -> ["2023-01-01", "2023-01-02"]
    isLoadingHabits: boolean;
    fetchHabits: () => Promise<void>;
    addHabit: (habit: Habit) => Promise<void>;
    overwriteHabits: (habits: Habit[]) => Promise<void>;
    toggleHabit: (id: string, dateStr: string) => Promise<void>;

    // AI Architect
    activeBlueprint: Blueprint | null;
    setActiveBlueprint: (blueprint: Blueprint | null) => void;

    // 21-Day Challenge
    activeChallenge: HabitChallenge | null;
    fetchActiveChallenge: () => Promise<void>;
    startChallenge: (habitId: string, challengeName?: string) => Promise<void>;
    quitChallenge: () => Promise<void>;
    updateChallengeProgress: (habitId: string, completed: boolean) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    mascotMood: 'idle',
    setMascotMood: (mood) => set({ mascotMood: mood }),
    userSession: null,
    setUserSession: async (session) => {
        const previousSession = get().userSession;
        set({ userSession: session });

        if (session && !previousSession) {
            // User just logged in. Check for "Guest Habits" to migrate.
            const { habits } = get();
            if (habits.length > 0) {
                // We have guest habits! Upload them.
                const rows = habits.map(h => ({
                    title: h.title,
                    icon: h.icon,
                    time: h.time,
                    streak: h.streak,
                    completed: false, // Default to false in DB, logs track completion
                    frequency: h.frequency,
                    user_id: session.user.id
                }));

                const { error } = await supabase.from('habits').insert(rows);
                if (error) {
                    console.error("Failed to migrate guest habits", error);
                }
                // Clear local guest habits, will refetch
                set({ habits: [] });
            }

            // Now fetch the source of truth
            get().fetchHabits();
        } else if (session) {
            // Just a session refresh or init
            get().fetchHabits();
        }
    },
    hasFinishedOnboarding: false,
    setHasFinishedOnboarding: (finished) => set({ hasFinishedOnboarding: finished }),

    habits: [],
    habitLogs: {},
    isLoadingHabits: false,

    fetchHabits: async () => {
        const { userSession } = get();
        if (!userSession) return;

        set({ isLoadingHabits: true });

        // 1. Fetch Habits
        const { data: habitsData, error: habitsError } = await supabase
            .from('habits')
            .select('*')
            .order('created_at', { ascending: true });

        // 2. Fetch Logs (Last 365 Days to be safe/simple)
        const { data: logsData, error: logsError } = await supabase
            .from('habit_logs')
            .select('habit_id, completed_at');

        if (!habitsError && habitsData) {
            const logsMap: Record<string, string[]> = {};

            if (!logsError && logsData) {
                logsData.forEach((log: any) => {
                    if (!logsMap[log.habit_id]) logsMap[log.habit_id] = [];
                    logsMap[log.habit_id].push(log.completed_at);
                });
            }

            set({
                habits: habitsData as Habit[],
                habitLogs: logsMap
            });
        }
        set({ isLoadingHabits: false });
    },

    addHabit: async (habit) => {
        // Optimistic Update
        set((state) => ({ habits: [...state.habits, habit] }));

        const { userSession } = get();
        if (userSession) {
            const { error } = await supabase.from('habits').insert({
                title: habit.title,
                icon: habit.icon,
                time: habit.time,
                streak: habit.streak,
                completed: false,
                frequency: habit.frequency,
                user_id: userSession.user.id
            });

            if (error) console.error("Error adding habit to DB", error);
            else get().fetchHabits();
        }
    },

    overwriteHabits: async (habits) => {
        set({ habits });

        const { userSession } = get();
        if (userSession) {
            // Delete all and re-insert 
            await supabase.from('habits').delete().eq('user_id', userSession.user.id);

            if (habits.length > 0) {
                const rows = habits.map(h => ({
                    title: h.title,
                    icon: h.icon,
                    time: h.time,
                    streak: h.streak,
                    completed: false, // reset
                    frequency: h.frequency,
                    user_id: userSession.user.id
                }));
                const { error } = await supabase.from('habits').insert(rows);
                if (error) console.error("Error overwriting habits in DB", error);
                else get().fetchHabits();
            }
        }
    },

    toggleHabit: async (id, dateStr) => {
        const { habitLogs, userSession } = get();
        const currentLogs = habitLogs[id] || [];
        const isCompleted = currentLogs.includes(dateStr);

        let newLogs = [];
        if (isCompleted) {
            newLogs = currentLogs.filter(d => d !== dateStr);
        } else {
            newLogs = [...currentLogs, dateStr];
        }

        // Optimistic Update
        set((state) => ({
            habitLogs: {
                ...state.habitLogs,
                [id]: newLogs
            }
        }));

        if (userSession) {
            if (isCompleted) {
                // Was completed, so we remove it (UNCHECK)
                const { error } = await supabase
                    .from('habit_logs')
                    .delete()
                    .match({ habit_id: id, completed_at: dateStr });

                if (error) console.error("Error deleting log", error);
            } else {
                // Was not completed, so we add it (CHECK)
                const { error } = await supabase
                    .from('habit_logs')
                    .insert({ habit_id: id, completed_at: dateStr, user_id: userSession.user.id });

                if (error) console.error("Error inserting log", error);
            }

            // NOTE: Streak calculation would ideally happen on backend or efficient frontend logic here.
            // For now, we are decoupling streak from the 'habits.streak' column visually.

            // 21-Day Challenge Logic
            const { activeChallenge, updateChallengeProgress } = get();
            if (activeChallenge && activeChallenge.habit_id === id && activeChallenge.status === 'active') {
                // If we entered this flow, 'isCompleted' was the OLD state.
                // So if isCompleted was true, we just UNCHECKED it -> new state is false.
                // If isCompleted was false, we just CHECKED it -> new state is true.
                const newCompletedState = !isCompleted;
                updateChallengeProgress(id, newCompletedState);
            }
        }
    },

    activeBlueprint: null,
    setActiveBlueprint: (blueprint) => set({ activeBlueprint: blueprint }),

    activeChallenge: null,

    fetchActiveChallenge: async () => {
        const { userSession } = get();
        if (!userSession) return;

        const { data, error } = await supabase
            .from('habit_challenges')
            .select('*')
            .eq('user_id', userSession.user.id)
            .eq('status', 'active')
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error("Error fetching active challenge", error);
        }

        if (data) {
            set({ activeChallenge: data as HabitChallenge });
        } else {
            set({ activeChallenge: null });
        }
    },

    startChallenge: async (habitId, challengeName) => {
        const { userSession } = get();
        if (!userSession) return;

        // 1. Deactivate any existing active challenge
        const { activeChallenge } = get();
        if (activeChallenge) {
            await supabase
                .from('habit_challenges')
                .update({ status: 'failed' })
                .eq('id', activeChallenge.id);
        }

        // 2. Create new challenge
        const { data, error } = await supabase
            .from('habit_challenges')
            .insert({
                user_id: userSession.user.id,
                habit_id: habitId,
                challenge_name: challengeName || 'My 21-Day Journey',
                status: 'active',
                current_day: 0
            })
            .select()
            .single();

        if (error) {
            console.error("Error starting challenge", error);
            return;
        }

        set({ activeChallenge: data as HabitChallenge });
        get().fetchHabits();

        // Schedule daily challenge reminder
        scheduleChallengeReminder(challengeName);
    },

    quitChallenge: async () => {
        const { activeChallenge, userSession } = get();
        if (!activeChallenge || !userSession) return;

        const { error } = await supabase
            .from('habit_challenges')
            .update({ status: 'failed' })
            .eq('id', activeChallenge.id);

        if (error) {
            console.error("Error quitting challenge", error);
            return;
        }

        set({ activeChallenge: null });

        // Cancel challenge reminders
        cancelChallengeReminder();
    },

    updateChallengeProgress: async (habitId, completed) => {
        const { activeChallenge, userSession } = get();
        if (!activeChallenge || activeChallenge.habit_id !== habitId || !userSession) return;

        // This logic runs AFTER the toggleHabit logic, so we just blindly increment/decrement based on 'completed' status
        // However, correct logic is: 
        // If completed = true (habit just marked done): increment current_day
        // If completed = false (habit unmarked): decrement current_day

        // NOTE: This assumes daily progress. If we want strict "streak" logic, we need to check dates.
        // For simplicity V1: Just tracking total completions as "days".

        let newDay = activeChallenge.current_day;
        if (completed) {
            newDay = Math.min(newDay + 1, 21);
        } else {
            newDay = Math.max(newDay - 1, 0);
        }

        let newStatus: 'active' | 'completed' | 'failed' = 'active';
        if (newDay >= 21) {
            newStatus = 'completed';
        }

        // Optimistic
        set({
            activeChallenge: {
                ...activeChallenge,
                current_day: newDay,
                status: newStatus
            }
        });

        const { error } = await supabase
            .from('habit_challenges')
            .update({
                current_day: newDay,
                status: newStatus,
                longest_streak: newDay // simplistic for now
            })
            .eq('id', activeChallenge.id);

        if (error) {
            console.error("Error updating challenge progress", error);
            // rollback?
        }
    },
}));
