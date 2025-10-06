console.log("[Chart6] Script yüklendi, event listener kuruluyor.");

document.addEventListener('dataLoaded', function(e) {
    console.log("[Chart6] dataLoaded event yakalandı. Data sayısı:", e.detail.length);
    renderChart6(e.detail);
});

function renderChart6(data) {
    if (!data || data.length === 0) {
        console.warn("[Chart6] Veri yok, grafik çizilmeyecek.");
        return;
    }

    // En uzun 20 işi al
    const topJobs = [...data]
        .filter(d => d.ELAPSED_TIME !== undefined && !isNaN(d.ELAPSED_TIME))
        .sort((a, b) => b.ELAPSED_TIME - a.ELAPSED_TIME)
        .slice(0, 20);

    const categories = topJobs.map(d => d.JOBNAME || d.JOBID);
    const values = topJobs.map(d => d.ELAPSED_TIME);

    const chartDom = document.getElementById('chart6');
    const myChart = echarts.init(chartDom, 'dark');

    const option = {
        title: {
            text: 'En Uzun Süreli 20 İş',
            left: 'center',
            textStyle: { fontSize: 16 }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: params => {
                const d = params[0];
                return `${d.name}<br/>Süre: ${d.value} sn`;
            }
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '15%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                rotate: 45,
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            name: 'Süre (sn)'
        },
        series: [
            {
                name: 'Süre',
                type: 'bar',
                data: values,
                itemStyle: {
                    color: '#3BA272'
                },
                label: {
                    show: true,
                    position: 'top', // bar üstünde göster
                    formatter: '{c} sn',
                    fontSize: 10,
                    color: '#fff'
                },
                emphasis: {
                    focus: 'series'
                }
            }
        ]
    };

    myChart.setOption(option);
    console.log("[Chart6] Grafik çizildi (dikey bar).");
}
