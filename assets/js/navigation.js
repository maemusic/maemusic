/** Navigation state and a lightweight magnetic treatment for pointer devices. */
import { clamp, prefersReducedMotion } from "./utilities.js";

export function initializeNavigation() {
  const header = document.querySelector("[data-header]");
  const syncHeader = () =>
    header?.classList.toggle("is-scrolled", window.scrollY > 16);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (
    prefersReducedMotion.matches ||
    !window.matchMedia("(pointer: fine)").matches
  )
    return;

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const x =
        clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5) *
        10;
      const y =
        clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5) *
        8;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}
