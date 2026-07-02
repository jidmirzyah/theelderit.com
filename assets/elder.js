/* ============================================================
   THE ELDER IT — Enhancement Layer (shared)
   Every feature is gated on element presence, so this single
   file safely powers all seven pages.
   ============================================================ */
(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Global flip — assigned before anything else can fail; inline onclick uses it */
  window.elderFlip = function (card) {
    var on = card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', String(on));
  };

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
        if (window.elderEqualizeFlips) requestAnimationFrame(window.elderEqualizeFlips);
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

    /* ── 17. THREAT CARD FLIPS — height equalization (binding is delegated, see EOF) ── */
    window.elderEqualizeFlips = function () {
      document.querySelectorAll('.threat-card--flip').forEach(function (card) {
        var inner = card.querySelector('.flip-inner');
        var front = card.querySelector('.flip-front');
        var back = card.querySelector('.flip-back');
        if (!inner || !front || !back) return;
        if (card.offsetParent === null) return; /* hidden tab panel — measure later */
        var h = Math.max(front.scrollHeight, back.scrollHeight, 230);
        inner.style.height = h + 'px';
      });
    };
    window.elderEqualizeFlips();
    window.addEventListener('resize', window.elderEqualizeFlips);
    document.querySelectorAll('.threat-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        requestAnimationFrame(window.elderEqualizeFlips);
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
        var jWrap = jSteps[0].closest('.journey');
        var jArr = Array.prototype.slice.call(jSteps);
        function jFill() {
          var lastActive = -1;
          jArr.forEach(function (st, i) { if (st.classList.contains('active')) lastActive = i; });
          if (jWrap) jWrap.style.setProperty('--journey-fill', ((lastActive + 1) / jArr.length * 100) + '%');
        }
        var jObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('active'); jFill(); }
          });
        }, { threshold: 0.55 });
        jArr.forEach(function (s) { jObs.observe(s); });
      }
    }

    /* ── 22. FILTER CHIPS (services + FAQ) ── */
    document.querySelectorAll('.svc-filter').forEach(function (bar) {
      var chips2 = bar.querySelectorAll('.svc-chip');
      var scope = bar.closest('.container') || document;
      chips2.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips2.forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          var f = chip.dataset.filter;
          scope.querySelectorAll('[data-cat]').forEach(function (card) {
            var show = f === 'all' || card.dataset.cat.split(' ').indexOf(f) > -1;
            card.classList.toggle('svc-hide', !show);
            if (show) {
              card.classList.remove('svc-pop');
              void card.offsetWidth;
              card.classList.add('svc-pop');
            }
          });
        });
      });
    });

    /* ── 23. AI TERMINAL wake effect (services robot tile) ── */
    var aiCard = null;
    document.querySelectorAll('.service-card').forEach(function (c) {
      if (c.textContent.indexOf('Managed AI Services') > -1) aiCard = c;
    });
    if (aiCard) {
      var term = document.createElement('div');
      term.className = 'ai-terminal';
      term.setAttribute('aria-hidden', 'true');
      term.innerHTML = '<span class="term-line">&gt; agents on standby<span class="cursor"></span></span>';
      aiCard.appendChild(term);
      var termLines = [
        '> agent.wake()',
        '> new lead detected — 11:42 PM',
        '> reply drafted, sent in 4.2s',
        '> follow-up scheduled: day 3',
        '> your data boundary: sealed ✓'
      ];
      var termBusy = false;
      function runTerminal() {
        if (termBusy || reducedMotion) return;
        termBusy = true;
        term.innerHTML = '';
        var li = 0;
        function typeLine() {
          if (li >= termLines.length) {
            term.innerHTML += '<span class="cursor"></span>';
            termBusy = false;
            return;
          }
          var line = termLines[li];
          var el = document.createElement('div');
          term.appendChild(el);
          var ci = 0;
          var t = setInterval(function () {
            ci++;
            el.textContent = line.slice(0, ci);
            if (ci >= line.length) {
              clearInterval(t);
              li++;
              setTimeout(typeLine, 240);
            }
          }, 18);
        }
        typeLine();
      }
      aiCard.addEventListener('mouseenter', runTerminal);
      aiCard.addEventListener('click', runTerminal);
    }

    /* ── 24. PILLARS ACCORDION (about) ── */
    var pillarEls = document.querySelectorAll('.pillar');
    if (pillarEls.length) {
      pillarEls.forEach(function (pl) {
        pl.querySelector('.pillar__head').addEventListener('click', function () {
          var isOpen = pl.classList.contains('open');
          pillarEls.forEach(function (o) {
            o.classList.remove('open');
            o.querySelector('.pillar__head').setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            pl.classList.add('open');
            pl.querySelector('.pillar__head').setAttribute('aria-expanded', 'true');
          }
        });
      });
    }

    /* ── 25. CONSTELLATION — hero + mission banners on the home page ── */
    function initNet(host, opacity) {
      var net = document.createElement('canvas');
      net.className = 'hero-net';
      if (opacity) net.style.opacity = opacity;
      host.prepend(net);
      host.classList.add('has-net');
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      var nctx = net.getContext('2d');
      var pts = [], mouse = { x: -9999, y: -9999 };
      function sizeNet() {
        net.width = host.offsetWidth;
        net.height = host.offsetHeight;
        var n = Math.min(70, Math.floor(net.width / 24));
        pts = [];
        for (var i = 0; i < n; i++) {
          pts.push({ x: Math.random() * net.width, y: Math.random() * net.height,
                     vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 });
        }
      }
      sizeNet();
      window.addEventListener('resize', sizeNet);
      host.addEventListener('pointermove', function (e) {
        var r = net.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      });
      host.addEventListener('pointerleave', function () { mouse.x = -9999; mouse.y = -9999; });
      var netRaf;
      function drawNet() {
        netRaf = requestAnimationFrame(drawNet);
        nctx.clearRect(0, 0, net.width, net.height);
        pts.forEach(function (p) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > net.width) p.vx *= -1;
          if (p.y < 0 || p.y > net.height) p.vy *= -1;
          nctx.beginPath();
          nctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
          nctx.fillStyle = 'rgba(201,151,58,0.7)';
          nctx.fill();
        });
        for (var i = 0; i < pts.length; i++) {
          for (var j = i + 1; j < pts.length; j++) {
            var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            var d = dx * dx + dy * dy;
            if (d < 110 * 110) {
              nctx.strokeStyle = 'rgba(201,151,58,' + (0.25 * (1 - d / 12100)) + ')';
              nctx.lineWidth = 1;
              nctx.beginPath(); nctx.moveTo(pts[i].x, pts[i].y); nctx.lineTo(pts[j].x, pts[j].y); nctx.stroke();
            }
          }
          var mdx = pts[i].x - mouse.x, mdy = pts[i].y - mouse.y;
          var md = mdx * mdx + mdy * mdy;
          if (md < 150 * 150) {
            nctx.strokeStyle = 'rgba(224,176,90,' + (0.45 * (1 - md / 22500)) + ')';
            nctx.beginPath(); nctx.moveTo(pts[i].x, pts[i].y); nctx.lineTo(mouse.x, mouse.y); nctx.stroke();
          }
        }
      }
      var netObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) netRaf = requestAnimationFrame(drawNet);
          else cancelAnimationFrame(netRaf);
        });
      });
      netObs.observe(host);
    }
    var hero = document.querySelector('.hero');
    if (hero && !reducedMotion && window.matchMedia('(min-width: 760px)').matches) {
      initNet(hero);
      document.querySelectorAll('.mission-banner').forEach(function (mb) { initNet(mb, '0.4'); });
    }

    /* ── 26. PLANS STICKY MINI-NAV ── */
    if (document.getElementById('residential') && document.getElementById('business')) {
      var mini = document.createElement('nav');
      mini.className = 'mini-nav';
      mini.setAttribute('aria-label', 'Plan sections');
      mini.innerHTML = '<div class="mini-nav__inner">' +
        '<a href="#residential" data-sec="residential">Home &amp; Business</a>' +
        '<a href="#business" data-sec="business">Managed AI</a>' +
        '<a href="#tier-quiz" data-sec="tier-quiz">Find My Tier</a>' +
        '</div>';
      document.body.appendChild(mini);
      window.addEventListener('scroll', function () {
        mini.classList.toggle('show', window.scrollY > 620);
      }, { passive: true });
      var secs = ['residential', 'business', 'tier-quiz'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
      var miniLinks = mini.querySelectorAll('a');
      if ('IntersectionObserver' in window) {
        var secObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              miniLinks.forEach(function (a) {
                a.classList.toggle('active', a.dataset.sec === e.target.id);
              });
            }
          });
        }, { rootMargin: '-30% 0px -60% 0px' });
        secs.forEach(function (sc) { secObs.observe(sc); });
      }
    }

    /* ── 27. LIVE FRAUD-LOSS COUNTER (awareness) ── */
    if (document.getElementById('scam-sim')) {
      var ph = document.querySelector('.page-header .container');
      if (ph) {
        var lc = document.createElement('div');
        lc.className = 'loss-counter';
        lc.innerHTML = '<span class="loss-counter__num">$0</span>' +
          '<span class="loss-counter__label">lost by Canadians to fraud since you opened this page</span>' +
          '<span class="loss-counter__src">Estimate based on $2.7B+/yr reported — Canadian Anti-Fraud Centre, 2023</span>';
        ph.appendChild(lc);
        var numEl = lc.querySelector('.loss-counter__num');
        var perSec = 2700000000 / (365 * 24 * 3600); // ≈ $85.6/s
        var t0 = Date.now();
        setInterval(function () {
          var lost = ((Date.now() - t0) / 1000) * perSec;
          numEl.textContent = '$' + Math.floor(lost).toLocaleString('en-CA');
        }, 500);
      }
    }

    /* ── 28. CONTACT FORM PROGRESS ── */
    var bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
      var reqFields = Array.prototype.slice.call(bookingForm.querySelectorAll('[required]'));
      if (!reqFields.length) reqFields = Array.prototype.slice.call(bookingForm.querySelectorAll('input[type="text"], input[type="email"], select'));
      var prog = document.createElement('div');
      prog.className = 'form-progress';
      prog.innerHTML = '<div class="form-progress__label"><span>Your request</span><strong><span class="fp-count">0</span> of ' + reqFields.length + ' complete</strong></div>' +
        '<div class="form-progress__track"><div class="form-progress__fill"></div></div>';
      bookingForm.prepend(prog);
      var fpCount = prog.querySelector('.fp-count');
      var fpFill = prog.querySelector('.form-progress__fill');
      function updateProg() {
        var done = reqFields.filter(function (f) { return f.value && f.value.trim() !== ''; }).length;
        fpCount.textContent = done;
        fpFill.style.width = (done / reqFields.length * 100) + '%';
      }
      reqFields.forEach(function (f) {
        f.addEventListener('input', updateProg);
        f.addEventListener('change', updateProg);
      });
      updateProg();
    }

    /* ── 29. INBOX DEFENDER (awareness arcade) ── */
    var def = document.getElementById('inbox-defender');
    if (def && !reducedMotion) {
      var field = def.querySelector('.defender__field');
      var overlay = def.querySelector('.defender__overlay');
      var oTitle = def.querySelector('.defender__overlay-title');
      var oBody = def.querySelector('.defender__overlay-body');
      var startBtn = def.querySelector('.defender__start');
      var scoreEl = def.querySelector('.defender__score');
      var shieldsEl = def.querySelector('.defender__shields');
      var bestWrap = def.querySelector('.defender__best');
      var bestEl = def.querySelector('.defender__best-num');
      var scams = [
        'You won a $500 gift card! Claim now',
        'URGENT: verify your SIN today',
        'Package held — pay $1.99 fee',
        'Grandma, I need bail money. Don\u2019t tell mom',
        'Your crypto doubles in 24h — act fast',
        'Bank alert: click to unlock account',
        'FINAL NOTICE: refund expires tonight'
      ];
      var legits = [
        'Dentist: appt Tuesday 2:00 PM',
        'Your 2FA code: 493 218 — never share',
        'Library: your book is due Friday',
        'Mom: call me when you\u2019re free',
        'Pharmacy: prescription ready for pickup'
      ];
      var dScore, dShields, spawnTimer, moveRaf, speed, playing = false;
      var best = 0;
      try { best = parseInt(localStorage.getItem('elder-defender-best') || '0', 10); } catch (e) {}
      if (best > 0) { bestWrap.style.display = ''; bestEl.textContent = best; }
      function updateHud() {
        scoreEl.textContent = dScore;
        shieldsEl.textContent = dShields > 0 ? '\uD83D\uDEE1\uFE0F'.repeat(dShields) : '\u2014';
      }
      function spawn() {
        if (!playing) return;
        var isScam = Math.random() < 0.62;
        var pool = isScam ? scams : legits;
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'fall-msg';
        el.textContent = pool[Math.floor(Math.random() * pool.length)];
        el.dataset.scam = isScam ? '1' : '0';
        el.style.left = Math.random() * (field.offsetWidth - 240) + 5 + 'px';
        el.dataset.y = '-60';
        el.dataset.v = String(speed * (0.85 + Math.random() * 0.4));
        el.addEventListener('pointerdown', function () {
          if (!playing || el.dataset.done) return;
          el.dataset.done = '1';
          if (el.dataset.scam === '1') {
            dScore += 10;
            el.classList.add('zapped');
            el.innerHTML += '<span class="tag tag--hit">+10 scam zapped</span>';
          } else {
            dScore = Math.max(0, dScore - 5);
            el.classList.add('wrong');
            el.innerHTML += '<span class="tag tag--miss">\u22125 that one was real</span>';
          }
          updateHud();
          setTimeout(function () { el.remove(); }, 400);
        });
        field.appendChild(el);
        spawnTimer = setTimeout(spawn, Math.max(520, 1500 - dScore * 8));
      }
      function move() {
        if (!playing) return;
        moveRaf = requestAnimationFrame(move);
        speed += 0.00035;
        field.querySelectorAll('.fall-msg').forEach(function (el) {
          if (el.dataset.done) return;
          var y = parseFloat(el.dataset.y) + parseFloat(el.dataset.v);
          el.dataset.y = String(y);
          el.style.transform = 'translateY(' + y + 'px)';
          if (y > field.offsetHeight - 30) {
            el.dataset.done = '1';
            var wasScam = el.dataset.scam === '1';
            el.remove();
            if (wasScam) {
              dShields--;
              field.classList.remove('defender__flash');
              void field.offsetWidth;
              field.classList.add('defender__flash');
              updateHud();
              if (dShields <= 0) gameOver();
            } else {
              dScore += 2;
              updateHud();
            }
          }
        });
      }
      function gameOver() {
        playing = false;
        def.classList.remove('playing');
        clearTimeout(spawnTimer);
        cancelAnimationFrame(moveRaf);
        field.querySelectorAll('.fall-msg').forEach(function (el) { el.remove(); });
        if (dScore > best) {
          best = dScore;
          try { localStorage.setItem('elder-defender-best', String(best)); } catch (e) {}
        }
        bestWrap.style.display = '';
        bestEl.textContent = best;
        oTitle.textContent = 'Inbox breached.';
        oBody.textContent = 'Final score: ' + dScore + '. Every scam that slipped past you here slips past thousands of real inboxes daily. One more round?';
        startBtn.textContent = 'Play Again';
      }
      startBtn.addEventListener('click', function () {
        dScore = 0; dShields = 3; speed = 1.1;
        updateHud();
        playing = true;
        def.classList.add('playing');
        spawn();
        moveRaf = requestAnimationFrame(move);
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && playing) gameOver();
      });
    } else if (def && reducedMotion) {
      def.querySelector('.defender__overlay-title').textContent = 'Arcade paused';
      def.querySelector('.defender__overlay-body').textContent = 'This game uses motion, which your system settings have turned off. The Real-or-Scam quiz above covers the same skills.';
      def.querySelector('.defender__start').style.display = 'none';
    }

    /* ── 39. THE GUARDED HOUSE (homepage signature) ── */
    var houseSec = document.getElementById('guarded-house');
    if (houseSec) {
      var stories = [
        { tag: 'Upstairs, left window', who: 'Nana, 74',
          threat: 'At 9:14 PM her phone rings. A shaken voice: <strong>"Grandma, I\u2019m in trouble \u2014 please don\u2019t tell Mom."</strong> It sounds exactly like her grandson. It isn\u2019t. It\u2019s a cloned voice, and it wants gift cards.',
          guard: 'We set up a <strong>family code word</strong> and drill the call-back habit \u2014 hang up, dial the real number. Ten minutes of practice defeats a million-dollar scam industry.' },
        { tag: 'Upstairs, right window', who: 'Maya, 13',
          threat: 'A "teammate" from her game has been friendly for weeks. Tonight he asks her to <strong>move the chat somewhere private</strong> \u2014 and to keep it their secret.',
          guard: 'Her parents co-manage her settings <strong>with her, not behind her back</strong> \u2014 and she knows "keep it secret" is the reddest flag there is. She tells them the same night.' },
        { tag: 'Main floor', who: 'Mom & Dad',
          threat: 'The router still runs <strong>factory-default settings</strong> from the day it came out of the box. Every device in the house \u2014 and every password typed on them \u2014 sits behind a door with the lock the burglars all have keys to.',
          guard: 'Full <strong>home network verification</strong>: hardened router, DNS-level blocking, a guest network for visitors. Done together at the kitchen table, explained in plain language.' },
        { tag: 'The home office', who: 'The family business',
          threat: 'Client files, invoices, and tax records share the same Wi-Fi as the smart TV and a decade of forgotten gadgets. One compromised device and it\u2019s <strong>not an inconvenience \u2014 it\u2019s a liability</strong>.',
          guard: 'The <strong>Professional plan</strong> draws a hard boundary around the business: commercial audit, quarterly reviews, breach intervention \u2014 and a data perimeter ready for AI when you are.' }
      ];
      var hotspots = houseSec.querySelectorAll('.house__hotspot');
      var winArts = ['win-art-1', 'win-art-2', 'win-art-3', 'win-art-4'].map(function (id) { return document.getElementById(id); });
      var tagEl = houseSec.querySelector('.house__story-tag');
      var whoEl = houseSec.querySelector('.house__story-who');
      var threatEl = houseSec.querySelector('.house__story-threat');
      var guardEl = houseSec.querySelector('.house__story-guard');
      var cardEl = houseSec.querySelector('.house__story-card');
      function showStory(i) {
        var st = stories[i];
        cardEl.style.animation = 'none';
        void cardEl.offsetWidth;
        cardEl.style.animation = '';
        tagEl.textContent = st.tag;
        whoEl.textContent = st.who;
        threatEl.innerHTML = st.threat;
        guardEl.innerHTML = st.guard;
        hotspots.forEach(function (h, hi) { h.classList.toggle('active', hi === i); });
        winArts.forEach(function (w, wi) { if (w) w.classList.toggle('active', wi === i); });
      }
      hotspots.forEach(function (h) {
        h.addEventListener('click', function () { showStory(parseInt(h.dataset.story, 10)); });
      });
      showStory(0);
      if ('IntersectionObserver' in window && !reducedMotion) {
        var hObs2 = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { houseSec.classList.add('awake'); hObs2.disconnect(); }
          });
        }, { threshold: 0.3 });
        hObs2.observe(houseSec);
      } else {
        houseSec.classList.add('awake');
      }
    }
  });

  /* ── MANIFESTO REVEAL (about founding principle) ── */
  document.addEventListener('DOMContentLoaded', function () {
    var man = document.querySelector('.manifesto');
    if (!man || !('IntersectionObserver' in window)) return;
    var box = man.closest('.about-principle');
    var text = man.dataset.manifesto || man.textContent;
    var keywords = ['privilege.', 'right', 'generation."'];
    var words = text.split(' ').map(function (w, i) {
      var key = keywords.indexOf(w) > -1 ? ' word--key' : '';
      return '<span class="word' + key + '" style="--wd:' + (i * 90) + 'ms">' + w + '</span>';
    });
    man.innerHTML = words.join(' ');
    var mObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { box.classList.add('lit'); mObs.disconnect(); }
      });
    }, { threshold: 0.6 });
    mObs.observe(box);

    /* ── 30. MOBILE SCAM-SIM: linear story, all messages visible ── */
    var sim2 = document.getElementById('scam-sim');
    if (sim2 && window.matchMedia('(max-width: 900px)').matches) {
      sim2.querySelectorAll('.msg').forEach(function (m) { m.classList.add('show'); });
      sim2.querySelectorAll('.scam-step').forEach(function (st) { st.classList.add('active'); });
    }

    /* ── 31. INTERSTITIAL REVEALS (anatomy + checkpoint) ── */
    if ('IntersectionObserver' in window) {
      [['#anatomy-section .anatomy', 0.35], ['#checkpoint-section .checkpoint', 0.4]].forEach(function (pair) {
        var el = document.querySelector(pair[0]);
        if (!el) return;
        if (reducedMotion) { el.classList.add('lit'); return; }
        var o = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { el.classList.add('lit'); o.disconnect(); }
          });
        }, { threshold: pair[1] });
        o.observe(el);
      });
    }

    /* ── 32. AWARENESS JOURNEY LINE ── */
    if (document.body.classList.contains('page-awareness') && 'IntersectionObserver' in window) {
      var stops = [
        ['scam-sim', 'Watch'], ['threats-by-audience', 'Know'], ['flag-game-section', 'Spot'],
        ['real-or-scam-section', 'Judge'], ['inbox-defender-section', 'Defend'], ['protection-plan', 'Protect']
      ].filter(function (st) { return document.getElementById(st[0]); });
      if (stops.length > 2) {
        var jl = document.createElement('div');
        jl.className = 'journey-line';
        jl.setAttribute('aria-hidden', 'true');
        stops.forEach(function (st, i) {
          if (i > 0) {
            var seg = document.createElement('span');
            seg.className = 'journey-line__seg';
            seg.dataset.idx = i;
            jl.appendChild(seg);
          }
          var node = document.createElement('button');
          node.type = 'button';
          node.className = 'journey-line__node';
          node.dataset.label = st[1];
          node.dataset.idx = i;
          node.addEventListener('click', function () {
            document.getElementById(st[0]).scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
          });
          jl.appendChild(node);
        });
        document.body.appendChild(jl);
        var jlObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var idx = stops.findIndex(function (st) { return st[0] === e.target.id; });
            jl.querySelectorAll('.journey-line__node').forEach(function (n) {
              n.classList.toggle('done', parseInt(n.dataset.idx, 10) <= idx);
            });
            jl.querySelectorAll('.journey-line__seg').forEach(function (sg) {
              sg.classList.toggle('done', parseInt(sg.dataset.idx, 10) <= idx);
            });
          });
        }, { rootMargin: '-35% 0px -55% 0px' });
        stops.forEach(function (st) { jlObs.observe(document.getElementById(st[0])); });
      }
    }

    /* ── 33. SERVICE DEMO STRIPS — every tile alive, each its own story ── */
    var demoDefs = [
      { match: 'Community Workshops', build: function (strip) {
          strip.innerHTML = 'seats filling ';
          for (var i = 0; i < 8; i++) { strip.innerHTML += '<span class="seat"></span>'; }
        }, run: function (strip) {
          var seats = strip.querySelectorAll('.seat');
          seats.forEach(function (st) { st.classList.remove('on'); });
          seats.forEach(function (st, i) { setTimeout(function () { st.classList.add('on'); }, 120 * (i + 1)); });
        } },
      { match: 'Digital Safety Check-Ins', build: function (strip) {
          strip.innerHTML = '<span class="chk">✓ passwords</span><span class="chk">✓ updates</span><span class="chk">✓ backups</span>';
        }, run: function (strip) {
          var chks = strip.querySelectorAll('.chk');
          chks.forEach(function (c) { c.classList.remove('on'); });
          chks.forEach(function (c, i) { setTimeout(function () { c.classList.add('on'); }, 300 * (i + 1)); });
        } },
      { match: 'Device Setup', build: function (strip) {
          strip.innerHTML = '<span class="dsl">hardening…</span><span class="bar"><i></i></span>';
        }, run: function (strip) {
          var bar = strip.querySelector('.bar i'), lbl = strip.querySelector('.dsl');
          bar.style.transition = 'none'; bar.style.width = '0';
          lbl.textContent = 'hardening…';
          void bar.offsetWidth;
          bar.style.transition = '';
          bar.style.width = '100%';
          setTimeout(function () { lbl.textContent = '🔒 locked'; }, 1150);
        } },
      { match: 'Account Recovery', build: function (strip) {
          strip.innerHTML = '<span class="rec">&gt; standing by<span class="cursor"></span></span>';
        }, run: function (strip) {
          var el = strip.querySelector('.rec');
          var msg = '> recovering access…';
          var ci = 0;
          el.textContent = '';
          var t = setInterval(function () {
            ci++;
            el.textContent = msg.slice(0, ci);
            if (ci >= msg.length) {
              clearInterval(t);
              setTimeout(function () { el.innerHTML = '&gt; access restored ✓'; }, 500);
            }
          }, 30);
        } },
      { match: 'Incident Guidance', build: function (strip) {
          strip.innerHTML = 'status: <span class="pill">URGENT</span>';
        }, run: function (strip) {
          var pill = strip.querySelector('.pill');
          pill.classList.remove('calm');
          pill.textContent = 'URGENT';
          setTimeout(function () { pill.classList.add('calm'); pill.textContent = 'CONTAINED ✓'; }, 900);
        } }
    ];
    document.querySelectorAll('.service-card').forEach(function (card) {
      var title = card.querySelector('.service-card__title');
      if (!title) return;
      demoDefs.forEach(function (defn) {
        if (title.textContent.indexOf(defn.match) === -1) return;
        var strip = document.createElement('div');
        strip.className = 'svc-demo';
        strip.setAttribute('aria-hidden', 'true');
        defn.build(strip);
        card.appendChild(strip);
        var busy = false;
        function go() {
          if (busy || reducedMotion) return;
          busy = true;
          defn.run(strip);
          setTimeout(function () { busy = false; }, 1900);
        }
        card.addEventListener('mouseenter', go);
        card.addEventListener('click', go);
      });
    });

    /* ── 34. HEADING GOLD STROKE (site-wide) ── */
    if ('IntersectionObserver' in window) {
      var heads = document.querySelectorAll('.section__heading');
      if (reducedMotion) {
        heads.forEach(function (h) { h.classList.add('lit'); });
      } else {
        var hObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('lit'); hObs.unobserve(e.target); }
          });
        }, { threshold: 0.5 });
        heads.forEach(function (h) { hObs.observe(h); });
      }
    }

    /* ── 35. HERO POINTER PARALLAX ── */
    var hero2 = document.querySelector('.hero');
    if (hero2 && !reducedMotion && window.matchMedia('(hover: hover)').matches) {
      hero2.addEventListener('pointermove', function (e) {
        var r = hero2.getBoundingClientRect();
        hero2.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5) * -1);
        hero2.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5) * -1);
      });
      hero2.addEventListener('pointerleave', function () {
        hero2.style.setProperty('--px', 0);
        hero2.style.setProperty('--py', 0);
      });
    }

    /* ── 36. CURSOR LANTERN (desktop) ── */
    if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
      var lc = document.createElement('div');
      lc.className = 'lantern-cursor';
      lc.style.opacity = '0';
      document.body.appendChild(lc);
      var lx = 0, ly = 0, tx = 0, ty = 0, seen = false;
      document.addEventListener('pointermove', function (e) {
        tx = e.clientX; ty = e.clientY;
        if (!seen) { seen = true; lx = tx; ly = ty; lc.style.opacity = '1'; }
      });
      (function lantLoop() {
        requestAnimationFrame(lantLoop);
        lx += (tx - lx) * 0.18;
        ly += (ty - ly) * 0.18;
        lc.style.transform = 'translate3d(' + lx + 'px,' + ly + 'px,0)';
      })();
    }

    /* ── 37. PAGE TRANSITION VEIL ── */
    if (!reducedMotion) {
      var veil = document.createElement('div');
      veil.className = 'veil veil--boot';
      document.body.appendChild(veil);
      window.addEventListener('pageshow', function (e) {
        if (e.persisted) { veil.className = 'veil'; }
      });
      document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download')) return;
        if (/^(mailto:|tel:|https?:\/\/)/i.test(href) && a.host !== location.host) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var samePageHash = href.indexOf('#') > -1 && href.split('#')[0] === location.pathname.split('/').pop();
        if (samePageHash) return;
        e.preventDefault();
        veil.className = 'veil veil--in';
        setTimeout(function () { location.href = href; }, 300);
      });
    }

    /* ── 38. LANTERN INTRO BLOOM (home, once per session) ── */
    if (document.querySelector('.hero') && !reducedMotion) {
      var seenIntro = false;
      try { seenIntro = sessionStorage.getItem('elder-intro') === '1'; } catch (e) {}
      if (!seenIntro) {
        var intro = document.createElement('div');
        intro.className = 'lantern-intro';
        document.body.appendChild(intro);
        setTimeout(function () { intro.remove(); }, 1700);
        try { sessionStorage.setItem('elder-intro', '1'); } catch (e) {}
      }
    }
  });

  /* ── FLIP keyboard support (clicks are handled by inline onclick) ── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest ? e.target.closest('.threat-card--flip') : null;
    if (card) { e.preventDefault(); window.elderFlip(card); }
  });
})();
