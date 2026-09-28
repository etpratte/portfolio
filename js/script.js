// Justified gallery: packs each project's images into rows where every
// image in a row has the same height and the row fills the full width.
// Nothing is cropped. Tune the two numbers below to taste.

(function () {
  var TARGET_ROW_HEIGHT = 240; // ideal row height in px (bigger = fewer per row)
  var MAX_ROW_HEIGHT = 460;    // a lone/short last row never gets taller than this
  var GAP = 8;                 // must match the gap in .project-gallery (CSS)

  function layoutGallery(gallery) {
    var tiles = Array.prototype.slice.call(gallery.querySelectorAll(".project-image"));
    var width = gallery.clientWidth;
    if (!width || !tiles.length) return;

    // Aspect ratio (w / h) for each tile. Images that are still loading are
    // skipped for now (we re-run when they finish); images that failed to
    // load are hidden so they can't break the layout for the others.
    var items = [];
    for (var i = 0; i < tiles.length; i++) {
      var img = tiles[i].querySelector("img");
      if (!img) continue;
      if (img.naturalWidth) {
        tiles[i].style.display = "";
        items.push({ tile: tiles[i], ar: img.naturalWidth / img.naturalHeight });
      } else if (img.complete) {
        tiles[i].style.display = "none"; // broken image (wrong filename, etc.)
      }
    }
    if (!items.length) return;

    var rowH = Math.min(TARGET_ROW_HEIGHT, width * 0.6);
    var row = [];
    var rowAr = 0;

    function place(list, sumAr, fill) {
      var gaps = GAP * (list.length - 1);
      var h = (width - gaps) / sumAr;       // height that exactly fills the row
      if (!fill) h = Math.min(h, MAX_ROW_HEIGHT); // last row: grow to fit, but not huge
      h = Math.min(h, MAX_ROW_HEIGHT);
      list.forEach(function (it) {
        it.tile.style.height = Math.round(h) + "px";
        it.tile.style.width = Math.floor(h * it.ar) + "px";
      });
    }

    items.forEach(function (it) {
      row.push(it);
      rowAr += it.ar;
      var gaps = GAP * (row.length - 1);
      if ((width - gaps) / rowAr <= rowH) {  // row is full: scale it to fit exactly
        place(row, rowAr, true);
        row = [];
        rowAr = 0;
      }
    });

    if (row.length) place(row, rowAr, false); // leftover last row
  }

  function layoutAll() {
    document.querySelectorAll(".project-gallery").forEach(layoutGallery);
  }

  // Run once each image has loaded, and again when the window resizes
  document.querySelectorAll(".project-image img").forEach(function (img) {
    if (img.complete) return;
    img.addEventListener("load", layoutAll);
    img.addEventListener("error", layoutAll);
  });
  window.addEventListener("load", layoutAll);
  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(layoutAll, 80);
  });
  layoutAll();
})();