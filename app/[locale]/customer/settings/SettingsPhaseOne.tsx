'use client';

import { useEffect, useState } from 'react';
import { Bell, Moon, LogOut, HelpCircle, ChevronRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

/* ==========================================
   LAYER 7: Shared (UI Components)
   ========================================== */
function Card({ title, icon, children, highlight = false }: any) {
    return (
        <div className={`group relative bg-white dark:bg-cocoa border ${highlight ? 'border-gold/30' : 'border-charcoal/10 dark:border-cream/10'
            } rounded-3xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden`}>
            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/5 to-transparent rounded-full blur-3xl"></div>

            {/* Header */}
            <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-charcoal dark:text-cream">{title}</h3>
                </div>
                <ChevronRight className="w-5 h-5 text-charcoal/30 dark:text-cream/30 group-hover:text-gold transition-colors" />
            </div>

            {/* Content */}
            <div className="relative space-y-5">
                {children}
            </div>
        </div>
    );
}

function Toggle({ label, checked, onChange, description }: any) {
    return (
        <div className="flex justify-between items-start gap-4 group/toggle">
            <div className="flex-1">
                <span className="text-sm font-medium text-charcoal dark:text-cream block mb-1">{label}</span>
                {description && (
                    <span className="text-xs text-charcoal/50 dark:text-cream/50">{description}</span>
                )}
            </div>
            <button
                onClick={onChange}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${checked
                    ? 'bg-gradient-to-r from-gold to-gold/80 shadow-lg shadow-gold/30'
                    : 'bg-charcoal/10 dark:bg-cream/10'
                    }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-7' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}

/* ==========================================
   LAYER 6: Entities (Business Logic)
   ========================================== */
const notificationsModel = {
    useNotifications() {
        const [notifications, setNotifications] = useState({
            whatsapp: true,
            sms: true,
            email: true,
        });

        const toggleWhatsApp = () =>
            setNotifications((prev) => ({ ...prev, whatsapp: !prev.whatsapp }));
        const toggleSMS = () =>
            setNotifications((prev) => ({ ...prev, sms: !prev.sms }));
        const toggleEmail = () =>
            setNotifications((prev) => ({ ...prev, email: !prev.email }));

        return { notifications, toggleWhatsApp, toggleSMS, toggleEmail };
    },
};

const themeModel = {
    useTheme() {
        const [darkMode, setDarkMode] = useState(false);

        useEffect(() => {
            const theme = localStorage.getItem('theme');
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                setDarkMode(true);
            }
        }, []);

        const toggleTheme = () => {
            const next = !darkMode;
            setDarkMode(next);
            if (next) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        };

        return { darkMode, toggleTheme };
    },
};

const languageModel = {
    useLanguage() {
        const router = useRouter();
        const pathname = usePathname();
        const locale = useLocale();

        const changeLanguage = (nextLocale: string) => {
            const cleanPath = pathname.replace(`/${locale}`, '');
            router.push(`/${nextLocale}${cleanPath}`);
        };

        return { locale, changeLanguage };
    },
};

const authModel = {
    useAuth() {
        const router = useRouter();

        const logout = () => {
            localStorage.removeItem('salon_token');
            router.push('/auth/login');
        };

        return { logout };
    },
};

/* ==========================================
   LAYER 5: Features (Feature Components)
   ========================================== */
function NotificationsFeature() {
    const { notifications, toggleWhatsApp, toggleSMS, toggleEmail } =
        notificationsModel.useNotifications();

    return (
        <Card title="Notifications" icon={<Bell className="w-6 h-6" />} highlight={true}>
            <Toggle
                label="WhatsApp Notifications"
                description="Receive booking updates via WhatsApp"
                checked={notifications.whatsapp}
                onChange={toggleWhatsApp}
            />
            <div className="border-t border-charcoal/5 dark:border-cream/5"></div>
            <Toggle
                label="SMS Notifications"
                description="Get text messages for appointments"
                checked={notifications.sms}
                onChange={toggleSMS}
            />
            <div className="border-t border-charcoal/5 dark:border-cream/5"></div>
            <Toggle
                label="Email Notifications"
                description="Stay updated through email"
                checked={notifications.email}
                onChange={toggleEmail}
            />
        </Card>
    );
}

function AppPreferencesFeature() {
    const { darkMode, toggleTheme } = themeModel.useTheme();
    const { locale, changeLanguage } = languageModel.useLanguage();

    return (
        <Card title="App Preferences" icon={<Moon className="w-6 h-6" />}>
            <Toggle
                label="Dark Mode"
                description="Switch between light and dark theme"
                checked={darkMode}
                onChange={toggleTheme}
            />

            <div className="border-t border-charcoal/5 dark:border-cream/5"></div>

            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <span className="text-sm font-medium text-charcoal dark:text-cream block mb-1">Language</span>
                    <span className="text-xs text-charcoal/50 dark:text-cream/50">Choose your preferred language</span>
                </div>
                <select
                    value={locale}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="border border-charcoal/20 dark:border-cream/20 rounded-xl px-4 py-2 text-sm font-medium bg-white dark:bg-charcoal text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="mr">मराठी</option>
                </select>
            </div>
        </Card>
    );
}

function SecurityFeature() {
    const router = useRouter();
    const { logout } = authModel.useAuth(); // Using your existing hook

    const handleLogout = () => {
        // 1. Call the auth model logout (handles internal state)
        if (logout) logout();

        // 2. Manual cleanup to match Header.tsx logic
        localStorage.removeItem('salon_user');
        localStorage.removeItem('salon_token');

        // 3. Notify the Header to update immediately
        window.dispatchEvent(new Event('storage'));

        // 4. Redirect to home/login
        router.push('/');
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <LogOut className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-semibold text-[#4a3728]">Security</h2>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6 border border-red-100">
                <p className="text-sm text-[#7a6a5e] mb-5">
                    You will be logged out from all devices and redirected to the landing page.
                    Any unsaved changes will be lost.
                </p>

                <button
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 flex items-center justify-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Logout from Account
                </button>
            </div>
        </div>
    );
}

function HelpSupportFeature() {
    const router = useRouter(); // 2. Initialize the router

    const triggerChat = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // This "shouts" to the ChatbotWidget
        window.dispatchEvent(new CustomEvent("open-glowbiz-chat"));
    };

    const links = [
        { label: 'Help Center', href: '#', onClick: triggerChat },
        {
            label: 'Contact Support',
            onClick: () => router.push('/contact') // 3. Use router.push here
        },
        { label: 'Privacy Policy', onClick: () => router.push('/privacy') },

        {
            label: 'Terms & Conditions', onClick: () => {
                const link = document.createElement('a');
                link.href = '/terms.pdf';
                link.download = 'GlowBiz_Terms_and_Conditions.pdf'; // Sets the filename
                link.click();
            }
        },
    ];

    return (
        <Card title="Help & Support" icon={<HelpCircle className="w-6 h-6" />}>
            <div className="space-y-3">
                {links.map((link, index) => (
                    <button // Use button instead of <a> to prevent page jumps
                        key={index}
                        onClick={link.onClick}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gold/5 transition-colors group/link"
                    >
                        <span className="text-sm font-medium text-charcoal dark:text-cream">
                            {link.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-charcoal/30 group-hover:text-gold" />
                    </button>
                ))}
            </div>

            <div className="border-t border-charcoal/5 dark:border-cream/5 pt-4 mt-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal/40 dark:text-cream/40">App Version</span>
                    <span className="text-xs font-mono text-gold">1.0.0</span>
                </div>
            </div>
        </Card>
    );
}

/* ==========================================
   LAYER 4: Widgets (Composite Components)
   ========================================== */
export default function SettingsPhaseOne() {
    return (
        <div className="space-y-6">
            <NotificationsFeature />
            <AppPreferencesFeature />
            <SecurityFeature />
            <HelpSupportFeature />
        </div>
    );
}