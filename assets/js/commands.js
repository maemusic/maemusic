/** Complete MAE Music 2.1.0 command reference plus shared copy controls. */
const commandReference = [
  ["mae play <query>", "PLAY", "Search up to 30 matches and open a paginated selection menu with 10 results per page."],
  ["mae pause", "PAUSE", "Pause the current track."],
  ["mae resume", "RESUME", "Resume the current track."],
  ["mae skip", "SKIP", "Immediately start the next queued track."],
  ["mae stop", "STOP", "Stop playback and clear the queue."],
  ["mae queue <query>", "QUEUE", "Search for a song and add your selected result without interrupting the current track."],
  ["mae queue", "NOW", "Show the currently playing track and the full upcoming queue."],
  ["mae playlist save <name>", "SAVE", "Save the current track and queue as a lightweight playlist snapshot."],
  ["mae playlist load <name>", "LOAD", "Replace the queue with a saved playlist and immediately begin with its first track."],
  ["mae playlist list", "LIST", "List every saved playlist."],
  ["mae playlist delete <name>", "DELETE", "Permanently delete one saved playlist."],
  ["mae history", "HISTORY", "Show your 20 most recently played tracks."],
  ["mae replay <number>", "REPLAY", "Instantly play an item from history."],
  ["mae fav", "FAV", "Add the currently playing track to permanent favourites."],
  ["mae fav list", "FAV LIST", "Show all saved favourites."],
  ["mae fav remove", "REMOVE", "Remove the currently playing track from favourites."],
  ["mae volume <number>", "VOLUME", "Set volume to an exact percentage."],
  ["mae volume +", "+10", "Increase volume by 10 percent."],
  ["mae volume -", "-10", "Decrease volume by 10 percent."],
  ["mae mute", "MUTE", "Toggle mute on or off."],
  ["mae crystal", "FX", "Toggle a clarity and transient-response boost. Effects can stack."],
  ["mae clear", "FX", "Reduce muddy low-mids and increase presence. Effects can stack."],
  ["mae tape", "FX", "Add subtle vibrato and a lo-fi high-cut. Effects can stack."],
  ["mae night", "FX", "Boost bass and extreme highs for quiet listening. Effects can stack."],
  ["mae status", "STATUS", "Print the current track, time, queue count, and active effects."],
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
