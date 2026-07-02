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
    toTop.innerHTML = '&#8593;<svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/></svg>';
    document.body.appendChild(toTop);
    var ringCircle = toTop.querySelector('circle');
    var RING = 151;
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('visible', window.scrollY > 700);
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pr = max > 0 ? h.scrollTop / max : 0;
      ringCircle.style.strokeDashoffset = String(RING - RING * pr);
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
        if (el.classList.contains('threat-card--flip')) return;
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
          name: 'Essential', href: '#card-essential',
          body: 'One person, one set of devices \u2014 or one urgent problem. Essential gives you a full footprint audit, hardened devices, and the training to spot what\u2019s coming. $60/month + a one-time $60 Onboarding & Setup Fee.'
        },
        collaborative: {
          name: 'Collaborative', href: '#card-collaborative',
          body: 'A shared household needs shared protection. Collaborative verifies your home network end to end, sets up parental controls with you, and keeps the whole family briefed. $100/month + a one-time $100 Onboarding & Setup Fee.'
        },
        sovereign: {
          name: 'Sovereign', href: '#card-sovereign',
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
        var cardIds = { essential: '#card-essential', collaborative: '#card-collaborative', sovereign: '#card-sovereign', professional: '#professional' };
        quiz.querySelector('.tier-quiz__result-name').textContent = r.name;
        quiz.querySelector('.tier-quiz__result-body').textContent = r.body;
        var link = quiz.querySelector('.tier-quiz__result-link');
        link.setAttribute('href', r.href);
        link.dataset.pulse = cardIds[key];
        quiz.classList.add('done');
      }
      quiz.querySelector('.tier-quiz__result-link').addEventListener('click', function () {
        var card = document.querySelector(this.dataset.pulse || '');
        if (!card) return;
        card.classList.remove('card-pulse');
        void card.offsetWidth;
        card.classList.add('card-pulse');
        setTimeout(function () { card.classList.remove('card-pulse'); }, 2400);
      });
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

    /* ── W2-A. AUDIENCE TAB SCROLLSPY (plans) ── */
    var switchBtns = document.querySelectorAll('.audience-switch__btn');
    var bizAnchor = document.getElementById('business');
    if (switchBtns.length === 2 && bizAnchor) {
      window.addEventListener('scroll', function () {
        var inBiz = bizAnchor.getBoundingClientRect().top < window.innerHeight * 0.45;
        switchBtns[0].classList.toggle('active', !inBiz);
        switchBtns[1].classList.toggle('active', inBiz);
      }, { passive: true });
    }

    /* ── W2-B. 3D TILT ON PRICING CARDS ── */
    if (window.matchMedia('(hover: hover)').matches && !reducedMotion) {
      document.querySelectorAll('.plan-card, .biz-plan-card').forEach(function (card) {
        card.classList.add('tiltable');
        card.addEventListener('pointerenter', function () {
          card.style.transition = 'transform 0.15s ease';
        });
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
          var ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
          card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        });
        card.addEventListener('pointerleave', function () {
          card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        });
      });
    }

    /* ── W2-C. LIVE FRAUD-LOSS TICKER (awareness) ── */
    var ticker = document.getElementById('loss-ticker-amount');
    if (ticker) {
      var RATE = 2700000000 / (365 * 24 * 3600); // ~$85.6/second, CAFC 2023 figure
      var opened = Date.now();
      function fmtMoney(x) {
        return '$' + x.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      function tick() {
        ticker.textContent = fmtMoney(((Date.now() - opened) / 1000) * RATE);
      }
      tick();
      setInterval(tick, reducedMotion ? 2000 : 120);
    }

    /* ── W2-D. THREAT CARD FLIPS (awareness) ── */
    document.querySelectorAll('.threat-card--flip').forEach(function (card) {
      function flip() {
        var on = card.classList.toggle('flipped');
        card.setAttribute('aria-pressed', String(on));
      }
      card.addEventListener('click', flip);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });
    });

    /* ── W2-E. PASSWORD EXPERIMENT (awareness) ── */
    var pwInput = document.getElementById('pw-lab-input');
    if (pwInput) {
      var fill = document.querySelector('.pw-lab__fill');
      var word = document.querySelector('.pw-lab__word');
      var time = document.querySelector('.pw-lab__time');
      var tip = document.querySelector('.pw-lab__tip');
      var GUESSES = 1e10; // offline attack, guesses/second
      function crackTime(pw) {
        if (!pw) return null;
        var pool = 0;
        if (/[a-z]/.test(pw)) pool += 26;
        if (/[A-Z]/.test(pw)) pool += 26;
        if (/[0-9]/.test(pw)) pool += 10;
        if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
        var seconds = Math.pow(pool, pw.length) / GUESSES / 2;
        return seconds;
      }
      function human(sec) {
        if (sec < 1) return 'less than a second';
        var units = [[31557600 * 1e9, 'billion years'], [31557600 * 1e6, 'million years'],
                     [31557600 * 1000, 'thousand years'], [31557600, 'years'],
                     [2629800, 'months'], [86400, 'days'], [3600, 'hours'], [60, 'minutes'], [1, 'seconds']];
        for (var i = 0; i < units.length; i++) {
          if (sec >= units[i][0]) {
            var v = sec / units[i][0];
            return (v >= 100 ? Math.round(v).toLocaleString('en-CA') : v.toFixed(1)) + ' ' + units[i][1];
          }
        }
        return 'moments';
      }
      pwInput.addEventListener('input', function () {
        var pw = pwInput.value;
        var sec = crackTime(pw);
        if (sec === null) {
          fill.style.width = '0%';
          word.textContent = '—';
          time.innerHTML = 'Start typing to see how long a computer would need.';
          tip.textContent = 'Tip: length beats cleverness. Four random words beat one clever substitution, every time.';
          return;
        }
        var verdict, pct, advice;
        if (sec < 3600) { verdict = 'Broken instantly'; pct = 12; advice = 'A modern computer tears through short passwords in moments. Add length before anything else.'; }
        else if (sec < 86400 * 30) { verdict = 'Weak'; pct = 34; advice = 'Better — but a patient attacker gets there. Push past 12 characters and mix in symbols.'; }
        else if (sec < 31557600 * 100) { verdict = 'Respectable'; pct = 62; advice = 'Solid for most accounts. For email and banking, go longer still — those are the keys to everything else.'; }
        else { verdict = 'Fortress'; pct = 100; advice = 'This is the goal. Now the real advice: use a password manager so every account gets one of these — and never reuse it.'; }
        fill.style.width = pct + '%';
        word.textContent = verdict;
        time.innerHTML = 'Estimated time to crack: <strong>' + human(sec) + '</strong>';
        tip.textContent = advice;
      });
    }

    /* ── W2-F. SCAM OR LEGIT QUIZ (awareness) ── */
    var sol = document.getElementById('sol-quiz');
    if (sol) {
      var scenarios = [
        { text: '\u201CHi Grandma, it\u2019s me. I\u2019m in trouble and I need $800 in Apple gift cards tonight. Please don\u2019t tell Mom \u2014 I\u2019m so embarrassed.\u201D', scam: true,
          why: 'Three flags in two sentences: urgency, gift cards, and secrecy. The \u201Cgrandchild emergency\u201D is one of Canada\u2019s most common phone scams \u2014 now supercharged by AI voice cloning. Hang up, call the real grandchild.' },
        { text: 'An email from your bank\u2019s exact address says a new device signed in, lists the city and time, and tells you: \u201CIf this wasn\u2019t you, call the number on the back of your card.\u201D', scam: false,
          why: 'This one is legitimate practice \u2014 note what it does NOT do: no link to click, no login demand, no urgency. It points you to a number you already own. That pattern is the tell.' },
        { text: 'A text from \u201CCanada Post\u201D: your package is held for a $1.12 customs fee. The link goes to canada-post-delivery.info and asks for your credit card.', scam: true,
          why: 'The tiny amount is the trick \u2014 it\u2019s not about $1.12, it\u2019s about your card number. Real couriers don\u2019t collect fees through lookalike domains by text.' },
        { text: 'You get a call from \u201CMicrosoft Support\u201D: they\u2019ve detected a virus on your computer and need remote access right now to remove it before your files are destroyed.', scam: true,
          why: 'Microsoft \u2014 and every real tech company \u2014 does not call you about viruses. Nobody monitors your computer waiting to phone you. Remote-access requests from inbound calls are always a scam.' },
        { text: 'Your phone pops up: \u201CA new iOS/Android update is available. Install tonight while charging?\u201D from your device\u2019s own Settings app.', scam: false,
          why: 'Legitimate \u2014 and important. System updates from your device\u2019s own settings are one of the best free defences you have. The scam version arrives by text or email link, never from Settings itself.' }
      ];
      var idx = 0, right = 0, answered = false;
      var scEl = sol.querySelector('.sol-quiz__scenario');
      var fbEl = sol.querySelector('.sol-quiz__feedback');
      var nextBtn = sol.querySelector('.sol-quiz__next');
      var countEl = sol.querySelector('.sol-quiz__count');
      var btnScam = sol.querySelector('.sol-quiz__btn--scam');
      var btnLegit = sol.querySelector('.sol-quiz__btn--legit');
      function load() {
        answered = false;
        fbEl.className = 'sol-quiz__feedback';
        fbEl.textContent = '';
        nextBtn.classList.remove('show');
        scEl.textContent = scenarios[idx].text;
        countEl.textContent = 'Scenario ' + (idx + 1) + ' of ' + scenarios.length;
        btnScam.disabled = false; btnLegit.disabled = false;
        btnScam.style.display = ''; btnLegit.style.display = '';
      }
      function answer(saidScam) {
        if (answered) return;
        answered = true;
        var sc = scenarios[idx];
        var correct = saidScam === sc.scam;
        if (correct) right++;
        fbEl.className = 'sol-quiz__feedback show ' + (correct ? 'sol-quiz__feedback--right' : 'sol-quiz__feedback--wrong');
        fbEl.innerHTML = '<strong>' + (correct ? 'Correct.' : (sc.scam ? 'That was a scam.' : 'That one was legitimate.')) + '</strong> ' + sc.why;
        nextBtn.textContent = idx === scenarios.length - 1 ? 'See my score' : 'Next scenario';
        nextBtn.classList.add('show');
        btnScam.disabled = true; btnLegit.disabled = true;
      }
      btnScam.addEventListener('click', function () { answer(true); });
      btnLegit.addEventListener('click', function () { answer(false); });
      nextBtn.addEventListener('click', function () {
        idx++;
        if (idx < scenarios.length) return load();
        scEl.innerHTML = '<div class="sol-quiz__score">' + right + ' / ' + scenarios.length + '</div>' +
          (right === scenarios.length
            ? 'A perfect read. That pause-and-check instinct is exactly what keeps people safe \u2014 now teach it to someone you love.'
            : 'The ones you missed are the ones scammers count on. Scroll back through the threats above \u2014 every pattern here is covered.');
        btnScam.style.display = 'none'; btnLegit.style.display = 'none';
        fbEl.className = 'sol-quiz__feedback';
        nextBtn.textContent = 'Try again';
        nextBtn.classList.add('show');
        nextBtn.onclick = null;
        idx = -1; right = 0; // next click reloads from 0
      });
      load();
    }

    /* ── W2-G. HERO LANTERN PARTICLES (index) ── */
    var hero = document.querySelector('.hero');
    if (hero && !reducedMotion && window.matchMedia('(hover: hover)').matches) {
      var canvas = document.createElement('canvas');
      canvas.className = 'hero__particles';
      canvas.setAttribute('aria-hidden', 'true');
      hero.prepend(canvas);
      var ctx = canvas.getContext('2d');
      var parts = [];
      function sizeCanvas() {
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
      }
      sizeCanvas();
      window.addEventListener('resize', sizeCanvas);
      for (var pi = 0; pi < 42; pi++) {
        parts.push({
          x: Math.random(), y: Math.random(),
          r: 0.8 + Math.random() * 1.8,
          vy: 0.00025 + Math.random() * 0.00055,
          vx: (Math.random() - 0.5) * 0.0002,
          ph: Math.random() * Math.PI * 2
        });
      }
      (function drawParts(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        parts.forEach(function (pt) {
          pt.y -= pt.vy; pt.x += pt.vx;
          if (pt.y < -0.02) { pt.y = 1.02; pt.x = Math.random(); }
          if (pt.x < 0) pt.x = 1; if (pt.x > 1) pt.x = 0;
          var tw = 0.35 + 0.3 * Math.sin(t / 900 + pt.ph);
          ctx.beginPath();
          ctx.arc(pt.x * canvas.width, pt.y * canvas.height, pt.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(224,176,90,' + tw.toFixed(2) + ')';
          ctx.fill();
        });
        requestAnimationFrame(drawParts);
      })(0);
    }

    /* ── W2-H. JOURNEY GOLD FILL ON SCROLL (about) ── */
    var journey = document.querySelector('.journey');
    if (journey) {
      function fillJourney() {
        var r = journey.getBoundingClientRect();
        var mid = window.innerHeight * 0.55;
        var p = (mid - r.top) / r.height;
        journey.style.setProperty('--journey-fill', (Math.max(0, Math.min(1, p)) * 100).toFixed(1) + '%');
      }
      window.addEventListener('scroll', fillJourney, { passive: true });
      fillJourney();
    }

    /* ── 16. 3D TILT on tiles (excludes flip cards) ── */
    if (window.matchMedia('(hover: hover)').matches && !reducedMotion) {
      var tiltEls = document.querySelectorAll(
        '.plan-card, .biz-plan-card:not(.biz-plan-card--custom), .home-card, .service-card, .value-card, .how-step, .audience-card, .about-value, .once-vs__col'
      );
      tiltEls.forEach(function (el) {
        el.classList.add('tilt');
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
          var ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
          el.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
        });
        el.addEventListener('pointerleave', function () { el.style.transform = ''; });
      });
    }

    /* ── 17. THREAT CARD FLIPS ── */
    document.querySelectorAll('.threat-card--flip').forEach(function (card) {
      function flip() {
        var on = card.classList.toggle('flipped');
        card.setAttribute('aria-pressed', String(on));
      }
      card.addEventListener('click', flip);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });
    });

    /* ── 18. REAL OR SCAM GAME ── */
    var ros = document.getElementById('real-or-scam');
    if (ros) {
      var rounds = [
        { msg: 'Your Netflix payment failed. Update your billing within 24 hours to avoid suspension: <span class="mono">netfIix-billing.co/renew</span>', scam: true,
          why: 'Look closely: that\u2019s a capital I in "netfIix", not an L \u2014 a lookalike domain. Plus a 24-hour deadline. Streaming services direct you to their own app, without countdowns.' },
        { msg: 'You have received an Interac e-Transfer of $150.00. Click to deposit: <span class="mono">interac-deposit-now.info</span>', scam: true,
          why: 'Real e-Transfers route you to YOUR bank, and legitimate notices come from interac.ca addresses. Third-party "deposit" domains harvest your banking login.' },
        { msg: 'Reminder: your dental appointment is Tuesday at 2:00 PM. Reply YES to confirm, or call the office to reschedule.', scam: false,
          why: 'Expected contact, no links, no urgency, no payment request \u2014 and it invites you to call a number you already know. This is what legitimate looks like.' },
        { msg: 'CRA: You are eligible for a $312 climate rebate. To claim, reply with your SIN and date of birth.', scam: true,
          why: 'The CRA never asks for your SIN by text \u2014 no legitimate organization does. Rebates you\u2019re owed arrive without you "claiming" them through a message.' },
        { msg: 'Canada Post: your package could not be delivered. Pay a $1.99 redelivery fee: <span class="mono">canda-post-track.com</span>', scam: true,
          why: 'Misspelled domain ("canda"), and a tiny fee \u2014 the $1.99 isn\u2019t the prize, your credit card number is. Canada Post leaves a card; it doesn\u2019t bill by text.' },
        { msg: 'Your verification code is 493 218. Never share this code with anyone, including our staff.', scam: false,
          why: 'A real two-factor code \u2014 and the lesson is in the message itself: NEVER share it. If someone calls asking for "the code we just sent you," that caller is the scam.' }
      ];
      var idx = 0, score = 0;
      var counter = ros.querySelector('.ros__counter');
      var msgEl = ros.querySelector('.ros__msg');
      var verdict = ros.querySelector('.ros__verdict');
      var btnReal = ros.querySelector('.ros__btn--real');
      var btnScam = ros.querySelector('.ros__btn--scam');
      var btnNext = ros.querySelector('.ros__btn--next');
      var stage = ros.querySelector('.ros__stage');
      var finalBox = ros.querySelector('.ros__final');
      function renderRound() {
        var r = rounds[idx];
        counter.textContent = 'Message ' + (idx + 1) + ' of ' + rounds.length;
        msgEl.innerHTML = r.msg;
        verdict.innerHTML = '';
        btnReal.style.display = '';
        btnScam.style.display = '';
        btnNext.style.display = 'none';
      }
      function answer(saidScam) {
        var r = rounds[idx];
        var correct = saidScam === r.scam;
        if (correct) score++;
        verdict.innerHTML = (correct
          ? '<strong class="hit">Correct.</strong> '
          : '<strong class="miss">Not quite \u2014 this one is ' + (r.scam ? 'a scam.' : 'real.') + '</strong> ') + r.why;
        btnReal.style.display = 'none';
        btnScam.style.display = 'none';
        btnNext.style.display = '';
        btnNext.textContent = idx === rounds.length - 1 ? 'See my result \u2192' : 'Next \u2192';
      }
      btnReal.addEventListener('click', function () { answer(false); });
      btnScam.addEventListener('click', function () { answer(true); });
      btnNext.addEventListener('click', function () {
        idx++;
        if (idx >= rounds.length) {
          stage.style.display = 'none';
          finalBox.style.display = '';
          finalBox.querySelector('.ros__final-score').textContent = score + ' / ' + rounds.length;
          var msg;
          if (score === rounds.length) msg = 'Perfect. That instinct \u2014 slowing down, reading the domain, questioning urgency \u2014 is exactly what keeps people safe. Now teach it to someone you love.';
          else if (score >= 4) msg = 'Strong. You caught most of the tells. The ones that slipped through are the same ones catching thousands of Canadians \u2014 worth a second look above.';
          else msg = 'This is why we exist. Every miss above is a scam pattern working exactly as designed \u2014 and every one is learnable. A free session can change these odds fast.';
          finalBox.querySelector('.ros__final-msg').textContent = msg;
        } else {
          renderRound();
        }
      });
      ros.querySelector('.ros__btn--restart').addEventListener('click', function () {
        idx = 0; score = 0;
        finalBox.style.display = 'none';
        stage.style.display = '';
        renderRound();
      });
      renderRound();
    }

    /* ── 19. DATA RAIN (Managed AI divider) ── */
    var rain = document.querySelector('.data-rain');
    if (rain && !reducedMotion) {
      var ctx = rain.getContext('2d');
      var chars = '01<>/{}$#*+=';
      var drops = [], fontSize = 14, raf;
      function sizeRain() {
        rain.width = rain.offsetWidth;
        rain.height = rain.offsetHeight;
        var cols = Math.floor(rain.width / fontSize);
        drops = Array(cols).fill(0).map(function () { return Math.random() * -50; });
      }
      sizeRain();
      window.addEventListener('resize', sizeRain);
      var last = 0;
      function drawRain(ts) {
        raf = requestAnimationFrame(drawRain);
        if (ts - last < 66) return;
        last = ts;
        ctx.fillStyle = 'rgba(13,31,60,0.22)';
        ctx.fillRect(0, 0, rain.width, rain.height);
        ctx.fillStyle = '#C9973A';
        ctx.font = fontSize + 'px monospace';
        drops.forEach(function (y, i) {
          var ch = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(ch, i * fontSize, y * fontSize);
          drops[i] = (y * fontSize > rain.height && Math.random() > 0.975) ? 0 : y + 1;
        });
      }
      var rainObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { raf = requestAnimationFrame(drawRain); }
          else cancelAnimationFrame(raf);
        });
      });
      rainObs.observe(rain);
    }

    /* ── 20. DECODE HEADLINE (Managed AI divider) ── */
    var decode = document.querySelector('.decode');
    if (decode && !reducedMotion && 'IntersectionObserver' in window) {
      var finalHTML = decode.innerHTML;
      var finalText = decode.dataset.text || decode.textContent;
      var glyphs = '!<>-_\\/[]{}=+*^?#$01';
      var played = false;
      var decObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || played) return;
          played = true;
          var frame = 0, total = 26;
          var timer = setInterval(function () {
            frame++;
            var reveal = Math.floor((frame / total) * finalText.length);
            var out = '';
            for (var i = 0; i < finalText.length; i++) {
              out += i < reveal ? finalText[i]
                   : (finalText[i] === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)]);
            }
            decode.textContent = out;
            if (frame >= total) {
              clearInterval(timer);
              decode.innerHTML = finalHTML;
            }
          }, 42);
          decObs.unobserve(decode);
        });
      }, { threshold: 0.5 });
      decObs.observe(decode);
    }

    /* ── 21. JOURNEY SCROLL ACTIVATION (about) ── */
    var jSteps = document.querySelectorAll('.journey__step');
    if (jSteps.length && 'IntersectionObserver' in window) {
      if (reducedMotion) {
        jSteps.forEach(function (s) { s.classList.add('active'); });
      } else {
        var jObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) e.target.classList.add('active');
          });
        }, { threshold: 0.55 });
        jSteps.forEach(function (s) { jObs.observe(s); });
      }
    }
  });
})();
