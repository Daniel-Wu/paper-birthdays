import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge and dedupe Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class handling
 * 
 * @param inputs - Class values to merge
 * @returns Merged and deduped class string
 * 
 * @example
 * ```tsx
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': true })
 * // Returns: "px-4 py-2 bg-blue-500 text-white"
 * 
 * cn('p-4', 'px-6') 
 * // Returns: "p-4 px-6" (tailwind-merge handles conflicts)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with appropriate suffixes (K, M, B)
 * Useful for displaying citation counts, view counts, etc.
 * 
 * @param num - Number to format
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted number string
 * 
 * @example
 * ```tsx
 * formatNumber(1234) // "1.2K"
 * formatNumber(1234567) // "1.2M"
 * formatNumber(1234567890) // "1.2B"
 * ```
 */
export function formatNumber(num: number, precision: number = 1): string {
  if (num < 1000) {
    return num.toString();
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixIndex = Math.floor(Math.log10(num) / 3);
  const scaledNum = num / Math.pow(1000, suffixIndex);
  
  return scaledNum.toFixed(precision) + suffixes[suffixIndex];
}

/**
 * Debounce function to limit the rate of function execution
 * Useful for search inputs, API calls, etc.
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 * 
 * @param value - Value to check
 * @returns True if value is empty, false otherwise
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Truncates text to a specified length and adds ellipsis
 * 
 * @param text - Text to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add (default: "...")
 * @returns Truncated text
 */
export function truncateText(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + suffix;
}