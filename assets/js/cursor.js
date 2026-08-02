/** Soft spotlight follows a mouse only; it is omitted for touch and reduced-motion users. */
import { prefersReducedMotion } from "./utilities.js";

export function initializeCursor() {
  const cursor = document.querySelector(".cursor-light");
  if (
    !cursor ||
    prefersReducedMotion.matches ||
    !window.matchMedia("(pointer: fine)").matches
  )
    return;

  let frame = 0;
  let x = 0;
  let y = 0;
  const render = () => {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
    frame = 0;
  };
  window.addEventListener(
    "pointermove",
    (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.classList.add("is-visible");
      if (!frame) frame = requestAnimationFrame(render);
    },
    { passive: true },
  );
  document.addEventListener("mouseleave", () =>
    cursor.classList.remove("is-visible"),
  );
}
