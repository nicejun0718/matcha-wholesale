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
})();
