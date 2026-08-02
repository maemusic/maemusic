/** Application entry point: modules are intentionally independent and enhancement-friendly. */
import { initializeBackground } from "./background.js";
import { initializeCommands } from "./commands.js";
import { initializeCursor } from "./cursor.js";
import { initializeNavigation } from "./navigation.js";
import { initializeParticles } from "./particles.js";
import { initializeReveals } from "./reveal.js";
import { initializeTerminals } from "./terminal.js";
import { initializeTheme } from "./theme.js";

function dismissLoader() {
  const loader = document.querySelector(".page-loader");
  window.setTimeout(() => loader?.classList.add("is-done"), 350);
}

initializeTheme();
initializeNavigation();
initializeBackground();
initializeCursor();
initializeParticles();
initializeCommands();
initializeReveals();
initializeTerminals();

if (document.readyState === "complete") dismissLoader();
else window.addEventListener("load", dismissLoader, { once: true });
