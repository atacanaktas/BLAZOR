console.log("[general-chart-dataset-distribution] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[general-chart-dataset-distribution] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderDatasetDistributionChart(e.detail);
});

function renderDatasetDistributionChart(data) {
    console.log("[general-chart-dataset-distribution] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[general-chart-dataset-distribution] Veri yok, chart çizilmeyecek.");
        return;
    }

    // DatasetAdi alanına göre gruplama
    const datasetCounts = {};
    data.forEach(job => {
        const datasetName = job.DatasetAdi || "Bilinmiyor";
        datasetCounts[datasetName] = (datasetCounts[datasetName] || 0) + 1;
    });

    // ECharts formatına uygun hale getir
    const chartData = Object.entries(datasetCounts).map(([dataset, count]) => ({
        name: dataset,
        value: count
    }));

    console.log("[general-chart-dataset-distribution] Dataset dağılımı:", chartData);

    var chartDom = document.getElementById("general-chart-dataset-distribution");
    var myChart = echarts.init(chartDom);

    var option = {
        title: {
            text: "İşlerin Dataset'lere Göre Dağılımı",
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
                name: "Dataset",
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
    console.log("[general-chart-dataset-distribution] Pie chart çizildi. Dataset sayısı:", chartData.length);
}
