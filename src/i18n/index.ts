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
            anytime: 'Anytime',
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
            days: 'days',
            // Default Habits
            walk: 'Go for a walk',
            sleep: 'Sleep by 11 PM'
        },
        focus: {
            title: "What brings you here today?",
            subtitle: "Select all that apply.",
            fitness: 'Health & Fitness',
            work: 'Deep Work',
            mindfulness: 'Mindfulness',
            sleep: 'Better Sleep',
            learning: 'Learning',
            social: 'Social',
            continue: 'Continue'
        },
        onboarding_habits: {
            title: "Let's pick your first habits.",
            subtitle: "Start small to build momentum.",
            continue: "Continue"
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
        },
        welcome: {
            title: "Hey friend! Ready to waddle towards a better you?",
            subtitle: "Small steps lead to big changes. Let's build healthy habits together.",
            btn: "Let's Get Started"
        },
        stats: {
            title: "Your Progress",
            streak_sub: "Day Streak! Keep waddling!",
            heatmap: "Consistency Heatmap",
            total_habits: "Total Habits",
            perfect_days: "Perfect Days"
        },
        challenges: {
            live: "Live Now",
            daily_tag: "Daily Challenge • 24h",
            weekly_tag: "Weekly Challenge • 7d",
            join: "Join Now",
            joined: "Joined",
            joined_count: "joined",
            ends_in: "Ends in",
            footer: "New challenges drop every Monday."
        },
        settings: {
            language: 'Language',
            notifications: 'Notifications',
            logout: 'Log Out',
            logout_confirm: 'Are you sure you want to log out?'
        },
        common: {
            cancel: 'Cancel'
        },
        paywall: {
            title: "Unlock your full potential with Waddle Pro.",
            trial: "7 Days Free Trial",
            then: "Then $19.99/year. Cancel anytime.",
            btn: "Start 7-Day Free Trial",
            no_thanks: "No thanks, I'll continue with the limited version.",
            f1: "Unlimited Habits",
            f2: "Advanced Stats",
            f3: "Cloud Backup",
            f4: "Custom Icons",
            f5: "Priority Support"
        },
        challenge21: {
            title: "21-Day Challenge",
            subtitle: "Build a habit that sticks.",
            card_title: "My 21-Day Journey",
            start_btn: "Start a New Challenge",
            day: "Day",
            completed: "Challenge Completed!",
            failed: "Challenge Failed",
            select_habit: "Select a Habit to Challenge",
            modal_title: "Start Your Journey",
            rule: "Complete this habit every day for 21 days straight.",
            confirm_btn: "Start 21 Days",
        }
    },
    ar: {
        dashboard: {
            title: 'اليوم',
            greeting: 'أهلاً بك',
            morning: 'الصباح',
            afternoon: 'بعد الظهر',
            evening: 'المساء',
            anytime: 'في أي وقت',
            month_format: 'MMM yyyy'
        },
        habits: {
            drink_water: 'شرب الماء',
            read: 'قراءة 10 صفحات',
            meditate: 'تأمل',
            journal: 'تدوين',
            deep_work: 'عمل عميق',
            no_sugar: 'بدون سكر',
            streak: 'أيام متتالية',
            days: 'أيام',
            // Default Habits
            walk: 'المشي قليلاً',
            sleep: 'نوم قبل ١١م'
        },
        focus: {
            title: "وش اللي جابك اليوم؟",
            subtitle: "اختر كل اللي يهمك",
            fitness: 'صحة ولياقة',
            work: 'عمل بتركيز',
            mindfulness: 'صفاء ذهن',
            sleep: 'نوم أفضل',
            learning: 'تعلم',
            social: 'حياة اجتماعية',
            continue: 'استمر'
        },
        onboarding_habits: {
            title: "خلنا نختار عاداتك الأولى",
            subtitle: "ابدأ صغير عشان تستمر",
            continue: "استمر"
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
            settings: 'الإعدادات'
        },
        welcome: {
            title: "أهلاً يا صديقي! مستعد لتبدأ رحلتك نحو الأفضل؟",
            subtitle: "خطوات صغيرة تصنع تغييرات كبيرة. دعنا نبني عادات صحية معاً.",
            btn: "هيا نبدأ"
        },
        stats: {
            title: "إنجازك",
            streak_sub: "أيام متتالية! استمر يا بطل!",
            heatmap: "خريطة الالتزام",
            total_habits: "مجموع العادات",
            perfect_days: "أيام مثالية"
        },
        challenges: {
            live: "جاري الآن",
            daily_tag: "تحدي يومي • ٢٤ ساعة",
            weekly_tag: "تحدي أسبوعي • ٧ أيام",
            join: "انضم الآن",
            joined: "منضم",
            joined_count: "مشترك",
            ends_in: "ينتهي خلال",
            footer: "تحديات جديدة كل يوم إثنين."
        },
        settings: {
            language: 'اللغة',
            notifications: 'الإشعارات',
            logout: 'تسجيل الخروج',
            logout_confirm: 'هل أنت متأكد أنك تريد تسجيل الخروج؟'
        },
        common: {
            cancel: 'إلغاء'
        },
        paywall: {
            title: "أطلق العنان لقدراتك مع وادل برو",
            trial: "تجربة مجانية لمدة ٧ أيام",
            then: "ثم ١٩.٩٩$/سنة. الغي في أي وقت.",
            btn: "ابدأ التجربة المجانية",
            no_thanks: "لا شكراً، سأكمل بالنسخة المحدودة",
            f1: "عادات لا محدودة",
            f2: "إحصائيات متقدمة",
            f3: "نسخ احتياطي سحابي",
            f4: "أيقونات مخصصة",
            f5: "دعم فني عاجل"
        },
        challenge21: {
            title: "تحدي الـ ٢١ يوم",
            subtitle: "ابني عادة تدوم معك",
            card_title: "رحلتي في التحدي",
            start_btn: "ابدأ تحدي جديد",
            day: "يوم",
            completed: "أتممت التحدي بنجاح!",
            failed: "لم تكتمل المحاولة",
            select_habit: "اختر عادة للتحدي",
            modal_title: "ابدأ رحلتك",
            rule: "التزم بهذه العادة يومياً لمدة ٢١ يوم متواصلة.",
            confirm_btn: "ابدأ رحلة ٢١ يوم",
        }
    }
};

const i18n = new I18n(translations);

// Dynamic Localization
const locales = getLocales();

// Handle iOS returning "ar-SA" etc.
const supportedCode = locales[0]?.languageCode ?? 'en';
const systemLanguage = supportedCode.startsWith('ar') ? 'ar' : 'en';

export const deviceLocale = systemLanguage === 'ar' ? 'ar' : 'en';

i18n.locale = deviceLocale;
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Helper to determine if we are in RTL mode
export const isRTL = deviceLocale === 'ar';

export default i18n;
