console.log("[timeline-chart-active-jobs-timeline] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[timeline-chart-active-jobs-timeline] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderActiveJobsTimeline(e.detail);
});

function renderActiveJobsTimeline(data) {
    console.log("[timeline-chart-active-jobs-timeline] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[timeline-chart-active-jobs-timeline] Veri yok, chart çizilmeyecek.");
        return;
    }

    // 15 dakikalık aralıklar için array (24 saat * 4 = 96 aralık)
    const intervalCount = 24 * 4;
    const activeCounts = Array(intervalCount).fill(0);

    data.forEach(job => {
        try {
            const [h, m, s] = job.START_TIME.split(":").map(Number);
            const startSec = h * 3600 + m * 60 + s;
            const endSec = startSec + job.ELAPSED_TIME;

            // 15 dakikalık aralıkları bul
            const startInterval = Math.floor(startSec / (15 * 60));
            const endInterval = Math.min(intervalCount - 1, Math.floor(endSec / (15 * 60)));

            for (let i = startInterval; i <= endInterval; i++) {
                activeCounts[i]++;
            }
        } catch (err) {
            console.warn("[timeline-chart-active-jobs-timeline] Hatalı kayıt:", job, err);
        }
    });

    console.log("[timeline-chart-active-jobs-timeline] 15dk aralık bazlı aktif iş sayıları:", activeCounts);

    const chartDom = document.getElementById("timeline-chart-active-jobs-timeline");
    const myChart = echarts.init(chartDom);

    // X ekseni label
    const intervals = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            intervals.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
        }
    }

    const option = {
        title: {
            text: "15 Dakikalık Aralıklarla Aktif İş Sayısı",
            left: "center",
            top: 10,
            textStyle: { fontSize: 16, color: "#333" }
        },
        tooltip: {
            trigger: "axis",
            formatter: (params) => {
                const { name, value } = params[0];
                return `${name}<br>Aktif İş Sayısı: <b>${value}</b>`;
            }
        },
        grid: { left: 50, right: 30, bottom: 40, top: 60 },
        xAxis: {
            type: "category",
            data: intervals,
            name: "Saat",
            nameLocation: "middle",
            nameGap: 30,
            axisLabel: { rotate: 45, fontSize: 10 }
        },
        yAxis: {
            type: "value",
            name: "Aktif İş Sayısı",
            nameLocation: "middle",
            nameGap: 50,
        },
        series: [
            {
                name: "Aktif İş Sayısı",
                type: "line",
                smooth: true,
                areaStyle: { opacity: 0.2 },
                lineStyle: { width: 2 },
                symbol: "circle",
                symbolSize: 6,
                data: activeCounts,
                itemStyle: { color: "#007bff" }
            }
        ]
    };

    myChart.setOption(option);
    console.log("[timeline-chart-active-jobs-timeline] Line chart çizildi (15dk aralık).");
}
