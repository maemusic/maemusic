/** Intersection-driven reveal states and optional GSAP enhancement. */
import { prefersReducedMotion } from "./utilities.js";

export function initializeReveals() {
  const revealTargets = document.querySelectorAll(
    ".reveal, .reveal-card, .reveal-text, .reveal-terminal",
  );
  const stories = document.querySelectorAll("[data-story]");

  if (prefersReducedMotion.matches) {
    revealTargets.forEach((element) => element.classList.add("is-revealed"));
    stories.forEach((element) => element.classList.add("is-active"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6%" },
  );
  revealTargets.forEach((target, index) => {
    if (target.classList.contains("reveal-card"))
      target.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
    revealObserver.observe(target);
  });

  const storyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) =>
        entry.target.classList.toggle("is-active", entry.isIntersecting),
      );
    },
    { threshold: 0.54 },
  );
  stories.forEach((story) => storyObserver.observe(story));

  // GSAP provides a polished first-frame entrance when available; the observer is the functional fallback.
  window.addEventListener(
    "load",
    () => {
      if (!window.gsap) return;
      const heroElements = document.querySelectorAll(
        ".hero .reveal, .hero .reveal-text, .hero .reveal-terminal",
      );
      window.gsap.to(heroElements, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
      });
      heroElements.forEach((element) => element.classList.add("is-revealed"));
    },
    { once: true },
  );
}
