import React, { useState } from 'react';
import { Palette, ChevronDown } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { THEMES, ThemeName } from '../theme/themes';

/**
 * Theme switcher dropdown component
 * Allows users to change the application theme
 */
export function ThemeSwitcher() {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentThemeLabel = THEMES[currentTheme].label;

  const handleThemeSelect = (theme: ThemeName) => {
    setTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors text-sm font-medium"
        title="Switch theme"
        aria-label="Theme switcher"
        aria-expanded={isOpen}
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">{currentThemeLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-surface-container-high border border-outline-variant/20 rounded-lg shadow-lg z-50 min-w-[180px] overflow-hidden">
          {/* Close button for mobile */}
          <div className="sm:hidden p-3 border-b border-outline-variant/10">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-sm text-on-surface-variant hover:text-on-surface text-left"
            >
              Close
            </button>
          </div>

          {/* Theme options */}
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleThemeSelect(key as ThemeName)}
              className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${
                currentTheme === key
                  ? 'bg-primary/15 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
              aria-current={currentTheme === key ? 'true' : 'false'}
            >
              <span>{theme.label}</span>
              {currentTheme === key && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}

          {/* Color preview */}
          <div className="border-t border-outline-variant/10 p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold opacity-60">
              Preview
            </p>
            <div className="flex gap-1.5">
              {Object.entries(THEMES).map(([key, theme]) => (
                <div
                  key={key}
                  className="w-6 h-6 rounded-md ring-1 ring-outline-variant/30 transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: theme.colors.primary }}
                  onClick={() => handleThemeSelect(key as ThemeName)}
                  title={theme.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
