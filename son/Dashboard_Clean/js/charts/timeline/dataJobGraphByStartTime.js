// dataJobGraphByStartTime.js
console.log("[graph-chart-jobs-by-time] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[graph-chart-jobs-by-time] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderJobGraphByStartTime(e.detail);
});

function renderJobGraphByStartTime(data) {
    console.log("[graph-chart-jobs-by-time] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    if (!data || data.length === 0) {
        console.warn("[graph-chart-jobs-by-time] Veri yok, chart çizilmeyecek.");
        return;
    }

    // Container kontrolü
    const chartDom = document.getElementById("graph-chart-jobs-by-time");
    if (!chartDom) {
        console.error("[graph-chart-jobs-by-time] Container bulunamadı: graph-chart-jobs-by-time");
        return;
    }

    try {
        // ---------- Ayarlar ----------
        const paddingY = 80;           // üstten/alttan boşluk
        const symbolMin = 8;
        const symbolMax = 25;
        const symbolScaleDiv = 3000;

        // Container boyutları
        const rect = chartDom.getBoundingClientRect();
        const domWidth = Math.max(600, rect.width || 1000);
        const domHeight = Math.max(400, rect.height || 800);
        const usableHeight = Math.max(200, domHeight - paddingY * 2);

        // HELPERS
        function parseTimeToMinutes(timeStr) {
            if (!timeStr) return 0;
            const parts = timeStr.split(":").map(Number);
            if (parts.length < 2) return 0;
            const [h, m, s = 0] = parts;
            return h * 60 + m + s / 60;
        }

        // Start time'a göre sırala (önce olan yukarıda)
        const jobs = data.map(j => ({ 
            ...j, 
            StartMinutes: parseTimeToMinutes(j.START_TIME) 
        })).sort((a, b) => a.StartMinutes - b.StartMinutes);

        // Y ekseni için min/max değerleri bul
        const startVals = jobs.map(j => j.StartMinutes);
        const minStart = Math.min(...startVals);
        const maxStart = Math.max(...startVals);

        // Y pozisyonunu hesapla (START_TIME'a göre)
        function mapStartToY(startMin) {
            if (maxStart === minStart) return paddingY + usableHeight / 2;
            const norm = (startMin - minStart) / (maxStart - minStart); // 0..1
            // Yukarıda erken zamanlar olacak şekilde ters çevir
            return -1 * Math.round(paddingY + (1 - norm) * usableHeight);
        }

        // İlk node'ları oluştur (Y sabit, X rastgele başlangıç)
        const nodes = [];
        const idToIndex = {};
        
        jobs.forEach((job, index) => {
            const size = 6;
            
            // Y pozisyonu START_TIME'a göre kesinlikle sabit
            const fixedY = mapStartToY(job.StartMinutes);
            
            // X pozisyonu başlangıçta rastgele (sonra force layout optimize edecek)
            const initialX = 100 + Math.random() * (domWidth - 200);
            
            nodes.push({
                id: job.JOBNAME,
                name: job.JOBNAME,
                x: initialX,
                y: fixedY, // Y KESİNLİKLE SABİT - START_TIME'a göre
                fixed: true, // Y eksenini sabitle
                symbolSize: size,
                value: 0,
                itemStyle: {
                    color: "#2673c9"
                },
                label: {
                    show: true,
                    position: 'right',
                    fontSize: 10
                },
                tooltip: {
                    formatter: `<b>${job.JOBNAME}</b><br>
                               Start: ${job.START_TIME}<br>
                               Elapsed: ${job.ELAPSED_TIME}s`
                }
            });
            
            idToIndex[job.JOBNAME] = index;
        });

        // Edges (bağlantıları) oluştur
        const edges = [];
        jobs.forEach(job => {
            const deps = Array.isArray(job.OnSart) ? job.OnSart : 
                        (Array.isArray(job.OnStart) ? job.OnStart : []);
            
            deps.forEach(dep => {
                if (idToIndex[dep] !== undefined) {
                    edges.push({
                        source: dep,
                        target: job.JOBNAME,
                        lineStyle: {
                            color: '#aaa',
                            width: 1.5,
                            curveness: 0.1
                        }
                    });
                }
            });
        });

        console.log("[graph-chart-jobs-by-time] Layout hesaplandı. nodes:", nodes.length, "edges:", edges.length);

        // ECharts option'ı oluştur - ÖZEL FORCE LAYOUT ile
        const myChart = echarts.init(chartDom);
        const option = {
            title: {
                text: 'Job Graph - Y Ekseni: START_TIME (kesin sıralı), X Ekseni: Bağlantı Optimize',
                left: 'center',
                textStyle: {
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'item'
            },
            animation: false,
            series: [{
                type: 'graph',
                layout: 'force',
                force: {
                    // X ekseni için optimizasyon
                    repulsion: 100,
                    gravity: 0.1,
                    edgeLength: 50,
                    layoutAnimation: false,
                    
                    // Y EKSENİNİ SABİT TUTMAK İÇİN ÖZEL AYARLAR
                    friction: 0.6,
                    
                    // Y ekseni için kuvveti kapat, sadece X ekseninde hareket etsin
                    y: 0, // Y ekseninde kuvvet yok
                    x: 1, // X ekseninde kuvvet var
                    
                    // Bağlantıların ideal uzunluğu
                    edgeLength: [50, 150],
                    
                    // İterasyon sayısını artır
                    initLayout: null
                },
                data: nodes,
                links: edges,
                roam: true,
                focusNodeAdjacency: true,
                edgeSymbol: ['none', 'arrow'],
                edgeSymbolSize: 6,
                lineStyle: {
                    color: 'source',
                    curveness: 0.1,
                    width: 1.2,
                    opacity: 0.7
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 2.5,
                        opacity: 1
                    }
                },
                label: {
                    show: true,
                    position: 'right',
                    fontSize: 9,
                    formatter: '{b}'
                },
                draggable: true
            }],
            grid: {
                left: '5%',
                right: '5%',
                top: '15%',
                bottom: '5%'
            }
        };

        myChart.setOption(option);

        /*// Y ekseni etiketleri için ek series (START_TIME gösterimi)
        const yAxisLabels = [];
        const uniqueTimes = [...new Set(jobs.map(j => j.START_TIME))].sort((a, b) => 
            parseTimeToMinutes(a) - parseTimeToMinutes(b)
        );
        
        uniqueTimes.forEach(time => {
            const yPos = mapStartToY(parseTimeToMinutes(time));
            yAxisLabels.push({
                name: time,
                x: 20,
                y: yPos,
                itemStyle: { color: 'transparent' },
                label: {
                    show: true,
                    fontSize: 10,
                    color: '#666',
                    position: 'left'
                }
            });
        });

        // Y ekseni etiketlerini ekle
        myChart.setOption({
            series: [
                option.series[0],
                {
                    type: 'graph',
                    layout: 'none',
                    data: yAxisLabels,
                    silent: true,
                    tooltip: { show: false },
                    label: { show: true }
                }
            ]
        });*/

        // Responsive davranış
        window.addEventListener('resize', function() {
            myChart.resize();
        });

        console.log("[graph-chart-jobs-by-time] Custom force layout graph chart çizildi.");

    } catch (error) {
        console.error("[graph-chart-jobs-by-time] Chart oluşturulurken hata:", error);
    }
}