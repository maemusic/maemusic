/** MAE v2 terminal displays: Core routing, daemon responses, and local playground state. */
import { escapeHtml, prefersReducedMotion, wait } from "./utilities.js";

const heroScenes = [
  {
    command: "mae play after dark",
    output: [
      "Router: registry.json → MAE Music",
      "Searching YouTube...",
      "",
      "1. After Dark — Mr.Kitty",
      "2. After Dark x Sweater Weather",
      "",
      '<span class="playing">Daemon now playing: After Dark — Mr.Kitty</span>',
    ],
  },
  {
    command: "mae q resonance",
    output: [
      "Router: MAE Music → localhost daemon",
      "Added to queue:",
      "",
      '<span class="playing">02. Resonance — HOME</span>',
      "",
      "Terminal returned in 0.18s",
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
      await wait(line ? 190 : 90);
    }
    await wait(2700);
    sceneIndex = (sceneIndex + 1) % heroScenes.length;
  }
}

function responseFor(command) {
  const normalized = command.toLowerCase().trim();
  const request = normalized.replace(/^mae\s+/, "");
  if (request === "help") {
    return [
      "Registered MAE commands:",
      "mae play &lt;query&gt; · mae q &lt;query&gt; · mae status",
      "mae pause · mae skip · mae logs · mae exit",
    ];
  }
  if (request.startsWith("play ")) {
    return [
      "Router → MAE Music → localhost daemon",
      'Searching for "' + escapeHtml(request.slice(5).trim()) + '"...',
      '<span class="success">Now playing: After Dark — Mr.Kitty</span>',
      "Structured NDJSON response received.",
    ];
  }
  if (request.startsWith("q ") || request.startsWith("queue ")) {
    return [
      "Router → MAE Music → localhost daemon",
      '<span class="success">Added to queue: Resonance — HOME</span>',
      "Terminal control returned in 0.18s.",
    ];
  }
  if (request === "status") {
    return [
      '<span class="success">Core Hub online · MAE Music registered</span>',
      "Router target: apps\\music\\music.exe",
      "Daemon: listening on authenticated localhost TCP.",
    ];
  }
  if (request === "logs") {
    return [
      '<span class="success">Opened daemon.log</span>',
      "State and error events are recorded locally without interrupting your terminal.",
    ];
  }
  if (request === "exit") {
    return [
      '<span class="success">Stopping MAE Music daemon</span>',
      "Terminated child mpv processes. No orphaned audio remains.",
    ];
  }
  if (request === "night") {
    return [
      '<span class="success">Enabled FX: night</span>',
      "The Music daemon applied the late-night preset.",
    ];
  }
  if (["norm", "xf", "clear", "pause", "skip", "fw", "bw"].includes(request)) {
    return [
      '<span class="success">Daemon command accepted: ' + escapeHtml(request) + "</span>",
      "Structured NDJSON response received over localhost.",
    ];
  }
  if (!request) return [];
  return [
    "Command not found: " + escapeHtml(command),
    "Try <kbd>mae help</kbd>, <kbd>mae play after dark</kbd>, <kbd>mae status</kbd>, or <kbd>mae exit</kbd>.",
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
