import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { I18nManager } from 'react-native';

// Define translations
const translations = {
    en: {
        dashboard: {
            title: 'Today',
            greeting: 'Welcome Back',
            morning: 'Morning',
            afternoon: 'Afternoon',
            evening: 'Evening',
            month_format: 'MMM yyyy'
        },
        habits: {
            drink_water: 'Drink Water',
            read: 'Read 10 pages',
            meditate: 'Meditate',
            journal: 'Journaling',
            deep_work: 'Deep Work',
            no_sugar: 'No Sugar',
            streak: 'Streak',
            days: 'days'
        },
        calendar: {
            today: 'Today'
        },
        ai: {
            title: 'Waddle AI',
            placeholder: 'Talk to Waddle...',
            typing: 'Waddle is thinking...',
            welcome_msg: "Hi there! I'm Waddle 🐧. Tell me a goal like 'I want to sleep better' or 'I want to read more'.",
            plan_card_title: 'Habit Architect',
            accept_btn: 'Accept Plan',
            error_msg: "Sorry, I couldn't understand that.",
            generic_msg: "That sounds great! I'm still learning."
        },
        tabs: {
            today: 'Today',
            challenges: 'Challenges',
            ai: 'Waddle AI',
            progress: 'Stats',
            settings: 'Settings'
        }
    },
    ar: {
        dashboard: {
            title: 'اليوم',
            greeting: 'أهلاً بك',
            morning: 'الصباح',
            afternoon: 'بعد الظهر',
            evening: 'المساء',
            month_format: 'MMM yyyy' // date-fns handles arabic months automatically if locale is passed
        },
        habits: {
            drink_water: 'شرب الماء',
            read: 'قراءة 10 صفحات',
            meditate: 'تأمل',
            journal: 'تدوين',
            deep_work: 'عمل عميق',
            no_sugar: 'بدون سكر',
            streak: 'أيام متتالية',
            days: 'أيام'
        },
        calendar: {
            today: 'اليوم'
        },
        ai: {
            title: 'مساعد وادل',
            placeholder: 'تحدث مع وادل...',
            typing: 'وادل يفكر...',
            welcome_msg: 'أهلاً بك! أنا وادل 🐧. أخبرني بهدفك وسأقوم بتصميم خطة عادات مخصصة لك.',
            plan_card_title: 'خطة مقترحة',
            accept_btn: 'اعتماد الخطة',
            error_msg: 'عذراً، لم أستطع فهم ذلك.',
            generic_msg: 'هذا يبدو رائعاً! ما زلت أتعلم.'
        },
        tabs: {
            today: 'اليوم',
            challenges: 'تحديات',
            ai: 'ذكاء وادل',
            progress: 'إحصائيات',
            settings: 'إعدادات'
        }
    }
};

const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
i18n.locale = deviceLocale;

// When a value is missing from a language it'll fall back to another language with the key present.
i18n.enableFallback = true;

// Helper to determine if we are in RTL mode
export const isRTL = deviceLocale === 'ar';

export default i18n;
