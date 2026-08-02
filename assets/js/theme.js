/** Theme preference controller: cycles system → dark → light and persists explicit choice. */
const themes = ["system", "dark", "light"];

function labelForTheme(theme) {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

function updateThemeColor() {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg")
    .trim();
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", color);
}

export function initializeTheme() {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("mae-theme");
  const initialTheme = themes.includes(savedTheme) ? savedTheme : "system";
  const toggle = document.querySelector("[data-theme-toggle]");
  const label = document.querySelector("[data-theme-label]");

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    if (label) label.textContent = labelForTheme(theme);
    if (toggle)
      toggle.setAttribute("aria-label", `Theme: ${theme}. Change theme`);
    updateThemeColor();
  };

  setTheme(initialTheme);
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", updateThemeColor);

  toggle?.addEventListener("click", () => {
    const currentIndex = themes.indexOf(root.dataset.theme || "system");
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    localStorage.setItem("mae-theme", nextTheme);
    setTheme(nextTheme);
  });
}
