(function () {
  function initSelectedEffects() {
    var root = document.querySelector(".ponto-effects");
    if (!root || root.dataset.effectsReady === "true") return;
    root.dataset.effectsReady = "true";

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.16 });
    root.querySelectorAll(".effects-reveal").forEach(function (item) {
      revealObserver.observe(item);
    });

    var frosted = root.querySelector(".effects-frosted");
    if (frosted) {
      frosted.addEventListener("pointermove", function (event) {
        var bounds = frosted.getBoundingClientRect();
        frosted.style.setProperty("--cursor-x", ((event.clientX - bounds.left) / bounds.width * 100) + "%");
        frosted.style.setProperty("--cursor-y", ((event.clientY - bounds.top) / bounds.height * 100) + "%");
      });
    }

    initFragmentRain(root);
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
    var fragmentTotal = 36;
    var floor;
    var leftWall;
    var rightWall;
    var frame = 0;
    var releaseTimer = 0;
    var unlockTimer = 0;
    var releaseStarted = false;
    var previousOverflow = document.documentElement.style.overflow;

    function overlapsProtectedCopy(x, y, radius, bounds) {
      if (!copy) return false;
      var copyBounds = copy.getBoundingClientRect();
      var padding = 38;
      var left = copyBounds.left - bounds.left - padding;
      var top = copyBounds.top - bounds.top - padding;
      var right = copyBounds.right - bounds.left + padding;
      var bottom = copyBounds.bottom - bounds.top + padding;
      var closestX = Math.max(left, Math.min(x, right));
      var closestY = Math.max(top, Math.min(y, bottom));
      return Math.hypot(x - closestX, y - closestY) < radius;
    }

    function setBounds() {
      var bounds = landing.getBoundingClientRect();
      if (floor) Composite.remove(engine.world, [floor, leftWall, rightWall]);
      floor = Bodies.rectangle(bounds.width / 2, bounds.height + 24, bounds.width + 96, 48, { isStatic: true, friction: 0.96 });
      leftWall = Bodies.rectangle(-24, bounds.height / 2, 48, bounds.height * 2, { isStatic: true });
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
      var radius = fragment.radius;
      var body = Bodies.circle(radius + fragment.xRatio * (width - radius * 2), -radius * 2, radius, {
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
      var bounds = sourceStage.getBoundingClientRect();
      var travel = Math.max(1, bounds.height - window.innerHeight);
      var progress = Math.min(1, Math.max(0, -bounds.top / travel));
      punchTo(Math.floor(progress * fragmentTotal));
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
    landing.addEventListener("pointermove", onPointerMove);
    frame = requestAnimationFrame(animate);

    window.addEventListener("pagehide", function cleanup() {
      cancelAnimationFrame(frame);
      window.clearInterval(releaseTimer);
      window.clearTimeout(unlockTimer);
      landingObserver.disconnect();
      window.removeEventListener("resize", setBounds);
      window.removeEventListener("scroll", onScroll);
      landing.removeEventListener("pointermove", onPointerMove);
      Engine.clear(engine);
    }, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSelectedEffects, { once: true });
  } else {
    initSelectedEffects();
  }
})();
