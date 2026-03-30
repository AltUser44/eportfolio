/**
 * CS 499 ePortfolio – script.js
 * Kester Nkese
 *
 * Covers:
 *  - Sticky navbar with scroll-shadow class
 *  - Active nav-link highlighting based on scroll position
 *  - Mobile hamburger menu toggle
 *  - Smooth scroll for anchor links (polyfill-safe)
 *  - Back-to-top button visibility
 *  - Footer year update
 *  - Scroll-triggered fade-in animations (IntersectionObserver)
 */

'use strict';

/* ==========================================================================
   DOM References
   ========================================================================== */
const navbar     = document.getElementById('navbar');
const navToggle  = document.getElementById('navToggle');
const navLinks   = document.getElementById('navLinks');
const allNavLinks = document.querySelectorAll('.nav-link');
const backToTop  = document.getElementById('backToTop');
const footerYear = document.getElementById('footerYear');

/* ==========================================================================
   1. Footer – Current Year
   ========================================================================== */
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

/* ==========================================================================
   2. Sticky Navbar – adds `.scrolled` class for stronger blur on scroll
   ========================================================================== */
function handleNavbarScroll() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/* ==========================================================================
   3. Back-to-Top Button
   ========================================================================== */
function handleBackToTop() {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}

if (backToTop) {
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   4. Active Nav-Link Highlighting (Scroll Spy)
   Highlights the nav link whose section is currently in view.
   ========================================================================== */
const sections = document.querySelectorAll('section[id], header[id]');

function updateActiveLink() {
  const scrollY = window.scrollY;
  // Offset to trigger the link a little before reaching the section top
  const offset = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-height'), 10) + 32 || 96;

  let currentId = '';

  sections.forEach(function (section) {
    const sectionTop = section.offsetTop - offset;
    if (scrollY >= sectionTop) {
      currentId = section.getAttribute('id');
    }
  });

  allNavLinks.forEach(function (link) {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentId) {
      link.classList.add('active');
    }
  });
}

/* ==========================================================================
   5. Consolidated Scroll Handler (single event listener for performance)
   ========================================================================== */
function onScroll() {
  handleNavbarScroll();
  handleBackToTop();
  updateActiveLink();
}

window.addEventListener('scroll', onScroll, { passive: true });

// Run once on load to set initial states
onScroll();

/* ==========================================================================
   6. Mobile Hamburger Menu Toggle
   ========================================================================== */
if (navToggle && navLinks) {
  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a nav link is clicked (smooth UX on mobile)
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside the navbar
  document.addEventListener('click', function (event) {
    if (navLinks.classList.contains('open') &&
        !navbar.contains(event.target)) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================================
   7. Smooth Scroll for Anchor Links
   CSS `scroll-behavior: smooth` covers most browsers, but this JS fallback
   ensures correct behaviour when offset compensation is needed for the sticky
   navbar height.
   ========================================================================== */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (event) {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return; // ignore empty hashes

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    event.preventDefault();

    const navHeight = navbar ? navbar.offsetHeight : 0;
    const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});

/* ==========================================================================
   8. Scroll-Triggered Fade-In Animations (IntersectionObserver)
   Adds `.visible` class to elements with `.fade-in` once they enter the
   viewport. Cards and section headers are given this class automatically.
   ========================================================================== */

// Elements to animate – add more selectors here if needed
const animatedSelectors = [
  '.assessment-block',
  '.artifact-card',
  '.outcome-card',
  '.link-card',
  '.section-header',
  '.code-review-body',
];

const animatedElements = document.querySelectorAll(animatedSelectors.join(', '));

// Inject the base animation CSS dynamically so it lives alongside the JS logic
(function injectAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = [
    animatedSelectors.join(', ') + ' {',
    '  opacity: 0;',
    '  transform: translateY(24px);',
    '  transition: opacity 0.55s ease, transform 0.55s ease;',
    '}',
    animatedSelectors.map(function (s) { return s + '.visible'; }).join(', ') + ' {',
    '  opacity: 1;',
    '  transform: translateY(0);',
    '}',
  ].join('\n');
  document.head.appendChild(style);
}());

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.1,    // trigger when 10% of the element is visible
    rootMargin: '0px 0px -40px 0px', // slight bottom offset for a nicer reveal
  });

  animatedElements.forEach(function (el, index) {
    // Stagger delay for cards in a grid row
    el.style.transitionDelay = (index % 3) * 0.08 + 's';
    observer.observe(el);
  });
} else {
  // Fallback: simply show all elements for browsers without IntersectionObserver
  animatedElements.forEach(function (el) {
    el.classList.add('visible');
  });
}

/* ==========================================================================
   9. Keyboard Navigation – close mobile menu on Escape key
   ========================================================================== */
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && navLinks && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.focus(); // return focus to toggle button
  }
});
