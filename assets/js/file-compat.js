/**
 * File-protocol compatibility entry. Browsers intentionally block ES-module
 * imports from file://; this classic-script mirror makes index.html useful when
 * opened directly while the modular app.js remains the HTTP(S) production path.
 */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wait = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));
  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);
  const escapeHtml = (value) => {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
  };

  function initializeTheme() {
    const themes = ["system", "dark", "light"];
    const root = document.documentElement;
    const stored = localStorage.getItem("mae-theme");
    const button = document.querySelector("[data-theme-toggle]");
    const label = document.querySelector("[data-theme-label]");
    const updateColor = () =>
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute(
          "content",
          getComputedStyle(root).getPropertyValue("--bg").trim(),
        );
    const setTheme = (theme) => {
      root.dataset.theme = theme;
      if (label) label.textContent = theme[0].toUpperCase() + theme.slice(1);
      button?.setAttribute("aria-label", `Theme: ${theme}. Change theme`);
      updateColor();
    };
    setTheme(themes.includes(stored) ? stored : "system");
    button?.addEventListener("click", () => {
      const next =
        themes[
          (themes.indexOf(root.dataset.theme || "system") + 1) % themes.length
        ];
      localStorage.setItem("mae-theme", next);
      setTheme(next);
    });
    window
      .matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", updateColor);
  }

  function initializeNavigation() {
    const header = document.querySelector("[data-header]");
    const updateHeader = () =>
      header?.classList.toggle("is-scrolled", scrollY > 16);
    updateHeader();
    addEventListener("scroll", updateHeader, { passive: true });
    if (reduceMotion.matches || !matchMedia("(pointer: fine)").matches) return;
    document.querySelectorAll(".magnetic").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const box = element.getBoundingClientRect();
        const x =
          clamp((event.clientX - box.left) / box.width - 0.5, -0.5, 0.5) * 10;
        const y =
          clamp((event.clientY - box.top) / box.height - 0.5, -0.5, 0.5) * 8;
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      element.addEventListener("pointerleave", () => {
        element.style.transform = "";
      });
    });
  }

  function initializeCursorAndParallax() {
    if (reduceMotion.matches || !matchMedia("(pointer: fine)").matches) return;
    const cursor = document.querySelector(".cursor-light");
    let x = 0;
    let y = 0;
    let frame = 0;
    const render = () => {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      document.documentElement.style.setProperty(
        "--parallax-x",
        `${(x - innerWidth / 2) * 0.012}px`,
      );
      document.documentElement.style.setProperty(
        "--parallax-y",
        `${(y - innerHeight / 2) * 0.012}px`,
      );
      frame = 0;
    };
    addEventListener(
      "pointermove",
      (event) => {
        x = event.clientX;
        y = event.clientY;
        cursor?.classList.add("is-visible");
        if (!frame) frame = requestAnimationFrame(render);
      },
      { passive: true },
    );
    document.addEventListener("mouseleave", () =>
      cursor?.classList.remove("is-visible"),
    );
  }

  function initializeParticles() {
    const canvas = document.querySelector("#particle-canvas");
    if (!canvas || reduceMotion.matches) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const count = matchMedia("(max-width: 800px)").matches ? 22 : 55;
    const particles = [];
    const mouse = { x: -1000, y: -1000 };
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = !document.hidden;
    const color = () => {
      const light =
        document.documentElement.dataset.theme === "light" ||
        (document.documentElement.dataset.theme === "system" &&
          matchMedia("(prefers-color-scheme: light)").matches);
      return light ? "37, 46, 32" : "202, 213, 166";
    };
    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() * 1.15 + 0.4,
    });
    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      while (particles.length < count) particles.push(createParticle());
    };
    const update = (particle) => {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 145 && distance) {
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
    };
    const draw = () => {
      if (!visible) {
        frame = 0;
        return;
      }
      context.clearRect(0, 0, width, height);
      const rgb = color();
      particles.forEach((particle, index) => {
        update(particle);
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
      });
      frame = requestAnimationFrame(draw);
    };
    new ResizeObserver(resize).observe(canvas);
    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden;
      if (visible && !frame) frame = requestAnimationFrame(draw);
    });
    addEventListener(
      "pointermove",
      (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
      },
      { passive: true },
    );
    addEventListener("pointerleave", () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
    resize();
    frame = requestAnimationFrame(draw);
  }

  function initializeReveals() {
    const targets = document.querySelectorAll(
      ".reveal, .reveal-card, .reveal-text, .reveal-terminal",
    );
    const stories = document.querySelectorAll("[data-story]");
    if (reduceMotion.matches) {
      targets.forEach((item) => item.classList.add("is-revealed"));
      stories.forEach((item) => item.classList.add("is-active"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6%" },
    );
    targets.forEach((item, index) => {
      if (item.classList.contains("reveal-card"))
        item.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
      observer.observe(item);
    });
    const storyObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) =>
          entry.target.classList.toggle("is-active", entry.isIntersecting),
        ),
      { threshold: 0.54 },
    );
    stories.forEach((item) => storyObserver.observe(item));
    addEventListener(
      "load",
      () => {
        const hero = document.querySelectorAll(
          ".hero .reveal, .hero .reveal-text, .hero .reveal-terminal",
        );
        if (window.gsap)
          window.gsap.to(hero, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "transform",
          });
        hero.forEach((item) => item.classList.add("is-revealed"));
      },
      { once: true },
    );
  }

  function initializeCommands() {
    const reference = [
      [
        "mae play <query>",
        "P",
        "Search YouTube and immediately play the best matching track.",
      ],
      [
        "mae queue <query>",
        "Q",
        "Add a matching song to the end of the queue without interrupting playback.",
      ],
      ["mae pause", "M P", "Pause or resume the active Music daemon session."],
      ["mae skip", "M N", "Advance the active queue through the daemon."],
      ["fw", "→", "Seek forward through the current track."],
      ["bw", "←", "Seek backwards through the current track."],
      ["mae status", "M S", "Check the Core Hub, router, and daemon state."],
      ["mae logs", "M L", "Open the local daemon.log diagnostics trail."],
      ["mae exit", "M X", "Hard-stop the daemon and child mpv processes."],
      ["mae help", "M ?", "List commands registered by installed MAE apps."],
    ];
    reference.splice(0, reference.length,
      ["mae play <query>", "PLAY", "Search up to 30 matches and choose from paginated results."],
      ["mae pause", "PAUSE", "Pause the current track."],
      ["mae resume", "RESUME", "Resume the current track."],
      ["mae skip", "SKIP", "Start the next queued track."],
      ["mae stop", "STOP", "Stop playback and clear the queue."],
      ["mae queue <query>", "QUEUE", "Search and add a selected track without interrupting playback."],
      ["mae queue", "NOW", "Show the current track and upcoming queue."],
      ["mae playlist save <name>", "SAVE", "Save the current track and queue as a playlist snapshot."],
      ["mae playlist load <name>", "LOAD", "Load a playlist and immediately start its first track."],
      ["mae playlist list", "LIST", "List saved playlists."],
      ["mae playlist delete <name>", "DELETE", "Permanently delete a saved playlist."],
      ["mae history", "HISTORY", "Show the last 20 played tracks."],
      ["mae replay <number>", "REPLAY", "Play a specific history item."],
      ["mae fav", "FAV", "Add the current track to favourites."],
      ["mae fav list", "FAV LIST", "Show saved favourites."],
      ["mae fav remove", "REMOVE", "Remove the current track from favourites."],
      ["mae volume <number>", "VOLUME", "Set an exact volume percentage."],
      ["mae volume +", "+10", "Increase volume by 10 percent."],
      ["mae volume -", "-10", "Decrease volume by 10 percent."],
      ["mae mute", "MUTE", "Toggle mute."],
      ["mae crystal", "FX", "Toggle the clarity filter."],
      ["mae clear", "FX", "Toggle the presence filter."],
      ["mae tape", "FX", "Toggle the lo-fi tape filter."],
      ["mae night", "FX", "Toggle the quiet-listening filter."],
      ["mae status", "STATUS", "Show playback, queue, and active effects."]
    );
    reference.forEach((item) => {
      if (!item[0].startsWith("mae ")) item[0] = "mae " + item[0];
    });
    const library = document.querySelector("[data-command-library]");
    if (library) {
      library.innerHTML = reference
        .map(
          ([command, shortcut, description]) =>
            `<article class="command-card"><button type="button" aria-expanded="false"><code>${command}</code><span class="command-shortcut">${shortcut}</span></button><p class="command-description"><span>${description}</span></p></article>`,
        )
        .join("");
      library.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        const card = button.closest(".command-card");
        const open = !card.classList.contains("is-open");
        library.querySelectorAll(".command-card").forEach((item) => {
          item.classList.remove("is-open");
          item.querySelector("button").setAttribute("aria-expanded", "false");
        });
        card.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", String(open));
      });
    }
    document.querySelectorAll("[data-copy]").forEach((button) =>
      button.addEventListener("click", async () => {
        const label = button.querySelector("[data-copy-label]");
        try {
          if (navigator.clipboard?.writeText)
            await navigator.clipboard.writeText(button.dataset.copy || "");
          else {
            const temporary = document.createElement("textarea");
            temporary.value = button.dataset.copy || "";
            document.body.append(temporary);
            temporary.select();
            document.execCommand("copy");
            temporary.remove();
          }
          button.classList.add("is-copied");
          if (label) label.textContent = "Copied";
        } catch {
          if (label) label.textContent = "Select";
        }
        setTimeout(() => {
          button.classList.remove("is-copied");
          if (label) label.textContent = "Copy";
        }, 1800);
      }),
    );
    const stage = document.querySelector("[data-fx-stage]");
    const output = document.querySelector("[data-fx-output]");
    stage?.querySelectorAll("[data-fx]").forEach((button) =>
      button.addEventListener("click", () => {
        const effect = button.dataset.fx || "clear";
        stage
          .querySelectorAll("[data-fx]")
          .forEach((item) => item.classList.remove("is-active"));
        if (effect === "clear") {
          output.textContent = "none";
          stage.classList.remove("has-effect");
        } else {
          button.classList.add("is-active");
          output.textContent = effect;
          stage.classList.add("has-effect");
        }
      }),
    );
  }

  function initializeTerminals() {
    const commands = [
      {
        command: "mae play after dark",
        output: [
          "Searching YouTube…",
          "",
          "1. After Dark — Mr.Kitty",
          "2. After Dark x Sweater Weather",
          "",
          '<span class="playing">Playing: After Dark — Mr.Kitty</span>',
        ],
      },
      {
        command: "mae q resonance",
        output: [
          "Added to queue:",
          "",
          '<span class="playing">02. Resonance — HOME</span>',
          "",
          "Queue: 3 tracks · 14m 09s",
        ],
      },
    ];
    commands[0] = {
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
    };
    commands[1] = {
      command: "mae queue resonance",
      output: [
        "Search: resonance",
        "Select a result to add without interrupting playback.",
        "",
        '<span class="playing">Current track continues. No ads in the queue.</span>',
        "",
        "One command. One clean response.",
      ],
    };
    const commandElement = document.querySelector("[data-demo-command]");
    const heroOutput = document.querySelector("[data-demo-output]");
    const terminal = document.querySelector("[data-terminal-demo]");
    const type = async (element, content) => {
      element.textContent = "";
      for (const character of content) {
        element.textContent += character;
        await wait(34);
      }
    };
    (async () => {
      if (!terminal || !commandElement || !heroOutput || reduceMotion.matches)
        return;
      let index = 0;
      while (document.body.contains(terminal)) {
        const scene = commands[index];
        heroOutput.innerHTML = "";
        await type(commandElement, scene.command);
        await wait(440);
        for (const line of scene.output) {
          const p = document.createElement("p");
          p.innerHTML = line || "&nbsp;";
          p.style.opacity = "0";
          heroOutput.append(p);
          requestAnimationFrame(() => {
            p.style.transition = "opacity .25s ease";
            p.style.opacity = "1";
          });
          await wait(line ? 190 : 90);
        }
        await wait(2700);
        index = (index + 1) % commands.length;
      }
    })();
    const output = document.querySelector("[data-playground-output]");
    const form = document.querySelector("[data-playground-form]");
    const input = document.querySelector("[data-playground-input]");
    const append = (content, className = "") => {
      const p = document.createElement("p");
      p.className = className;
      p.innerHTML = content;
      output.append(p);
      output.scrollTop = output.scrollHeight;
    };
    let response = (raw) => {
      const normalized = raw.toLowerCase().trim().replace(/^mae\s+/, "");
      if (normalized === "help")
        return [
          "Registered MAE commands:",
          "mae play &lt;query&gt;  ·  mae q &lt;query&gt;  ·  mae status",
          "mae pause  ·  mae skip  ·  mae logs  ·  mae exit",
        ];
      if (normalized.startsWith("play "))
        return [
          `Searching for \"${escapeHtml(raw.slice(5).trim())}\"…`,
          '<span class="success">Now playing: After Dark — Mr.Kitty</span>',
          "Audio engine connected · 03:49",
        ];
      if (normalized.startsWith("q ") || normalized.startsWith("queue "))
        return [
          "Looking ahead…",
          '<span class="success">Added to queue: Resonance — HOME</span>',
          "Queue contains 3 tracks · 14m 09s",
        ];
      if (normalized === "status")
        return [
          '<span class="success">Core Hub online · MAE Music registered</span>',
          "Router target: apps\\music\\music.exe",
          "Daemon: listening on authenticated localhost TCP.",
        ];
      if (normalized === "logs")
        return [
          '<span class="success">Opened daemon.log</span>',
          "State and error events are recorded locally without terminal interruption.",
        ];
      if (normalized === "exit")
        return [
          '<span class="success">Stopping MAE Music daemon</span>',
          "Terminated child mpv processes. No orphaned audio remains.",
        ];
      if (normalized === "night")
        return [
          '<span class="success">Enabled FX: night</span>',
          "Lowered harsh frequencies for late-night listening.",
        ];
      if (
        ["norm", "xf", "clear", "pause", "skip", "fw", "bw"].includes(
          normalized,
        )
      )
        return [
          `<span class=\"success\">Command accepted: ${escapeHtml(normalized)}</span>`,
          "This is a local terminal demonstration.",
        ];
      return [
        "Command not found: " + escapeHtml(raw),
        "Try <kbd>mae help</kbd>, <kbd>mae play after dark</kbd>, <kbd>mae status</kbd>, or <kbd>mae exit</kbd>.",
      ];
    };
    response = (raw) => {
      const request = raw.toLowerCase().trim().replace(/^mae\s+/, "");
      const search = (query, queueing) => [
        (queueing ? "Queue selection" : "Play selection") + ': search results for "' + escapeHtml(query) + '"',
        "Page 1 of 3 - 10 results",
        "1. Lofi beats to relax/study to",
        "2. Resonance - HOME",
        "3. Snowfall - oneheart",
        '<span class="success">1-10 select | n next | p previous | r refine | q cancel</span>',
      ];
      if (request === "help") return ["MAE Music 2.1.0", "play | pause | resume | skip | stop | queue | status", "playlist | history | replay | fav | volume | mute", "crystal | clear | tape | night"];
      if (request.startsWith("play ")) return search(request.slice(5), false);
      if (request === "queue") return ['<span class="success">Now playing: After Dark - Mr.Kitty</span>', "Queue", "1. Resonance - HOME", "2. Midnight City - M83"];
      if (request.startsWith("queue ") || request.startsWith("q ")) return search(request.replace(/^(queue|q)\s+/, ""), true);
      if (request === "pause") return ['<span class="success">Paused.</span>'];
      if (request === "resume") return ['<span class="success">Resumed.</span>'];
      if (request === "skip") return ['<span class="success">Skipped to the next track.</span>'];
      if (request === "stop") return ['<span class="success">Stopped playback. Queue cleared.</span>'];
      if (request === "status") return ['<span class="success">After Dark - Mr.Kitty</span>', "01:42 / 03:49", "Queue: 2", "FX: night, crystal"];
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
      if (["crystal", "clear", "tape", "night"].includes(request)) return ['<span class="success">' + escapeHtml(request) + " enabled.</span>", "Active FX can be stacked."];
      if (!request) return [];
      return ["Command not found: " + escapeHtml(raw), "Try <kbd>mae help</kbd>, <kbd>mae play lofi beats</kbd>, <kbd>mae queue</kbd>, or <kbd>mae status</kbd>."];
    };
    const execute = async (value) => {
      const command = value.trim();
      if (!command) return;
      append(`&gt; ${escapeHtml(command)}`);
      input.value = "";
      input.disabled = true;
      await wait(reduceMotion.matches ? 0 : 260);
      response(command).forEach((line) => append(line, "response"));
      input.disabled = false;
      input.focus();
    };
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      execute(input.value);
    });
    document.querySelectorAll("[data-prompt]").forEach((button) =>
      button.addEventListener("click", () => {
        input.value = button.dataset.prompt || "";
        input.focus();
      }),
    );
  }

  initializeTheme();
  initializeNavigation();
  initializeCursorAndParallax();
  initializeParticles();
  initializeCommands();
  initializeReveals();
  initializeTerminals();
  const loader = document.querySelector(".page-loader");
  const dismiss = () => setTimeout(() => loader?.classList.add("is-done"), 350);
  if (document.readyState === "complete") dismiss();
  else addEventListener("load", dismiss, { once: true });
})();
