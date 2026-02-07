'use client';

import { useState } from 'react';
import { Calendar, Shield, Download, Trash2, ChevronRight } from 'lucide-react';

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

function SelectRow({ label, value, onChange, options, description }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <span className="text-sm font-medium text-charcoal dark:text-cream block mb-1">{label}</span>
                    {description && (
                        <span className="text-xs text-charcoal/50 dark:text-cream/50">{description}</span>
                    )}
                </div>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="border border-charcoal/20 dark:border-cream/20 rounded-xl px-4 py-2 text-sm font-medium bg-white dark:bg-charcoal text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all min-w-[160px]"
                >
                    {options.map((o: any) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

/* ==========================================
   LAYER 6: Entities (Business Logic)
   ========================================== */
const bookingModel = {
    useBookingPreferences() {
        const [prefs, setPrefs] = useState({
            preferredTime: 'morning',
            reminder: '1h',
        });

        const setPreferredTime = (time: string) =>
            setPrefs((prev) => ({ ...prev, preferredTime: time }));

        const setReminderTime = (reminder: string) =>
            setPrefs((prev) => ({ ...prev, reminder }));

        return { prefs, setPreferredTime, setReminderTime };
    },
};

const privacyModel = {
    downloadData() {
        console.log('Downloading user data...');
        alert('Your data download will begin shortly.');
    },

    deleteAccount() {
        const confirmed = window.confirm(
            'Are you sure you want to request account deletion? This action cannot be undone.'
        );
        if (confirmed) {
            console.log('Account deletion requested...');
            alert('Account deletion request submitted.');
        }
    },
};

/* ==========================================
   LAYER 5: Features (Feature Components)
   ========================================== */
function BookingPreferencesFeature() {
    const { prefs, setPreferredTime, setReminderTime } =
        bookingModel.useBookingPreferences();

    const timeOptions = [
        { value: 'morning', label: 'Morning (9AM - 12PM)' },
        { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
        { value: 'evening', label: 'Evening (5PM - 9PM)' },
    ];

    const reminderOptions = [
        { value: '30m', label: '30 minutes' },
        { value: '1h', label: '1 hour' },
        { value: '2h', label: '2 hours' },
        { value: '1d', label: '1 day' },
    ];

    return (
        <Card title="Booking Preferences" icon={<Calendar className="w-6 h-6" />} highlight={true}>
            <SelectRow
                label="Preferred Time Slot"
                description="Your default booking time preference"
                value={prefs.preferredTime}
                onChange={setPreferredTime}
                options={timeOptions}
            />

            <div className="border-t border-charcoal/5 dark:border-cream/5"></div>

            <SelectRow
                label="Appointment Reminder"
                description="When to receive booking reminders"
                value={prefs.reminder}
                onChange={setReminderTime}
                options={reminderOptions}
            />

            {/* Visual Indicator */}
            <div className="bg-gradient-to-br from-gold/5 to-gold/10 rounded-2xl p-4 border border-gold/20">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-charcoal dark:text-cream mb-1">
                            Smart Scheduling
                        </p>
                        <p className="text-xs text-charcoal/60 dark:text-cream/60">
                            We'll suggest appointments based on your preferences
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function PrivacyDataFeature() {
    return (
        <Card title="Privacy & Data" icon={<Shield className="w-6 h-6" />}>
            {/* Download Data Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-900/10 dark:to-blue-900/5 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-charcoal dark:text-cream mb-1">
                            Download Your Data
                        </h4>
                        <p className="text-xs text-charcoal/60 dark:text-cream/60">
                            Get a copy of your personal information and activity
                        </p>
                    </div>
                </div>
                <button
                    onClick={privacyModel.downloadData}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Request Data Export
                </button>
            </div>

            <div className="border-t border-charcoal/5 dark:border-cream/5"></div>

            {/* Delete Account Section */}
            <div className="bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-900/10 dark:to-red-900/5 rounded-2xl p-5 border border-red-100 dark:border-red-900/20">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-charcoal dark:text-cream mb-1">
                            Delete Account
                        </h4>
                        <p className="text-xs text-charcoal/60 dark:text-cream/60">
                            Permanently remove your account and all associated data
                        </p>
                    </div>
                </div>
                <button
                    onClick={privacyModel.deleteAccount}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Request Account Deletion
                </button>
            </div>

            {/* Info Notice */}
            <div className="bg-charcoal/5 dark:bg-cream/5 rounded-xl p-4">
                <p className="text-xs text-charcoal/60 dark:text-cream/60 leading-relaxed">
                    <span className="font-semibold text-charcoal dark:text-cream">Note:</span> Account deletion requests are processed within 30 days. You'll receive a confirmation email before permanent deletion.
                </p>
            </div>
        </Card>
    );
}

/* ==========================================
   LAYER 4: Widgets (Composite Components)
   ========================================== */
export default function SettingsPhaseTwo() {
    return (
        <div className="space-y-6">
            <BookingPreferencesFeature />
            <PrivacyDataFeature />
        </div>
    );
}