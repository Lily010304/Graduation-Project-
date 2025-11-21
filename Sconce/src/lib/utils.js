import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Lightweight toast helper used in the UI.
 * This is intentionally minimal: it falls back to `alert()` in the browser.
 * Call as: toast({ title: 'Title', description: 'Details', variant: 'destructive' })
 */
export function toast({ title = '', description = '', variant = 'default' } = {}) {
  try {
    // Prefer a non-blocking console output and a simple alert for visibility
    console.log('TOAST', { title, description, variant });
    // Use a single-line message for alert
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert((title ? title + '\n' : '') + (description || ''));
    }
  } catch (e) {
    // No-op
    console.log('toast fallback', title, description, e);
  }
}
