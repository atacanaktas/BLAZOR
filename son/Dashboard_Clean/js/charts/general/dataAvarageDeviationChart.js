console.log("[general-chart-avg-deviation] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[general-chart-avg-deviation] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderGeneralChartAvgDeviation(e.detail);
});

function renderGeneralChartAvgDeviation(data) {
    console.log("[general-chart-avg-deviation] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[general-chart-avg-deviation] Veri yok, gauge çizilmeyecek.");
        return;
    }

    // PLANED_START_TIME dizisi (her bir START_TIME'a 1 dk ekliyoruz)
    const PLANED_START_TIME = data.map(d => {
        const [h, m, s] = d.START_TIME.split(":").map(Number);
        const date = new Date();
        date.setHours(h, m + 1, s);
        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        const ss = String(date.getSeconds()).padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
    });

    // START_TIME ile PLANED_START_TIME farklarını sn cinsinden hesapla
    const diffs = data.map((d, i) => {
        const [sh, sm, ss] = d.START_TIME.split(":").map(Number);
        const [ph, pm, ps] = PLANED_START_TIME[i].split(":").map(Number);
        const start = new Date();
        start.setHours(sh, sm, ss);
        const planned = new Date();
        planned.setHours(ph, pm, ps);
        return -1 * ((start - planned) / 1000); // sn
    });

    // Ortalama sapma
    const avgDeviation = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);

    var chartDom = document.getElementById("general-chart-avg-deviation");
    var myChart = echarts.init(chartDom);

    var option = {
        title: {
            text: "Ortalama Planlanan Başlangıçtan Sapma (sn)",
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
                max: avgDeviation * 2,
                progress: {
                    show: true,
                    width: 18,
                    roundCap: true,
                    itemStyle: { color: avgDeviation >= 0 ? "#dc3545" : "#28a745" }
                },
                pointer: {
                    icon: "path://M2,0 L-2,0 L0,-80 Z",
                    length: "70%",
                    width: 6,
                    offsetCenter: [0, "8%"],
                    itemStyle: { color: avgDeviation >= 0 ? "#dc3545" : "#28a745" }
                },
                axisLine: {
                    lineStyle: {
                        width: 18,
                        color: [[1, "#ddd"]]
                    }
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
                    color: avgDeviation >= 0 ? "#dc3545" : "#28a745",
                    offsetCenter: [0, "30%"],
                    formatter: "{value} sn"
                },
                data: [{ value: avgDeviation }]
            }
        ]
    };

    myChart.setOption(option);
    console.log("[general-chart-avg-deviation] Gauge çizildi. Ortalama sapma (dk):", avgDeviation);
}
