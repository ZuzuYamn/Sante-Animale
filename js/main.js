/* ==========================================================================
   Santé Animale — shared behaviour
   Small, dependency-free interactions. Everything degrades gracefully if
   JS fails to load: nav becomes a plain list, forms still submit, etc.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollReveal();
  initTestimonialSlider();
  initFaqAccordion();
  initTeamFilter();
  initContactForm();
  initPulseDividers();
  setActiveNavLink();
  initYear();
});

/* ---- Mobile nav ---------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );
}

/* ---- Scroll-triggered reveal ---------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---- Testimonial slider ----------------------------------------------------- */
function initTestimonialSlider() {
  const track = document.querySelector(".testimonial-track");
  const prev = document.querySelector("[data-t-prev]");
  const next = document.querySelector("[data-t-next]");
  if (!track || !prev || !next) return;

  const scrollByCard = (dir) => {
    const card = track.querySelector(".t-card");
    const gap = parseFloat(getComputedStyle(track).gap || "0");
    const distance = card ? card.offsetWidth + gap : 320;
    track.scrollBy({ left: dir * distance, behavior: "smooth" });
  };

  prev.addEventListener("click", () => scrollByCard(-1));
  next.addEventListener("click", () => scrollByCard(1));
}

/* ---- FAQ accordion ----------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector(".faq-q");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      items.forEach((i) => {
        i.classList.remove("open");
        i.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ---- Team filter --------------------------------------------------------------- */
function initTeamFilter() {
  const buttons = document.querySelectorAll(".team-filter button");
  const cards = document.querySelectorAll(".team-card");
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.role === filter;
        card.hidden = !match;
      });
    });
  });
}

/* ---- Contact form validation ----------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const success = document.querySelector("#form-success");

  const validators = {
    name: (v) => v.trim().length >= 2,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone: (v) => v.trim() === "" || /^[+\d][\d\s().-]{6,}$/.test(v.trim()),
    petType: (v) => v.trim().length > 0,
    message: (v) => v.trim().length >= 10,
  };

  function validateField(field) {
    const name = field.name;
    if (!validators[name]) return true;
    const valid = validators[name](field.value);
    const wrapper = field.closest(".field");
    wrapper.classList.toggle("invalid", !valid);
    return valid;
  }

  form.querySelectorAll("input, textarea, select").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("invalid")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let allValid = true;
    form.querySelectorAll("input, textarea, select").forEach((field) => {
      if (validators[field.name] && !validateField(field)) allValid = false;
    });

    if (!allValid) {
      const firstInvalid = form.querySelector(".field.invalid input, .field.invalid textarea, .field.invalid select");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* Placeholder submit: no backend wired up yet.
       Replace this block with a fetch() call to your endpoint. */
    form.reset();
    form.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));
    if (success) {
      success.classList.add("show");
      success.setAttribute("tabindex", "-1");
      success.focus();
      setTimeout(() => success.classList.remove("show"), 6000);
    }
  });
}

/* ---- Pulse-to-paw divider: (re)play the draw-on animation once in view ------------- */
function initPulseDividers() {
  const dividers = document.querySelectorAll(".pulse-divider .pulse-line-anim");
  if (!dividers.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = "running";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  dividers.forEach((el) => {
    el.style.animationPlayState = "paused";
    observer.observe(el);
  });
}

/* ---- Active nav link based on current page ------------------------------------------ */
function setActiveNavLink() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
}

/* ---- Footer year -------------------------------------------------------------------- */
function initYear() {
  const el = document.querySelector("#year");
  if (el) el.textContent = new Date().getFullYear();
}
