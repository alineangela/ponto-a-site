(function () {
  function initSelectedEffects() {
    document.querySelectorAll(".ponto-effects").forEach(function (root) {
      if (root.dataset.effectsReady === "true") return;
      root.dataset.effectsReady = "true";
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      }, { threshold: 0.16 });
      root.querySelectorAll(".effects-reveal").forEach(function (item) {
        revealObserver.observe(item);
      });
      var frosted = root.querySelector(".effects-frosted-media");
      if (frosted) {
        frosted.addEventListener("pointermove", function (event) {
          var bounds = frosted.getBoundingClientRect();
          frosted.style.setProperty("--cursor-x", ((event.clientX - bounds.left) / bounds.width * 100) + "%");
          frosted.style.setProperty("--cursor-y", ((event.clientY - bounds.top) / bounds.height * 100) + "%");
        });
      }
      initFragmentRain(root);
      initFaqAccordion(root);
    });
  }

  function initFaqAccordion(root) {
    var items = Array.from(root.querySelectorAll(".effects-faq-item"));
    if (!items.length) return;
    items.forEach(function (item) {
      var button = item.querySelector(".effects-faq-question");
      var answer = item.querySelector(".effects-faq-answer");
      if (!button || !answer) return;
      button.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        items.forEach(function (other) {
          other.classList.remove("is-open");
          var otherButton = other.querySelector(".effects-faq-question");
          if (otherButton) {
            otherButton.setAttribute("aria-expanded", "false");
            otherButton.querySelector("b").textContent = "+";
          }
        });
        if (!isOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
          button.querySelector("b").textContent = "−";
        }
      });
    });
  }

  function initFragmentRain(root) {
    var sourceStage = root.querySelector(".effects-fragment-source-stage");
    var source = root.querySelector(".effects-fragment-source");
    var landing = root.querySelector(".effects-fragment-landing");
    var copy = root.querySelector(".effects-fragment-copy");
    var Matter = window.Matter;
    if (!sourceStage || !source || !landing || !Matter) return;
    root.dataset.physicsReady = "true";

    var Bodies = Matter.Bodies;
    var Body = Matter.Body;
    var Composite = Matter.Composite;
    var Engine = Matter.Engine;
    var World = Matter.World;
    var engine = Engine.create({ gravity: { x: 0, y: 1.35, scale: 0.0015 } });
    var pieces = new Map();
    var fragments = [];
    var fragmentTotal = 29;
    var floor;
    var leftWall;
    var rightWall;
    var frame = 0;
    var releaseTimer = 0;
    var unlockTimer = 0;
    var releaseStarted = false;
    var scrollLocked = true;
    var previousOverflow = document.documentElement.style.overflow;

    function overlapsProtectedCopy(x, y, radius, bounds) {
      if (!copy) return false;
      var protectedText = copy.querySelector("h1, h2, p");
      var copyBounds = protectedText ? protectedText.getBoundingClientRect() : copy.getBoundingClientRect();
      var padding = 82;
      var left = copyBounds.left - bounds.left - padding;
      var top = copyBounds.top - bounds.top - padding;
      var right = copyBounds.right - bounds.left + padding;
      var bottom = copyBounds.bottom - bounds.top + padding;
      return x + radius > left && x - radius < right && y + radius > top && y - radius < bottom;
    }

    function setBounds() {
      var bounds = landing.getBoundingClientRect();
      var dropLeft = window.matchMedia("(max-width: 900px)").matches ? 0 : bounds.width * 0.5;
      var dropWidth = bounds.width - dropLeft;
      if (floor) Composite.remove(engine.world, [floor, leftWall, rightWall]);
      floor = Bodies.rectangle(dropLeft + dropWidth / 2, bounds.height + 24, dropWidth + 96, 48, { isStatic: true, friction: 0.96 });
      leftWall = Bodies.rectangle(dropLeft - 24, bounds.height / 2, 48, bounds.height * 2, { isStatic: true });
      rightWall = Bodies.rectangle(bounds.width + 24, bounds.height / 2, 48, bounds.height * 2, { isStatic: true });
      World.add(engine.world, [floor, leftWall, rightWall]);
    }

    function punch() {
      if (fragments.length >= fragmentTotal) return false;
      var bounds = source.getBoundingClientRect();
      var width = bounds.width;
      var height = bounds.height;
      var radius = 13 + Math.random() * 17;
      var x = width / 2;
      var y = height / 2;
      var foundClearSpace = false;

      for (var attempt = 0; attempt < 120; attempt += 1) {
        var candidateX = radius + 20 + Math.random() * Math.max(1, width - radius * 2 - 40);
        var candidateY = radius + 28 + Math.random() * Math.max(1, height - radius * 2 - 56);
        var overlaps = fragments.some(function (fragment) {
          return Math.hypot(candidateX - fragment.sourceX, candidateY - fragment.sourceY) < radius + fragment.radius + 9;
        });
        if (!overlaps && !overlapsProtectedCopy(candidateX, candidateY, radius, bounds)) {
          x = candidateX;
          y = candidateY;
          foundClearSpace = true;
          break;
        }
      }

      if (!foundClearSpace) return false;
      var imageAspect = 1400 / 933;
      var renderedWidth = width / height > imageAspect ? width : height * imageAspect;
      var renderedHeight = width / height > imageAspect ? width / imageAspect : height;
      var offsetX = (width - renderedWidth) / 2;
      var offsetY = (height - renderedHeight) * 0.52;
      var hole = document.createElement("div");
      hole.className = "effects-fragment-hole";
      hole.style.width = radius * 2 + "px";
      hole.style.height = radius * 2 + "px";
      hole.style.left = x - radius + "px";
      hole.style.top = y - radius + "px";
      source.appendChild(hole);
      fragments.push({
        radius: radius,
        sourceX: x,
        sourceY: y,
        xRatio: x / width,
        cropSize: renderedWidth + "px " + renderedHeight + "px",
        cropPosition: -(x - radius - offsetX) + "px " + -(y - radius - offsetY) + "px"
      });
      return true;
    }

    function punchTo(count) {
      while (fragments.length < Math.min(count, fragmentTotal)) {
        if (!punch()) break;
      }
    }

    function release(fragment) {
      var width = landing.getBoundingClientRect().width;
      var dropLeft = window.matchMedia("(max-width: 900px)").matches ? 0 : width * 0.5;
      var dropWidth = width - dropLeft;
      var radius = fragment.radius;
      var body = Bodies.circle(dropLeft + radius + fragment.xRatio * (dropWidth - radius * 2), -radius * 2, radius, {
        density: 0.0024,
        friction: 0.88,
        frictionAir: 0.012,
        restitution: 0.16
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.16);
      var element = document.createElement("div");
      element.className = "effects-fragment-piece";
      element.style.width = radius * 2 + "px";
      element.style.height = radius * 2 + "px";
      element.style.backgroundPosition = fragment.cropPosition;
      element.style.backgroundSize = fragment.cropSize;
      landing.appendChild(element);
      World.add(engine.world, body);
      pieces.set(body.id, { body: body, element: element, radius: radius });
    }

    function animate() {
      Engine.update(engine, 1000 / 60);
      pieces.forEach(function (piece) {
        piece.element.style.transform = "translate3d(" + (piece.body.position.x - piece.radius) + "px," + (piece.body.position.y - piece.radius) + "px,0) rotate(" + piece.body.angle + "rad)";
      });
      frame = requestAnimationFrame(animate);
    }

    function onScroll() {
      if (scrollLocked) return;
      var bounds = sourceStage.getBoundingClientRect();
      var travel = Math.max(1, bounds.height - window.innerHeight);
      var progress = Math.min(1, Math.max(0, -bounds.top / travel));
      punchTo(Math.floor(progress * fragmentTotal));
    }

    function onWheel(event) {
      if (event.deltaY <= 0 || !scrollLocked) return;
      var bounds = sourceStage.getBoundingClientRect();
      var header = document.querySelector("header");
      var headerHeight = header ? header.getBoundingClientRect().height : 0;
      var heroIsUnderMenu = bounds.top <= headerHeight + 4 && bounds.bottom > headerHeight;
      if (!heroIsUnderMenu) return;
      event.preventDefault();
      punchTo(fragments.length + 3);
      if (fragments.length >= fragmentTotal) {
        scrollLocked = false;
      }
    }

    var landingObserver = new IntersectionObserver(function (entries) {
      var entry = entries[0];
      if (!entry.isIntersecting || releaseStarted) return;
      releaseStarted = true;
      landing.classList.add("effects-fragment-landing--falling");
      punchTo(fragmentTotal);
      var index = 0;
      releaseTimer = window.setInterval(function () {
        if (index >= fragments.length) {
          window.clearInterval(releaseTimer);
          unlockTimer = window.setTimeout(function () {
            landing.classList.add("effects-fragment-landing--complete");
          }, 1300);
          return;
        }
        release(fragments[index]);
        index += 1;
      }, 12);
    }, { threshold: 0.16 });

    function onPointerMove(event) {
      var bounds = landing.getBoundingClientRect();
      var pointerX = event.clientX - bounds.left;
      var pointerY = event.clientY - bounds.top;
      pieces.forEach(function (piece) {
        var dx = piece.body.position.x - pointerX;
        var dy = piece.body.position.y - pointerY;
        var distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 145) {
          var force = (1 - distance / 145) * 0.0022 * piece.body.mass;
          Body.applyForce(piece.body, piece.body.position, { x: dx / distance * force, y: dy / distance * force });
        }
      });
    }

    setBounds();
    onScroll();
    landingObserver.observe(landing);
    window.addEventListener("resize", setBounds);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    landing.addEventListener("pointermove", onPointerMove);
    frame = requestAnimationFrame(animate);

    window.addEventListener("pagehide", function cleanup() {
      cancelAnimationFrame(frame);
      window.clearInterval(releaseTimer);
      window.clearTimeout(unlockTimer);
      landingObserver.disconnect();
      window.removeEventListener("resize", setBounds);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      landing.removeEventListener("pointermove", onPointerMove);
      Engine.clear(engine);
    }, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSelectedEffects, { once: true });
  } else {
    initSelectedEffects();
  }

  /* Abas da seção "O que tem no planner" — melhoria progressiva:
     sem JS todas as áreas aparecem empilhadas. */
  function initFeatureTabs() {
    var root = document.querySelector(".sx-feat");
    if (!root || root.dataset.tabsReady === "true") return;
    root.dataset.tabsReady = "true";
    root.classList.add("sx-js");
    var tabs = Array.prototype.slice.call(root.querySelectorAll(".sx-tab"));
    var panels = Array.prototype.slice.call(root.querySelectorAll(".sx-panel"));
    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
        if (active && focus) tab.focus();
      });
      panels.forEach(function (panel, i) {
        panel.classList.toggle("is-active", i === index);
      });
      var current = tabs[index];
      if (current && current.scrollIntoView) {
        current.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== null) { event.preventDefault(); select(next, true); }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFeatureTabs, { once: true });
  } else {
    initFeatureTabs();
  }

  function initChaos() {
    var box = document.querySelector(".cmp-chaos");
    if (!box || box.dataset.ready) return;
    box.dataset.ready = "1";
    var chips = Array.prototype.slice.call(box.querySelectorAll(".cmp-chip"));
    var R = 130;
    function reset() {
      chips.forEach(function (c) { c.style.transform = "rotate(" + c.dataset.r + "deg)"; });
    }
    box.addEventListener("pointermove", function (e) {
      var b = box.getBoundingClientRect(), mx = e.clientX - b.left, my = e.clientY - b.top;
      chips.forEach(function (c, i) {
        var cx = c.offsetLeft + c.offsetWidth / 2, cy = c.offsetTop + c.offsetHeight / 2;
        var dx = cx - mx, dy = cy - my, d = Math.hypot(dx, dy) || 1;
        if (d > R) { c.style.transform = "rotate(" + c.dataset.r + "deg)"; return; }
        var f = 1 - d / R, s = i % 2 ? 1 : -1;
        c.style.transform = "translate(" + (dx / d * f * 80) + "px," + (dy / d * f * 80) + "px) rotate(" + (parseFloat(c.dataset.r) + s * f * 40) + "deg)";
      });
    });
    box.addEventListener("pointerleave", reset);
  }

  function initStars() {
    var sec = document.querySelector(".sx-emo");
    if (!sec || sec.dataset.stars) return;
    sec.dataset.stars = "1";
    var field = document.createElement("div");
    field.className = "sx-starfield";
    field.setAttribute("aria-hidden", "true");
    sec.insertBefore(field, sec.firstChild);
    var stars = [];
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function build() {
      field.innerHTML = "";
      stars = [];
      var cs = getComputedStyle(sec), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom), H = sec.offsetHeight, W = sec.offsetWidth;
      var margin = 36;
      var bands = [[8, pt - margin], [H - pb + margin, H - 8]];
      bands.forEach(function (band) {
        var h = band[1] - band[0];
        if (h < 8) return;
        var n = Math.max(6, Math.round(W / 60));
        for (var i = 0; i < n; i++) {
          var s = document.createElement("i");
          s.className = "sx-star";
          var size = 1.5 + rnd() * 1.8;
          s.style.cssText = "width:" + size + "px;height:" + size + "px;left:" + (rnd() * 98 + 1) + "%;top:" + (band[0] + rnd() * h) + "px;--o:" + (0.45 + rnd() * 0.45) + ";animation-delay:" + (rnd() * 4) + "s";
          field.appendChild(s);
          stars.push({ el: s, t: rnd() * 0.9 });
        }
      });
      update();
    }
    function update() {
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * 0.6)));
      stars.forEach(function (s) { s.el.classList.toggle("is-on", p > s.t); });
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", build);
    build();
  }

  function initExtras() { initChaos(); initStars(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initExtras, { once: true });
  else initExtras();
})();
