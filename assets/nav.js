(function () {
  var header = document.getElementById("masthead");
  var hero = document.getElementById("hero");
  if (header && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle("show", !entries[0].isIntersecting);
    }, { rootMargin: "-80px 0px 0px 0px" }).observe(hero);
  } else if (header) {
    header.classList.add("show");
  }

  // Close language menus on outside click, on Escape, and when another one opens.
  var menus = document.querySelectorAll(".lang-menu");
  document.addEventListener("click", function (event) {
    menus.forEach(function (menu) {
      if (!menu.contains(event.target)) menu.open = false;
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") menus.forEach(function (menu) { menu.open = false; });
  });
  // Hero: play the cafe scenes in order, with a soft crossfade, on every screen size.
  var clips = Array.prototype.slice.call(document.querySelectorAll(".hero video.clip"));
  if (clips.length) {
    var current = 0;
    var switching = false;
    var fade = 700;

    clips.forEach(function (clip) {
      clip.muted = true;
      clip.defaultMuted = true;
      clip.playsInline = true;
      clip.setAttribute("muted", "");
      clip.setAttribute("playsinline", "");
      clip.setAttribute("webkit-playsinline", "");
      clip.loop = false;
      clip.removeAttribute("loop");
    });

    function start(clip) {
      var attempt = clip.play();
      return attempt && attempt.catch ? attempt : Promise.resolve();
    }

    function advance() {
      if (switching) return;
      switching = true;
      var from = clips[current];
      var nextIndex = (current + 1) % clips.length;
      var to = clips[nextIndex];
      to.preload = "auto";
      try { to.currentTime = 0; } catch (e) {}
      start(to).then(function () {
        to.classList.add("on");
        from.classList.remove("on");
        current = nextIndex;
        clips[(nextIndex + 1) % clips.length].preload = "auto";
        setTimeout(function () {
          from.pause();
          switching = false;
        }, fade);
      }).catch(function () {
        switching = false;
        try { from.currentTime = 0; } catch (e) {}
        start(from).catch(function () {});
      });
    }

    clips.forEach(function (clip, index) {
      var limit = parseFloat(clip.getAttribute("data-seconds")) || 8;
      clip.addEventListener("timeupdate", function () {
        if (index === current && clip.currentTime >= limit) advance();
      });
      clip.addEventListener("ended", function () {
        if (index === current) advance();
      });
    });

    clips[0].classList.add("on");
    clips[1].preload = "auto";

    function resume() {
      if (clips[current].paused && !document.hidden) start(clips[current]).catch(function () {});
    }
    start(clips[0]).catch(function () {});
    // Some phones hold autoplay until the first touch or scroll.
    ["touchstart", "touchend", "click", "scroll"].forEach(function (name) {
      window.addEventListener(name, resume, { passive: true });
    });
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pageshow", resume);
    clips[0].addEventListener("canplay", resume);
  }
})();
