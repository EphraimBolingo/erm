/**
 * ERM RDC — JavaScript Principal
 * Protection Individuelle des Véhicules
 * Stack: Vanilla JS pur, sans framework ni librairie externe
 */

(function () {
  'use strict';

  /* ============================================================
     CONSTANTES & RÉFÉRENCES DOM
     ============================================================ */
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');

  /* ============================================================
     HEADER STICKY — ajout/suppression classe .scrolled
     ============================================================ */
  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // init

  /* ============================================================
     MENU HAMBURGER MOBILE
     ============================================================ */
  function openMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.style.display = 'flex';
    // Force reflow pour l'animation
    mobileMenu.offsetHeight;
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';

    // Masquer après la transition
    mobileMenu.addEventListener('transitionend', function handler() {
      if (!mobileMenu.classList.contains('active')) {
        mobileMenu.style.display = 'none';
      }
      mobileMenu.removeEventListener('transitionend', handler);
    }, { once: true });
  }

  function toggleMobileMenu() {
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
    hamburger.setAttribute('aria-label', 'Ouvrir le menu');
    hamburger.setAttribute('role', 'button');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  // Fermer le menu mobile au clic sur un lien
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // Fermer le menu au clic en dehors
  document.addEventListener('click', function (e) {
    if (!mobileMenu || !hamburger) return;
    if (
      mobileMenu.classList.contains('active') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  // Fermer au redimensionnement si desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && mobileMenu && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  /* ============================================================
     NAVIGATION ACTIVE — surligner le lien de la page courante
     ============================================================ */
  function setActiveNavLink() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    // Normaliser
    if (currentPage === '' || currentPage === '/') currentPage = 'index.html';

    var allLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    allLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var linkPage = href.split('/').pop() || 'index.html';
      if (linkPage === '' || linkPage === '/') linkPage = 'index.html';

      link.classList.remove('active');
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  }

  setActiveNavLink();

  /* ============================================================
     SCROLL REVEAL — IntersectionObserver
     ============================================================ */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback : tout afficher
      reveals.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Lancer après chargement DOM complet
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }

  /* ============================================================
     SMOOTH SCROLL — pour ancres internes si présentes
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').substring(1);
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        var headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
        var y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });

  /* ============================================================
     PARALLAX LÉGER HERO
     ============================================================ */
  function initParallax() {
    var heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    // Pas de parallax sur mobile
    var mq = window.matchMedia('(min-width: 768px)');

    function onScroll() {
      if (!mq.matches) return;
      var scrolled = window.pageYOffset;
      var rate = scrolled * 0.18;
      heroContent.style.transform = 'translateY(' + rate + 'px)';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  initParallax();

  /* ============================================================
     ANIMATION COMPTEUR — stats hero
     ============================================================ */
  function animateCounter(el, target, duration) {
    var start = 0;
    var startTime = null;
    var suffix = el.dataset.suffix || '';

    function update(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      var current = Math.round(start + (target - start) * eased);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseInt(el.dataset.counter, 10);
            var duration = parseInt(el.dataset.duration, 10) || 1500;
            animateCounter(el, target, duration);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (c) { observer.observe(c); });
  }

  initCounters();

  /* ============================================================
     MICRO-INTERACTIONS CARDS — ripple effect au clic
     ============================================================ */
  function initRipple() {
    var cards = document.querySelectorAll('.benefit-card, .forfait-card, .agent-card, .contact-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        var ripple = document.createElement('span');
        var rect = card.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        ripple.style.cssText =
          'position:absolute;border-radius:50%;background:rgba(26,122,74,0.15);' +
          'width:' + size + 'px;height:' + size + 'px;' +
          'top:' + (e.clientY - rect.top - size / 2) + 'px;' +
          'left:' + (e.clientX - rect.left - size / 2) + 'px;' +
          'animation:ripple-anim 0.6s linear;pointer-events:none;z-index:0;';

        if (!card.style.position || card.style.position === 'static') {
          card.style.position = 'relative';
        }
        card.style.overflow = 'hidden';
        card.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 650);
      });
    });

    // CSS injection pour l'animation ripple
    if (!document.getElementById('ripple-styles')) {
      var style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent =
        '@keyframes ripple-anim{from{transform:scale(0);opacity:1}to{transform:scale(1);opacity:0}}';
      document.head.appendChild(style);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRipple);
  } else {
    initRipple();
  }

  /* ============================================================
     PULSE GPS — animation ondes sur la page index
     ============================================================ */
  function initGPSPulse() {
    var mapRoute = document.querySelector('.hero-map-route');
    if (!mapRoute) return;

    // Ondes circulaires supplémentaires dynamiques
    var mapEl = document.querySelector('.hero-map');
    if (!mapEl) return;

    function createWave() {
      var wave = document.createElement('div');
      wave.style.cssText =
        'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);' +
        'width:20px;height:20px;border-radius:50%;' +
        'border:2px solid rgba(34,197,94,0.5);animation:gps-wave 2s ease-out forwards;pointer-events:none;';
      mapEl.appendChild(wave);
      setTimeout(function () { wave.remove(); }, 2100);
    }

    if (!document.getElementById('gps-wave-styles')) {
      var style = document.createElement('style');
      style.id = 'gps-wave-styles';
      style.textContent =
        '@keyframes gps-wave{0%{width:20px;height:20px;opacity:0.8;transform:translate(-50%,-50%) scale(1)}' +
        '100%{width:80px;height:80px;opacity:0;transform:translate(-50%,-50%) scale(1)}}';
      document.head.appendChild(style);
    }

    setInterval(createWave, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGPSPulse);
  } else {
    initGPSPulse();
  }

  /* ============================================================
     TOOLTIP sur emails / téléphones
     ============================================================ */
  function initTooltips() {
    var emailLinks = document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]');
    emailLinks.forEach(function (link) {
      link.setAttribute('title', link.textContent.trim());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltips);
  } else {
    initTooltips();
  }

  /* ============================================================
     INIT GLOBAL — DOMContentLoaded
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    // Initialiser le menu mobile masqué
    if (mobileMenu) {
      mobileMenu.style.display = 'none';
    }

    // Re-lancer le scroll reveal après DOMContentLoaded
    initScrollReveal();
    initCounters();
    initRipple();
    initGPSPulse();
    initTooltips();

    // Apparition du body (évite le flash)
    document.body.style.opacity = '1';
  });

  // Assurer opacité body dès le chargement si déjà ready
  if (document.readyState !== 'loading') {
    document.body.style.opacity = '1';
  }

  /* ============================================================
     GESTION ERREUR IMAGES — fallback SVG placeholder
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    var images = document.querySelectorAll('img[src]');
    images.forEach(function (img) {
      img.addEventListener('error', function () {
        var w = this.width || 400;
        var h = this.height || 280;
        var alt = encodeURIComponent(this.alt || 'Image');
        this.src =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" +
          w + "' height='" + h +
          "' viewBox='0 0 " + w + " " + h + "' fill='none'%3E" +
          "%3Crect width='" + w + "' height='" + h + "' fill='%23f0fdf4'/%3E" +
          "%3Crect width='" + w + "' height='" + h + "' fill='url(%23g)'/%3E" +
          "%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E" +
          "%3Cstop offset='0' stop-color='%231a7a4a' stop-opacity='0.12'/%3E" +
          "%3Cstop offset='1' stop-color='%2322c55e' stop-opacity='0.06'/%3E" +
          "%3C/linearGradient%3E%3C/defs%3E" +
          "%3Ctext x='50%25' y='50%25' font-family='Inter,sans-serif' font-size='14' fill='%231a7a4a' " +
          "text-anchor='middle' dominant-baseline='middle'%3E" + alt + "%3C/text%3E%3C/svg%3E";
        this.style.objectFit = 'cover';
      });
    });
  });

  /* ============================================================
     ANIMATIONS D'APPARITION AU SCROLL
     ============================================================ */
  function initScrollAnimations() {
    // Options pour l'Intersection Observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    // Fonction callback pour l'observer
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
        }
      });
    };

    // Créer l'observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Sélectionner tous les éléments à animer
    const animateElements = document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right, .animate-on-scroll-up, .animate-on-scroll-scale');

    // Observer chaque élément
    animateElements.forEach(element => {
      observer.observe(element);
    });

    // Animation automatique pour les éléments avec classes d'animation directe
    const autoAnimateElements = document.querySelectorAll('.animate-fade-in-up, .animate-fade-in-down, .animate-fade-in-left, .animate-fade-in-right, .animate-scale-in, .animate-slide-in-up, .animate-slide-in-down, .animate-slide-in-left, .animate-slide-in-right');

    autoAnimateElements.forEach((element, index) => {
      // Ajouter un délai progressif basé sur la position dans le DOM
      const delay = index * 0.1;
      element.style.animationDelay = `${delay}s`;
    });
  }

  // Initialiser les animations au chargement de la page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }

})();
