// timeline-chart-critical-chain.js
console.log("[timeline-chart-critical-chain] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[timeline-chart-critical-chain] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderCriticalChainTimeline(e.detail);
});

function parseTimeToSec(t) {
    if (!t) return 0;
    const parts = ("" + t).split(":").map(Number);
    const [h = 0, m = 0, s = 0] = parts;
    return h * 3600 + m * 60 + s;
}

function secToHHMM(v) {
    v = Math.max(0, Math.round(v));
    const h = Math.floor(v / 3600) % 24;
    const m = Math.floor((v % 3600) / 60);
    const s = v % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function renderCriticalChainTimeline(data) {
    console.log("[timeline-chart-critical-chain] renderCriticalChainTimeline çağrıldı.");

    if (!data || data.length === 0) {
        console.warn("[timeline-chart-critical-chain] Veri yok, chart çizilmeyecek.");
        return;
    }

    // Hızlı erişim map'leri
    const jobMapByName = new Map();
    const jobMapById = new Map();
    data.forEach(j => {
        if (j.JOBNAME) jobMapByName.set(j.JOBNAME, j);
        if (j.JOBID) jobMapById.set(j.JOBID, j);
    });

    // En geç biten job'u bul
    const lastJob = data.reduce((a, b) => {
        return parseTimeToSec(a.END_TIME) >= parseTimeToSec(b.END_TIME) ? a : b;
    });

    if (!lastJob) {
        console.warn("[timeline-chart-critical-chain] En geç biten job bulunamadı.");
        return;
    }

    // Zinciri geriye doğru oluştur
    const chain = [];
    let current = lastJob;
    const visited = new Set();

    while (current) {
        if (visited.has(current.JOBNAME || current.JOBID)) break;
        visited.add(current.JOBNAME || current.JOBID);
        chain.unshift(current); // earliest at top

        const depsArr = Array.isArray(current.OnSart) ? current.OnSart :
                        Array.isArray(current.OnStart) ? current.OnStart : [];

        if (!depsArr || depsArr.length === 0) break;

        const depJobs = depsArr
            .map(id => jobMapByName.get(id) || jobMapById.get(id))
            .filter(j => j && j.END_TIME !== undefined);

        if (depJobs.length === 0) break;

        let next = depJobs.reduce((a, b) =>
            parseTimeToSec(a.END_TIME) >= parseTimeToSec(b.END_TIME) ? a : b
        );

        current = next;
    }

    if (chain.length === 0) {
        console.warn("[timeline-chart-critical-chain] Zincir boş.");
        return;
    }

    console.log("[timeline-chart-critical-chain] Zincir bulundu:", chain.map(c => c.JOBNAME));

    // Chart verilerini hazırla
    const categories = chain.map(c => c.JOBNAME);
    const startSecs = chain.map(c => parseTimeToSec(c.START_TIME));
    const endSecs = chain.map(c => parseTimeToSec(c.END_TIME));
    const tanimStartSecs = chain.map(c => parseTimeToSec(c.TANIM_START_TIME || c.START_TIME));

    const durations = chain.map((c, i) => Math.max(1, endSecs[i] - startSecs[i]));
    const delayDurations = chain.map((c, i) =>
        Math.max(0, startSecs[i] - tanimStartSecs[i])
    );

    const minStart = Math.min(...tanimStartSecs);
    const maxEnd = Math.max(...endSecs);
    const padding = Math.ceil((maxEnd - minStart) * 0.05) || 60;

    const chartDom = document.getElementById("timeline-chart-critical-chain");
    if (!chartDom) {
        console.error("[timeline-chart-critical-chain] Container bulunamadı: timeline-chart-critical-chain");
        return;
    }

    const myChart = echarts.init(chartDom);

    const option = {
        title: {
            text: "En Geç Biten İş Zinciri (Timeline)",
            left: "center"
        },
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: function (params) {
                const idx = params[0].dataIndex;
                const job = chain[idx];
                const start = secToHHMM(startSecs[idx]);
                const end = secToHHMM(endSecs[idx]);
                const planned = secToHHMM(tanimStartSecs[idx]);
                const delay = delayDurations[idx];
                return `${job.JOBNAME}<br>
                        Planlanan: ${planned}<br>
                        Başlangıç: ${start}<br>
                        Bitiş: ${end}<br>
                        Gecikme: ${delay > 0 ? delay + " sn" : "Yok"}<br>
                        Süre: ${durations[idx]} sn`;
            }
        },
        grid: { left: 120, right: 40, top: 60, bottom: 40 },
        xAxis: {
            type: "value",
            min: Math.max(0, minStart - padding),
            max: maxEnd + padding,
            axisLabel: {
                formatter: function (v) {
                    const h = Math.floor(v / 3600);
                    const m = Math.floor((v % 3600) / 60);
                    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                }
            },
            name: "Saat (HH:mm)",
            nameLocation: "middle",
            nameGap: 30
        },
        yAxis: {
            type: "category",
            data: categories,
            inverse: true,
            axisLabel: { interval: 0 }
        },
        series: [
			// 🔘 Offset (transparent, sadece stack başlangıcı)
			{
				name: "Offset",
				type: "bar",
				stack: "time",
				itemStyle: { color: "transparent" },
				data: tanimStartSecs.map((v) => v),
				z: 1
			},
			// 🔴 Gecikme barı
			{
				name: "Delay",
				type: "bar",
				stack: "time",
				barWidth: 18,
				data: startSecs.map((start, i) => ({
					value: start - tanimStartSecs[i],
					itemStyle: { color: (start - tanimStartSecs[i]) > 0 ? "#E53935" : "transparent" },
					jobIndex: i
				})),
				z: 2
			},
			// 🟩 İşin asıl süresi
			{
				name: "Duration",
				type: "bar",
				stack: "time",
				barWidth: 18,
				data: durations.map((v, i) => ({
					value: v,
					jobIndex: i
				})),
				itemStyle: { color: "#43A047" },
				label: {
					show: true,
					position: "insideRight",
					formatter: (p) => `${durations[p.dataIndex]}s`,
					color: "#fff",
					fontSize: 11
				},
				z: 3
			}
		]
    };

    myChart.setOption(option);
    myChart.resize();

    console.log("[timeline-chart-critical-chain] Chart çizildi. Zincir uzunluğu:", chain.length);
}
