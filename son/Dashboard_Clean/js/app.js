// App.js

// Genel değişkenler
window.App = {
    globalData: [],      // Ham JSON dosyası
    filteredData: [],    // Filtrelenmiş data
    charts: []           // Tüm chart instance'ları
};

// Filtrelenmiş data değiştiğinde event tetikleme
Object.defineProperty(App, "filteredData", {
    get: function() { return this._filteredData; },
    set: function(value) {
        this._filteredData = value;
        console.log("[App] filteredData set edildi, length:", value.length);

        // Event fırlat
        const event = new CustomEvent("globalDataUpdated", { detail: value });
        document.dispatchEvent(event);
    }
});
App._filteredData = [];

// Body’ye drag & drop
document.addEventListener('dragover', function(e) {
    e.preventDefault();
});

document.addEventListener('drop', function(e) {
    e.preventDefault();

    if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();

        reader.onload = function(ev) {
            try {
                const data = JSON.parse(ev.target.result);
                console.log("[App] Dosya yüklendi:", data);

                // Ham data olarak sakla
                App.globalData = data;

                // Başlangıçta filtrelenmiş data ham data olabilir
                App.filteredData = data;

            } catch(err) {
                alert("[App] JSON hatalı: " + err);
            }
        };

        reader.readAsText(file);
    }
});

// -----------------------------
// general-chart-* chart’larını otomatik başlat
// -----------------------------
document.addEventListener("DOMContentLoaded", function() {
    // Tüm id'si 'general-chart-' ile başlayan elementleri seç
    document.querySelectorAll('[id*="-chart-"]').forEach(el => {
        const chart = echarts.init(el);
        App.charts.push(chart);
    });

    // Window resize event
    window.addEventListener("resize", () => {
        App.charts.forEach(chart => {
            if (chart) chart.resize();
        });
    });
});

// App.js içine ekle (örneğin en alta)
document.addEventListener('shown.bs.tab', function (event) {
    console.log("[App] Tab değişti:", event.target.id);

    // ECharts container'larını bul
    document.querySelectorAll("[id*='-chart-']").forEach(div => {
        const chart = echarts.getInstanceByDom(div);
        if (chart) {
            chart.resize(); // mevcut chart'ı yeniden boyutlandır
            console.log("[App] Chart resize edildi:", div.id);
        }
    });
});
