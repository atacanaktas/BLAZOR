console.log("[Chart5] Script yüklendi, event listener kuruluyor.");

document.addEventListener('globalDataUpdated', function(e) {
    console.log("[Chart5] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderChart5(e.detail);
});

function renderChart5(data) {
    console.log("[Chart5] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[Chart5] Veri yok, grafik çizilmeyecek.");
        return;
    }

    // 🔹 Önce toplam CPU hesapla
    var totalCpu = data.reduce((sum, d) => sum + (d.CPU_SERV_UNIT || 0), 0);
    if (totalCpu === 0) {
        console.warn("[Chart5] Toplam CPU = 0, normalize edilemiyor.");
        return;
    }

    // 🔹 Dakika bazlı timeline için dictionary
    var timeline = {};

    data.forEach(d => {
        var start = new Date("2025-01-01 " + d.START_TIME);
        var end = new Date("2025-01-01 " + d.END_TIME);
        var cpu = d.CPU_SERV_UNIT || 0;

        var elapsedMinutes = Math.max(1, Math.round((end - start) / 60000));
        var perMinute = cpu / elapsedMinutes;

        // job’un çalıştığı her dakikaya CPU paylaştır
        for (var t = new Date(start); t <= end; t.setMinutes(t.getMinutes() + 1)) {
            var key = t.getHours().toString().padStart(2, '0') + ":" +
                      t.getMinutes().toString().padStart(2, '0');
            if (!timeline[key]) timeline[key] = 0;
            timeline[key] += perMinute;
        }
    });

    // 🔹 Normalize et (%CPU olarak)
    var cpuData = Object.keys(timeline).sort().map(k => {
        return { time: k, cpu: (timeline[k] / totalCpu) * 100 };
    });

    console.log("[Chart5] Normalize edilmiş CPU data hazır:", cpuData.length, "nokta");

    var chartDom = document.getElementById('chart5');
    var myChart = echarts.init(chartDom, 'dark');

    var option = {
        title: {
            text: 'Gece Batch CPU Kullanımı (Normalize %)',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                var item = params[0];
                return item.axisValue + "<br/>CPU: " + item.data.toFixed(4) + "%";
            }
        },
        xAxis: {
            type: 'category',
            data: cpuData.map(d => d.time),
            boundaryGap: false,
            name: 'Zaman'
        },
        yAxis: {
            type: 'value',
            name: '% CPU',
            min: 0,
            max: 100
        },
        series: [
            {
                name: 'CPU (%)',
                type: 'line',
                data: cpuData.map(d => d.cpu),
                smooth: true,
                lineStyle: { width: 2 },
                areaStyle: {},   // area chart efekti
                itemStyle: { color: '#EE6666' }
            }
        ]
    };

    myChart.setOption(option);
    console.log("[Chart5] Grafik çizildi.");
}
