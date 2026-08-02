/**
 * Canvas particle field. It uses a fixed small pool and only draws nearby links,
 * so it stays inexpensive even on high-density screens.
 */
import { prefersReducedMotion, clamp } from "./utilities.js";

export function initializeParticles() {
  const canvas = document.querySelector("#particle-canvas");
  if (!canvas || prefersReducedMotion.matches) return;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedCount = window.matchMedia("(max-width: 800px)").matches;
  const count = reducedCount ? 22 : 55;
  const particles = [];
  const mouse = { x: -1000, y: -1000 };
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = 0;
  let isVisible = !document.hidden;

  function themeColor() {
    const isLight =
      document.documentElement.dataset.theme === "light" ||
      (document.documentElement.dataset.theme === "system" &&
        window.matchMedia("(prefers-color-scheme: light)").matches);
    return isLight ? "37, 46, 32" : "202, 213, 166";
  }

  function makeParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() * 1.15 + 0.4,
    };
  }

  function resize() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    while (particles.length < count) particles.push(makeParticle());
  }

  function updateParticle(particle) {
    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 145 && distance > 0) {
      particle.vx -= (dx / distance) * 0.004;
      particle.vy -= (dy / distance) * 0.004;
    }
    particle.vx = clamp(particle.vx, -0.34, 0.34) * 0.995;
    particle.vy = clamp(particle.vy, -0.34, 0.34) * 0.995;
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.x < -8) particle.x = width + 8;
    if (particle.x > width + 8) particle.x = -8;
    if (particle.y < -8) particle.y = height + 8;
    if (particle.y > height + 8) particle.y = -8;
  }

  function draw() {
    if (!isVisible) {
      animationFrame = 0;
      return;
    }
    context.clearRect(0, 0, width, height);
    const rgb = themeColor();
    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      updateParticle(particle);
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(${rgb}, .38)`;
      context.fill();
      for (let second = index + 1; second < particles.length; second += 1) {
        const neighbor = particles[second];
        const distance = Math.hypot(
          particle.x - neighbor.x,
          particle.y - neighbor.y,
        );
        if (distance < 105) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(neighbor.x, neighbor.y);
          context.strokeStyle = `rgba(${rgb}, ${(0.095 * (1 - distance / 105)).toFixed(3)})`;
          context.lineWidth = 0.5;
          context.stroke();
        }
      }
      const cursorDistance = Math.hypot(
        particle.x - mouse.x,
        particle.y - mouse.y,
      );
      if (cursorDistance < 130) {
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(mouse.x, mouse.y);
        context.strokeStyle = `rgba(${rgb}, ${(0.22 * (1 - cursorDistance / 130)).toFixed(3)})`;
        context.stroke();
      }
    }
    animationFrame = requestAnimationFrame(draw);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
    if (isVisible && !animationFrame)
      animationFrame = requestAnimationFrame(draw);
  });
  window.addEventListener(
    "pointermove",
    (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    },
    { passive: true },
  );
  window.addEventListener("pointerleave", () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });
  resize();
  animationFrame = requestAnimationFrame(draw);
}
