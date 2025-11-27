import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates if a string is a valid CSS color
 * Supports: hex (#RGB, #RRGGBB, #RRGGBBAA), rgb/rgba, hsl/hsla, and named colors
 */
export function isValidCSSColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;

  // Trim whitespace
  color = color.trim();

  // Check for hex colors (#RGB or #RRGGBB or #RRGGBBAA)
  if (/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color)) return true;

  // Check for rgb/rgba
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(color))
    return true;

  // Check for hsl/hsla
  if (
    /^hsla?\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*(,\s*[\d.]+\s*)?\)$/i.test(
      color
    )
  )
    return true;

  // For named colors and other valid CSS values, use a temporary element
  if (typeof document !== 'undefined') {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  return false;
}

/**
 * Returns the color if valid, otherwise returns the fallback
 */
export function sanitizeColor(color: string, fallback: string): string {
  return isValidCSSColor(color) ? color : fallback;
}
