console.log("[general-chart-avg-elapsed] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[general-chart-avg-elapsed] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderGeneralChartElapsed(e.detail);
});

function renderGeneralChartElapsed(data) {
    console.log("[general-chart-avg-elapsed] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[general-chart-avg-elapsed] Veri yok, gauge çizilmeyecek.");
        return;
    }

    // ELAPSED_TIME ortalamasını hesapla
    const elapsedTimes = data.map(d => d.ELAPSED_TIME);
    const avgElapsed = Math.round(elapsedTimes.reduce((a, b) => a + b, 0) / elapsedTimes.length);

    var chartDom = document.getElementById("general-chart-avg-elapsed");
    var myChart = echarts.init(chartDom);

    var option = {
        title: {
            text: "Ortalama Elapsed Time (sn)",
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
                max: Math.max(...elapsedTimes) || 100, // otomatik skala, boşsa 100
                progress: {
                    show: true,
                    width: 18,
                    roundCap: true,
                    itemStyle: { color: "#28a745" }
                },
                pointer: {
                    icon: "path://M2,0 L-2,0 L0,-80 Z",
                    length: "70%",
                    width: 6,
                    offsetCenter: [0, "8%"],
                    itemStyle: { color: "#28a745" }
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
                    color: "#000",
                    offsetCenter: [0, "30%"],
                    formatter: "{value} sn"
                },
                data: [{ value: avgElapsed }]
            }
        ]
    };

    myChart.setOption(option);
    console.log("[general-chart-avg-elapsed] Gauge çizildi. Ortalama ELAPSED_TIME:", avgElapsed, "sn");
}
