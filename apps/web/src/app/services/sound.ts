import type { SoundDefinition } from "@web-kits/audio";

/** The sounds the site plays, from the reference's generated `@web-kits/audio` Core patch. */
export const SOUNDS = {
  blur: {
    envelope: { attack: 0, decay: 0.018, release: 0.008, sustain: 0 },
    gain: 0.04,
    source: { fm: { depth: 30, ratio: 0.5 }, frequency: 1100, type: "sine" },
  },
  checkbox: {
    envelope: { attack: 0, decay: 0.05, release: 0.015, sustain: 0 },
    gain: 0.22,
    source: {
      fm: { depth: 60, ratio: 0.5 },
      frequency: { end: 800, start: 250 },
      type: "sine",
    },
  },
  click: {
    envelope: { attack: 0, decay: 0.06, release: 0.02, sustain: 0 },
    gain: 0.25,
    source: {
      fm: { depth: 80, ratio: 0.5 },
      frequency: { end: 700, start: 200 },
      type: "sine",
    },
  },
  copy: {
    layers: [
      {
        envelope: { attack: 0, decay: 0.015, release: 0.006, sustain: 0 },
        gain: 0.16,
        source: { frequency: 1200, type: "sine" },
      },
      {
        delay: 0.04,
        envelope: { attack: 0, decay: 0.015, release: 0.006, sustain: 0 },
        gain: 0.14,
        source: { frequency: 1400, type: "sine" },
      },
    ],
  },
  deselect: {
    envelope: { attack: 0, decay: 0.04, release: 0.012, sustain: 0 },
    gain: 0.16,
    source: { fm: { depth: 60, ratio: 0.5 }, frequency: 1200, type: "sine" },
  },
  drawerClose: {
    envelope: { attack: 0, decay: 0.1, release: 0.03, sustain: 0 },
    gain: 0.06,
    source: { frequency: { end: 350, start: 800 }, type: "sine" },
  },
  drawerOpen: {
    envelope: { attack: 0, decay: 0.1, release: 0.03, sustain: 0 },
    gain: 0.08,
    source: { frequency: { end: 1000, start: 350 }, type: "sine" },
  },
  dropdownClose: {
    envelope: { attack: 0, decay: 0.06, release: 0.02, sustain: 0 },
    gain: 0.05,
    source: { frequency: { end: 500, start: 900 }, type: "sine" },
  },
  dropdownOpen: {
    envelope: { attack: 0, decay: 0.06, release: 0.02, sustain: 0 },
    gain: 0.07,
    source: { frequency: { end: 1200, start: 500 }, type: "sine" },
  },
  error: {
    layers: [
      {
        envelope: { attack: 0, decay: 0.25, release: 0.08, sustain: 0 },
        filter: { frequency: 1200, type: "lowpass" },
        gain: 0.22,
        source: { frequency: { end: 140, start: 320 }, type: "sawtooth" },
      },
      {
        delay: 0.03,
        envelope: { attack: 0, decay: 0.2, release: 0.06, sustain: 0 },
        filter: { frequency: 800, type: "lowpass" },
        gain: 0.12,
        source: { frequency: { end: 80, start: 180 }, type: "square" },
      },
    ],
  },
  focus: {
    envelope: { attack: 0, decay: 0.02, release: 0.008, sustain: 0 },
    gain: 0.06,
    source: { fm: { depth: 40, ratio: 0.5 }, frequency: 1300, type: "sine" },
  },
  heart: {
    layers: [
      {
        envelope: { attack: 0, decay: 0.1, release: 0.04, sustain: 0 },
        gain: 0.16,
        source: { frequency: { end: 300, start: 500 }, type: "sine" },
      },
      {
        envelope: { attack: 0.008, decay: 0.25, release: 0.1, sustain: 0.04 },
        gain: 0.1,
        source: {
          fm: { depth: 100, ratio: 2.5 },
          frequency: 523,
          type: "sine",
        },
      },
    ],
  },
  hover: {
    envelope: { attack: 0.005, decay: 0.015, release: 0.008, sustain: 0 },
    gain: 0.04,
    source: { frequency: 1300, type: "sine" },
  },
  keyPress: {
    envelope: { attack: 0, decay: 0.012, release: 0.004, sustain: 0 },
    gain: 0.18,
    source: { fm: { depth: 80, ratio: 0.5 }, frequency: 1300, type: "sine" },
  },
  modalClose: {
    envelope: { attack: 0, decay: 0.08, release: 0.025, sustain: 0 },
    gain: 0.08,
    source: { frequency: { end: 430, start: 730 }, type: "sine" },
  },
  modalOpen: {
    envelope: { attack: 0, decay: 0.08, release: 0.025, sustain: 0 },
    gain: 0.1,
    source: { frequency: { end: 1400, start: 430 }, type: "sine" },
  },
  notification: {
    layers: [
      {
        effects: [{ damping: 0.6, decay: 0.6, mix: 0.12, type: "reverb" }],
        envelope: { attack: 0, decay: 0.4, release: 0.15, sustain: 0.04 },
        gain: 0.16,
        source: {
          fm: { depth: 150, ratio: 1.5 },
          frequency: 780,
          type: "sine",
        },
      },
      {
        delay: 0.1,
        effects: [{ damping: 0.6, decay: 0.6, mix: 0.12, type: "reverb" }],
        envelope: { attack: 0, decay: 0.35, release: 0.15, sustain: 0.03 },
        gain: 0.14,
        source: {
          fm: { depth: 120, ratio: 1.5 },
          frequency: 1170,
          type: "sine",
        },
      },
    ],
  },
  pop: {
    envelope: { attack: 0, decay: 0.08, release: 0.025, sustain: 0 },
    gain: 0.25,
    source: { frequency: { end: 150, start: 400 }, type: "sine" },
  },
  radio: {
    envelope: { attack: 0, decay: 0.04, release: 0.012, sustain: 0 },
    gain: 0.2,
    source: {
      fm: { depth: 50, ratio: 0.5 },
      frequency: { end: 900, start: 300 },
      type: "sine",
    },
  },
  scrollSnap: {
    envelope: { attack: 0, decay: 0.008, release: 0.003, sustain: 0 },
    gain: 0.08,
    source: { fm: { depth: 50, ratio: 0.5 }, frequency: 1400, type: "sine" },
  },
  select: {
    envelope: { attack: 0, decay: 0.05, release: 0.015, sustain: 0 },
    gain: 0.2,
    source: { fm: { depth: 60, ratio: 0.5 }, frequency: 1400, type: "sine" },
  },
  star: {
    effects: [{ damping: 0.5, decay: 0.6, mix: 0.12, type: "reverb" }],
    envelope: { attack: 0, decay: 0.4, release: 0.18, sustain: 0.04 },
    gain: 0.14,
    source: { fm: { depth: 250, ratio: 2.76 }, frequency: 880, type: "sine" },
  },
  success: {
    layers: [
      {
        envelope: { attack: 0.003, decay: 0.3, release: 0.1, sustain: 0.06 },
        gain: 0.16,
        source: { frequency: 523, type: "sine" },
      },
      {
        delay: 0.07,
        envelope: { attack: 0.003, decay: 0.28, release: 0.1, sustain: 0.05 },
        gain: 0.14,
        source: { frequency: 659, type: "sine" },
      },
      {
        delay: 0.14,
        envelope: { attack: 0.003, decay: 0.32, release: 0.12, sustain: 0.06 },
        gain: 0.15,
        source: { frequency: { end: 880, start: 784 }, type: "sine" },
      },
    ],
  },
  tabSwitch: {
    envelope: { attack: 0, decay: 0.05, release: 0.015, sustain: 0 },
    gain: 0.18,
    source: {
      fm: { depth: 50, ratio: 0.5 },
      frequency: { end: 1500, start: 1100 },
      type: "sine",
    },
  },
  tap: {
    envelope: { attack: 0, decay: 0.015, release: 0.005, sustain: 0 },
    gain: 0.2,
    source: { fm: { depth: 100, ratio: 0.5 }, frequency: 1300, type: "sine" },
  },
  tick: {
    envelope: { attack: 0, decay: 0.01, release: 0.004, sustain: 0 },
    gain: 0.15,
    source: { fm: { depth: 60, ratio: 0.5 }, frequency: 1500, type: "sine" },
  },
  toggleOff: {
    layers: [
      {
        envelope: { attack: 0, decay: 0.012, release: 0.004, sustain: 0 },
        gain: 0.2,
        source: { frequency: 3136, type: "sine" },
      },
      {
        delay: 0.025,
        envelope: { attack: 0, decay: 0.012, release: 0.004, sustain: 0 },
        gain: 0.2,
        source: { frequency: 2093, type: "sine" },
      },
    ],
  },
  toggleOn: {
    layers: [
      {
        envelope: { attack: 0, decay: 0.012, release: 0.004, sustain: 0 },
        gain: 0.2,
        source: { frequency: 2093, type: "sine" },
      },
      {
        delay: 0.025,
        envelope: { attack: 0, decay: 0.012, release: 0.004, sustain: 0 },
        gain: 0.2,
        source: { frequency: 3136, type: "sine" },
      },
    ],
  },
  warning: {
    layers: [
      {
        envelope: { attack: 0, decay: 0.18, release: 0.06, sustain: 0.06 },
        gain: 0.2,
        source: { frequency: 440, type: "triangle" },
      },
      {
        delay: 0.01,
        envelope: { attack: 0, decay: 0.18, release: 0.06, sustain: 0.06 },
        gain: 0.15,
        source: { frequency: 466, type: "triangle" },
      },
    ],
  },
} satisfies Record<string, SoundDefinition>;

export type FeedbackType = keyof typeof SOUNDS;
