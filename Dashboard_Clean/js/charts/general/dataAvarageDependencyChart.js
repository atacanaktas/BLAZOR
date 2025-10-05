console.log("[general-chart-avg-dependency] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[general-chart-avg-dependency] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderGeneralChartAvgDependency(e.detail);
});

function renderGeneralChartAvgDependency(data) {
    console.log("[general-chart-avg-dependency] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[general-chart-avg-dependency] Veri yok, gauge çizilmeyecek.");
        return;
    }

    // 🔹 OnSart dizisini düzgün yakalayalım
    const dependencyCounts = data.map(d => {
        if (!d.OnSart) return 0;
        if (Array.isArray(d.OnSart)) return d.OnSart.length;
        try {
            // Bazı JSON’larda string olabilir, parse etmeyi dene
            const parsed = JSON.parse(d.OnSart);
            return Array.isArray(parsed) ? parsed.length : 0;
        } catch {
            return 0;
        }
    });

    // 🔹 Ortalama bağımlılık sayısı
    const total = dependencyCounts.reduce((a, b) => a + b, 0);
    const avgDependency = total === 0 ? 0 : +(total / dependencyCounts.length).toFixed(2);

    // 🔹 Maksimum bağımlılık sayısı (ölçek için)
    const maxDependency = Math.max(...dependencyCounts, 5);

    var chartDom = document.getElementById("general-chart-avg-dependency");
    var myChart = echarts.init(chartDom);

    var option = {
        title: {
            text: "Ortalama 1. Derece Bağımlılık Sayısı",
            left: "center",
            top: 10,
            textStyle: { fontSize: 16, color: "#333" }
        },
        series: [
            {
                type: "gauge",
                center: ["50%", "60%"],
                startAngle: 200,
                endAngle: -20,
                min: 0,
                max: avgDependency * 2,
                progress: {
                    show: true,
                    width: 18,
                    roundCap: true,
                    itemStyle: { color: "#17a2b8" }
                },
                pointer: {
                    icon: "path://M2,0 L-2,0 L0,-80 Z",
                    length: "70%",
                    width: 6,
                    offsetCenter: [0, "8%"],
                    itemStyle: { color: "#17a2b8" }
                },
                axisLine: {
                    lineStyle: { width: 18, color: [[1, "#ddd"]] }
                },
                axisTick: {
                    distance: -22,
                    length: 6,
                    lineStyle: { color: "#999", width: 1 }
                },
                splitLine: {
                    distance: -22,
                    length: 16,
                    lineStyle: { color: "#999", width: 2 }
                },
                axisLabel: {
                    distance: -38,
                    color: "#666",
                    fontSize: 10
                },
                detail: {
                    valueAnimation: true,
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#000",
                    offsetCenter: [0, "30%"],
                    formatter: "{value}"
                },
                data: [{ value: avgDependency }]
            }
        ]
    };

    myChart.setOption(option);
    console.log("[general-chart-avg-dependency] Gauge çizildi. Ortalama bağımlılık:", avgDependency);
}
