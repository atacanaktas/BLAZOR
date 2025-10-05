console.log("[tree-chart-jobs] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[tree-chart-jobs] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderJobsTree(e.detail);
});

function renderJobsTree(data) {
    if (!data || data.length === 0) {
        console.warn("[tree-chart-jobs] Veri yok, chart çizilmeyecek.");
        return;
    }

    // maxOnSart ve rootJob değişkenlerini tanımla
    let maxOnSart = 0;
    let rootJob = null;

    // JSON verisindeki her job'u gez
    for (let i = 0; i < data.length; i++) {
        const job = data[i];
        const onStartCount = Array.isArray(job.OnSart) ? job.OnSart.length : 0;

        if (onStartCount > maxOnSart) {
            maxOnSart = onStartCount;
            rootJob = job;
        }
    }

    if (!rootJob) {
        console.warn("[tree-chart-jobs] Root job bulunamadı.");
        return;
    }

    console.log("[tree-chart-jobs] Root job seçildi:", rootJob.JOBNAME, "OnSart sayısı:", maxOnSart);

    // Tree veri yapısını oluştur (sadece 1. derece bağımlılıklar)
    const treeData = {
        name: rootJob.JOBNAME,
        children: []
    };

    rootJob.OnSart?.forEach(jobName => {
        const job = data.find(d => d.JOBNAME === jobName); // JOBNAME ile eşleştiriyoruz
        if (job) {
            treeData.children.push({ name: job.JOBNAME });
        }
    });

    console.log("[tree-chart-jobs] Tree data hazır:", treeData);

    // Chart çizimi
    const chartDom = document.getElementById("tree-chart-jobs");
    const myChart = echarts.init(chartDom);

    const option = {
        tooltip: { trigger: "item", triggerOn: "mousemove" },
        series: [
            {
                type: "tree",
                data: [treeData],
                top: "1%",
                left: "10%",
                bottom: "1%",
                right: "20%",
                symbolSize: 12,
                label: {
                    position: "left",
                    verticalAlign: "middle",
                    align: "right",
                    fontSize: 12
                },
                leaves: { label: { position: "right", verticalAlign: "middle", align: "left" } },
                expandAndCollapse: false,
                animationDuration: 550,
                animationDurationUpdate: 750
            }
        ]
    };

    myChart.setOption(option);
    console.log("[tree-chart-jobs] Tree chart çizildi.");
}
