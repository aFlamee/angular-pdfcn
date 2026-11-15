/** Whether the event target takes text, where single-key shortcuts stay off. */
export const isTypingTarget = (target: EventTarget | null) =>
  (target instanceof HTMLElement && target.isContentEditable) ||
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement;

/** `key` pressed without modifiers, outside text fields. */
export const isHotkey = (event: KeyboardEvent, key: string) =>
  event.key.toLowerCase() === key.toLowerCase() &&
  !(event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) &&
  !isTypingTarget(event.target);
