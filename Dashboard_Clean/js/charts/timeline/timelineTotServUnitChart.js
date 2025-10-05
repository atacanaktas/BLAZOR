console.log("[timeline-chart-tot-serv-unit] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[timeline-chart-tot-serv-unit] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderTotServUnitTimeline(e.detail);
});

function renderTotServUnitTimeline(data) {
    console.log("[timeline-chart-tot-serv-unit] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[timeline-chart-tot-serv-unit] Veri yok, chart çizilmeyecek.");
        return;
    }

    const intervalCount = 24 * 4; // 15 dk aralık = 96 aralık
    const totServUnitCounts = Array(intervalCount).fill(0);

    data.forEach(job => {
        try {
            const [h, m, s] = job.START_TIME.split(":").map(Number);
            const startSec = h * 3600 + m * 60 + s;
            const endSec = startSec + job.ELAPSED_TIME;

            const startInterval = Math.floor(startSec / (15 * 60));
            const endInterval = Math.min(intervalCount - 1, Math.floor(endSec / (15 * 60)));

            const intervalsLength = endInterval - startInterval + 1;
            if (intervalsLength <= 0) return;

            // TOT_SERV_UNIT değerini aralıklara eşit paylaştır
            const valuePerInterval = job.TOT_SERV_UNIT / intervalsLength;

            for (let i = startInterval; i <= endInterval; i++) {
                totServUnitCounts[i] += valuePerInterval;
            }

        } catch (err) {
            console.warn("[timeline-chart-tot-serv-unit] Hatalı kayıt:", job, err);
        }
    });

    console.log("[timeline-chart-tot-serv-unit] 15dk aralık bazlı TOT_SERV_UNIT dağılımı:", totServUnitCounts);

    const chartDom = document.getElementById("timeline-chart-tot-serv-unit");
    const myChart = echarts.init(chartDom);

    const intervals = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            intervals.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
        }
    }

    const option = {
        title: {
            text: "15 Dakikalık Aralıklarla TOT_SERV_UNIT Dağılımı",
            left: "center",
            top: 10,
            textStyle: { fontSize: 16, color: "#333" }
        },
        tooltip: {
            trigger: "axis",
            formatter: (params) => {
                const { name, value } = params[0];
                return `${name}<br>TOT_SERV_UNIT: <b>${Math.round(value)}</b>`;
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
            name: "TOT_SERV_UNIT",
            nameLocation: "middle",
            nameGap: 50,
        },
        series: [
            {
                name: "TOT_SERV_UNIT",
                type: "line",
                smooth: true,
                areaStyle: { opacity: 0.2 },
                lineStyle: { width: 2 },
                symbol: "circle",
                symbolSize: 6,
                data: totServUnitCounts,
                itemStyle: { color: "#28a745" }
            }
        ]
    };

    myChart.setOption(option);
    console.log("[timeline-chart-tot-serv-unit] Line chart çizildi (15dk aralık).");
}
