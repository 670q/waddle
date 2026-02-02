import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { useAppStore } from '../store/useAppStore';

export interface Habit {
    id: number;
    title: string;
    icon: string;
    color: string;
    isCompleted?: boolean; // Derived state
}

export const useHabits = (date: Date) => {
    const queryClient = useQueryClient();
    const dateStr = format(date, 'yyyy-MM-dd');

    // 1. Fetch Habits & Logs
    const { data: habits, isLoading } = useQuery({
        queryKey: ['habits', dateStr],
        queryFn: async () => {
            // Fetch habits
            const { data: habitsData, error: distError } = await supabase
                .from('habits')
                .select('*');
            if (distError) throw distError;

            // Fetch logs for this date
            const { data: logsData, error: logsError } = await supabase
                .from('habit_logs')
                .select('habit_id')
                .eq('date_logged', dateStr);
            if (logsError) throw logsError;

            // Merge
            const completedIds = new Set(logsData?.map(l => l.habit_id));
            return habitsData?.map(h => ({
                ...h,
                isCompleted: completedIds.has(h.id),
            })) as Habit[];
        },
    });

    // 2. Toggle Mutation (Optimistic)
    const toggleHabit = useMutation({
        mutationFn: async (habitId: number) => {
            // Check if already completed (simple toggle for now, usually it's insert vs delete)
            // For this demo: assume we ONLY complete. Swipe to undo could be a separate feature.

            const { error } = await supabase
                .from('habit_logs')
                .insert({ habit_id: habitId, date_logged: dateStr });
            if (error) throw error;
        },
        onMutate: async (habitId) => {
            // Cancel refetch
            await queryClient.cancelQueries({ queryKey: ['habits', dateStr] });

            // Snapshot previous value
            const previousHabits = queryClient.getQueryData(['habits', dateStr]);

            // Optimistic Update
            queryClient.setQueryData(['habits', dateStr], (old: Habit[] | undefined) => {
                if (!old) return [];
                return old.map(h => h.id === habitId ? { ...h, isCompleted: true } : h);
            });

            return { previousHabits };
        },
        onError: (_err, _newTodo, context) => {
            queryClient.setQueryData(['habits', dateStr], context?.previousHabits);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['habits', dateStr] });
        },
    });

    return { habits, isLoading, toggleHabit };
};
