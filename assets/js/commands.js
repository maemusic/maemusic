/** Copy affordances and the live MAE Core command reference. */
const commandReference = [
  ["mae play <query>", "M P", "Route a search to the MAE Music sandbox and return results without locking your terminal."],
  ["mae queue <query>", "M Q", "Send a stateless queue request to the background daemon."],
  ["mae pause", "M ⏎", "Pause or resume the active MAE Music daemon session."],
  ["mae skip", "M N", "Advance the current queue through the same local TCP command channel."],
  ["mae status", "M S", "Check the Core Hub registry, router target, and daemon state."],
  ["mae logs", "M L", "Open the local daemon.log trail for silent diagnostics."],
  ["mae exit", "M X", "Hard-stop the MAE Music daemon and every child mpv process."],
  ["mae help", "M ?", "List commands registered by the MAE apps currently installed."]
];

function renderReference() {
  const library = document.querySelector("[data-command-library]");
  if (!library) return;
  library.innerHTML = commandReference.map(([command, shortcut, description]) =>
    '<article class="command-card">' +
      '<button type="button" aria-expanded="false">' +
        '<code>' + command + '</code><span class="command-shortcut">' + shortcut + '</span>' +
      '</button>' +
      '<p class="command-description"><span>' + description + '</span></p>' +
    '</article>'
  ).join("");

  library.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const card = button.closest(".command-card");
    const willOpen = !card.classList.contains("is-open");
    library.querySelectorAll(".command-card").forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector("button").setAttribute("aria-expanded", "false");
    });
    card.classList.toggle("is-open", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
  });
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const fallback = document.createElement("textarea");
  fallback.value = text;
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.append(fallback);
  fallback.select();
  document.execCommand("copy");
  fallback.remove();
}

function initializeCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const label = button.querySelector("[data-copy-label]");
      try {
        await copyText(button.dataset.copy || "");
        button.classList.add("is-copied");
        if (label) label.textContent = "Copied";
      } catch {
        if (label) label.textContent = "Select";
      }
      window.setTimeout(() => {
        button.classList.remove("is-copied");
        if (label) label.textContent = "Copy";
      }, 1800);
    });
  });
}

export function initializeCommands() {
  renderReference();
  initializeCopyButtons();
}
