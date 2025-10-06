console.log("[Chart2] CPU vs Zaman vs Elapsed Time heatmap script yüklendi.");

document.addEventListener('globalDataUpdated', function(e) {
    console.log("[Chart2] globalDataUpdated event yakalandı. Eleman sayısı:", e.detail.length);
    renderChart2(e.detail);
});

function renderChart2(data) {
    console.log("[Chart2] Heatmap çizimi hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) return;

    var chartDom = document.getElementById('chart2');
    var myChart = echarts.init(chartDom, 'dark');

    // Zaman bucket’ları (5 dk)
    var bucketSizeMin = 5;
    var startTime = new Date("2025-01-01 00:00:00").getTime();
    var endTime = new Date("2025-01-01 12:00:00").getTime();
    var buckets = [];
    for (var t = startTime; t <= endTime; t += bucketSizeMin*60*1000) {
        buckets.push(t);
    }

    // Heatmap data: [bucketIdx, CPU_SERV_UNIT, ELAPSED_TIME]
    var heatmapData = [];
    buckets.forEach((bucketStart, bucketIdx) => {
        data.forEach(d => {
            var jobStart = new Date("2025-01-01 " + d.START_TIME).getTime();
            var jobEnd = new Date("2025-01-01 " + d.END_TIME).getTime();
            if (jobStart < bucketStart + bucketSizeMin*60*1000 && jobEnd > bucketStart) {
                heatmapData.push([bucketIdx, d.CPU_SERV_UNIT, d.ELAPSED_TIME]);
            }
        });
    });

    var maxElapsed = Math.max(...heatmapData.map(d=>d[2]));

    var option = {
        tooltip: {
            formatter: function(params) {
                var bucketIdx = params.value[0];
                var cpu = params.value[1];
                var elapsed = params.value[2];
                return "Zaman: " + new Date(buckets[bucketIdx]).toLocaleTimeString() +
                       "<br/>CPU: " + cpu +
                       "<br/>Elapsed: " + elapsed + " sn";
            }
        },
        grid: { containLabel: true, left: 60, right: 50, top: 30, bottom: 50 },
        xAxis: {
            type: 'category',
            data: buckets.map(t => new Date(t).toLocaleTimeString()),
            name: 'Zaman'
        },
        yAxis: {
            type: 'value',
            name: 'CPU Usage'
        },
        visualMap: {
            min: 0,
            max: maxElapsed,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: 10,
            inRange: { color: ['#313695', '#74add1', '#fdae61', '#a50026'] } // mavi → kırmızı
        },
        series: [{
            name: 'Job CPU vs Time',
            type: 'heatmap',
            data: heatmapData,
            progressive: 5000,
            progressiveThreshold: 5000
        }]
    };

    myChart.setOption(option);
    console.log("[Chart2] Heatmap çizildi. Data points:", heatmapData.length);
}
