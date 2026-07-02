/* ============================================================
   THE ELDER IT — Enhancement Layer (shared)
   Every feature is gated on element presence, so this single
   file safely powers all seven pages.
   ============================================================ */
(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* ── 1. SKIP LINK (injected) ── */
    var skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#main';
    skip.textContent = 'Skip to main content';
    document.body.prepend(skip);
    var firstSection = document.querySelector('.page-header, .hero, section');
    if (firstSection && !document.getElementById('main')) firstSection.id = 'main';

    /* ── 2. READING PROGRESS BAR (injected) ── */
    var bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);
    var ticking = false;
    function paintBar() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(paintBar); ticking = true; }
    }, { passive: true });
    paintBar();

    /* ── 3. BACK TO TOP (injected) ── */
    var toTop = document.createElement('button');
    toTop.className = 'to-top';
    toTop.setAttribute('aria-label', 'Back to top');
    toTop.innerHTML = '&#8593;';
    document.body.appendChild(toTop);
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('visible', window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });

    /* ── 4. TEXT SIZE TOGGLE (injected into nav) ── */
    var navInner = document.querySelector('.nav__inner');
    if (navInner) {
      var sizeBtn = document.createElement('button');
      sizeBtn.className = 'nav__textsize';
      sizeBtn.setAttribute('aria-label', 'Toggle larger text');
      sizeBtn.setAttribute('aria-pressed', 'false');
      sizeBtn.innerHTML = 'A<span class="big">A</span>';
      var hamburger = navInner.querySelector('.nav__hamburger');
      navInner.insertBefore(sizeBtn, hamburger);
      try {
        if (localStorage.getItem('elder-text-lg') === '1') {
          document.documentElement.classList.add('text-lg');
          sizeBtn.setAttribute('aria-pressed', 'true');
        }
      } catch (e) {}
      sizeBtn.addEventListener('click', function () {
        var on = document.documentElement.classList.toggle('text-lg');
        sizeBtn.setAttribute('aria-pressed', String(on));
        try { localStorage.setItem('elder-text-lg', on ? '1' : '0'); } catch (e) {}
      });
    }

    /* ── 5. LANTERN GLOW on cards ── */
    var lanternTargets = document.querySelectorAll(
      '.plan-card, .biz-plan-card, .home-card, .service-card, .threat-card, .value-card, .how-step, .audience-card'
    );
    if (window.matchMedia('(hover: hover)').matches && !reducedMotion) {
      lanternTargets.forEach(function (el) {
        el.classList.add('lantern');
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          el.style.setProperty('--lx', (e.clientX - r.left) + 'px');
          el.style.setProperty('--ly', (e.clientY - r.top) + 'px');
        });
      });
    }

    /* ── 6. STAGGERED REVEAL DELAYS ── */
    document.querySelectorAll('.plans-grid, .biz-plans-grid, .home-sections, .services-grid, .threat-panel, .how-grid').forEach(function (grid) {
      Array.prototype.forEach.call(grid.children, function (child, i) {
        child.style.setProperty('--stagger', Math.min(i * 70, 420) + 'ms');
      });
    });

    /* ── 7. STAT COUNT-UP (home) ── */
    var counters = document.querySelectorAll('[data-countup]');
    if (counters.length && 'IntersectionObserver' in window && !reducedMotion) {
      var countObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          countObs.unobserve(el);
          var target = parseFloat(el.dataset.countup);
          var decimals = parseInt(el.dataset.decimals || '0', 10);
          var prefix = el.dataset.prefix || '';
          var suffix = el.dataset.suffix || '';
          var start = null, dur = 1400;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { countObs.observe(c); });
    }

    /* ── 8. SAFETY TIP ROTATOR (home) ── */
    var tipText = document.getElementById('tip-text');
    if (tipText) {
      var tips = [
        'The CRA, your bank, and the police will <strong>never</strong> ask for payment by gift card or wire transfer. Ever.',
        'Got an urgent call from a "family member" in trouble? <strong>Hang up and call them back</strong> on the number you know.',
        'Real institutions give you time to think. <strong>Urgency is the scammer\u2019s favourite weapon.</strong>',
        'Before you click, hover: if the link doesn\u2019t match the sender, <strong>don\u2019t touch it.</strong>',
        'A password you reuse is a password you\u2019ve already lost. <strong>One account, one password.</strong>',
        'AI can clone a voice from seconds of audio. Agree on a <strong>family code word</strong> for real emergencies.'
      ];
      var ti = 0, tipTimer = null;
      function showTip(i) { tipText.innerHTML = tips[(i + tips.length) % tips.length]; }
      function startTips() {
        if (reducedMotion) return;
        tipTimer = setInterval(function () { ti = (ti + 1) % tips.length; showTip(ti); }, 6000);
      }
      function stopTips() { if (tipTimer) clearInterval(tipTimer); }
      showTip(0); startTips();
      var strip = tipText.closest('.tip-strip');
      if (strip) { strip.addEventListener('mouseenter', stopTips); strip.addEventListener('mouseleave', startTips); }
      var prev = document.getElementById('tip-prev'), next = document.getElementById('tip-next');
      if (prev) prev.addEventListener('click', function () { ti = (ti - 1 + tips.length) % tips.length; showTip(ti); });
      if (next) next.addEventListener('click', function () { ti = (ti + 1) % tips.length; showTip(ti); });
    }

    /* ── 9. AUDIENCE SWITCHER (plans) ── */
    var audienceBtns = document.querySelectorAll('.audience-switch__btn');
    if (audienceBtns.length) {
      audienceBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          audienceBtns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var target = document.querySelector(btn.dataset.target);
          if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        });
      });
    }

    /* ── 10. TIER FINDER QUIZ (plans) ── */
    var quiz = document.getElementById('tier-quiz');
    if (quiz) {
      var qEl = quiz.querySelector('.tier-quiz__question');
      var optsEl = quiz.querySelector('.tier-quiz__options');
      var progEl = quiz.querySelector('.tier-quiz__progress');
      var results = {
        essential: {
          name: 'Essential', href: '#residential',
          body: 'One person, one set of devices \u2014 or one urgent problem. Essential gives you a full footprint audit, hardened devices, and the training to spot what\u2019s coming. $60/month + a one-time $60 Onboarding & Setup Fee.'
        },
        collaborative: {
          name: 'Collaborative', href: '#residential',
          body: 'A shared household needs shared protection. Collaborative verifies your home network end to end, sets up parental controls with you, and keeps the whole family briefed. $100/month + a one-time $100 Onboarding & Setup Fee.'
        },
        sovereign: {
          name: 'Sovereign', href: '#residential',
          body: 'Smart home, mesh network, a device in every room \u2014 complex environments need total perimeter control and priority response. That\u2019s Sovereign. $150/month + a one-time $150 Onboarding & Setup Fee.'
        },
        professional: {
          name: 'Professional', href: '#professional',
          body: 'You handle client data \u2014 which means a leak isn\u2019t an inconvenience, it\u2019s a liability. Professional hardens your business footprint and primes it for automation. $199/month, 3-month minimum.'
        }
      };
      var questions = [
        {
          q: 'Who are we protecting?',
          opts: [
            { t: 'Just me', v: 'solo' },
            { t: 'My household', v: 'household' },
            { t: 'My business & my clients', v: 'business' }
          ]
        },
        {
          q: 'How would you describe your digital setup?',
          opts: [
            { t: 'A few devices \u2014 phone, laptop, email', v: 'simple' },
            { t: 'Multiple people & devices sharing one network', v: 'multi' },
            { t: 'Smart home \u2014 cameras, speakers, IoT everywhere', v: 'complex' }
          ]
        },
        {
          q: 'When something goes wrong, what do you need?',
          opts: [
            { t: 'Guidance when I ask for it', v: 'light' },
            { t: 'Ongoing help & regular check-ins', v: 'regular' },
            { t: 'Priority response \u2014 right now, live', v: 'priority' }
          ]
        }
      ];
      var answers = [], qi = 0;
      function renderQ() {
        var item = questions[qi];
        qEl.textContent = item.q;
        optsEl.innerHTML = '';
        item.opts.forEach(function (o) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'tier-quiz__opt';
          b.textContent = o.t;
          b.addEventListener('click', function () { pick(o.v); });
          optsEl.appendChild(b);
        });
        progEl.textContent = 'Question ' + (qi + 1) + ' of ' + questions.length;
      }
      function pick(v) {
        answers.push(v);
        if (v === 'business') return finish('professional');
        qi++;
        if (qi >= questions.length) return finish(score());
        renderQ();
      }
      function score() {
        if (answers.indexOf('complex') > -1 || answers.indexOf('priority') > -1) return 'sovereign';
        if (answers.indexOf('household') > -1 || answers.indexOf('multi') > -1 || answers.indexOf('regular') > -1) return 'collaborative';
        return 'essential';
      }
      function finish(key) {
        var r = results[key];
        quiz.querySelector('.tier-quiz__result-name').textContent = r.name;
        quiz.querySelector('.tier-quiz__result-body').textContent = r.body;
        quiz.querySelector('.tier-quiz__result-link').setAttribute('href', r.href);
        quiz.classList.add('done');
      }
      quiz.querySelector('.tier-quiz__restart').addEventListener('click', function () {
        answers = []; qi = 0;
        quiz.classList.remove('done');
        renderQ();
      });
      renderQ();
    }

    /* ── 11. AUTOMATION CALCULATORS (plans, Growth & Max) ── */
    document.querySelectorAll('.auto-calc').forEach(function (calc) {
      var base = parseInt(calc.dataset.base, 10);       // base setup fee
      var included = parseInt(calc.dataset.included, 10); // builds covered by base
      var cap = parseInt(calc.dataset.cap, 10);           // plan capacity
      var monthly = parseInt(calc.dataset.monthly, 10);
      var n = included;
      var countEl = calc.querySelector('.auto-calc__count');
      var outEl = calc.querySelector('.auto-calc__out');
      var minus = calc.querySelector('[data-dir="minus"]');
      var plus = calc.querySelector('[data-dir="plus"]');
      function fmt(x) { return '$' + x.toLocaleString('en-CA'); }
      function render() {
        countEl.textContent = n;
        var extra = Math.max(0, n - included) * 500;
        outEl.innerHTML = 'Setup: <strong>' + fmt(base + extra) + '</strong>' +
          (extra ? ' (' + fmt(base) + ' base + ' + fmt(extra) + ' for ' + (n - included) + ' additional)' : ' (base covers ' + included + ' builds)') +
          ' &middot; then <strong>' + fmt(monthly) + '/mo</strong> + HST';
        minus.disabled = n <= 1;
        plus.disabled = n >= cap;
      }
      minus.addEventListener('click', function () { if (n > 1) { n--; render(); } });
      plus.addEventListener('click', function () { if (n < cap) { n++; render(); } });
      render();
    });

    /* ── 12. SCAM SIMULATION SCROLLY (awareness) ── */
    var sim = document.getElementById('scam-sim');
    if (sim && 'IntersectionObserver' in window) {
      var steps = sim.querySelectorAll('.scam-step');
      var msgs = sim.querySelectorAll('.msg');
      function showUpTo(idx) {
        msgs.forEach(function (m) {
          var mi = parseInt(m.dataset.step, 10);
          m.classList.toggle('show', mi <= idx);
        });
        steps.forEach(function (s, si) { s.classList.toggle('active', si === idx); });
      }
      if (reducedMotion) {
        showUpTo(steps.length - 1);
        steps.forEach(function (s) { s.classList.add('active'); });
      } else {
        var stepObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              showUpTo(parseInt(entry.target.dataset.index, 10));
            }
          });
        }, { rootMargin: '-40% 0px -40% 0px' });
        steps.forEach(function (s, i) { s.dataset.index = i; stepObs.observe(s); });
      }
    }

    /* ── 13. SPOT THE RED FLAGS GAME (awareness) ── */
    var game = document.getElementById('flag-game');
    if (game) {
      var spots = game.querySelectorAll('.flag-spot');
      var total = spots.length;
      var foundList = game.querySelector('.flag-game__found');
      var scoreEl = game.querySelector('.flag-game__score span');
      var found = 0;
      scoreEl.textContent = '0 of ' + total;
      spots.forEach(function (spot) {
        spot.addEventListener('click', function () {
          if (spot.classList.contains('found')) return;
          spot.classList.add('found');
          found++;
          scoreEl.textContent = found + ' of ' + total;
          var item = document.createElement('div');
          item.className = 'flag-game__item';
          item.innerHTML = '<span aria-hidden="true">&#9873;</span><div><strong>' +
            spot.dataset.flag + '</strong> \u2014 ' + spot.dataset.why + '</div>';
          foundList.appendChild(item);
          if (found === total) game.classList.add('complete');
        });
      });
      var resetBtn = game.querySelector('.flag-game__reset');
      resetBtn.addEventListener('click', function () {
        found = 0;
        scoreEl.textContent = '0 of ' + total;
        foundList.innerHTML = '';
        game.classList.remove('complete');
        spots.forEach(function (s) { s.classList.remove('found'); });
      });
    }

    /* ── 14. FAQ LIVE SEARCH ── */
    var faqSearch = document.getElementById('faq-search-input');
    if (faqSearch) {
      var items = document.querySelectorAll('.faq-item');
      var noRes = document.querySelector('.faq-noresults');
      faqSearch.addEventListener('input', function () {
        var q = faqSearch.value.trim().toLowerCase();
        var visible = 0;
        items.forEach(function (item) {
          var hit = !q || item.textContent.toLowerCase().indexOf(q) > -1;
          item.style.display = hit ? '' : 'none';
          if (hit) visible++;
        });
        if (noRes) noRes.style.display = visible ? 'none' : 'block';
      });
    }

    /* ── 15. CONTACT TOPIC CHIPS ── */
    var chips = document.querySelectorAll('.topic-chip');
    if (chips.length) {
      var topicSelect = document.getElementById('topic');
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          if (topicSelect) {
            topicSelect.value = chip.dataset.topic;
            topicSelect.dispatchEvent(new Event('change'));
          }
        });
      });
    }
  });
})();
