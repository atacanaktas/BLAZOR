console.log("[Chart8] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[Chart8] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderChart8(e.detail);
});

function renderChart8(data) {
    console.log("[Chart8] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[Chart8] Veri yok, gauge çizilmeyecek.");
        return;
    }

    // Burada örnek olarak count = datanın uzunluğu
    const count = data.length;

    var chartDom = document.getElementById("chart8");
    var myChart = echarts.init(chartDom);

    var option = {
        title: {
            text: "Toplam Job Sayısı",
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
                max: count, // otomatik skala
                progress: {
                    show: true,
                    width: 18,
                    roundCap: true,
                    itemStyle: { color: "#007bff" }
                },
                pointer: {
                    icon: "path://M2,0 L-2,0 L0,-80 Z",
                    length: "70%",
                    width: 6,
                    offsetCenter: [0, "8%"],
                    itemStyle: { color: "#007bff" }
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
                    formatter: "{value}"
                },
                data: [{ value: count }]
            }
        ]
    };

    myChart.setOption(option);
    console.log("[Chart8] Gauge çizildi. Count:", count);
}
