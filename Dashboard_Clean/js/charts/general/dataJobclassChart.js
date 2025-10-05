console.log("[general-chart-jobclass-distribution] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[general-chart-jobclass-distribution] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderJobClassDistributionChart(e.detail);
});

function renderJobClassDistributionChart(data) {
    console.log("[general-chart-jobclass-distribution] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[general-chart-jobclass-distribution] Veri yok, chart çizilmeyecek.");
        return;
    }

    // JOB_CLASS alanına göre gruplama
    const classCounts = {};
    data.forEach(job => {
        const jobClass = job.JOB_CLASS || "Bilinmiyor";
        classCounts[jobClass] = (classCounts[jobClass] || 0) + 1;
    });

    // ECharts formatına uygun hale getir
    const chartData = Object.entries(classCounts).map(([cls, count]) => ({
        name: cls,
        value: count
    }));

    console.log("[general-chart-jobclass-distribution] Job Class dağılımı:", chartData);

    var chartDom = document.getElementById("general-chart-jobclass-distribution");
    var myChart = echarts.init(chartDom);

    var option = {
        title: {
            text: "İşlerin Job Class’lara Göre Dağılımı",
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
                name: "Job Class",
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
    console.log("[general-chart-jobclass-distribution] Pie chart çizildi. Class sayısı:", chartData.length);
}
