/* ==========================================================
   Rachel Hu — Portfolio script
   1. Mobile navigation
   2. Active nav link while scrolling
   3. Load more projects
   4. Contact form (Formspree)
   5. Voice navigation (Web Speech API)
   6. Footer year
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNavLinks();
  initLoadMoreProjects();
  initContactForm();
  initVoiceNavigation();
  initFooterYear();
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SCROLL_BEHAVIOR = prefersReducedMotion ? "auto" : "smooth";

/* ---------------------------------------------------------
   1. Mobile navigation
   --------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  const setMenuOpen = (open) => {
    menu.dataset.state = open ? "open" : "closed";
    menu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.classList.toggle("open", open);
  };

  toggle.addEventListener("click", () => {
    setMenuOpen(menu.dataset.state !== "open");
  });

  // Clicking a link only ever closes the menu
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  // Close with Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.dataset.state === "open") {
      setMenuOpen(false);
      toggle.focus();
    }
  });

  // Close if the window is resized to desktop width
  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) setMenuOpen(false);
  });
}

/* ---------------------------------------------------------
   2. Highlight the nav link for the section in view
   --------------------------------------------------------- */
function initActiveNavLinks() {
  const links = document.querySelectorAll(".nav-links a");
  if (!links.length || !("IntersectionObserver" in window)) return;

  const linkFor = new Map();
  links.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) linkFor.set(section, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.remove("is-active"));
        linkFor.get(entry.target)?.classList.add("is-active");
      });
    },
    // A section counts as "in view" when it crosses the middle band of the screen
    { rootMargin: "-45% 0px -50% 0px" }
  );

  linkFor.forEach((_, section) => observer.observe(section));
}

/* ---------------------------------------------------------
   3. Load more projects
   --------------------------------------------------------- */
function initLoadMoreProjects() {
  const loadMoreBtn = document.getElementById("load-more-btn");
  if (!loadMoreBtn) return;

  const container = loadMoreBtn.parentElement;
  const hiddenProjects = document.querySelectorAll(".hidden-project");

  if (hiddenProjects.length === 0) {
    container.hidden = true;
    return;
  }

  loadMoreBtn.addEventListener("click", () => {
    hiddenProjects.forEach((project) => project.classList.remove("hidden-project"));

    // Move keyboard focus to the first newly shown project
    const firstLink = hiddenProjects[0].querySelector("a");
    if (firstLink) firstLink.focus({ preventScroll: true });
    hiddenProjects[0].scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: "nearest" });

    container.hidden = true;
  });
}

/* ---------------------------------------------------------
   4. Contact form (Formspree)
   --------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const submitBtn = form.querySelector(".contact-submit");
  const fields = [
    { input: document.getElementById("contact-name"), message: "Please enter your name." },
    { input: document.getElementById("contact-email"), message: "Please enter a valid email address." },
    { input: document.getElementById("contact-message"), message: "Please enter a message." },
  ].filter((field) => field.input);

  function validateField({ input, message }) {
    const error = document.getElementById(`${input.id}-error`);
    const isValid = input.value.trim() !== "" && input.checkValidity();
    input.setAttribute("aria-invalid", String(!isValid));
    if (error) error.textContent = isValid ? "" : message;
    return isValid;
  }

  function setStatus(text, type = "") {
    status.textContent = text;
    status.className = `form-status ${type}`.trim();
  }

  // Re-check a field while the person is fixing it
  fields.forEach((field) => {
    field.input.addEventListener("input", () => {
      if (field.input.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const results = fields.map(validateField);
    const firstInvalid = fields.find((_, i) => !results[i]);
    if (firstInvalid) {
      firstInvalid.input.focus();
      return;
    }

    setStatus("Sending…");
    submitBtn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      form.reset();
      fields.forEach(({ input }) => input.removeAttribute("aria-invalid"));
      setStatus("Thanks! Your message has been sent — I'll get back to you soon.", "is-success");
    } catch (error) {
      setStatus(
        "Your message couldn't be sent. Please try again or email me at hurui.lcy@gmail.com.",
        "is-error"
      );
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* ---------------------------------------------------------
   5. Voice navigation (Web Speech API)
   --------------------------------------------------------- */
function initVoiceNavigation() {
  const toggle = document.getElementById("voice-toggle");
  const panel = document.getElementById("voice-panel");
  const closeBtn = document.getElementById("voice-close");
  const listenBtn = document.getElementById("voice-listen");
  const status = document.getElementById("voice-status");
  if (!toggle || !panel || !closeBtn || !listenBtn || !status) return;

  // Reuse the hero's resume link so the path only lives in one place
  const resumeLink = document.querySelector("[data-resume-link]");
  const RESUME_URL = resumeLink ? resumeLink.href : null;
  const BLOG_URL = "https://nodejs-blog-c5o4.onrender.com/";

  /*
    Order matters: more specific phrases first.
    ("ai resume analyzer" must be checked before "resume",
     otherwise it would open the resume PDF.)
  */
  const COMMANDS = [
    { keywords: ["resume analyzer", "resume analyser", "ai resume"], label: "AI Resume Analyzer details", run: () => goToPage("business-ai.html") },
    { keywords: ["peak pets", "pet"], label: "Peak Pets details", run: () => goToPage("business-peakpets.html") },
    { keywords: ["project"], label: "Projects", run: () => scrollToSection("#projects") },
    { keywords: ["skill", "capabil"], label: "Skills", run: () => scrollToSection("#skills") },
    { keywords: ["about"], label: "About", run: () => scrollToSection("#about") },
    { keywords: ["contact"], label: "Contact", run: () => scrollToSection("#contact") },
    { keywords: ["top", "home"], label: "the top of the page", run: () => scrollToSection("#profile") },
    { keywords: ["resume", "cv"], label: "Resume", run: () => (RESUME_URL ? openInNewTab(RESUME_URL) : false) },
    { keywords: ["blog"], label: "Blog", run: () => openInNewTab(BLOG_URL) },
  ];

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;

  function setStatus(text) {
    status.textContent = text;
  }

  function scrollToSection(selector) {
    const section = document.querySelector(selector);
    if (!section) return false;
    section.scrollIntoView({ behavior: SCROLL_BEHAVIOR });
    return true;
  }

  function goToPage(url) {
    window.location.href = url;
    return true;
  }

  function openInNewTab(url) {
    // Passing "noopener" makes window.open() always return null, so clear opener manually
    const win = window.open(url, "_blank");
    if (win) {
      win.opener = null;
    } else {
      // Pop-up blocked: open in the same tab instead
      window.location.href = url;
    }
    return true;
  }

  function stopListening() {
    if (recognition && isListening) recognition.stop();
  }

  function setPanelOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (!open) stopListening();
  }

  toggle.addEventListener("click", () => setPanelOpen(panel.hidden));

  closeBtn.addEventListener("click", () => {
    setPanelOpen(false);
    toggle.focus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setPanelOpen(false);
      toggle.focus();
    }
  });

  // Browser without speech recognition (e.g. Firefox)
  if (!SpeechRecognition) {
    listenBtn.hidden = true;
    setStatus("Voice navigation isn't supported in this browser. You can use the menu instead.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  listenBtn.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch (error) {
      // start() throws if recognition is already running — safe to ignore
    }
  });

  recognition.addEventListener("start", () => {
    isListening = true;
    listenBtn.textContent = "Stop Listening";
    listenBtn.classList.add("is-listening");
    setStatus("Listening…");
  });

  recognition.addEventListener("end", () => {
    isListening = false;
    listenBtn.textContent = "Start Listening";
    listenBtn.classList.remove("is-listening");
  });

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    const command = COMMANDS.find((cmd) =>
      cmd.keywords.some((word) => transcript.includes(word))
    );

    if (!command) {
      setStatus(`I heard "${transcript}", but didn't catch a command. Please try again.`);
      return;
    }

    const succeeded = command.run();
    setStatus(
      succeeded === false
        ? `Couldn't open ${command.label}.`
        : `Going to ${command.label}.`
    );
  });

  recognition.addEventListener("error", (event) => {
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      setStatus("Microphone access wasn't granted. You can use the menu or update your browser permissions.");
    } else if (event.error === "no-speech") {
      setStatus("I didn't catch that. Please try again.");
    } else if (event.error !== "aborted") {
      setStatus("Voice navigation ran into a problem. Please use the menu instead.");
    }
  });
}

/* ---------------------------------------------------------
   6. Footer year
   --------------------------------------------------------- */
function initFooterYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}