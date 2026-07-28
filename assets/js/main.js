// MAP Ventures — shared site behavior (mobile nav toggle + active nav highlight)
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = !mobileNav.classList.contains("hidden");
      mobileNav.classList.toggle("hidden");
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(function (link) {
    if (link.getAttribute("data-nav") === currentPage) {
      link.classList.add("nav-active");
    }
  });

  // Portfolio "coverflow" carousel (styles.html only — no-ops elsewhere)
  var viewport = document.getElementById("portfolio-carousel");
  var track = document.getElementById("portfolio-carousel-track");
  if (viewport && track) {
    var cards = Array.prototype.slice.call(track.querySelectorAll(".carousel-card"));
    var total = cards.length;
    var active = 0;
    var intervalId = null;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function render() {
      cards.forEach(function (card, i) {
        var delta = i - active;
        if (delta > total / 2) delta -= total;
        if (delta < -total / 2) delta += total;
        card.classList.remove("is-center", "is-prev", "is-next", "is-hidden");
        if (delta === 0) card.classList.add("is-center");
        else if (delta === -1) card.classList.add("is-prev");
        else if (delta === 1) card.classList.add("is-next");
        else card.classList.add("is-hidden");
      });
    }

    function goTo(index) {
      active = ((index % total) + total) % total;
      render();
    }

    function next() {
      goTo(active + 1);
    }

    function prev() {
      goTo(active - 1);
    }

    function startAuto() {
      if (reduceMotion) return;
      stopAuto();
      intervalId = window.setInterval(next, 5000);
    }

    function stopAuto() {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    var prevBtn = viewport.querySelector(".carousel-prev");
    var nextBtn = viewport.querySelector(".carousel-next");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        startAuto();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        next();
        startAuto();
      });
    }

    viewport.addEventListener("mouseenter", stopAuto);
    viewport.addEventListener("mouseleave", startAuto);
    viewport.addEventListener("focusin", stopAuto);
    viewport.addEventListener("focusout", startAuto);

    render();
    startAuto();
  }

  // Contact form: submit via fetch so a successful send shows an on-page
  // confirmation instead of navigating to Formspree's own page (contact.html only)
  var contactForm = document.getElementById("contact-form");
  var contactSuccess = document.getElementById("contact-success");
  if (contactForm && contactSuccess) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(contactForm);
      fetch(contactForm.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            contactForm.hidden = true;
            contactSuccess.hidden = false;
            contactSuccess.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            contactForm.submit();
          }
        })
        .catch(function () {
          contactForm.submit();
        });
    });
  }
});
