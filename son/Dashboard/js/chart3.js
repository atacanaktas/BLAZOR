console.log("[Chart3] Job count over time script yüklendi.");

document.addEventListener('globalDataUpdated', function(e) {
    console.log("[Chart3] globalDataUpdated event yakalandı. Eleman sayısı:", e.detail.length);
    renderChart3(e.detail);
});

function renderChart3(data) {
    console.log("[Chart3] Çizim hazırlanıyor. Data uzunluğu:", data.length);
    if (!data || data.length === 0) return;

    var chartDom = document.getElementById('chart3');
    var myChart = echarts.init(chartDom, 'dark');

    // Zaman bucket’ları (5 dk)
    var bucketSizeMin = 5;
    var startTime = new Date("2025-01-01 00:00:00").getTime();
    var endTime = new Date("2025-01-01 12:00:00").getTime();
    var buckets = [];
    for (var t = startTime; t <= endTime; t += bucketSizeMin*60*1000) {
        buckets.push(t);
    }

    // Her bucket için çalışan job sayısını hesapla
    var jobCounts = buckets.map(bucketStart => {
        var count = data.filter(d => {
            var jobStart = new Date("2025-01-01 " + d.START_TIME).getTime();
            var jobEnd = new Date("2025-01-01 " + d.END_TIME).getTime();
            return jobStart < bucketStart + bucketSizeMin*60*1000 && jobEnd > bucketStart;
        }).length;
        return count;
    });

    var option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                var idx = params[0].dataIndex;
                return "Zaman: " + new Date(buckets[idx]).toLocaleTimeString() +
                       "<br/>Çalışan Job Sayısı: " + params[0].value;
            }
        },
        xAxis: {
            type: 'category',
            data: buckets.map(t => new Date(t).toLocaleTimeString()),
            name: 'Saat'
        },
        yAxis: {
            type: 'value',
            name: 'Çalışan Job Sayısı'
        },
        series: [{
            data: jobCounts,
            type: 'line',
            smooth: true,
            lineStyle: { color: '#3BA272' },
            areaStyle: { color: 'rgba(59, 162, 114, 0.3)' }
        }],
        grid: { containLabel: true, left: 60, right: 50, top: 30, bottom: 50 }
    };

    myChart.setOption(option);
    console.log("[Chart3] Job count çizildi. Max:", Math.max(...jobCounts));
}
