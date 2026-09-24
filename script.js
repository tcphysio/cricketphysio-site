/* ============================================================================
   The Cricket Physio — behaviour
   ----------------------------------------------------------------------------
   No framework, no dependencies, no build step. Everything degrades: with
   JavaScript off the site is still readable, navigable and bookable, because
   the menu falls back to a visible list, conditional form fields all show,
   nothing waits on a reveal animation, and every call to action is a real
   link to a real URL.

   Analytics events are named in site-config.js. This file fires the ones
   that need more than a click: form starts and completions, tier card
   views, FAQ opens and scroll depth.
   ========================================================================== */
(function () {
  'use strict';
  var TCP = window.TCP || {};
  var track = TCP.track || function () {};
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    menuBtn.addEventListener('click', function () { setMenu(nav.getAttribute('data-open') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    if (window.matchMedia) {
      var wide = window.matchMedia('(min-width: 75rem)');
      if (wide.addEventListener) wide.addEventListener('change', function (e) { if (e.matches) setMenu(false); });
    }
  }

  /* --- Back to top ------------------------------------------------------ */
  var top = document.querySelector('[data-to-top]');
  if (top) {
    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var h1 = document.querySelector('h1');
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    });
  }

  /* --- Scroll: header state, progress bar, back-to-top, depth, parallax -- */
  var hdr = document.querySelector('.hdr');
  var bar = document.querySelector('.progress');
  var article = document.querySelector('[data-article]');
  var parallax = reduceMotion ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var depthMarks = [25, 50, 75, 100];
  var depthSent = {};
  var readSent = false;
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? Math.min(1, Math.max(0, y / scrollable)) : 0;

      if (hdr) hdr.classList.toggle('is-scrolled', y > 8);
      if (bar) bar.style.setProperty('--p', pct.toFixed(4));
      if (top) top.setAttribute('data-show', String(y > 900));

      if (article && !readSent) {
        var span = article.offsetHeight - window.innerHeight;
        if (span > 0 && (y - article.offsetTop) / span > 0.75) { readSent = true; track('article_read', location.pathname); }
      }

      var seen = Math.round(pct * 100);
      depthMarks.forEach(function (m) {
        if (seen >= m && !depthSent[m]) { depthSent[m] = true; track('scroll_depth', String(m)); }
      });

      /* Parallax: the element drifts against the scroll, a little. */
      parallax.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var f = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var off = (r.top + r.height / 2 - window.innerHeight / 2) * -f;
        el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* --- Reveal on scroll ------------------------------------------------- */
  /* Content fades up as it arrives. Anything already on screen when the
     script runs is left alone, so there is no flicker above the fold. */
  var REVEAL = '.section-head, .rulecols > *, .paths > li, .topics > li, .journal > li, .tier, main .card, .steps > li,' +
               ' .scenarios > div, .career, .media, .quote, .compare-wrap, .faq, .versus > div, .lines, .proof li,' +
               ' .bowling__foot, .imageband__copy, .articles, .pathway, .journey, .continuum, .fitlist, .form, .profile, .taxonomy';
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll(REVEAL).forEach(function (el) {
      if (el.closest('.hero--home, .hero__grid')) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) { el.classList.add('is-in'); return; }
      var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--i', String(Math.min(sibs, 6)));
      el.setAttribute('data-reveal', '');
      revealIO.observe(el);
    });
  } else {
    document.querySelectorAll('.pathway').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* --- Spotlight on cards, fine pointers only ---------------------------- */
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest ? e.target.closest('.spot') : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* --- Sticky mobile CTA ------------------------------------------------- */
  /* Shown only while none of the sections that already carry the same call
     to action (hero, tier cards, forms, closing band, footer) is on screen. */
  var sticky = document.querySelector('[data-sticky]');
  if (sticky && 'IntersectionObserver' in window) {
    var onScreen = [];
    var stickyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = onScreen.indexOf(en.target);
        if (en.isIntersecting && i === -1) onScreen.push(en.target);
        if (!en.isIntersecting && i > -1) onScreen.splice(i, 1);
      });
      sticky.setAttribute('data-show', String(onScreen.length === 0));
    });
    document.querySelectorAll('[data-sticky-hide], .ftr').forEach(function (el) { stickyIO.observe(el); });
  }

  /* --- Tier card views --------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    var tierIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { track('tier_card_view', en.target.getAttribute('data-tier')); tierIO.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-tier]').forEach(function (el) { tierIO.observe(el); });
  }

  /* --- FAQ opens --------------------------------------------------------- */
  document.querySelectorAll('.faq details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) track('faq_open', (d.querySelector('summary') || {}).textContent);
    });
  });

  /* --- Checkout starts --------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-checkout]') : null;
    if (a) track('checkout_start', a.getAttribute('data-checkout'));
  });

  /* --- Cross-domain attribution ----------------------------------------- */
  /* Tag outbound links to bridgeroad.physio and Halaxy at click time rather
     than in the markup. Internal links are never touched: tagging same-site
     navigation destroys attribution. */
  if (TCP.utm) {
    document.querySelectorAll('a[data-utm]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.indexOf('http') !== 0) return;
      if (/thecricket\.physio/.test(href)) return;
      a.setAttribute('href', TCP.utm(href, a.getAttribute('data-utm')));
    });
  }

  /* --- Forms ------------------------------------------------------------- */
  /* One handler for every enquiry form. The form declares its type with
     data-form (team, player, club) and its analytics prefix with
     data-events, which produces <prefix>_start, _invalid, _complete and
     _error. The server validates again; this is for the person typing. */
  var SUCCESS = {
    player: '<p><strong>Thanks, your application is in.</strong> I read every one myself and reply within two business days with the next step.</p>',
    club: '<p><strong>Thanks, that has sent.</strong> I will be in touch within two business days to set up a short call about your squad.</p>',
    pro: '<p><strong>Thanks, that has reached me directly.</strong> I reply personally, by the contact method you chose, usually within two business days.</p>',
    team: '<p><strong>Thanks, that has sent.</strong> I answer enquiries myself, usually within two business days.</p>'
  };
  var phoneLink = TCP.clinic ? TCP.clinic.phoneLink : 'tel:+61458007583';
  var phoneText = TCP.clinic ? TCP.clinic.phoneDisplay : '0458 007 583';

  /* Preselect a tier or package from ?tier= / ?package=, and handle links to
     the same page without a reload. */
  function preselect(form, params) {
    var map = { tier: 'membership', package: 'package' };
    Object.keys(map).forEach(function (k) {
      var v = params.get(k);
      var sel = form.querySelector('select[name="' + map[k] + '"]');
      if (v && sel && sel.querySelector('option[value="' + v + '"]')) {
        sel.value = v;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
  var forms = document.querySelectorAll('form[data-enquiry]');
  forms.forEach(function (f) { preselect(f, new URLSearchParams(location.search)); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="?tier="], a[href*="?package="]') : null;
    if (!a || !forms.length) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    var target = document.querySelector(url.hash);
    if (!target) return;
    e.preventDefault();
    forms.forEach(function (f) { preselect(f, url.searchParams); });
    history.replaceState(null, '', url.pathname + url.search + url.hash);
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    var h = target.querySelector('h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  });

  forms.forEach(function (form) {
    var type = form.getAttribute('data-form') || 'team';
    var prefix = form.getAttribute('data-events') || (type + '_enquiry');
    var status = form.querySelector('.formstatus');
    var submit = form.querySelector('button[type="submit"]');
    var label = submit ? submit.querySelector('[data-label]') : null;
    var labelText = label ? label.textContent : '';
    var started = false;

    function fieldOf(input) { return input.closest('.field'); }
    function controls() {
      return Array.prototype.slice.call(form.querySelectorAll('input, select, textarea')).filter(function (i) {
        return i.type !== 'hidden' && !i.disabled && !i.closest('.hp');
      });
    }
    function nameOf(wrap) {
      var l = wrap.querySelector('label, .label');
      if (!l) return 'details';
      return l.textContent.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    /* Conditional fields: data-show-if="field=a|b" or "field<18". Hidden
       fields are disabled so they neither block submission nor get sent. */
    var conditional = form.querySelectorAll('[data-show-if]');
    function evaluate() {
      conditional.forEach(function (wrap) {
        var rule = wrap.getAttribute('data-show-if');
        var m = rule.match(/^([\w-]+)\s*(<|=)\s*(.+)$/);
        if (!m) return;
        var src = form.querySelector('[name="' + m[1] + '"]');
        var v = src ? src.value.trim() : '';
        var show = m[2] === '<'
          ? (v !== '' && Number(v) < Number(m[3]))
          : m[3].split('|').indexOf(v) > -1;
        wrap.hidden = !show;
        wrap.querySelectorAll('input, select, textarea').forEach(function (i) { i.disabled = !show; });
      });
    }
    if (conditional.length) {
      form.addEventListener('input', evaluate);
      form.addEventListener('change', evaluate);
      evaluate();
    }

    function validate(input) {
      var wrap = fieldOf(input);
      if (!wrap) return true;
      var msg = '';
      var v = input.type === 'checkbox' ? (input.checked ? 'on' : '') : (input.value || '').trim();
      if (input.required && !v) {
        if (input.type === 'checkbox') msg = 'Please tick this box to continue.';
        else if (input.tagName === 'SELECT') msg = 'Please choose your ' + nameOf(wrap) + '.';
        else msg = 'Please enter your ' + nameOf(wrap) + '.';
      } else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        msg = 'That email address does not look right. Check it and try again.';
      } else if (input.type === 'number' && v) {
        var n = Number(v), min = input.min !== '' ? Number(input.min) : -Infinity, max = input.max !== '' ? Number(input.max) : Infinity;
        if (isNaN(n) || n < min || n > max) msg = 'Enter a number between ' + input.min + ' and ' + input.max + '.';
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

    form.addEventListener('focusin', function () {
      if (!started) { started = true; track(prefix + '_start', type); }
    });
    form.addEventListener('blur', function (e) {
      var i = e.target;
      if (i.matches && i.matches('input, select, textarea') && (i.value || '').trim()) validate(i);
    }, true);
    form.addEventListener('input', function (e) {
      var w = fieldOf(e.target);
      if (w && w.getAttribute('data-invalid') === 'true') validate(e.target);
    });
    form.addEventListener('change', function (e) {
      var w = fieldOf(e.target);
      if (w && w.getAttribute('data-invalid') === 'true') validate(e.target);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.removeAttribute('data-state');

      var bad = controls().filter(function (i) { return !validate(i); });
      if (bad.length) { bad[0].focus(); track(prefix + '_invalid', bad[0].name); return; }

      /* Honeypot: a person never fills it; a bot fills everything. Answer as
         though it worked so the bot learns nothing. */
      var hp = form.querySelector('input[name="company"]');
      if (hp && hp.value) {
        if (status) { status.setAttribute('data-state', 'ok'); status.innerHTML = SUCCESS[type] || SUCCESS.team; }
        form.reset();
        return;
      }

      if (submit) { submit.setAttribute('data-loading', 'true'); submit.setAttribute('aria-disabled', 'true'); }
      if (label) label.textContent = 'Sending…';

      var payload = {};
      new FormData(form).forEach(function (v, k) {
        payload[k] = payload[k] ? payload[k] + ', ' + v : v;
      });
      var detail = payload.membership || payload.package || type;

      fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json().catch(function () { return {}; }); })
      .then(function () {
        if (status) {
          status.setAttribute('data-state', 'ok');
          status.innerHTML = (SUCCESS[type] || SUCCESS.team) +
            '<p>If it is time-critical, call <a href="' + phoneLink + '" data-track="phone_click">' + phoneText + '</a>.</p>';
          status.focus();
        }
        form.reset();
        if (conditional.length) evaluate();
        track(prefix + '_complete', detail);
      })
      .catch(function (err) {
        if (status) {
          status.setAttribute('data-state', 'err');
          status.innerHTML = '<p><strong>That did not send.</strong> Rather than lose what you wrote, email it to ' +
            '<a href="mailto:thihan@thecricket.physio" data-track="email_click">thihan@thecricket.physio</a> ' +
            'or call <a href="' + phoneLink + '" data-track="phone_click">' + phoneText + '</a>.</p>';
          status.focus();
        }
        track(prefix + '_error', String(err && err.message));
      })
      .then(function () {
        if (submit) { submit.removeAttribute('data-loading'); submit.removeAttribute('aria-disabled'); }
        if (label) label.textContent = labelText;
      });
    });
  });
})();
