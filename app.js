import {setupV13Integrations} from './v13-integrations.js';
import {createSlideBuilds} from './core/slide-builds.js';

(() => {
  "use strict";

  // Narrative order: introduce the moving finite-element space first, then use
  // the characteristic comparison to show how nodal motion relates to transport.
  const meshKinematicsChapter = document.getElementById("mesh-kinematics");
  const characteristicChapter = document.getElementById("characteristics");
  if (meshKinematicsChapter && characteristicChapter) {
    meshKinematicsChapter.after(characteristicChapter);
  }

  // The optional LG derivation belongs to the LG scheme scene. Keeping the
  // relocation here also makes the narrative order explicit before chapters
  // and their focus controls are initialized.
  const lgDerivationDetail = document.querySelector(".lg-derivation-detail");
  const lgSchemeSummary = document.querySelector("#conservative-lg .lg-clean-grid");
  if (lgDerivationDetail && lgSchemeSummary) {
    lgSchemeSummary.after(lgDerivationDetail);
  }

  const {openTechnicalLink} = setupV13Integrations();
  const presentation = document.getElementById("presentation");
  const chapters = Array.from(presentation.querySelectorAll(":scope > .chapter"));
  const builds = createSlideBuilds(chapters);
  const nav = document.querySelector(".chapter-nav");
  const navLinks = Array.from(nav.querySelectorAll("a"));
  const overviewDialog = document.getElementById("overviewDialog");
  const overviewLinks = Array.from(overviewDialog.querySelectorAll(".overview-grid a"));
  const counter = document.getElementById("sectionCounter");
  const sectionNumber = document.getElementById("sectionNumber");
  const buildStatus = document.getElementById("slideBuildStatus");
  const showSlideAll = document.getElementById("showSlideAll");
  const topbar = document.querySelector(".topbar");
  const dock = document.querySelector(".presenter-controls");
  const sceneLabel = document.getElementById("activeSceneLabel");
  const progressFill = document.getElementById("topProgressFill");
  const previous = document.getElementById("prevSection");
  const next = document.getElementById("nextSection");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedMotion = motionPreference.matches;
  let currentIndex = -1;
  let presenting = false;
  let scrollFrame = 0;
  let viewportWidth = window.innerWidth;
  let overviewTrigger;

  function updateMotion() {
    document.documentElement.classList.toggle("motion-ready", !motionPreference.matches);
  }
  updateMotion();
  motionPreference.addEventListener("change", updateMotion);

  const pad = (value) => String(value).padStart(2, "0");

  function updateNavigation() {
    const {visible,total} = builds.count(chapters[currentIndex]);
    const hasSteps = presenting && total > 1;
    const progress = hasSteps ? `, step ${visible} of ${total}` : "";
    const canReveal = presenting && visible < total;
    const canUndo = presenting && visible > 1;
    counter.setAttribute("aria-label", `Sections, slide ${currentIndex + 1} of ${chapters.length}${progress}`);
    buildStatus.textContent = hasSteps ? `Step ${visible}/${total}` : "";
    previous.disabled = currentIndex === 0 && !canUndo;
    previous.setAttribute("aria-label", canUndo ? "Hide previous step" : "Previous section");
    next.disabled = currentIndex === chapters.length - 1 && !canReveal;
    next.setAttribute("aria-label", canReveal ? "Reveal next step" : "Next section");
    showSlideAll.hidden = !hasSteps;
    showSlideAll.disabled = !canReveal;
  }

  function setActiveSection(index) {
    if (index === currentIndex) return;
    builds.finish(chapters[currentIndex]);
    chapters[currentIndex]?.classList.remove("is-active");
    currentIndex = index;
    const chapter = chapters[index];
    chapter.classList.add("is-active");
    const hash = "#" + chapter.id;

    navLinks.forEach((link) => {
      const active = link.dataset.navGroup === chapter.dataset.nav;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
        if (nav.scrollWidth > nav.clientWidth) {
          nav.scrollLeft += link.getBoundingClientRect().left - nav.getBoundingClientRect().left
            - (nav.clientWidth - link.clientWidth) / 2;
        }
      } else {
        link.removeAttribute("aria-current");
      }
    });
    overviewLinks.forEach((link) => {
      if (link.hash === hash) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });

    sectionNumber.textContent = pad(index + 1) + " / " + pad(chapters.length);
    sceneLabel.textContent = chapter.dataset.title;
    progressFill.style.width = ((index + 1) / chapters.length) * 100 + "%";
    updateNavigation();

    if (window.location.hash !== hash) history.replaceState(null, "", hash);
  }

  function alignChapter(chapter) {
    const top = chapter.getBoundingClientRect().top - presentation.getBoundingClientRect().top;
    presentation.scrollTo({ top: presentation.scrollTop + top, behavior: "instant" });
  }

  function focusHeading(chapter) {
    const heading = chapter.querySelector("h1,h2");
    heading.tabIndex = -1;
    heading.focus({preventScroll:true});
  }

  function goToSection(index, focus = false, resetBuild = false) {
    const target = Math.max(0, Math.min(chapters.length - 1, index));
    const chapter = chapters[target];
    if (presenting && resetBuild) builds.restart(chapter);
    alignChapter(chapter);
    setActiveSection(target);
    if (presenting && resetBuild) updateNavigation();
    if (focus) focusHeading(chapter);
  }

  document.querySelectorAll('a[href^="#"]:not([data-technical-group])').forEach((link) => {
    link.addEventListener("click", (event) => {
      const index = chapters.findIndex((chapter) => "#" + chapter.id === link.hash);
      if (index < 0) return;
      event.preventDefault();
      const dialog = link.closest("dialog");
      if (dialog?.open) {
        overviewTrigger = null;
        dialog.close();
      }
      goToSection(index, Boolean(dialog) || link.classList.contains("skip-link"), true);
    });
  });

  // Use the same scroll root for slide counting at every viewport width.
  function queuePositionCheck() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (viewportWidth !== window.innerWidth) {
        viewportWidth = window.innerWidth;
        if (chapters[currentIndex]) alignChapter(chapters[currentIndex]);
        return;
      }
      const bounds = presentation.getBoundingClientRect();
      const reference = bounds.top + Math.min(bounds.height * 0.32, 230);
      setActiveSection(Math.max(0, chapters.findLastIndex(chapter => chapter.getBoundingClientRect().top <= reference)));
    });
  }
  presentation.addEventListener("scroll", queuePositionCheck, {passive:true});
  window.addEventListener("resize", queuePositionCheck, {passive:true});

  const equationObserver = new ResizeObserver(entries => {
    for (const {target} of entries) {
      const overflow = target.clientWidth > 0 && target.scrollWidth > target.clientWidth + 2;
      target.classList.toggle("wide-math", overflow);
      if (overflow) target.tabIndex = 0;
      else target.removeAttribute("tabindex");
    }
  });
  presentation.querySelectorAll(":is(div.math-display,div.formula-display,.xy-formula):not([tabindex])").forEach(element => equationObserver.observe(element));

  function bringStepIntoView(chapter, elements) {
    const units = elements.filter(unit => unit.getClientRects().length && getComputedStyle(unit).visibility === "visible");
    if (!units.length) return;

    const frame = presentation.getBoundingClientRect();
    const header = topbar.getBoundingClientRect().bottom + 16;
    const footer = Math.min(frame.bottom,dock.getBoundingClientRect().top) - 16;
    const rects = units.map(unit => unit.getBoundingClientRect());
    const top = Math.min(...rects.map(rect => rect.top));
    const bottom = Math.max(...rects.map(rect => rect.bottom));
    const fits = bottom - top <= footer - header;
    const offset = top < header || (!fits && bottom > footer)
      ? top - header
      : Math.max(0,bottom - footer);
    if (Math.abs(offset) < 2) return;

    const scene = chapter.getBoundingClientRect();
    const start = presentation.scrollTop + scene.top - frame.top;
    const end = Math.max(start,presentation.scrollTop + scene.bottom - frame.bottom);
    const target = Math.min(end,Math.max(start,presentation.scrollTop + offset));
    presentation.scrollTo({top:target,behavior:motionPreference.matches ? "instant" : "smooth"});
  }

  function advance(direction) {
    const chapter = chapters[currentIndex];
    const active = document.activeElement;
    const step = presenting ? builds.advance(chapter,direction) : null;
    if (step === null) {
      const target = currentIndex + direction;
      if (chapters[target]) goToSection(target, active === document.body || chapter.contains(active), direction > 0);
      return;
    }
    if (active.closest("[data-build-hidden]")) focusHeading(chapter);
    updateNavigation();
    bringStepIntoView(chapter,step);
  }

  previous.addEventListener("click", () => advance(-1));
  next.addEventListener("click", () => advance(1));
  showSlideAll.addEventListener("click", () => {
    const chapter = chapters[currentIndex];
    builds.showAll(chapter);
    updateNavigation();
    focusHeading(chapter);
  });

  let touchOrigin;
  presentation.addEventListener("touchstart", (event) => {
    touchOrigin = null;
    const touch = event.touches[0];
    if (event.touches.length !== 1 || touch.clientX < 24 || touch.clientX > window.innerWidth - 24) return;
    if (event.target.closest("button,a,summary,input,select,video,[role='tablist'],.math-display,.formula-display,.xy-formula")) return;
    touchOrigin = {x:touch.clientX,y:touch.clientY,id:touch.identifier};
  }, {passive:true});
  presentation.addEventListener("touchcancel", () => { touchOrigin = null; }, {passive:true});
  presentation.addEventListener("touchend", (event) => {
    if (!touchOrigin) return;
    const start = touchOrigin;
    touchOrigin = null;
    const touch = Array.from(event.changedTouches).find(item => item.identifier === start.id);
    if (!touch || event.touches.length || document.querySelector("dialog[open]")) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > 1.75 * Math.abs(dy)) advance(dx < 0 ? 1 : -1);
  }, {passive:true});

  // Projector-friendly text zoom. This changes the presentation typography and
  // spacing together, while keeping the browser's own zoom available as a fallback.
  const zoomOut = document.getElementById("zoomOut");
  const zoomReset = document.getElementById("zoomReset");
  const zoomIn = document.getElementById("zoomIn");
  const zoomLevel = document.getElementById("zoomLevel");
  const zoomLevels = [1, 1.12, 1.25, 1.4];
  let zoomIndex = 0;

  try {
    const storedZoom = Number(window.localStorage.getItem("lgmm-presenter-zoom"));
    const storedIndex = zoomLevels.findIndex((value) => Math.abs(value - storedZoom) < 0.001);
    if (storedIndex >= 0) zoomIndex = storedIndex;
  } catch {
    // Local storage may be unavailable when the file is opened with strict privacy settings.
  }

  function applyPresenterZoom(recenter = false) {
    const scale = zoomLevels[zoomIndex];
    document.documentElement.style.fontSize = `${16 * scale}px`;
    document.body.style.fontSize = `${18 * scale}px`;
    zoomLevel.textContent = `${Math.round(scale * 100)}%`;
    zoomOut.disabled = zoomIndex === 0;
    zoomIn.disabled = zoomIndex === zoomLevels.length - 1;
    zoomReset.setAttribute("aria-label", `Reset presentation text zoom; current size ${Math.round(scale * 100)} percent`);
    try {
      window.localStorage.setItem("lgmm-presenter-zoom", String(scale));
    } catch {
      // The control still works for the current session.
    }
    if (recenter) {
      const chapter = chapters[currentIndex];
      if (chapter) window.requestAnimationFrame(() => alignChapter(chapter));
    }
  }

  zoomOut.addEventListener("click", () => {
    zoomIndex = Math.max(0, zoomIndex - 1);
    applyPresenterZoom(true);
  });
  zoomIn.addEventListener("click", () => {
    zoomIndex = Math.min(zoomLevels.length - 1, zoomIndex + 1);
    applyPresenterZoom(true);
  });
  zoomReset.addEventListener("click", () => {
    zoomIndex = 0;
    applyPresenterZoom(true);
  });
  applyPresenterZoom(false);

  const fullscreenToggle = document.getElementById("fullscreenToggle");

  function setPresenting(active) {
    if (presenting === active) return;
    presenting = active;
    document.documentElement.classList.toggle("presenting", active);
    fullscreenToggle.setAttribute("aria-pressed", String(active));
    fullscreenToggle.setAttribute("aria-label", active ? "Exit presentation" : "Present");
    fullscreenToggle.querySelector("span").textContent = active ? "Exit" : "Present";
    const chapter = chapters[currentIndex];
    builds.setMode(active,chapter);
    if (active) focusHeading(chapter);
    updateNavigation();
    alignChapter(chapter);
  }

  fullscreenToggle.addEventListener("click", async () => {
    if (presenting) {
      setPresenting(false);
      if (document.fullscreenElement) await document.exitFullscreen();
      return;
    }
    setPresenting(true);
    // The focused layout also works when the browser cannot enter fullscreen.
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      // Embedded browsers may allow only the focused layout.
    }
  });
  document.addEventListener("fullscreenchange", () => setPresenting(Boolean(document.fullscreenElement)));

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const recall = document.querySelector(".equation-recall-popover:popover-open");
    if (recall) {
      if (event.key === "Escape") {
        event.preventDefault();
        recall.hidePopover();
      }
      return;
    }
    if (document.querySelector("dialog[open]")) return;
    const active = document.activeElement;
    if (active.closest("input,select,textarea,video,[contenteditable='true'],[role='tablist']")) return;
    // Native interaction and local scrolling take priority in wide equations.
    if (active.matches(".wide-math")) return;

    if (event.key === "Escape" && presenting && !document.fullscreenElement) {
      setPresenting(false);
      fullscreenToggle.focus({preventScroll:true});
    } else if (["ArrowRight","ArrowLeft"].includes(event.key) || (presenting && ["PageDown","PageUp"].includes(event.key))) {
      event.preventDefault();
      advance(["ArrowRight","PageDown"].includes(event.key) ? 1 : -1);
    } else if (active.closest("button,a,summary")) {
      return;
    } else if (presenting && event.key === " ") {
      event.preventDefault();
      advance(event.shiftKey ? -1 : 1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      goToSection(event.key === "Home" ? 0 : chapters.length - 1, true, true);
    } else if (["+", "=", "-", "0"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "0") zoomIndex = 0;
      else zoomIndex = Math.min(zoomLevels.length - 1, Math.max(0, zoomIndex + (event.key === "-" ? -1 : 1)));
      applyPresenterZoom(true);
    }
  });

  function openOverview(event) {
    overviewTrigger = event.currentTarget;
    overviewDialog.dataset.opener = overviewTrigger.id;
    overviewDialog.showModal();
    const active = overviewDialog.querySelector("[aria-current='step']");
    active?.focus();
  }
  document.getElementById("overviewToggle").addEventListener("click", openOverview);
  counter.addEventListener("click", openOverview);
  document.getElementById("overviewClose").addEventListener("click", () => overviewDialog.close());
  overviewDialog.addEventListener("click", (event) => {
    if (event.target === overviewDialog) overviewDialog.close();
  });
  overviewDialog.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]")) overviewTrigger?.focus({preventScroll:true});
    overviewTrigger = null;
    delete overviewDialog.dataset.opener;
  });

  function safePlay(video) {
    const result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  }

  const coverVideo = document.getElementById("coverVideo");
  const coverPlay = document.getElementById("coverPlay");

  function setCoverPlaying(playing) {
    if (!coverVideo || !coverPlay) return;
    coverPlay.setAttribute("aria-pressed", String(playing));
    coverPlay.querySelector("span:last-child").textContent = playing ? "Pause" : "Play";
    if (playing) safePlay(coverVideo);
    else coverVideo.pause();
  }

  if (coverVideo && coverPlay) {
    coverPlay.addEventListener("click", () => {
      setCoverPlaying(coverVideo.paused);
    });
    if (reducedMotion) setCoverPlaying(false);
  }

  const bioVideo = document.getElementById("bioVideo");
  const bioSources = {
    fields: {
      src: "assets/urokinase-fields.mp4",
      poster: "assets/urokinase-fields-poster.jpg",
      label: "Computed evolution of cell density, extracellular matrix, uPA, PAI-1, and plasmin",
    },
    mesh: {
      src: "assets/urokinase-mesh.mp4",
      poster: "assets/urokinase-mesh-poster.jpg",
      label: "Computed uPA-system solution with the associated moving mesh sizes",
    },
  };

  document.querySelectorAll("[data-bio-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.bioView;
      const selected = bioSources[key];
      const wasPlaying = !bioVideo.paused;

      document.querySelectorAll("[data-bio-view]").forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle("active", active);
        candidate.setAttribute("aria-pressed", String(active));
      });

      if (!bioVideo.currentSrc.endsWith(selected.src)) {
        bioVideo.src = selected.src;
        bioVideo.poster = selected.poster;
        bioVideo.setAttribute("aria-label", selected.label);
        bioVideo.load();
        if (wasPlaying || !reducedMotion) safePlay(bioVideo);
      }
    });
  });

  if (reducedMotion) bioVideo.pause();

  // Section 3: schematic fixed-grid under-resolution as a moving layer sharpens.
  const oscillationStage = document.getElementById("oscillationStage");
  const oscillationTime = document.getElementById("oscillationTime");
  const oscillationPlay = document.getElementById("oscillationPlay");
  const oscillationExact = document.getElementById("oscillationExact");
  const oscillationFixed = document.getElementById("oscillationFixed");
  const oscillationSamples = document.getElementById("oscillationSamples");
  const oscillationGrid = document.getElementById("oscillationGrid");

  if (oscillationStage && oscillationTime && oscillationPlay && oscillationExact && oscillationFixed && oscillationSamples && oscillationGrid) {
    const plotX = (x) => 58 + 670 * x;
    const plotY = (value) => 231 - 176 * value;
    const nodeCount = 31;
    let oscillationPlaying = false;
    let oscillationFrame = 0;
    let oscillationStart = null;

    function gaussian(x, center, width) {
      return Math.exp(-Math.pow((x - center) / width, 2));
    }

    function exactProfile(x, phase) {
      const offset = 0.17 + 0.22 * phase;
      const width = 0.105 - 0.068 * phase;
      const amplitude = 0.72 + 0.26 * phase;
      return amplitude * (gaussian(x, 0.5 - offset, width) + gaussian(x, 0.5 + offset, width));
    }

    function fixedProfile(x, phase) {
      const exact = exactProfile(x, phase);
      const offset = 0.17 + 0.22 * phase;
      const width = 0.105 - 0.068 * phase;
      const envelope = gaussian(x, 0.5 - offset, width * 2.65) + gaussian(x, 0.5 + offset, width * 2.65);
      const ripple = Math.pow(phase, 1.7) * 0.24 * envelope * Math.sin(63 * x + 2.4 * phase);
      return exact + ripple;
    }

    function pathFromSamples(samples) {
      return samples.map((point, index) => `${index ? "L" : "M"} ${plotX(point.x).toFixed(1)} ${plotY(point.y).toFixed(1)}`).join(" ");
    }

    function drawOscillation() {
      const phase = Number(oscillationStage.value) / 100;
      oscillationTime.textContent = `t = ${(2 * phase).toFixed(2)}`;

      const exactPoints = [];
      for (let i = 0; i <= 260; i += 1) {
        const x = i / 260;
        exactPoints.push({ x, y: exactProfile(x, phase) });
      }
      oscillationExact.setAttribute("d", pathFromSamples(exactPoints));

      const fixedPoints = [];
      oscillationSamples.innerHTML = "";
      oscillationGrid.innerHTML = "";
      for (let i = 0; i < nodeCount; i += 1) {
        const x = i / (nodeCount - 1);
        const y = fixedProfile(x, phase);
        fixedPoints.push({ x, y });

        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", plotX(x));
        tick.setAttribute("x2", plotX(x));
        tick.setAttribute("y1", 240);
        tick.setAttribute("y2", 246);
        tick.setAttribute("class", "oscillation-mesh-tick");
        oscillationGrid.appendChild(tick);

        const sample = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        sample.setAttribute("cx", plotX(x));
        sample.setAttribute("cy", plotY(y));
        sample.setAttribute("r", phase > 0.52 ? 3.1 : 2.6);
        sample.setAttribute("class", "oscillation-sample");
        oscillationSamples.appendChild(sample);
      }
      oscillationFixed.setAttribute("d", pathFromSamples(fixedPoints));
    }

    function oscillationLoop(timestamp) {
      if (!oscillationPlaying) return;
      if (oscillationStart === null) oscillationStart = timestamp;
      const phase = 0.5 + 0.5 * Math.sin((timestamp - oscillationStart) / 1150 - 0.5 * Math.PI);
      oscillationStage.value = String(Math.round(100 * phase));
      drawOscillation();
      oscillationFrame = requestAnimationFrame(oscillationLoop);
    }

    oscillationStage.addEventListener("input", drawOscillation);
    oscillationPlay.addEventListener("click", () => {
      oscillationPlaying = !oscillationPlaying;
      oscillationPlay.textContent = oscillationPlaying ? "Pause" : "Animate";
      if (oscillationPlaying) {
        oscillationStart = null;
        oscillationFrame = requestAnimationFrame(oscillationLoop);
      } else {
        cancelAnimationFrame(oscillationFrame);
      }
    });
    drawOscillation();
  }


  const fixedVideo = document.getElementById("fixedVideo");
  const movingVideo = document.getElementById("movingVideo");
  const comparisonPlay = document.getElementById("comparisonPlay");
  const comparisonRestart = document.getElementById("comparisonRestart");
  const comparisonScrubber = document.getElementById("comparisonScrubber");
  const comparisonTime = document.getElementById("comparisonTime");
  let comparisonPlaying = false;
  let comparisonFrame = 0;

  function comparisonDuration() {
    if (Number.isFinite(movingVideo.duration) && movingVideo.duration > 0) {
      return movingVideo.duration;
    }
    return 4.2;
  }

  function renderComparisonTime() {
    const duration = comparisonDuration();
    const progress = Math.max(0, Math.min(1, movingVideo.currentTime / duration));
    comparisonScrubber.value = String(Math.round(progress * 1000));
    comparisonTime.textContent = "t ≈ " + (progress * 2).toFixed(2);
    comparisonScrubber.style.setProperty("--comparison-progress", (progress * 100) + "%");
    comparisonScrubber.setAttribute("aria-valuetext", comparisonTime.textContent);

    if (
      comparisonPlaying &&
      Number.isFinite(fixedVideo.currentTime) &&
      Math.abs(fixedVideo.currentTime - movingVideo.currentTime) > 0.06
    ) {
      fixedVideo.currentTime = movingVideo.currentTime;
    }
  }

  function comparisonLoop() {
    renderComparisonTime();
    if (comparisonPlaying) comparisonFrame = requestAnimationFrame(comparisonLoop);
  }

  function setComparisonPlaying(playing) {
    comparisonPlaying = playing;
    comparisonPlay.classList.toggle("is-playing", playing);
    comparisonPlay.querySelector("span:last-child").textContent = playing
      ? "Pause together"
      : "Play together";

    if (playing) {
      safePlay(fixedVideo);
      safePlay(movingVideo);
      cancelAnimationFrame(comparisonFrame);
      comparisonLoop();
    } else {
      fixedVideo.pause();
      movingVideo.pause();
      cancelAnimationFrame(comparisonFrame);
      renderComparisonTime();
    }
  }

  comparisonPlay.addEventListener("click", () => {
    setComparisonPlaying(!comparisonPlaying);
  });

  comparisonRestart.addEventListener("click", () => {
    fixedVideo.currentTime = 0;
    movingVideo.currentTime = 0;
    renderComparisonTime();
    if (comparisonPlaying) {
      safePlay(fixedVideo);
      safePlay(movingVideo);
    }
  });

  comparisonScrubber.addEventListener("input", () => {
    const nextTime = (Number(comparisonScrubber.value) / 1000) * comparisonDuration();
    fixedVideo.currentTime = nextTime;
    movingVideo.currentTime = nextTime;
    renderComparisonTime();
  });

  movingVideo.addEventListener("loadedmetadata", renderComparisonTime);
  movingVideo.addEventListener("seeked", renderComparisonTime);

  const discussionResponse = document.getElementById("discussionResponse");
  if (discussionResponse) {
    const discussionContent = {
      regularity: "Non-overlap is weaker than uniform shape regularity.",
      amr: "A useful comparison should report error versus degrees of freedom and computational cost.",
      interfaces: "Moving interfaces are a research direction, not a claim of the present theorem."
    };
    document.querySelectorAll("[data-discussion]").forEach((button) => {
      button.addEventListener("click", () => { discussionResponse.textContent = discussionContent[button.dataset.discussion] || ""; });
    });
  }

  // Section 3: reveal one numerical bottleneck at a time so the audience can
  // follow the transport and resolution arguments sequentially.
  const challengeButtons = Array.from(document.querySelectorAll("[data-challenge-view]"));
  const challengePanels = Array.from(document.querySelectorAll("[data-challenge-panel]"));
  function setChallengeView(key) {
    challengeButtons.forEach((button) => {
      const active = button.dataset.challengeView === key;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    challengePanels.forEach((panel) => {
      const active = panel.dataset.challengePanel === key;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
  }
  challengeButtons.forEach((button, index) => {
    button.addEventListener("click", () => setChallengeView(button.dataset.challengeView));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = (index + direction + challengeButtons.length) % challengeButtons.length;
      challengeButtons[next].focus();
      setChallengeView(challengeButtons[next].dataset.challengeView);
    });
  });

  // Additional numerical examples tabs.
  const phenomenonButtons = Array.from(document.querySelectorAll("[data-phenomenon]"));
  const phenomenonPanels = Array.from(document.querySelectorAll("[data-phenomenon-panel]"));
  function setPhenomenon(key) {
    phenomenonButtons.forEach((b) => b.classList.toggle("active", b.dataset.phenomenon === key));
    phenomenonPanels.forEach((p) => p.classList.toggle("active", p.dataset.phenomenonPanel === key));
  }
  phenomenonButtons.forEach((button) => button.addEventListener("click", () => setPhenomenon(button.dataset.phenomenon)));
  const qualityVideo = document.getElementById("qualityVideo");
  const qualityFrameButton = document.getElementById("qualityFrameButton");
  if (qualityFrameButton && qualityVideo) {
    qualityFrameButton.addEventListener("click", () => {
      setPhenomenon("quality");
      qualityVideo.pause();
      const seek = () => { qualityVideo.currentTime = Math.min(2.4, Math.max(0, (qualityVideo.duration || 3) * 0.8)); };
      if (Number.isFinite(qualityVideo.duration) && qualityVideo.duration > 0) seek();
      else qualityVideo.addEventListener("loadedmetadata", seek, { once: true });
    });
  }

  // Mathigon-like contextual definitions / cross-links.
  const conceptPopover = document.getElementById("conceptPopover");
  const conceptTitle = document.getElementById("conceptTitle");
  const conceptBody = document.getElementById("conceptBody");
  const conceptJump = document.getElementById("conceptJump");
  const conceptClose = document.getElementById("conceptClose");
  const concepts = {
    "conservative-form": { title: "Conservative form", body: "Writing transport as ∂ₜφ + ∇·(uφ) preserves the density / mass interpretation. In the LG discretization, the Jacobian-weighted pullback is the corresponding discrete mechanism.", jump: "#conservative-lg" },
    "physical-velocity": { title: "Physical velocity u", body: "u defines the characteristic map X₁ⁿ and transports the density. It is conceptually distinct from the mesh velocity, which transports the nodes and basis functions.", jump: "#characteristics" },
    "characteristic-map": { title: "Characteristic departure map X₁ⁿ", body: "X₁ⁿ(x)=x−Δt uⁿ(x) approximates the backward characteristic from the arrival point x at tⁿ to the departure point at tⁿ⁻¹.", jump: "#characteristics" },
    "jacobian": { title: "Jacobian γⁿ", body: "γⁿ=det(∂X₁ⁿ/∂x). It accounts for local compression / expansion so that the characteristic pullback transports density conservatively, not only point values.", jump: "#conservative-lg" },
    "non-overlap": { title: "Non-overlap", body: "Distinct element interiors do not intersect after the mesh update. In Proposition 1 this follows from global injectivity of the mesh-to-mesh map, not merely from positive element determinants.", jump: "#geometry-theorem" },
    "element-matrix": { title: "Element matrix E_K", body: "For an oriented simplex K with vertices P_{i_0},…,P_{i_d}, the edge matrix is E_K=[P_{i_1}-P_{i_0} ··· P_{i_d}-P_{i_0}]. Its determinant records orientation and |det(E_K)|/d! is the simplex volume.", jump: "#geometry-theorem" },
    "under-resolution": { title: "Fixed-mesh under-resolution", bodyHtml: `<p>Let ℓ(t) denote the width of a sharp layer. When ℓ(t) is much smaller than the local element size h<sub>K</sub>, only a few P1 nodes lie across the layer.</p><div class="popup-math">ℓ(t) ≪ h<sub>K</sub> &nbsp; ⇒ &nbsp; the fixed space cannot represent the sharp profile reliably.</div><p>A stable characteristic update controls transport, but it cannot manufacture the missing spatial degrees of freedom. The fixed-grid numerical animation shows the resulting oscillatory response.</p>`, jump: "#challenge" },
    "moving-resolution": { title: "Moving spatial resolution", bodyHtml: `<p>The mesh keeps the same total number of P1 degrees of freedom but relocates nodes toward large changes in the numerical profile.</p><div class="popup-math">h<sub>K</sub>(t) ↓ &nbsp; near sharp peaks and large gradient jumps.</div><p>This improves the local representation scale without globally refining the mesh. Mesh validity and multidimensional shape quality remain separate analytical requirements.</p>`, jump: "#mesh-kinematics" },
    "r1-standard": { title: "R₁: standard LG consistency", body: "R₁ contains the physical characteristic / time consistency error. In the residual norm used by the LG stability argument, the standard estimate is O(Δt) for LG1 and O(Δt²) for LG2. It does not come from movement of the finite-element mesh; the moving-space work is concentrated in R₂ and R₃.", jump: "#error-equation" },
    "r2-residual": { title: "R₂: moving projection-error residual", bodyHtml: `<p>With η(t)=φ(t)−Π<sub>h</sub>(t)φ(t),</p><div class="popup-math">R<sub>2</sub><sup>n</sup> = [η<sup>n</sup>−(η<sup>n−1</sup>∘X<sub>1</sub><sup>n</sup>)γ<sup>n</sup>]/Δt.</div><p>It compares the present projection error with the previous error after the conservative physical pullback. Because Π<sub>h</sub>(t) changes with the mesh, this is the residual where projection and transport interact.</p>`, jump: "#r2-analysis" },
    "q-mov": { title: "Qmov: moving-projection difference", bodyHtml: `<div class="popup-math">Q<sub>mov</sub><sup>n</sup> := [η<sup>n</sup>−η<sup>n−1</sup>∘Y<sub>1</sub><sup>n</sup>]/Δt.</div><p>It follows the projection error along the mesh trajectory. This is the term reduced to the norm of the mesh material derivative η̇.</p>`, jump: "#r2-analysis" },
    "q-mesh": { title: "Qmesh: mesh-map difference", bodyHtml: `<div class="popup-math">Q<sub>mesh</sub><sup>n</sup> := [η<sup>n−1</sup>∘Y<sub>1</sub><sup>n</sup>−η<sup>n−1</sup>]/Δt.</div><p>It isolates the change caused by evaluating the same previous-time error at the mesh departure point.</p>`, jump: "#r2-analysis" },
    "q-phys": { title: "Qphys: physical-characteristic difference", bodyHtml: `<div class="popup-math">Q<sub>phys</sub><sup>n</sup> := [η<sup>n−1</sup>−η<sup>n−1</sup>∘X<sub>1</sub><sup>n</sup>]/Δt.</div><p>It isolates the physical characteristic displacement. Together with Q<sub>mesh</sub><sup>n</sup>, it bridges mesh transport and physical transport.</p>`, jump: "#r2-analysis" },
    "q-jacobian": { title: "QJ: conservative Jacobian difference", bodyHtml: `<div class="popup-math">Q<sub>J</sub><sup>n</sup> := (η<sup>n−1</sup>∘X<sub>1</sub><sup>n</sup>)(1−γ<sup>n</sup>)/Δt.</div><p>It is the volume-change correction needed because the conservative pullback transports density with the Jacobian γ<sup>n</sup>.</p>`, jump: "#r2-analysis" },
    "material-derivative": { title: "Dot material derivative", bodyHtml: `<p>In this presentation, the dot means differentiation along the mesh velocity:</p><div class="popup-math"><span class="html-math"><span class="mdot">v</span> := ∂<sub>t</sub>v + w<sub>h</sub>·∇v</span>.</div><p>For a transported P1 test function with fixed nodal coefficients, <span class="html-math"><span class="mdot">ψ</span><sub>h</sub>=0</span>. This is the transport property used when differentiating the moving projection orthogonality.</p>`, jump: "#analysis-target" },
    "mesh-flow": { title: "Backward mesh flow Y", bodyHtml: `<p>The mesh-flow trajectory follows the mesh velocity and connects the moving spaces at different times.</p><div class="popup-math">Y(t;x,t<sup>n</sup>) = x - (t<sup>n</sup>-t)w<sub>h</sub><sup>n</sup>(x), &nbsp; Y<sub>1</sub><sup>n</sup>(x)=Y(t<sup>n-1</sup>;x,t<sup>n</sup>)</div><p>Along this trajectory, the transported basis satisfies <span class="html-math"><span class="frac"><span class="top">d</span><span class="bottom">dt</span></span>φ<sub>i</sub>(Y(t),t)=0</span>, and <span class="html-math"><span class="frac"><span class="top">d</span><span class="bottom">dt</span></span>η(Y(t),t)=<span class="mdot">η</span>(Y(t),t)</span>.</p>`, jump: "#r2-analysis" },
    "b-form": { title: "Differentiated orthogonality term b(η,ψₕ)", bodyHtml: `<p>After differentiating the projection orthogonality along the moving mesh, the mesh-deformation terms are collected in</p><div class="popup-math">b(η,ψ<sub>h</sub>) = -(M<sub>h</sub>∇η,∇ψ<sub>h</sub>) - ((∇·w<sub>h</sub>)η,ψ<sub>h</sub>).</div><p>So <span class="html-math">A(<span class="mdot">η</span>,ψ<sub>h</sub>)=b(η,ψ<sub>h</sub>)</span> is the differentiated orthogonality identity used to estimate the moving-projection derivative.</p>`, jump: "#analysis-target" },
    "elliptic-form": { title: "Elliptic bilinear form A", bodyHtml: `<p>The extension uses the coercive elliptic form</p><div class="popup-math">A(v,z):=(∇v,∇z)+(v,z).</div><p>The moving projection is defined by <span class="html-math">A(Π<sub>h</sub>(t)φ,ψ<sub>h</sub>)=A(φ,ψ<sub>h</sub>)</span> for every <span class="html-math">ψ<sub>h</sub>∈V<sub>h,0</sub>(t)</span>. Therefore its error <span class="html-math">η=φ−Π<sub>h</sub>(t)φ</span> satisfies <span class="html-math">A(η,ψ<sub>h</sub>)=0</span>.</p>`, jump: "#projection-strategy" },
    "projection-orthogonality": { title: "Moving projection orthogonality", bodyHtml: `<p>For η(t)=φ(t)−Π<sub>h</sub>(t)φ(t), the boundary-compatible elliptic projection satisfies</p><div class="popup-math">A(η,ψ<sub>h</sub>)=0, &nbsp; ∀ψ<sub>h</sub>∈V<sub>h,0</sub>(t).</div><p>Choosing a test function transported with the moving basis, so that <span class="html-math"><span class="mdot">ψ</span><sub>h</sub>=0</span>, lets us differentiate this identity and obtain the equation used to estimate <span class="html-math"><span class="mdot">η</span></span>.</p>`, jump: "#analysis-target" },
    "boundary-l2-projection": { title: "Boundary L² projection Pₕ^Γ", body: "Pₕ^Γ is the L²(Γ)-orthogonal projection onto the finite-element trace space: (φ−Pₕ^Γφ,μₕ)_Γ=0. Under H²(Ω) regularity this orthogonality improves the negative-order boundary error to O(h²), which is the gain needed in the duality argument.", jump: "#projection-strategy" },
    "shape-regularity": { title: "Shape regularity", body: "A stronger mesh-quality condition controlling aspect ratios / angles uniformly. A mesh may be non-overlapping and non-inverted while still containing very thin or skewed simplices.", jump: "#boundary-quality", action: "quality" },
    "ritz-projection": { title: "Elliptic projection Πₕ(t)", body: "Defined by A(Πₕ(t)v,ψₕ)=A(v,ψₕ) for all ψₕ in the moving finite-element space, with A(v,z)=(∇v,∇z)+(v,z). Its orthogonality converts the diffusion residual R₃ into an L² projection-error term.", jump: "#projection-strategy" },
    "r3": { title: "R₃", body: "The diffusion residual: ⟨R₃ⁿ,ψₕ⟩=ν(∇ηⁿ,∇ψₕ). The elliptic-projection orthogonality rewrites this in terms of the L² projection error.", jump: "#projection-strategy" },
    "boundary-quality": { title: "Boundary-element quality", body: "The 2D moving-mesh run visibly develops strongly skewed boundary-adjacent triangles. This motivates a separate shape-quality analysis: non-inversion alone is not enough for uniform interpolation constants.", jump: "#boundary-quality", action: "quality", image: "assets/moving-mesh-2d-poster.jpg" },
    "coupled-transport": { title: "A simple coupled transport next step", body: "Carrillo–Kolbe–Lukáčová-Medvid’ová (2019) start from a reaction–taxis–diffusion pair: ∂ₜρ=∂ₓ(Dρ∂ₓρ−χρ∂ₓc)+Rρ(ρ), ε∂ₜc=Dc∂ₓₓc+Rc(ρ,c). A natural extension path is: scalar convection–diffusion → this two-field system → richer cancer-invasion / uPA systems.", jump: "#motivation" },
    "stokes-transport": { title: "Convection–diffusion with stationary Stokes flow", bodyHtml: `<p>First determine an incompressible velocity from a stationary Stokes problem, for example</p><div class="popup-math">−μΔu + ∇p = f, &nbsp; ∇·u = 0,</div><p>then use that velocity in the conservative scalar convection–diffusion equation. This is a realistic intermediate application: it introduces a PDE-generated flow field while avoiding the full feedback and nonlinearity of Navier–Stokes coupling.</p>`, jump: "#outlook" },
    "curvature-flow": { title: "Curve-shortening flow", bodyHtml: `<p>A planar curve evolves with normal velocity determined by its curvature; schematically,</p><div class="popup-math">V<sub>n</sub> = κ</div><p>A moving mesh could redistribute points tangentially while the geometric motion shrinks the curve normally. The analytical questions are then geometric accuracy, point distribution, and mesh quality.</p>`, jump: "#outlook" }
  };
  let conceptHideTimer = 0;
  function placePopover(target) {
    const r = target.getBoundingClientRect();
    conceptPopover.hidden = false;
    const box = conceptPopover.getBoundingClientRect();
    let left = r.left + r.width / 2 - box.width / 2;
    left = Math.max(12, Math.min(window.innerWidth - box.width - 12, left));
    let top = r.bottom + 10;
    if (top + box.height > window.innerHeight - 12) top = Math.max(12, r.top - box.height - 10);
    conceptPopover.style.left = left + "px";
    conceptPopover.style.top = top + "px";
  }
  let conceptTrigger;
  function showConcept(target) {
    clearTimeout(conceptHideTimer);
    const item = concepts[target.dataset.term];
    if (!item) return;
    conceptTrigger = target;
    conceptTitle.textContent = item.title;
    conceptBody.innerHTML = (item.bodyHtml || `<p>${item.body}</p>`) + (item.image ? `<img src="${item.image}" alt="Preview related to ${item.title}">` : "");
    conceptJump.href = item.jump || "#question";
    conceptJump.textContent = item.action === "quality" ? "Open the 2D quality example ↗" : "Revisit the related section ↗";
    conceptJump.dataset.action = item.action || "";
    placePopover(target);
  }
  function scheduleHideConcept() { conceptHideTimer = window.setTimeout(() => { conceptPopover.hidden = true; }, 180); }
  document.querySelectorAll("[data-term]").forEach((target) => {
    target.addEventListener("mouseenter", () => showConcept(target));
    target.addEventListener("mouseleave", scheduleHideConcept);
    target.addEventListener("focus", () => showConcept(target));
    target.addEventListener("blur", scheduleHideConcept);
    target.addEventListener("click", () => showConcept(target));
  });
  conceptPopover.addEventListener("mouseenter", () => clearTimeout(conceptHideTimer));
  conceptPopover.addEventListener("mouseleave", scheduleHideConcept);
  conceptClose.addEventListener("click", () => { conceptPopover.hidden = true; });
  conceptJump.addEventListener("click", (event) => {
    if (openTechnicalLink(conceptJump.getAttribute("href"), false, conceptTrigger)) event.preventDefault();
    if (conceptJump.dataset.action === "quality") setPhenomenon("quality");
    conceptPopover.hidden = true;
  });

  // Optional panel focus: enlarge substantial mathematical panels without
  // changing or removing any presentation content.
  const panelFocusDialog = document.createElement("dialog");
  panelFocusDialog.className = "panel-focus-dialog";
  panelFocusDialog.setAttribute("aria-label", "Focused presentation panel");
  panelFocusDialog.innerHTML = `
    <div class="panel-focus-shell">
      <header class="panel-focus-head">
        <div><span>Focused view</span><strong id="panelFocusTitle">Mathematical panel</strong></div>
        <button type="button" class="panel-focus-close" aria-label="Close focused view">
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 4l12 12M16 4L4 16"></path></svg>
        </button>
      </header>
      <div class="panel-focus-content"></div>
    </div>`;
  document.body.appendChild(panelFocusDialog);

  const panelFocusTitle = panelFocusDialog.querySelector("#panelFocusTitle");
  const panelFocusContent = panelFocusDialog.querySelector(".panel-focus-content");
  const panelFocusClose = panelFocusDialog.querySelector(".panel-focus-close");
  let lastPanelFocusTrigger = null;

  function panelLabel(panel) {
    const localLabel = panel.querySelector(
      ":scope > header span, .formal-label, .extension-result-head span, .material-bridge-head span, .analysis-conclusion > header span, .initial-data-head span"
    );
    return localLabel?.textContent.trim() || panel.closest(".chapter")?.dataset.title || "Mathematical panel";
  }

  function openPanelFocus(panel, trigger) {
    const clone = panel.cloneNode(true);
    clone.querySelectorAll(".panel-focus-trigger").forEach((button) => button.remove());
    clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
    clone.querySelectorAll("button.term-link").forEach((button) => { button.disabled = true; });
    clone.querySelectorAll("video").forEach((video) => {
      video.removeAttribute("autoplay");
      video.pause?.();
    });
    panelFocusTitle.textContent = panelLabel(panel);
    panelFocusContent.replaceChildren(clone);
    lastPanelFocusTrigger = trigger;
    conceptPopover.hidden = true;
    if (!panelFocusDialog.open) panelFocusDialog.showModal();
    panelFocusClose.focus();
  }

  const focusTargets = Array.from(document.querySelectorAll(
    ".formal-panel:not(.r2-exact-panel), .theorem-box, .mapping-visual-panel, .material-bridge-panel, .extension-result-panel, .analysis-conclusion, .mesh-update-definition, .initial-data-figure"
  ));

  focusTargets.forEach((panel) => {
    panel.classList.add("panel-focusable");
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "panel-focus-trigger";
    trigger.setAttribute("aria-label", `Enlarge ${panelLabel(panel)}`);
    trigger.title = "Focus this panel";
    trigger.innerHTML = `<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M7 3H3v4M13 3h4v4M17 13v4h-4M7 17H3v-4"></path></svg>`;
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      openPanelFocus(panel, trigger);
    });
    panel.appendChild(trigger);

    if (!reducedMotion) {
      panel.addEventListener("pointermove", (event) => {
        const rect = panel.getBoundingClientRect();
        panel.style.setProperty("--panel-x", `${event.clientX - rect.left}px`);
        panel.style.setProperty("--panel-y", `${event.clientY - rect.top}px`);
      });
    }
  });

  function closePanelFocus() {
    if (panelFocusDialog.open) panelFocusDialog.close();
  }
  panelFocusClose.addEventListener("click", closePanelFocus);
  panelFocusDialog.addEventListener("click", (event) => {
    if (event.target === panelFocusDialog) closePanelFocus();
  });
  panelFocusDialog.addEventListener("close", () => {
    panelFocusContent.replaceChildren();
    lastPanelFocusTrigger?.focus();
  });


  const initialHash = window.location.hash;
  if (initialHash && chapters.some(chapter => "#" + chapter.id === initialHash)) {
    window.addEventListener("load", () => {
      const chapter = chapters[currentIndex];
      if (chapter && window.location.hash === initialHash) alignChapter(chapter);
    }, {once:true});
  }
  const initialIndex = Math.max(
    0,
    chapters.findIndex((chapter) => "#" + chapter.id === window.location.hash)
  );
  const technicalDestination = openTechnicalLink(initialHash, true);
  if (technicalDestination) {
    goToSection(chapters.findIndex(chapter => chapter.id === technicalDestination));
    openTechnicalLink(initialHash);
  } else goToSection(initialIndex);
})();
