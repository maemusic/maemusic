/** MAE Music 2.1.0 terminal demonstrations and local playground responses. */
import { escapeHtml, prefersReducedMotion, wait } from "./utilities.js";

const heroScenes = [
  {
    command: "mae play lofi beats",
    output: [
      "Search: lofi beats",
      "Page 1 of 3 - 10 results",
      "",
      "1. lofi beats to relax/study to",
      "2. Lofi Hip Hop Radio",
      "",
      '<span class="playing">1-10 select | n next | p previous | r refine | q cancel</span>',
    ],
  },
  {
    command: "mae queue resonance",
    output: [
      "Search: resonance",
      "Select a result to add without interrupting playback.",
      "",
      '<span class="playing">Current track continues. No ads in the queue.</span>',
      "",
      "One command. One clean response.",
    ],
  },
];

async function typeText(element, text, duration = 30) {
  element.textContent = "";
  for (const character of text) {
    element.textContent += character;
    await wait(duration);
  }
}

async function runHeroTerminal() {
  const terminal = document.querySelector("[data-terminal-demo]");
  const commandElement = document.querySelector("[data-demo-command]");
  const output = document.querySelector("[data-demo-output]");
  if (!terminal || !commandElement || !output || prefersReducedMotion.matches) return;
  let sceneIndex = 0;
  while (document.body.contains(terminal)) {
    const scene = heroScenes[sceneIndex];
    output.innerHTML = "";
    await typeText(commandElement, scene.command);
    await wait(440);
    for (const line of scene.output) {
      const paragraph = document.createElement("p");
      paragraph.innerHTML = line || "&nbsp;";
      paragraph.style.opacity = "0";
      output.append(paragraph);
      requestAnimationFrame(() => {
        paragraph.style.transition = "opacity .25s ease";
        paragraph.style.opacity = "1";
      });
      await wait(line ? 170 : 90);
    }
    await wait(2900);
    sceneIndex = (sceneIndex + 1) % heroScenes.length;
  }
}

function searchResponse(query, queueing) {
  const action = queueing ? "Queue selection" : "Play selection";
  return [
    action + ': search results for "' + escapeHtml(query) + '"',
    "Page 1 of 3 - 10 results",
    "1. Lofi beats to relax/study to",
    "2. Resonance - HOME",
    "3. Snowfall - oneheart",
    '<span class="success">1-10 select | n next | p previous | r refine | q cancel</span>',
  ];
}

function responseFor(command) {
  const normalized = command.toLowerCase().trim();
  const request = normalized.replace(/^mae\s+/, "");
  if (request === "help") {
    return [
      "MAE Music 2.1.0",
      "play | pause | resume | skip | stop | queue | status",
      "playlist | history | replay | fav | volume | mute",
      "crystal | clear | tape | night",
    ];
  }
  if (request.startsWith("play ")) return searchResponse(request.slice(5).trim(), false);
  if (request === "queue") {
    return [
      '<span class="success">Now playing: After Dark - Mr.Kitty</span>',
      "Queue",
      "1. Resonance - HOME",
      "2. Midnight City - M83",
    ];
  }
  if (request.startsWith("queue ") || request.startsWith("q ")) {
    return searchResponse(request.replace(/^(queue|q)\s+/, ""), true);
  }
  if (request === "pause") return ['<span class="success">Paused.</span>'];
  if (request === "resume") return ['<span class="success">Resumed.</span>'];
  if (request === "skip") return ['<span class="success">Skipped to the next track.</span>'];
  if (request === "stop") return ['<span class="success">Stopped playback. Queue cleared.</span>'];
  if (request === "status") {
    return [
      '<span class="success">After Dark - Mr.Kitty</span>',
      "01:42 / 03:49",
      "Queue: 2",
      "FX: night, crystal",
    ];
  }
  if (request.startsWith("playlist save ")) return ['<span class="success">Saved playlist "' + escapeHtml(request.slice(14)) + '".</span>', "Snapshot includes the current track and queue."];
  if (request.startsWith("playlist load ")) return ['<span class="success">Loaded playlist "' + escapeHtml(request.slice(14)) + '".</span>', "Playing its first track now."];
  if (request === "playlist list") return ["Saved playlists", "driving", "late-night", "focus"];
  if (request.startsWith("playlist delete ")) return ['<span class="success">Deleted playlist "' + escapeHtml(request.slice(16)) + '".</span>'];
  if (request === "history") return ["Recent history", "1. After Dark - Mr.Kitty", "2. Resonance - HOME", "3. Snowfall - oneheart"];
  if (request.startsWith("replay ")) return ['<span class="success">Replaying history item ' + escapeHtml(request.slice(7)) + ".</span>"];
  if (request === "fav") return ['<span class="success">Added to favourites: After Dark - Mr.Kitty</span>'];
  if (request === "fav list") return ["Favourites", "1. After Dark - Mr.Kitty", "2. Resonance - HOME"];
  if (request === "fav remove") return ['<span class="success">Removed the current track from favourites.</span>'];
  if (request.startsWith("volume ")) return ['<span class="success">Volume: ' + escapeHtml(request.slice(7)) + "%</span>"];
  if (request === "mute") return ['<span class="success">Muted.</span>'];
  if (["crystal", "clear", "tape", "night"].includes(request)) {
    return ['<span class="success">' + escapeHtml(request) + " enabled.</span>", "Active FX can be stacked."];
  }
  if (!request) return [];
  return [
    "Command not found: " + escapeHtml(command),
    "Try <kbd>mae help</kbd>, <kbd>mae play lofi beats</kbd>, <kbd>mae queue</kbd>, or <kbd>mae status</kbd>.",
  ];
}

function appendOutput(container, content, className = "") {
  const paragraph = document.createElement("p");
  paragraph.className = className;
  paragraph.innerHTML = content;
  container.append(paragraph);
  container.scrollTop = container.scrollHeight;
}

function initializePlayground() {
  const output = document.querySelector("[data-playground-output]");
  const form = document.querySelector("[data-playground-form]");
  const input = document.querySelector("[data-playground-input]");
  if (!output || !form || !input) return;

  const execute = async (value) => {
    const command = value.trim();
    if (!command) return;
    appendOutput(output, "&gt; " + escapeHtml(command));
    input.value = "";
    input.disabled = true;
    await wait(prefersReducedMotion.matches ? 0 : 260);
    responseFor(command).forEach((line) => appendOutput(output, line, "response"));
    input.disabled = false;
    input.focus();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    execute(input.value);
  });
  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.prompt || "";
      input.focus();
    });
  });
}

export function initializeTerminals() {
  runHeroTerminal();
  initializePlayground();
}
