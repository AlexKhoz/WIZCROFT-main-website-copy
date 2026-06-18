/* ============================================================
   main.js
   1) Inject CMS content from /content/home.json into the static
      markup via data-* attributes (markup/styling stay static).
   2) Web3Forms contact-form submission + client-side validation.
   3) Scroll-to-top ("Наверх").

   NOTE on the fixed-background ("parallax") effect: it is implemented
   purely in CSS (.hero__bg-img / .footer__bg-img use position:fixed,
   clipped by the section's overflow:hidden). No JS is required for it.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- helpers ---------- */
  function getByPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc == null ? undefined : acc[key];
    }, obj);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ---------- 1) content injection ---------- */
  function injectContent(data) {
    // plain text fields: escape, keep newlines as <br>
    document.querySelectorAll("[data-field]").forEach(function (el) {
      var val = getByPath(data, el.getAttribute("data-field"));
      if (val == null) return;
      el.innerHTML = escapeHtml(val).replace(/\n/g, "<br>");
    });

    // raw HTML fields (contain intentional inline <span>/<br> markup)
    document.querySelectorAll("[data-field-html]").forEach(function (el) {
      var val = getByPath(data, el.getAttribute("data-field-html"));
      if (val == null) return;
      el.innerHTML = val;
    });

    // placeholder fields
    document.querySelectorAll("[data-field-placeholder]").forEach(function (el) {
      var val = getByPath(data, el.getAttribute("data-field-placeholder"));
      if (val != null) el.setAttribute("placeholder", val);
    });

    // simple <li> lists rebuilt from arrays
    document.querySelectorAll("[data-field-list]").forEach(function (el) {
      var arr = getByPath(data, el.getAttribute("data-field-list"));
      if (!Array.isArray(arr)) return;
      el.innerHTML = "";
      arr.forEach(function (text) {
        var li = document.createElement("li");
        li.textContent = text;
        el.appendChild(li);
      });
    });
  }

  fetch("content/home.json")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(injectContent)
    .catch(function (err) {
      // Non-fatal: the static HTML already contains the correct copy.
      console.warn("home.json not loaded; using static content.", err);
    });

  /* ---------- 2) contact form (Web3Forms) ---------- */
  var form = document.getElementById("contact-form");
  var result = document.getElementById("form-result");

  // Accepts UA numbers like +380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX
  // (spaces, dashes, parentheses are ignored).
  function isValidUaPhone(raw) {
    var digits = raw.replace(/[^\d+]/g, "");
    return /^(?:\+?380\d{9}|0\d{9})$/.test(digits);
  }

  function setResult(message, ok) {
    if (!result) return;
    result.textContent = message;
    result.classList.remove("is-ok", "is-error");
    result.classList.add(ok ? "is-ok" : "is-error");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameEl = form.elements["name"];
      var phoneEl = form.elements["phone"];
      var valid = true;

      [nameEl, phoneEl].forEach(function (el) { el.classList.remove("is-invalid"); });

      if (!nameEl.value.trim()) { nameEl.classList.add("is-invalid"); valid = false; }
      if (!isValidUaPhone(phoneEl.value)) { phoneEl.classList.add("is-invalid"); valid = false; }

      if (!valid) {
        setResult("Будь ласка, вкажіть ім'я та коректний номер телефону.", false);
        return;
      }

      var btn = form.querySelector(".form__submit");
      var btnText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Надсилаємо…"; }
      setResult("", true);

      var payload = Object.fromEntries(new FormData(form).entries());

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (json.success) {
            form.reset();
            setResult("Дякуємо! Ми зв'яжемося з вами найближчим часом.", true);
          } else {
            setResult("Сталася помилка. Спробуйте ще раз або зателефонуйте нам.", false);
          }
        })
        .catch(function () {
          setResult("Сталася помилка з'єднання. Спробуйте ще раз.", false);
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
        });
    });
  }

  /* ---------- 3) scroll to top ---------- */
  var toTop = document.getElementById("back-to-top");
  if (toTop) {
    toTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 4) mobile nav (hamburger) ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var heroNav = document.getElementById("hero-nav");
  if (navToggle && heroNav) {
    navToggle.addEventListener("click", function () {
      var open = heroNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    // close the mobile menu after tapping a link
    heroNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        heroNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 5) services dropdown ("Сервіси") ---------- */
  var servicesToggle = document.querySelector(".nav__item--services");
  var servicesMenu = document.querySelector(".services-menu");
  var servicesChevron = document.querySelector(".hero__chevron");

  if (servicesToggle && servicesMenu) {
    servicesToggle.setAttribute("role", "button");
    servicesToggle.setAttribute("aria-haspopup", "true");
    servicesToggle.setAttribute("aria-expanded", "false");
    servicesToggle.setAttribute("tabindex", "0");

    function setServicesOpen(open) {
      servicesMenu.classList.toggle("is-open", open);
      servicesToggle.setAttribute("aria-expanded", String(open));
      if (servicesChevron) servicesChevron.classList.toggle("is-open", open);
    }
    function toggleServices() {
      setServicesOpen(!servicesMenu.classList.contains("is-open"));
    }

    servicesToggle.addEventListener("click", function (e) { e.stopPropagation(); toggleServices(); });
    servicesToggle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleServices(); }
    });
    if (servicesChevron) {
      servicesChevron.addEventListener("click", function (e) { e.stopPropagation(); toggleServices(); });
    }
    // close when clicking outside or pressing Escape
    document.addEventListener("click", function (e) {
      if (servicesMenu.classList.contains("is-open") &&
          !servicesMenu.contains(e.target) &&
          e.target !== servicesToggle) {
        setServicesOpen(false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setServicesOpen(false);
    });
  }
})();
