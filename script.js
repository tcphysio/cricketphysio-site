/* ============================================================================
   The Cricket Physio — behaviour
   ----------------------------------------------------------------------------
   No framework, no dependencies, no build step. Everything degrades: with
   JavaScript off the site is still readable, navigable and bookable, because
   the menu falls back to a visible list and every call to action is a real
   link to a real URL.
   ========================================================================== */
(function () {
  'use strict';
  var TCP = window.TCP || {};
  var track = TCP.track || function () {};

  /* --- Theme ----------------------------------------------------------- */
  /* The theme is applied by an inline script in <head> before first paint,
     so there is no flash. This only wires the control up. */
  var STORE = 'tcp-theme';
  var root = document.documentElement;

  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function currentTheme() {
    return root.getAttribute('data-theme') || systemTheme();
  }
  function paintToggle(btn) {
    var dark = currentTheme() === 'dark';
    btn.setAttribute('aria-pressed', String(dark));
    /* The control says what it will DO, not what the state is: clearer for
       screen reader users than announcing the current theme. */
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.querySelector('[data-icon="sun"]').hidden = !dark;
    btn.querySelector('[data-icon="moon"]').hidden = dark;
  }

  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    paintToggle(toggle);
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(STORE, next); } catch (e) { /* private mode */ }
      paintToggle(toggle);
      track('theme_toggle', next);
    });

    /* If the visitor has never chosen, follow the system when it changes. */
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () {
        var saved = null;
        try { saved = localStorage.getItem(STORE); } catch (e) {}
        if (!saved) { root.removeAttribute('data-theme'); paintToggle(toggle); }
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* --- Mobile menu ------------------------------------------------------ */
  var menuBtn = document.querySelector('[data-menu-toggle]');
  var nav = document.getElementById('nav');
  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.setAttribute('data-open', String(open));
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    setMenu(false);
    menuBtn.addEventListener('click', function () {
      setMenu(nav.getAttribute('data-open') !== 'true');
    });
    /* Escape closes and returns focus to the button, as a menu should. */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
        setMenu(false); menuBtn.focus();
      }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    /* Reset when the layout goes back to desktop, so the menu is never stuck
       open behind a hidden button. */
    if (window.matchMedia) {
      var wide = window.matchMedia('(min-width: 62.0625rem)');
      var onWide = function (e) { if (e.matches) setMenu(false); };
      if (wide.addEventListener) wide.addEventListener('change', onWide);
    }
  }

  /* --- Back to top ------------------------------------------------------ */
  var top = document.querySelector('[data-to-top]');
  if (top) {
    top.addEventListener('click', function () {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var h1 = document.querySelector('h1');
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    });
  }

  /* --- Reading progress, articles only ---------------------------------- */
  var bar = document.querySelector('[data-progress]');
  var article = document.querySelector('[data-article]');

  /* --- Scroll-driven bits, batched into one listener -------------------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || document.documentElement.scrollTop;

      if (top) top.setAttribute('data-show', String(y > 900));

      if (bar && article) {
        var start = article.offsetTop;
        var span = article.offsetHeight - window.innerHeight;
        var pct = span > 0 ? Math.min(1, Math.max(0, (y - start) / span)) : 0;
        bar.style.width = (pct * 100).toFixed(1) + '%';
        if (pct > 0.75 && !bar.dataset.counted) {
          bar.dataset.counted = '1';
          track('article_read', location.pathname);
        }
      }
      ticking = false;
    });
  }
  if (top || (bar && article)) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Small entrance transition ---------------------------------------- */
  var rises = document.querySelectorAll('.rise');
  if (rises.length && 'IntersectionObserver' in window &&
      !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.setAttribute('data-in', 'true'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rises.forEach(function (el) { io.observe(el); });
  } else {
    rises.forEach(function (el) { el.setAttribute('data-in', 'true'); });
  }

  /* --- Cross-domain attribution ----------------------------------------- */
  /* Tag outbound links to bridgeroad.physio and Halaxy at click time rather
     than in the markup, so the HTML stays clean and the campaign can be
     derived from the page the visitor was actually on. Internal links are
     never touched: tagging same-site navigation destroys attribution. */
  if (TCP.utm) {
    document.querySelectorAll('a[data-utm]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.indexOf('http') !== 0) return;
      if (/thecricket\.physio/.test(href)) return;
      a.setAttribute('href', TCP.utm(href, a.getAttribute('data-utm')));
    });
  }

  /* --- Enquiry form (Contact) ------------------------------------------- */
  /* One form for every kind of enquiry. The "I am a" selector tags the lead,
     and the server checks it against the same fixed list. Every door on the
     site that leads here passes ?type=, so the selector arrives preselected. */
  var form = document.querySelector('form[data-enquiry]');
  if (form) {
    var status = form.querySelector('.formstatus');
    var submit = form.querySelector('button[type="submit"]');
    var label  = submit ? submit.querySelector('[data-label]') : null;
    var typeSel = form.querySelector('select[name="type"]');
    var nudge = form.querySelector('[data-player-nudge]');
    var where = form.getAttribute('data-track-location') || 'contact_form';
    var sentEvent = form.getAttribute('data-track') || 'enquiry_submit';

    function fieldOf(input) { return input.closest('.field'); }

    function showNudge() {
      if (nudge && typeSel) nudge.hidden = typeSel.value !== 'player';
    }

    if (typeSel) {
      try {
        var wanted = new URLSearchParams(window.location.search).get('type');
        var ok = Array.prototype.some.call(typeSel.options, function (o) { return o.value && o.value === wanted; });
        if (ok) typeSel.value = wanted;
      } catch (e) { /* old browser: the visitor picks it themselves */ }
      showNudge();
      typeSel.addEventListener('change', showNudge);
    }

    function validate(input) {
      var wrap = fieldOf(input);
      if (!wrap) return true;
      var msg = '';
      var v = (input.value || '').trim();

      if (input.required && !v) {
        if (input.tagName === 'SELECT') {
          msg = 'Choose the option that fits best.';
        } else {
          msg = (wrap.querySelector('label') || {}).textContent;
          msg = 'Please enter your ' + (msg ? msg.toLowerCase().replace(/\s*\*$/, '').replace(/^your\s+/, '') : 'details') + '.';
        }
      } else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        msg = 'That email address does not look right. Check it and try again.';
      } else if (input.name === 'message' && v && v.length < 20) {
        msg = 'A sentence or two helps me answer usefully.';
      }

      var err = wrap.querySelector('.err');
      if (msg) {
        wrap.setAttribute('data-invalid', 'true');
        if (err) err.textContent = msg;
        input.setAttribute('aria-invalid', 'true');
        return false;
      }
      wrap.removeAttribute('data-invalid');
      input.removeAttribute('aria-invalid');
      return true;
    }

    form.querySelectorAll('input, textarea, select').forEach(function (i) {
      i.addEventListener('blur', function () { if (i.value.trim()) validate(i); });
      i.addEventListener(i.tagName === 'SELECT' ? 'change' : 'input', function () {
        var w = fieldOf(i);
        if (w && w.getAttribute('data-invalid') === 'true') validate(i);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.removeAttribute('data-state');

      var fields = Array.prototype.slice.call(form.querySelectorAll('input[required], select[required], textarea[required], input[type="email"]'));
      var bad = fields.filter(function (i) { return !validate(i); });
      if (bad.length) {
        bad[0].focus();
        track('enquiry_invalid', bad[0].name, where);
        return;
      }

      /* Honeypot. A real person never fills this in; a bot fills everything.
         Answer as though it succeeded so the bot does not learn otherwise. */
      var hp = form.querySelector('input[name="company"]');
      if (hp && hp.value) {
        if (status) { status.setAttribute('data-state', 'ok'); status.innerHTML = '<p>Thanks. Your enquiry is on its way.</p>'; }
        form.reset(); showNudge();
        return;
      }

      if (submit) { submit.setAttribute('data-loading', 'true'); submit.setAttribute('aria-disabled', 'true'); }
      if (label) label.textContent = 'Sending…';

      var payload = {};
      new FormData(form).forEach(function (v, k) { payload[k] = v; });
      var kind = payload.type || null;

      fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json().catch(function () { return {}; }); })
      .then(function () {
        if (status) {
          status.setAttribute('data-state', 'ok');
          status.innerHTML = '<p><strong>Thanks, that has sent.</strong> I answer enquiries myself, usually within two business days.</p>';
          status.focus();
        }
        form.reset(); showNudge();
        track(sentEvent, kind, where);
      })
      .catch(function (err) {
        if (status) {
          status.setAttribute('data-state', 'err');
          status.innerHTML = '<p><strong>That did not send.</strong> Rather than lose what you wrote, email it to ' +
            '<a href="mailto:thihan@thecricket.physio" data-track="email_click" data-track-location="contact_form_error">thihan@thecricket.physio</a>.</p>';
          status.focus();
        }
        track('enquiry_error', String(err && err.message), where);
      })
      .then(function () {
        if (submit) { submit.removeAttribute('data-loading'); submit.removeAttribute('aria-disabled'); }
        if (label) label.textContent = 'Send';
      });
    });
  }
})();
