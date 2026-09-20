(function () {
  "use strict";

  /**
   * Número de WhatsApp de destino, en formato internacional sin signos
   * ni espacios (ej: 573001234567). Cámbialo por el tuyo.
   */
  var WHATSAPP_NUMBER = "00000000000";

  /* ------------------------------------------------------------------
   * 1. Header que se compacta al hacer scroll
   * ------------------------------------------------------------------ */
  function initCondensedHeader() {
    var header = document.querySelector("header");
    if (!header) return;

    var THRESHOLD = 40;
    var ticking = false;

    function update() {
      header.classList.toggle("is-condensed", window.scrollY > THRESHOLD);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true },
    );

    update();
  }

  /* ------------------------------------------------------------------
   * 2. Resaltar el enlace del menú según la sección visible
   * ------------------------------------------------------------------ */
  function initActiveNav() {
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('nav a[href^="#"]'),
    );
    if (!navLinks.length || !("IntersectionObserver" in window)) return;

    var sections = navLinks
      .map(function (link) {
        var id = link.getAttribute("href").slice(1);
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (!sections.length) return;

    var linkBySectionId = {};
    navLinks.forEach(function (link) {
      linkBySectionId[link.getAttribute("href").slice(1)] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkBySectionId[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("is-active");
            });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ------------------------------------------------------------------
   * 3. Animación de aparición al hacer scroll (respeta reduced-motion)
   * ------------------------------------------------------------------ */
  function initScrollReveal() {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll(
        ".service, .process-item, .preview .wrap > *, .section-head",
      ),
    );
    if (!targets.length) return;

    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    targets.forEach(function (el) {
      el.setAttribute("data-reveal", "");
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------
   * 4. Scroll suave para los enlaces internos (#trabajos, #proceso...)
   * ------------------------------------------------------------------ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = link.getAttribute("href").slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", "#" + id);
      });
    });
  }

  /* ------------------------------------------------------------------
   * 5. Formulario de cotización -> mensaje de WhatsApp prellenado
   * ------------------------------------------------------------------ */
  function initQuoteForm() {
    var form = document.getElementById("quote-form");
    if (!form) return;

    var statusEl = form.querySelector(".form-status");

    function fieldWrap(name) {
      return form.querySelector('[data-field="' + name + '"]');
    }

    function setError(name, hasError) {
      var wrap = fieldWrap(name);
      if (wrap) wrap.classList.toggle("has-error", hasError);
    }

    function validate(data) {
      var valid = true;

      if (!data.nombre) {
        setError("nombre", true);
        valid = false;
      } else {
        setError("nombre", false);
      }

      if (!data.mensaje) {
        setError("mensaje", true);
        valid = false;
      } else {
        setError("mensaje", false);
      }

      return valid;
    }

    function buildWhatsAppMessage(data) {
      var lines = [
        "Hola, soy " + data.nombre + ".",
        "Me interesa una página de tipo: " + data.tipo + ".",
        "",
        data.mensaje,
      ];
      return lines.join("\n");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = {
        nombre: form.nombre.value.trim(),
        tipo: form.tipo.value,
        mensaje: form.mensaje.value.trim(),
      };

      if (!validate(data)) {
        statusEl.textContent = "Falta completar algún dato antes de enviar.";
        return;
      }

      var message = buildWhatsAppMessage(data);
      var url =
        "https://api.whatsapp.com/qr/PFRPIIW4AHX4O1?autoload=1&app_absent=0" +
        3009796908 +
        "?text=" +
        encodeURIComponent(message);

      statusEl.textContent = "Abriendo WhatsApp con tu mensaje listo...";
      window.open(url, "_blank", "noopener");
      form.reset();
    });

    // Quita el estado de error apenas la persona empieza a corregir.
    ["nombre", "mensaje"].forEach(function (name) {
      form[name].addEventListener("input", function () {
        setError(name, false);
      });
    });
  }

  /* ------------------------------------------------------------------
   * Arranque
   * ------------------------------------------------------------------ */
  function init() {
    initCondensedHeader();
    initActiveNav();
    initScrollReveal();
    initSmoothScroll();
    initQuoteForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
