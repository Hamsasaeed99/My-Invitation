/* ===================================================
   script.js — Wedding Invitation Logic
   =================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------
     DOM REFS
  ------------------------------------------------------- */
  const openBtn        = document.getElementById('openInvitationBtn');
  const mainContent    = document.getElementById('mainContent');
  const bgMusic        = document.getElementById('bgMusic');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicIcon      = document.getElementById('musicIcon');
  const petalsCanvas   = document.getElementById('petalsCanvas');
  const heroSection    = document.getElementById('hero');

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
        .catch(function () {});
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
    // Target: 20 July 2026 at 20:00 Cairo time (UTC+2 in July = UTC+2/3)
    // Using Egypt Standard Time (EET = UTC+2, no DST)
    const targetDate = new Date('2026-07-20T20:00:00+02:00').getTime();

    const daysEl    = document.getElementById('cdDays');
    const hoursEl   = document.getElementById('cdHours');
    const minutesEl = document.getElementById('cdMinutes');
    const secondsEl = document.getElementById('cdSeconds');
    const pastEl    = document.getElementById('countdownPast');
    const gridEl    = document.getElementById('countdownGrid');

    function pad(n, width) {
      const s = String(Math.floor(n));
      return s.length >= width ? s : '0'.repeat(width - s.length) + s;
    }

    function updateCountdown() {
      const now  = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        gridEl.classList.add('hidden');
        pastEl.classList.remove('hidden');
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const d  = Math.floor(totalSeconds / 86400);
      const h  = Math.floor((totalSeconds % 86400) / 3600);
      const m  = Math.floor((totalSeconds % 3600) / 60);
      const s  = totalSeconds % 60;

      setCountdownValue(daysEl,    pad(d, 3));
      setCountdownValue(hoursEl,   pad(h, 2));
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
      '.portrait-frame-wrapper',
      '.portrait-caption',
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
     FALLING PETALS CANVAS
  ------------------------------------------------------- */
  function startPetals() {
    const canvas = petalsCanvas;
    const ctx    = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
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
        x:       Math.random() * canvas.width,
        y:       -20,
        size:    Math.random() * 8 + 5,
        speedY:  Math.random() * 0.8 + 0.4,
        speedX:  (Math.random() - 0.5) * 0.6,
        rot:     Math.random() * Math.PI * 2,
        rotSpeed:(Math.random() - 0.5) * 0.03,
        color:   petalColors[Math.floor(Math.random() * petalColors.length)],
        opacity: Math.random() * 0.5 + 0.3,
        swing:   Math.random() * Math.PI * 2,
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
        p.x     += p.speedX + Math.sin(p.swing) * 0.5;
        p.y     += p.speedY;
        p.rot   += p.rotSpeed;

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
