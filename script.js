/* ===================================================
   script.js — Wedding Invitation Logic
   =================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------
     DOM REFS
  ------------------------------------------------------- */
  const openBtn = document.getElementById('openInvitationBtn');
  const mainContent = document.getElementById('mainContent');
  const bgMusic = document.getElementById('bgMusic');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicIcon = document.getElementById('musicIcon');
  const petalsCanvas = document.getElementById('petalsCanvas');
  const heroSection = document.getElementById('hero');
  const langToggleBtn = document.getElementById('langToggleBtn');

  /* -------------------------------------------------------
     LANGUAGE SWITCHER
  ------------------------------------------------------- */
  let currentLang = localStorage.getItem('inviteLang') || 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('inviteLang', lang);
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    // dir is handled by CSS on body via html[lang="ar"] body { direction: rtl }
    // We do NOT set dir on <html> to keep the scrollbar on the right side
    if (openBtn) {
      openBtn.setAttribute('aria-label', lang === 'ar' ? 'افتح الدعوة' : 'Open Invitation');
    }
  }

  // Apply on page load
  applyLanguage(currentLang);

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', function () {
      applyLanguage(currentLang === 'en' ? 'ar' : 'en');
    });
  }

  /* -------------------------------------------------------
     OPEN INVITATION BUTTON
  ------------------------------------------------------- */
  let isOpen = false;


  openBtn.addEventListener('click', function () {
    if (isOpen) return;
    isOpen = true;

    // Disable button to prevent double-click
    openBtn.disabled = true;

    // Step 1: trigger fade-out on hero
    heroSection.classList.add('fading-out');

    // Step 2: after fade finishes (1s), hide hero and reveal content
    setTimeout(function () {
      heroSection.classList.add('hidden');

      // Unlock body scroll
      document.body.classList.add('invitation-opened');

      // Reveal main content
      mainContent.classList.remove('hidden');
      mainContent.classList.add('revealed');

      // Scroll to top so content starts from top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Start petals
      petalsCanvas.classList.add('active');
      startPetals();

      // Try to play music
      tryPlayMusic();

      // Show music toggle
      musicToggleBtn.classList.remove('hidden');

      // Init scroll reveal
      initReveal();

      // Init countdown
      initCountdown();

      // Init portrait animation
      initPortraitAnimation();
    }, 1000);
  });

  /* -------------------------------------------------------
     MUSIC CONTROL
  ------------------------------------------------------- */
  let musicPlaying = false;

  function tryPlayMusic() {
    if (!bgMusic.src || bgMusic.src === window.location.href) return;
    bgMusic.volume = 0;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(function () {
          musicPlaying = true;
          updateMusicIcon();
          fadeInAudio(bgMusic, 0.35, 3000);
        })
        .catch(function () {
          musicPlaying = false;
          updateMusicIcon();
        });
    }
  }

  function fadeInAudio(audioEl, targetVol, durationMs) {
    const steps = 60;
    const stepTime = durationMs / steps;
    const increment = targetVol / steps;
    let currentStep = 0;
    const interval = setInterval(function () {
      currentStep++;
      audioEl.volume = Math.min(targetVol, increment * currentStep);
      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);
  }

  musicToggleBtn.addEventListener('click', function () {
    if (musicPlaying) {
      bgMusic.pause();
      musicPlaying = false;
    } else {
      bgMusic.play()
        .then(function () { musicPlaying = true; })
        .catch(function () { });
      musicPlaying = true;
    }
    updateMusicIcon();
  });

  function updateMusicIcon() {
    musicIcon.textContent = musicPlaying ? '♫' : '♪';
    musicToggleBtn.setAttribute('aria-label', musicPlaying ? 'Pause music' : 'Play music');
    musicToggleBtn.style.opacity = musicPlaying ? '1' : '0.55';
  }

  /* -------------------------------------------------------
     COUNTDOWN TIMER
  ------------------------------------------------------- */
  function initCountdown() {
    // Target: 11 September 2026 at 17:00 Cairo time
    const targetDate = new Date('2026-09-11T17:00:00+03:00').getTime();

    const daysEl = document.getElementById('cdDays');
    const hoursEl = document.getElementById('cdHours');
    const minutesEl = document.getElementById('cdMinutes');
    const secondsEl = document.getElementById('cdSeconds');
    const pastEl = document.getElementById('countdownPast');
    const gridEl = document.getElementById('countdownGrid');

    function pad(n, width) {
      const s = String(Math.floor(n));
      return s.length >= width ? s : '0'.repeat(width - s.length) + s;
    }

    function updateCountdown() {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        gridEl.classList.add('hidden');
        pastEl.classList.remove('hidden');
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const d = Math.floor(totalSeconds / 86400);
      const h = Math.floor((totalSeconds % 86400) / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      setCountdownValue(daysEl, pad(d, 3));
      setCountdownValue(hoursEl, pad(h, 2));
      setCountdownValue(minutesEl, pad(m, 2));
      setCountdownValue(secondsEl, pad(s, 2));
    }

    function setCountdownValue(el, value) {
      if (el.textContent !== value) {
        el.classList.remove('flip');
        void el.offsetWidth; // reflow
        el.classList.add('flip');
        el.textContent = value;
      }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* -------------------------------------------------------
     SCROLL REVEAL
  ------------------------------------------------------- */
  function initReveal() {
    // Add .reveal class to key elements
    const revealSelectors = [
      '.verse-ornament',
      '.verse-text',
      '.verse-source',
      /* portrait handled by initPortraitAnimation */
      '.std-wedding-of',
      '.std-names',
      '.std-date-block',
      '.std-year',
      '.std-time',
      '.countdown-title',
      '.countdown-grid',
      '.venue-icon',
      '.venue-name',
      '.venue-address',
      '.btn-directions',
    ];

    revealSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.classList.add('reveal');
      });
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* -------------------------------------------------------
     PORTRAIT — SLIDE-IN + TYPEWRITER
  ------------------------------------------------------- */
  function initPortraitAnimation() {
    var imgCol  = document.getElementById('portraitImgCol');
    var textCol = document.getElementById('portraitTextCol');
    var cursor  = document.querySelector('.cursor-blink');
    var spanEN  = document.querySelector('.typewriter-en');
    var spanAR  = document.querySelector('.typewriter-ar');

    if (!imgCol) return;

    // Tagline texts
    var textEN = 'Two hearts, one beautiful journey.\nForever begins on September 11, 2026.';
    var textAR = 'قلبان تجمعهما رحلة جميلة.\nالأبدية تبدأ في 11 سبتمبر 2026.';

    var animationDone = false;
    var typewriterTimer = null;

    // Fill one span with typewriter effect, other instantly
    function typewrite(el, text, speed, onDone) {
      // Clear any running timer
      if (typewriterTimer) clearTimeout(typewriterTimer);
      el.innerHTML = '';
      var i = 0;

      function step() {
        if (i < text.length) {
          if (text[i] === '\n') {
            el.appendChild(document.createElement('br'));
          } else {
            el.appendChild(document.createTextNode(text[i]));
          }
          i++;
          typewriterTimer = setTimeout(step, speed);
        } else {
          if (onDone) onDone();
        }
      }
      step();
    }

    // Write text instantly (no animation) for the hidden lang span
    function writeInstant(el, text) {
      el.innerHTML = '';
      var parts = text.split('\n');
      parts.forEach(function (part, idx) {
        el.appendChild(document.createTextNode(part));
        if (idx < parts.length - 1) el.appendChild(document.createElement('br'));
      });
    }

    function startTypewriter() {
      var lang = document.documentElement.getAttribute('lang') || 'en';

      // Reset cursor
      if (cursor) {
        cursor.classList.remove('done');
      }

      if (lang === 'ar') {
        // Animate Arabic, fill English instantly
        writeInstant(spanEN, textEN);
        typewrite(spanAR, textAR, 50, function () {
          if (cursor) cursor.classList.add('done');
        });
      } else {
        // Animate English, fill Arabic instantly
        writeInstant(spanAR, textAR);
        typewrite(spanEN, textEN, 45, function () {
          if (cursor) cursor.classList.add('done');
        });
      }
    }

    function runAnimation() {
      if (animationDone) return;
      animationDone = true;

      // 1. Slide image in
      imgCol.classList.add('slide-in');

      // 2. After image settles, show text & typewrite
      setTimeout(function () {
        textCol.classList.add('text-visible');
        startTypewriter();
      }, 950);
    }

    // Re-run typewriter on language switch (after animation already played)
    langToggleBtn.addEventListener('click', function () {
      if (!animationDone) return; // Not yet revealed, nothing to redo
      // Small delay to let the lang attribute update first
      setTimeout(startTypewriter, 80);
    });

    // Trigger on scroll into view — observe the SECTION (always in layout)
    // Not the imgCol (which is opacity:0 and may confuse some browsers)
    var portraitSection = document.getElementById('portrait');
    var triggerEl = portraitSection || imgCol;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runAnimation();
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0,            // fire as soon as 1px enters viewport
        rootMargin: '0px 0px -80px 0px'  // slight offset so it feels intentional
      }
    );
    observer.observe(triggerEl);
  }

  function startPetals() {
    const canvas = petalsCanvas;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Petal colors
    const petalColors = [
      'rgba(200, 169, 110, 0.6)',
      'rgba(230, 200, 150, 0.5)',
      'rgba(255, 230, 180, 0.4)',
      'rgba(245, 215, 160, 0.55)',
      'rgba(240, 220, 185, 0.45)',
    ];

    const petals = [];
    const PETAL_COUNT = 28;

    function createPetal() {
      return {
        x: Math.random() * canvas.width,
        y: -20,
        size: Math.random() * 8 + 5,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: (Math.random() - 0.5) * 0.6,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        opacity: Math.random() * 0.5 + 0.3,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.01,
      };
    }

    for (let i = 0; i < PETAL_COUNT; i++) {
      const p = createPetal();
      p.y = Math.random() * window.innerHeight;
      petals.push(p);
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      // Simple petal shape
      ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach(function (p) {
        p.swing += p.swingSpeed;
        p.x += p.speedX + Math.sin(p.swing) * 0.5;
        p.y += p.speedY;
        p.rot += p.rotSpeed;

        if (p.y > canvas.height + 30) {
          // Reset to top
          Object.assign(p, createPetal());
        }

        drawPetal(p);
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* -------------------------------------------------------
     KEYBOARD ACCESSIBILITY
  ------------------------------------------------------- */
  openBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openBtn.click();
    }
  });

})();
