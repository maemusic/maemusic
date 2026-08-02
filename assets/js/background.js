/** Subtle grid parallax using one compositor-friendly custom property. */
import { prefersReducedMotion } from "./utilities.js";

export function initializeBackground() {
  if (
    prefersReducedMotion.matches ||
    !window.matchMedia("(pointer: fine)").matches
  )
    return;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  const root = document.documentElement;
  const paint = () => {
    frame = 0;
  };
  window.addEventListener(
    "pointermove",
    (event) => {
      
      if (!frame) frame = requestAnimationFrame(paint);
    },
    { passive: true },
  );
}
