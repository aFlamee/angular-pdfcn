import { afterNextRender, effect, signal } from "@angular/core";

/**
 * A signal saved to `localStorage`. It starts at the default on the server and on the
 * first client render, then reads the stored value, so hydration sees the server markup.
 */
export const storedSignal = <T>(key: string, initial: T) => {
  const value = signal(initial);
  let loaded = false;
  afterNextRender(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        value.set(JSON.parse(stored) as T);
      }
    } catch {
      // Unreadable storage keeps the default.
    }
    loaded = true;
  });
  effect(() => {
    const current = value();
    if (loaded) {
      try {
        localStorage.setItem(key, JSON.stringify(current));
      } catch {
        // Private mode or full storage: the choice lasts for this page only.
      }
    }
  });
  return value;
};
