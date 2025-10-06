console.log("[general-chart-count] Script y�klendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[general-chart-count] globalDataUpdated event yakaland�. Data say�s�:", e.detail.length);
    renderGeneralChartCount(e.detail);
});

function renderGeneralChartCount(data) {
    console.log("[general-chart-count] �izim i�in haz�rlan�yor. Data uzunlu�u:", data.length);

    if (!data || data.length === 0) {
        console.warn("[general-chart-count] Veri yok, gauge �izilmeyecek.");
        return;
    }

    // Burada �rnek olarak count = datan�n uzunlu�u
    const count = data.length;

    var chartDom = document.getElementById("general-chart-count");
    var myChart = echarts.init(chartDom);

    var option = {
        title: {
            text: "Toplam Job Say�s�",
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
                max: count * 2, // otomatik skala
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
    console.log("[general-chart-count] Gauge �izildi. Count:", count);
}
