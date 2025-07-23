/**
 * Design Tokens for Paper Birthdays
 * Implements the "Bright & Airy" design language
 */

export const colors = {
  // Primary Colors
  primary: {
    main: '#0EA5E9', // Sky blue
    light: '#BAE6FD', // Light blue accent
    dark: '#0284C7', // Darker sky blue for hover states
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF', // Pure white
    secondary: '#F8FAFC', // Soft gray sections
    tertiary: '#F1F5F9', // Even lighter gray for subtle backgrounds
  },
  
  // Text Colors
  text: {
    primary: '#1E293B', // Dark gray for main text
    secondary: '#64748B', // Medium gray for secondary text
    muted: '#94A3B8', // Light gray for muted text
    inverse: '#FFFFFF', // White text for dark backgrounds
  },
  
  // Accent Colors
  accent: {
    amber: '#F59E0B', // Warm amber for highlights and CTAs
    success: '#10B981', // Emerald green for positive states
    warning: '#F97316', // Orange for warnings
    error: '#EF4444', // Red for errors
    info: '#3B82F6', // Blue for informational states
  },
  
  // Border Colors
  border: {
    light: '#E2E8F0', // Light border
    medium: '#CBD5E1', // Medium border
    primary: '#BAE6FD', // Light blue border for cards
    focus: '#0EA5E9', // Sky blue for focus states
  },
  
  // Surface Colors
  surface: {
    card: '#FFFFFF', // White for cards
    elevated: '#FFFFFF', // White for elevated surfaces
    hover: '#F8FAFC', // Light gray for hover states
    pressed: '#F1F5F9', // Slightly darker gray for pressed states
  },
} as const;

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '0.75rem', // 12px
  lg: '1rem',    // 16px
  xl: '1.5rem',  // 24px
  '2xl': '2rem', // 32px
  '3xl': '3rem', // 48px
  '4xl': '4rem', // 64px
  '5xl': '6rem', // 96px
} as const;

export const borderRadius = {
  sm: '0.25rem', // 4px
  md: '0.5rem',  // 8px
  lg: '0.75rem', // 12px
  xl: '1rem',    // 16px
  full: '9999px', // Full rounded
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  card: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
} as const;

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  fontSize: {
    xs: ['0.75rem', '1rem'],     // 12px, line-height 16px
    sm: ['0.875rem', '1.25rem'],  // 14px, line-height 20px
    base: ['1rem', '1.5rem'],     // 16px, line-height 24px
    lg: ['1.125rem', '1.75rem'],  // 18px, line-height 28px
    xl: ['1.25rem', '1.75rem'],   // 20px, line-height 28px
    '2xl': ['1.5rem', '2rem'],    // 24px, line-height 32px
    '3xl': ['1.875rem', '2.25rem'], // 30px, line-height 36px
    '4xl': ['2.25rem', '2.5rem'], // 36px, line-height 40px
    '5xl': ['3rem', '1'],         // 48px, line-height 1
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: '2rem',    // 32px
      md: '2.5rem',  // 40px
      lg: '3rem',    // 48px
    },
    padding: {
      sm: '0.5rem 0.75rem',  // 8px 12px
      md: '0.75rem 1rem',    // 12px 16px
      lg: '1rem 1.5rem',     // 16px 24px
    },
  },
  card: {
    padding: {
      sm: '1rem',      // 16px
      md: '1.5rem',    // 24px
      lg: '2rem',      // 32px
    },
    borderRadius: borderRadius.lg,
    borderColor: colors.border.primary,
    shadow: shadows.card,
  },
  badge: {
    padding: '0.25rem 0.5rem', // 4px 8px
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.xs,
  },
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Typography = typeof typography;
export type ZIndex = typeof zIndex;
export type Components = typeof components;