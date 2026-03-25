/**
 * Theme definitions for the learning manager application
 * Each theme contains a complete color palette following Material Design 3 principles
 */

export type ThemeName = 'void' | 'ocean' | 'forest' | 'sunset' | 'cornsilk' | 'soft_peach' | 'metallic_gold' | 'dark_goldenrod' | 'olive_bark';

export interface ThemeColors {
  // Background
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;

  // Surface levels
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceBright: string;

  // Primary (Main accent)
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary (Supporting color)
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary (Accent color)
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Outline
  outline: string;
  outlineVariant: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  colors: ThemeColors;
}

/**
 * VOID Theme - Original cyan/blue dark theme
 */
export const voidTheme: Theme = {
  name: 'void',
  label: 'VOID (Cyan)',
  colors: {
    background: '#111317',
    onBackground: '#e2e2e8',
    surface: '#111317',
    onSurface: '#e2e2e8',
    surfaceVariant: '#333539',
    onSurfaceVariant: '#bbc9cf',
    surfaceContainerLowest: '#0c0e12',
    surfaceContainerLow: '#1a1c20',
    surfaceContainer: '#1e2024',
    surfaceContainerHigh: '#282a2e',
    surfaceContainerHighest: '#333539',
    surfaceBright: '#37393e',
    primary: '#a4e6ff',
    onPrimary: '#003543',
    primaryContainer: '#00d1ff',
    onPrimaryContainer: '#00566a',
    secondary: '#9ccee2',
    onSecondary: '#003543',
    secondaryContainer: '#184f60',
    onSecondaryContainer: '#8ec0d3',
    tertiary: '#ffd59c',
    onTertiary: '#442b00',
    tertiaryContainer: '#feb127',
    onTertiaryContainer: '#6b4700',
    outline: '#859399',
    outlineVariant: '#3c494e',
  },
};

/**
 * Ocean Theme - Deep blue/teal theme
 */
export const oceanTheme: Theme = {
  name: 'ocean',
  label: 'Ocean',
  colors: {
    background: '#0a0e14',
    onBackground: '#e0e3eb',
    surface: '#0a0e14',
    onSurface: '#e0e3eb',
    surfaceVariant: '#2d3239',
    onSurfaceVariant: '#aeb7c6',
    surfaceContainerLowest: '#050709',
    surfaceContainerLow: '#12171f',
    surfaceContainer: '#171d25',
    surfaceContainerHigh: '#21272f',
    surfaceContainerHighest: '#2c323a',
    surfaceBright: '#343b43',
    primary: '#5dd9ff',
    onPrimary: '#002e3f',
    primaryContainer: '#004959',
    onPrimaryContainer: '#8ff3ff',
    secondary: '#7dd3ea',
    onSecondary: '#003d4f',
    secondaryContainer: '#00596b',
    onSecondaryContainer: '#aef0ff',
    tertiary: '#7cc5cc',
    onTertiary: '#003f45',
    tertiaryContainer: '#005a61',
    onTertiaryContainer: '#a4e8f0',
    outline: '#8a9199',
    outlineVariant: '#46505a',
  },
};

/**
 * Forest Theme - Green/emerald theme
 */
export const forestTheme: Theme = {
  name: 'forest',
  label: 'Forest',
  colors: {
    background: '#0b1410',
    onBackground: '#dfe3dc',
    surface: '#0b1410',
    onSurface: '#dfe3dc',
    surfaceVariant: '#2d3529',
    onSurfaceVariant: '#adb8a8',
    surfaceContainerLowest: '#06080c',
    surfaceContainerLow: '#131c13',
    surfaceContainer: '#182218',
    surfaceContainerHigh: '#222c22',
    surfaceContainerHighest: '#2d372c',
    surfaceBright: '#323e33',
    primary: '#6dd962',
    onPrimary: '#0d3b0d',
    primaryContainer: '#1f5920',
    onPrimaryContainer: '#9ef57b',
    secondary: '#8dd2b7',
    onSecondary: '#00382c',
    secondaryContainer: '#1f5142',
    onSecondaryContainer: '#afe9d0',
    tertiary: '#8cd0d0',
    onTertiary: '#003738',
    tertiaryContainer: '#1f5051',
    onTertiaryContainer: '#aef0f1',
    outline: '#8a9585',
    outlineVariant: '#49524a',
  },
};

/**
 * Sunset Theme - Warm orange/red theme
 */
export const sunsetTheme: Theme = {
  name: 'sunset',
  label: 'Sunset',
  colors: {
    background: '#140d0a',
    onBackground: '#ede1dc',
    surface: '#140d0a',
    onSurface: '#ede1dc',
    surfaceVariant: '#332b27',
    onSurfaceVariant: '#c0aea5',
    surfaceContainerLowest: '#0f0805',
    surfaceContainerLow: '#1c1511',
    surfaceContainer: '#211916',
    surfaceContainerHigh: '#2b2420',
    surfaceContainerHighest: '#362f2a',
    surfaceBright: '#3f3835',
    primary: '#ffb3a0',
    onPrimary: '#350b00',
    primaryContainer: '#5a1a0a',
    onPrimaryContainer: '#ffdcc8',
    secondary: '#e5bfad',
    onSecondary: '#3f2817',
    secondaryContainer: '#58412c',
    onSecondaryContainer: '#ffe1cb',
    tertiary: '#e4a870',
    onTertiary: '#3f2600',
    tertiaryContainer: '#59401d',
    onTertiaryContainer: '#ffdeaa',
    outline: '#998678',
    outlineVariant: '#51443e',
  },
};

/**
 * Cornsilk Theme - Light warm theme with golden tones
 */
export const cornsilkTheme: Theme = {
  name: 'cornsilk',
  label: 'Cornsilk',
  colors: {
    background: '#fffdf7',
    onBackground: '#1a1512',
    surface: '#fffdf7',
    onSurface: '#1a1512',
    surfaceVariant: '#e8dcc8',
    onSurfaceVariant: '#4b423b',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#fff8e7',
    surfaceContainer: '#fff0da',
    surfaceContainerHigh: '#ffe8ce',
    surfaceContainerHighest: '#ffe0c1',
    surfaceBright: '#fffdf7',
    primary: '#bc8300',
    onPrimary: '#ffffff',
    primaryContainer: '#ffd778',
    onPrimaryContainer: '#3d2900',
    secondary: '#c8941a',
    onSecondary: '#ffffff',
    secondaryContainer: '#ffd88a',
    onSecondaryContainer: '#3f3000',
    tertiary: '#866311',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffd89b',
    onTertiaryContainer: '#2e2000',
    outline: '#79705f',
    outlineVariant: '#ccc0b4',
  },
};

/**
 * Soft Peach Theme - Light theme with peach undertones
 */
export const softPeachTheme: Theme = {
  name: 'soft_peach',
  label: 'Soft Peach',
  colors: {
    background: '#fcf6e8',
    onBackground: '#1c1410',
    surface: '#fcf6e8',
    onSurface: '#1c1410',
    surfaceVariant: '#ead9c3',
    onSurfaceVariant: '#4d443b',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f6e3b9',
    surfaceContainer: '#f0d18b',
    surfaceContainerHigh: '#e7b747',
    surfaceContainerHighest: '#dda23f',
    surfaceBright: '#fcf6e8',
    primary: '#866311',
    onPrimary: '#ffffff',
    primaryContainer: '#e7b747',
    onPrimaryContainer: '#2d2000',
    secondary: '#c8941a',
    onSecondary: '#ffffff',
    secondaryContainer: '#ffc966',
    onSecondaryContainer: '#3f3000',
    tertiary: '#9e6d1f',
    onTertiary: '#ffffff',
    tertiaryContainer: '#fod987',
    onTertiaryContainer: '#331f00',
    outline: '#7a7265',
    outlineVariant: '#ccc0b4',
  },
};

/**
 * Metallic Gold Theme - Light theme with rich gold
 */
export const metallicGoldTheme: Theme = {
  name: 'metallic_gold',
  label: 'Metallic Gold',
  colors: {
    background: '#f8f1dc',
    onBackground: '#1f1a0f',
    surface: '#f8f1dc',
    onSurface: '#1f1a0f',
    surfaceVariant: '#e8dcc8',
    onSurfaceVariant: '#504638',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f0e2b9',
    surfaceContainer: '#e7d496',
    surfaceContainerHigh: '#ddc672',
    surfaceContainerHighest: '#ca9f27',
    surfaceBright: '#f8f1dc',
    primary: '#654f13',
    onPrimary: '#ffffff',
    primaryContainer: '#e4c672',
    onPrimaryContainer: '#1f1806',
    secondary: '#98771d',
    onSecondary: '#ffffff',
    secondaryContainer: '#ffc266',
    onSecondaryContainer: '#2d2200',
    tertiary: '#9e6d1f',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffby87',
    onTertiaryContainer: '#331f00',
    outline: '#82746f',
    outlineVariant: '#d9cdc1',
  },
};

/**
 * Dark Goldenrod Theme - Light theme with sophisticated gold
 */
export const darkGoldenrodTheme: Theme = {
  name: 'dark_goldenrod',
  label: 'Dark Goldenrod',
  colors: {
    background: '#f1e9d7',
    onBackground: '#1a1510',
    surface: '#f1e9d7',
    onSurface: '#1a1510',
    surfaceVariant: '#e3d3af',
    onSurfaceVariant: '#504638',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#dec696',
    surfaceContainer: '#d5bd87',
    surfaceContainerHigh: '#c7a85f',
    surfaceContainerHighest: '#b08d3e',
    surfaceBright: '#f1e9d7',
    primary: '#473919',
    onPrimary: '#ffffff',
    primaryContainer: '#c7a85f',
    onPrimaryContainer: '#0f0b05',
    secondary: '#6a5625',
    onSecondary: '#ffffff',
    secondaryContainer: '#ffc266',
    onSecondaryContainer: '#231d0c',
    tertiary: '#7d6128',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffby87',
    onTertiaryContainer: '#231d0c',
    outline: '#82746f',
    outlineVariant: '#d4c4b8',
  },
};

/**
 * Olive Bark Theme - Light theme with olive and earth tones
 */
export const oliveBarkTheme: Theme = {
  name: 'olive_bark',
  label: 'Olive Bark',
  colors: {
    background: '#eee2ca',
    onBackground: '#16110b',
    surface: '#eee2ca',
    onSurface: '#16110b',
    surfaceVariant: '#ddd1bd',
    onSurfaceVariant: '#4d433c',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#dec696',
    surfaceContainer: '#cda961',
    surfaceContainerHigh: '#b18838',
    surfaceContainerHighest: '#7d6128',
    surfaceBright: '#eee2ca',
    primary: '#322610',
    onPrimary: '#ffffff',
    primaryContainer: '#b18838',
    onPrimaryContainer: '#0a0703',
    secondary: '#4a3918',
    onSecondary: '#ffffff',
    secondaryContainer: '#ffc266',
    onSecondaryContainer: '#191308',
    tertiary: '#5a4d1f',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffca87',
    onTertiaryContainer: '#1a1408',
    outline: '#7a6f67',
    outlineVariant: '#cdc4ba',
  },
};

/**
 * All available themes
 */
export const THEMES: Record<ThemeName, Theme> = {
  void: voidTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  cornsilk: cornsilkTheme,
  soft_peach: softPeachTheme,
  metallic_gold: metallicGoldTheme,
  dark_goldenrod: darkGoldenrodTheme,
  olive_bark: oliveBarkTheme,
};

/**
 * Get theme by name
 */
export function getTheme(name: ThemeName): Theme {
  return THEMES[name] || voidTheme;
}

/**
 * Apply theme colors to CSS custom properties
 */
export function applyThemeColors(colors: ThemeColors): void {
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case and add --color- prefix
    const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });
}
