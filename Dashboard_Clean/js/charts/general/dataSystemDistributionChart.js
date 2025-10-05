console.log("[general-chart-system-distribution] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[general-chart-system-distribution] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderSystemDistributionChart(e.detail);
});

function renderSystemDistributionChart(data) {
    console.log("[general-chart-system-distribution] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[general-chart-system-distribution] Veri yok, chart çizilmeyecek.");
        return;
    }

    // SYSTEM alanına göre gruplama
    const systemCounts = {};
    data.forEach(job => {
        const systemName = job.SYSTEM || "Bilinmiyor";
        systemCounts[systemName] = (systemCounts[systemName] || 0) + 1;
    });

    // ECharts formatına uygun hale getir
    const chartData = Object.entries(systemCounts).map(([system, count]) => ({
        name: system,
        value: count
    }));

    console.log("[general-chart-system-distribution] Sistem dağılımı:", chartData);

    var chartDom = document.getElementById("general-chart-system-distribution");
    var myChart = echarts.init(chartDom);

    var option = {
        title: {
            text: "İşlerin Sistemlere Göre Dağılımı",
            left: "center",
            top: 10,
            textStyle: { fontSize: 16, color: "#333" }
        },
        tooltip: {
            trigger: "item",
            formatter: "{b}: {c} iş ({d}%)"
        },
        legend: {
            orient: "vertical",
            left: "left",
            textStyle: { fontSize: 12 }
        },
        series: [
            {
                name: "Sistem",
                type: "pie",
                radius: ["35%", "65%"],
                center: ["50%", "60%"],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: "#fff",
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: "{b}\n{c} iş"
                },
                data: chartData
            }
        ]
    };

    myChart.setOption(option);
    console.log("[general-chart-system-distribution] Pie chart çizildi. Sistem sayısı:", chartData.length);
}
