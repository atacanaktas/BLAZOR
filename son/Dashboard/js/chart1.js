console.log("[Chart1] Script yüklendi, event listener kuruluyor.");

document.addEventListener('globalDataUpdated', function(e) {
    console.log("[Chart1] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderChart1(e.detail);
});

function renderChart1(data) {
    console.log("[Chart1] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[Chart1] Veri yok, grafik çizilmeyecek.");
        return;
    }

    var chartDom = document.getElementById('chart1');
    var myChart = echarts.init(chartDom, 'dark');

    var categories = data.map(d => d.JOBNAME);
    var seriesData = data.map((d, idx) => {
        var start = new Date("2025-01-01 " + d.START_TIME).getTime();
        var end = new Date("2025-01-01 " + d.END_TIME).getTime();
        return [idx, start, end, d.JOBNAME];
    });

    console.log("[Chart1] Series data hazırlanıyor, length:", seriesData.length);

    var option = {
        tooltip: {
            formatter: function(params) {
                var d = params.value;
                return d[3] + "<br/>Başlangıç: " + new Date(d[1]).toLocaleTimeString() +
                       "<br/>Bitiş: " + new Date(d[2]).toLocaleTimeString();
            }
        },
        dataZoom: [
            { type: "slider", yAxisIndex: 0, start: 0, end: 100 },
            { type: "slider", xAxisIndex: 0, start: 0, end: 100 }
        ],
        grid: { containLabel: true, left: 150 },
        xAxis: { type: "time" },
        yAxis: { type: "category", data: categories, inverse: true },
        series: [
            {
                name: "Job Süreleri",
                type: "custom",
                renderItem: function(params, api) {
                    var categoryIndex = api.value(0);
                    var start = api.coord([api.value(1), categoryIndex]);
                    var end = api.coord([api.value(2), categoryIndex]);
                    var height = api.size([0,1])[1]*0.6;
                    return {
                        type: "rect",
                        shape: { x:start[0], y:start[1]-height/2, width:end[0]-start[0], height:height },
                        style: api.style({ fill:"#3BA272" })
                    };
                },
                encode: { x:[1,2], y:0 },
                data: seriesData
            }
        ]
    };

    myChart.setOption(option);
    console.log("[Chart1] Grafik çizildi.");
}
