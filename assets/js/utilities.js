/** Shared, dependency-free helpers for the site modules. */
export const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

/** Clamp a number without repeated Math.min/Math.max at call sites. */
export function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

/** Create a short delay used by the intentionally simulated terminal responses. */
export function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

/** Escape user input before inserting it into the local terminal output. */
export function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

/** Read a CSS variable as a number, falling back when it cannot be parsed. */
export function cssNumber(variableName, fallback) {
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(variableName),
  );
  return Number.isFinite(value) ? value : fallback;
}
