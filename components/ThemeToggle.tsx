import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../services/theme';

export const ThemeToggle: React.FC<{ mobile?: boolean }> = ({ mobile = false }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ] as const;

  const currentIndex = themes.findIndex(t => t.value === theme);
  const CurrentIcon = themes[currentIndex]?.icon || Monitor;

  const cycleTheme = () => {
    const next = (currentIndex + 1) % themes.length;
    setTheme(themes[next].value);
  };

  /* ---------------- MOBILE VERSION ---------------- */
  if (mobile) {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={cycleTheme}
        aria-label={`Switch theme (current: ${theme})`}
        className="
          p-2 rounded-lg backdrop-blur-sm
          bg-zinc-100 dark:bg-zinc-900/50
          border border-zinc-300 dark:border-zinc-800
          text-zinc-700 dark:text-zinc-400
          hover:text-zinc-900 dark:hover:text-zinc-200
          hover:border-zinc-400 dark:hover:border-zinc-700
          transition-all
        "
      >
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CurrentIcon size={20} />
        </motion.div>
      </motion.button>
    );
  }

  /* ---------------- DESKTOP VERSION ---------------- */
  return (
    <div className="mt-auto pt-4 border-t border-zinc-300 dark:border-zinc-800">
      <motion.div
        className="
          p-3 rounded-xl overflow-hidden
          bg-zinc-100/60 dark:bg-zinc-900/50
          border border-zinc-300 dark:border-zinc-800
          hover:border-zinc-400 dark:hover:border-zinc-700
          transition-all
        "
      >
        {/* Main Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={cycleTheme}
          aria-label={`Switch theme (current: ${theme})`}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.div
              key={theme}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="
                w-8 h-8 rounded-lg flex items-center justify-center
                bg-zinc-200 dark:bg-zinc-800
                group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700
                transition-colors
              "
            >
              <CurrentIcon
                size={18}
                className="text-zinc-700 dark:text-zinc-300"
              />
            </motion.div>

            <div className="text-left">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Theme
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">
                {themes[currentIndex]?.label}
              </div>
            </div>
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.25 }}
            className="text-zinc-600 dark:text-zinc-500 group-hover:text-zinc-400"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.button>

        {/* Mini Option Buttons */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-zinc-300 dark:border-zinc-800">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = t.value === theme;

            return (
              <motion.button
                key={t.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme(t.value);
                }}
                className={`
                  flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5
                  text-xs transition-all

                  ${isActive
                    ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                    : 'text-zinc-600 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                  }
                `}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
