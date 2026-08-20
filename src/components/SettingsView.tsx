import { useState } from 'react';
import { UserPreferences } from '../types/alarm';
import { PermissionsModal } from './PermissionsModal';
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  BellRing,
  BatteryCharging,
  Cpu,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  Clock,
  RotateCcw,
  Sun,
  Moon,
  Palette,
  Sparkles,
  Camera,
  Mic,
  Activity,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onResetDefaults: () => void;
}

export function SettingsView({
  preferences,
  onUpdatePreferences,
  onResetDefaults,
}: SettingsViewProps) {
  const [userName, setUserName] = useState(preferences.userName);
  const [weatherCity, setWeatherCity] = useState(preferences.weatherCity);
  const [selectedOem, setSelectedOem] = useState<'samsung' | 'xiaomi' | 'oneplus' | 'pixel'>('pixel');
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  const isLight = preferences.theme === 'white' || preferences.theme === 'light';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      userName: userName.trim() || 'Nitish',
      weatherCity: weatherCity.trim() || 'San Francisco, CA',
    });
  };

  const oemGuides = {
    pixel: {
      name: 'Google Pixel / Stock Android 12–16',
      status: 'Fully Compatible',
      steps: [
        'Allow "Schedule Exact Alarms" in Special App Access.',
        'Ensure "POST_NOTIFICATIONS" is enabled.',
        'Battery usage set to "Unrestricted" for zero-lag wake-up.',
      ],
    },
    samsung: {
      name: 'Samsung One UI',
      status: 'Requires Setup',
      steps: [
        'Go to Settings &rarr; Apps &rarr; AuraWake &rarr; Battery &rarr; Select "Unrestricted".',
        'Exclude AuraWake from "Deep Sleeping Apps" in Device Care.',
        'Allow "Appear on top" permission.',
      ],
    },
    xiaomi: {
      name: 'Xiaomi MIUI / HyperOS',
      status: 'Requires Setup',
      steps: [
        'Enable "Autostart" in App Info &rarr; Permissions.',
        'Set Battery Saver to "No restrictions".',
        'Allow "Show on Lock screen" and "Display pop-up windows".',
      ],
    },
    oneplus: {
      name: 'OnePlus / OxygenOS',
      status: 'Requires Setup',
      steps: [
        'Disable Battery Optimization for AuraWake.',
        'Lock AuraWake in the Recent Apps overview.',
        'Allow Background Activity execution.',
      ],
    },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1
          className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
            isLight ? 'text-stone-900' : 'text-stone-100'
          }`}
        >
          <ShieldAlert className="w-6 h-6 text-red-500" />
          Settings & Reliability Control Center
        </h1>
        <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-red-200/70'}`}>
          Configure White/Black theme, audio profile, and Android battery optimizations
        </p>
      </div>

      {/* 1. Theme & Appearance Toggle Section */}
      <div
        id="theme-selection-card"
        className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          isLight
            ? 'bg-white border-red-200 shadow-red-500/5'
            : 'bg-gradient-to-b from-[#180709] to-[#100406] border-red-900/40 shadow-red-950/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2
            className={`text-sm font-black flex items-center gap-2 ${
              isLight ? 'text-stone-900' : 'text-yellow-400'
            }`}
          >
            <Palette className="w-4 h-4 text-red-500" />
            Theme & Appearance Toggle
          </h2>
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
              isLight
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-red-950 text-yellow-300 border-yellow-500/40'
            }`}
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
            {isLight ? 'White Theme Active' : 'Black Theme Active'}
          </span>
        </div>

        <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-300'}`}>
          Choose between high-contrast White Light mode and AMOLED Obsidian Black mode with radiant red & golden yellow accents.
        </p>

        {/* 2-Card Interactive Theme Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Black Mode Button */}
          <button
            id="theme-select-black"
            type="button"
            onClick={() => onUpdatePreferences({ theme: 'black' })}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
              !isLight
                ? 'bg-[#1b070a] border-yellow-400 shadow-lg shadow-yellow-500/15 ring-2 ring-yellow-400/20'
                : 'bg-stone-900 border-stone-800 text-stone-200 hover:border-yellow-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-red-800/80 flex items-center justify-center text-yellow-400 shadow-inner">
                <Moon className="w-5 h-5 fill-yellow-400/20 text-yellow-400" />
              </div>
              <div>
                <div className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                  <span>Obsidian Black Mode</span>
                  {!isLight && <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />}
                </div>
                <div className="text-[11px] text-red-200/70 mt-0.5">
                  Deep dark, battery saving & red-gold accents
                </div>
              </div>
            </div>
            {!isLight && (
              <span className="text-[10px] font-black uppercase text-yellow-300 bg-red-950 px-2 py-0.5 rounded border border-yellow-500/40">
                Selected
              </span>
            )}
          </button>

          {/* White Mode Button */}
          <button
            id="theme-select-white"
            type="button"
            onClick={() => onUpdatePreferences({ theme: 'white' })}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
              isLight
                ? 'bg-gradient-to-br from-amber-50 to-white border-red-500 shadow-lg shadow-red-500/10 ring-2 ring-red-400/20 text-stone-900'
                : 'bg-stone-100 border-stone-300 text-stone-900 hover:border-red-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-yellow-400 flex items-center justify-center text-amber-700 shadow-inner">
                <Sun className="w-5 h-5 fill-amber-400 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-black text-red-950 flex items-center gap-1.5">
                  <span>Crisp White Mode</span>
                  {isLight && <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />}
                </div>
                <div className="text-[11px] text-stone-600 mt-0.5">
                  High-contrast bright canvas & warm cardinal red
                </div>
              </div>
            </div>
            {isLight && (
              <span className="text-[10px] font-black uppercase text-red-900 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                Selected
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Permissions Center Section */}
      <div
        className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          isLight
            ? 'bg-white border-red-200 shadow-red-500/5'
            : 'bg-stone-900 border-stone-800 shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h2 className={`text-sm font-bold ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
              System & Device Permissions Manager
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsPermissionsModalOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 font-black text-xs rounded-xl shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition-all"
          >
            Open Permission Center 🛡️
          </button>
        </div>

        <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
          Grant and test hardware access for Camera Photo verification, Microphone Chanting recognition, Gesture/Motion sensors, Notification priority, and Device Screen Lock/Freeze protection.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {[
            { label: 'Camera & QR Scanner', icon: Camera, status: 'Active' },
            { label: 'Microphone & Voice Chanting', icon: Mic, status: 'Active' },
            { label: 'Motion & Step Gestures', icon: Activity, status: 'Active' },
            { label: 'Screen Freeze & Anti-Cheat', icon: Lock, status: 'Protected' },
            { label: 'Exact Alarm Notifications', icon: BellRing, status: 'Granted' },
            { label: 'WakeLock Screen Keep-On', icon: Smartphone, status: 'Active' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                onClick={() => setIsPermissionsModalOpen(true)}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isLight
                    ? 'bg-stone-50 border-stone-200 hover:border-red-300'
                    : 'bg-stone-950 border-stone-800 hover:border-yellow-500/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-yellow-500" />
                  <span className={`text-[11px] font-bold ${isLight ? 'text-stone-800' : 'text-stone-200'}`}>
                    {item.label}
                  </span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* OEM Battery Killer Guides */}
      <div
        className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          isLight
            ? 'bg-white border-red-200 shadow-red-500/5'
            : 'bg-stone-900 border-stone-800 shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2
            className={`text-sm font-bold flex items-center gap-2 ${
              isLight ? 'text-stone-900' : 'text-stone-100'
            }`}
          >
            <Smartphone className="w-4 h-4 text-red-500" />
            OEM Manufacturer Background Guard
          </h2>
          <span className="text-[11px] text-stone-500">Select your device model</span>
        </div>

        {/* OEM Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['pixel', 'samsung', 'xiaomi', 'oneplus'] as const).map((oem) => (
            <button
              key={oem}
              type="button"
              onClick={() => setSelectedOem(oem)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedOem === oem
                  ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 shadow-md'
                  : isLight
                  ? 'bg-stone-100 text-stone-600 hover:text-stone-900'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {oem}
            </button>
          ))}
        </div>

        {/* Selected OEM guide info */}
        <div
          className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-stone-50 border-stone-200' : 'bg-stone-950/80 border-stone-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold ${isLight ? 'text-stone-900' : 'text-stone-200'}`}>
              {oemGuides[selectedOem].name}
            </h3>
            <span className="text-[11px] font-semibold text-yellow-500">
              {oemGuides[selectedOem].status}
            </span>
          </div>

          <ul className={`space-y-1.5 text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
            {oemGuides[selectedOem].steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-500 font-bold font-mono">{idx + 1}.</span>
                <span dangerouslySetInnerHTML={{ __html: step }} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* User Customization & Profile */}
      <div
        className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          isLight
            ? 'bg-white border-red-200 shadow-red-500/5'
            : 'bg-stone-900 border-stone-800 shadow-xl'
        }`}
      >
        <h2
          className={`text-sm font-bold flex items-center gap-2 ${
            isLight ? 'text-stone-900' : 'text-stone-100'
          }`}
        >
          <User className="w-4 h-4 text-yellow-500" />
          User Profile & Morning Voice Briefing
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isLight ? 'text-stone-600' : 'text-stone-400'
                }`}
              >
                Your Name (for Morning Greeting)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-yellow-400 border ${
                  isLight
                    ? 'bg-stone-50 border-stone-300 text-stone-900'
                    : 'bg-stone-950 border-stone-800 text-stone-100'
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isLight ? 'text-stone-600' : 'text-stone-400'
                }`}
              >
                Weather City (for Audio Briefing)
              </label>
              <input
                type="text"
                value={weatherCity}
                onChange={(e) => setWeatherCity(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-yellow-400 border ${
                  isLight
                    ? 'bg-stone-50 border-stone-300 text-stone-900'
                    : 'bg-stone-950 border-stone-800 text-stone-100'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="twentyFourHourToggle"
                checked={preferences.twentyFourHour}
                onChange={(e) => onUpdatePreferences({ twentyFourHour: e.target.checked })}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
              <label
                htmlFor="twentyFourHourToggle"
                className={`text-xs font-medium cursor-pointer ${
                  isLight ? 'text-stone-700' : 'text-stone-300'
                }`}
              >
                Use 24-Hour Military Time Format
              </label>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-400 hover:from-red-500 hover:to-yellow-300 text-stone-950 text-xs font-black rounded-xl shadow-md cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Reset to Factory Defaults */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
          isLight ? 'bg-white border-stone-200' : 'bg-stone-950 border-stone-900'
        }`}
      >
        <div>
          <div className={`font-semibold ${isLight ? 'text-stone-800' : 'text-stone-300'}`}>
            Restore Default State
          </div>
          <div className={`${isLight ? 'text-stone-500' : 'text-stone-500'}`}>
            Reset all alarms, stats, and missions to defaults
          </div>
        </div>
        <button
          type="button"
          onClick={onResetDefaults}
          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-stone-800 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Permissions Modal */}
      {isPermissionsModalOpen && (
        <PermissionsModal
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          isLight={isLight}
        />
      )}
    </div>
  );
}
