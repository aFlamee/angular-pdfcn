import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

import { cn } from "@/lib/utils";

const DIGIT_FOUR = [
  "...X.",
  "..X..",
  ".X...",
  "X..X.",
  "XXXXX",
  "...X.",
  "...X.",
];

const DIGIT_ZERO = [
  ".XXX.",
  "X...X",
  "X...X",
  "X...X",
  "X...X",
  "X...X",
  ".XXX.",
];

const NOT_FOUND_PATTERN = DIGIT_FOUR.map(
  (row, index) => `${row}.${DIGIT_ZERO[index]}.${row}`
);
const BRICKS = NOT_FOUND_PATTERN.flatMap((row) =>
  [...row].map((brick) => brick === "X")
);

const ARTWORK_CLASS_NAME =
  "relative aspect-2/1 w-full overflow-hidden bg-muted/35 ring-1 ring-border";

/** "404" drawn in bricks. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "aria-hidden": "true",
    class: "absolute inset-x-[7%] top-1/2 grid -translate-y-1/2 gap-0.5",
    style: "grid-template-columns: repeat(17, minmax(0, 1fr))",
  },
  selector: "span[appDaikanoidBricks]",
  template: `
    @for (active of BRICKS; track $index) {
      <span aria-hidden="true" class="relative aspect-square">
        @if (active) {
          <span class="absolute inset-0.5 bg-foreground">
            <span
              class="absolute top-1 right-1 left-1 h-0.5 bg-background/20"
            ></span>
            <span
              class="absolute top-1 bottom-1 left-1 w-0.5 bg-background/20"
            ></span>
          </span>
        }
      </span>
    }
  `,
})
export class DaikanoidBricks {
  protected readonly BRICKS = BRICKS;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()", "aria-label": "404", role: "img" },
  imports: [DaikanoidBricks],
  selector: "div[appDaikanoidArtwork]",
  template: `<span appDaikanoidBricks></span>`,
})
export class DaikanoidArtwork {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(ARTWORK_CLASS_NAME, this.class())
  );
}

/** The artwork as a button with a Play label that flickers on hover. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
    "aria-label": "Play the 404 brick breaker game",
    type: "button",
  },
  imports: [DaikanoidBricks],
  selector: "button[appDaikanoidPreview]",
  styles: `
    @keyframes daikanoid-flicker {
      18% {
        opacity: 0.42;
      }
      42% {
        opacity: 1;
      }
      68% {
        opacity: 0.64;
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      :host(:hover) .play,
      :host(:focus) .play {
        animation: daikanoid-flicker 0.32s;
      }
    }
  `,
  template: `
    <span appDaikanoidBricks></span>
    <span
      class="play absolute top-1/2 left-1/2 z-10 inline-flex min-h-14 min-w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-foreground/70 px-6 font-mono text-background text-base transition-colors duration-150 group-hover:bg-foreground/85 group-focus-visible:bg-foreground/85"
    >
      Play
    </span>
  `,
})
export class DaikanoidPreview {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      ARTWORK_CLASS_NAME,
      "group cursor-pointer outline-none transition-colors duration-150 hover:bg-muted/55 focus-visible:ring-2 focus-visible:ring-ring",
      this.class()
    )
  );
}
