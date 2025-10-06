// global.js
window.globalData = [];

function updateGlobalData(data) {
    console.log("[Global] updateGlobalData çağrıldı. Eleman sayısı:", data.length);
    window.globalData = data; // global değişken olarak tut
    const event = new CustomEvent('globalDataUpdated', { detail: data });
    console.log("[Global] globalDataUpdated event dispatch ediliyor.");
    document.dispatchEvent(event);
}


// Drag & Drop
var dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover", function (e) {
  e.preventDefault();
  dropZone.style.borderColor = "yellow";
});
dropZone.addEventListener("dragleave", function (e) {
  dropZone.style.borderColor = "#888";
});
dropZone.addEventListener("drop", function (e) {
  e.preventDefault();
  dropZone.style.borderColor = "#888";
  var file = e.dataTransfer.files[0];
  var reader = new FileReader();
  reader.onload = function (ev) {
    console.log("[Global] Dosya okundu. JSON parse ediliyor...");
    try {
      var jobs = JSON.parse(ev.target.result);
      console.log("[Global] JSON parse başarılı. Eleman sayısı:", Array.isArray(jobs) ? jobs.length : 1);
      if (!Array.isArray(jobs)) {
        jobs = [jobs]; // Tek obje geldiyse array yap
      }
      updateGlobalData(jobs);
    } catch (err) {
      console.error("[Global] JSON parse hatası:", err);
    }
  };
  reader.readAsText(file);
});
