import { DOCUMENT } from "@angular/common";
import {
  Injectable,
  afterNextRender,
  computed,
  inject,
  signal,
} from "@angular/core";

import { META_THEME_COLORS } from "@/constants/site";

export type ThemeSetting = "light" | "dark" | "system";

/** next-themes' class strategy: `theme` in localStorage, `dark` or `light` on `<html>`. */
@Injectable({ providedIn: "root" })
export class ThemeService {
  readonly theme = signal<ThemeSetting>("system");
  private readonly systemDark = signal(false);
  readonly resolvedTheme = computed((): "light" | "dark" => {
    const theme = this.theme();
    if (theme !== "system") {
      return theme;
    }
    return this.systemDark() ? "dark" : "light";
  });
  private readonly document = inject(DOCUMENT);

  constructor() {
    afterNextRender(() => {
      const query = matchMedia("(prefers-color-scheme: dark)");
      this.systemDark.set(query.matches);
      query.addEventListener("change", (event) => {
        this.systemDark.set(event.matches);
        this.apply();
      });
      try {
        const stored = localStorage.getItem("theme");
        if (stored === "light" || stored === "dark" || stored === "system") {
          this.theme.set(stored);
        }
      } catch {
        // Unreadable storage follows the system.
      }
    });
  }

  setTheme(theme: ThemeSetting) {
    this.theme.set(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // The choice lasts for this page only.
    }
    this.apply();
  }

  private apply() {
    const resolved = this.resolvedTheme();
    const root = this.document.documentElement;
    // Like next-themes' disableTransitionOnChange.
    const style = this.document.createElement("style");
    style.textContent = "*,*::before,*::after{transition:none!important}";
    this.document.head.append(style);
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
    this.document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", META_THEME_COLORS[resolved]);
    getComputedStyle(this.document.body);
    setTimeout(() => style.remove(), 1);
  }
}
