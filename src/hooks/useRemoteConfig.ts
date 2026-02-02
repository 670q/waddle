import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface AppConfig {
    id: number;
    is_paywall_active: boolean;
    monthly_price: string;
    yearly_price: string;
    promo_text: string;
}

const fetchAppConfig = async (): Promise<AppConfig | null> => {
    const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
    }
    return data;
};

export const useRemoteConfig = () => {
    return useQuery({
        queryKey: ['app_config'],
        queryFn: fetchAppConfig,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
