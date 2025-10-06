// chart4.js — robust graph renderer (uses ECharts graph series)
console.log("[Chart4] Script yüklendi, listener kuruluyor.");

// helper: esnek dependency key okuma (OnSart, OnStart, onstart, ...)
function getDeps(job) {
  if (!job || typeof job !== 'object') return [];
  // try common keys first
  const checkKeys = ['OnSart','OnStart','onsart','onstart','ONSART','ONSTART'];
  for (let k of checkKeys) {
    if (k in job) {
      const v = job[k];
      return Array.isArray(v) ? v : (v ? [v] : []);
    }
  }
  // fallback: find any key that contains 'on' and 's' or 'start' substring
  for (let k of Object.keys(job)) {
    const kl = k.toLowerCase();
    if (kl.includes('on') && (kl.includes('sart') || kl.includes('start'))) {
      const v = job[k];
      return Array.isArray(v) ? v : (v ? [v] : []);
    }
  }
  return [];
}

// main render function (keeps chart pattern like chart1)a// chart4.js — robust graph renderer (uses ECharts graph series)
console.log("[Chart4] Script yüklendi, listener kuruluyor.");

// helper: esnek dependency key okuma
function getDeps(job) {
  if (!job || typeof job !== 'object') return [];
  const checkKeys = ['OnSart','OnStart','onsart','onstart','ONSART','ONSTART'];
  for (let k of checkKeys) {
    if (k in job) {
      const v = job[k];
      return Array.isArray(v) ? v : (v ? [v] : []);
    }
  }
  for (let k of Object.keys(job)) {
    const kl = k.toLowerCase();
    if (kl.includes('on') && (kl.includes('sart') || kl.includes('start'))) {
      const v = job[k];
      return Array.isArray(v) ? v : (v ? [v] : []);
    }
  }
  return [];
}

// main render function
console.log("[Chart4] event listener kuruluyor.");
document.addEventListener('globalDataUpdated', function(e) {
  console.log("[Chart4] globalDataUpdated event yakalandı. Eleman sayısı:", e.detail?.length || 0);
  renderChart4(e.detail || []);
});

if (window.globalData && Array.isArray(window.globalData) && window.globalData.length) {
  console.log("[Chart4] globalData zaten var. Eleman sayısı:", window.globalData.length);
  renderChart4(window.globalData);
}

function renderChart4(data) {
  console.log("[Chart4] renderChart4 çağrıldı. data.length=", data.length);

  if (!data || data.length === 0) {
    console.warn("[Chart4] Veri yok, çizilmeyecek.");
    return;
  }

  const chartDom = document.getElementById('chart4');
  if (!chartDom) {
    console.error("[Chart4] chart4 div bulunamadı!");
    return;
  }

  // 1) nodeMap oluştur
  const nodeMap = new Map();
  data.forEach(d => {
    if (!d || !d.JOBNAME) return;
    const id = String(d.JOBNAME);
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { name: id, symbolSize: 8, value: id });
    }
  });

  // 2) edges oluştur
  const rawEdges = [];
  for (const job of data) {
    if (!job || !job.JOBNAME) continue;
    const target = String(job.JOBNAME);
    const deps = getDeps(job);
    if (!deps || deps.length === 0) continue;
    deps.forEach(dep => {
      if (!dep) return;
      const source = String(dep);
      if (!nodeMap.has(source)) {
        nodeMap.set(source, { name: source, symbolSize: 6, value: source, itemStyle: { color: '#999' } });
      }
      rawEdges.push({ source: source, target: target });
    });
  }

  console.log("[Chart4] raw nodes:", nodeMap.size, " raw edges:", rawEdges.length);

  const finalNodes = Array.from(nodeMap.values());
  const finalEdges = rawEdges.filter(e => nodeMap.has(e.source) && nodeMap.has(e.target));

  console.log("[Chart4] Final nodes:", finalNodes.length, " Final edges:", finalEdges.length);

  // 5) prepare echarts instance
  let myChart = echarts.getInstanceByDom(chartDom);
  if (!myChart) {
    myChart = echarts.init(chartDom, 'dark');
  } else {
    myChart.clear();
  }

  const showLabels = finalNodes.length <= 1000;

  const option = {
    tooltip: {
      formatter: function (params) {
        if (params.dataType === 'node') return `Job: ${params.data.name}`;
        return `Edge: ${params.data.source} → ${params.data.target}`;
      }
    },
    series: [{
      name: 'Job Dependency Graph',
      type: 'graph',
      layout: 'force',
      roam: true,
      focusNodeAdjacency: true,
      large: finalNodes.length > 2000,
      largeThreshold: 2000,
      data: finalNodes,
      links: finalEdges,
      label: { show: showLabels, position: 'right', formatter: '{b}' },
      lineStyle: { color: 'rgba(200,200,200,0.6)' },
      force: {
        repulsion: 30,
        edgeLength: [10, 50],
        layoutAnimation: false, // animation kapalı
      }
    }]
  };

  myChart.setOption(option, true);

  // ---- layout tamamlandığında force'u durdur ----
  myChart.on('finished', function() {
    console.log("[Chart4] Layout tamamlandı, force durduruluyor.");
    finalNodes.forEach(n => n.fixed = true); // node pozisyonunu sabitle
    myChart.setOption({ series: [{ data: finalNodes }] });
  });

  console.log("[Chart4] Grafik çizildi, force tek seferlik.");
}

console.log("[Chart4] event listener kuruluyor.");
document.addEventListener('globalDataUpdated', function(e) {
  console.log("[Chart4] globalDataUpdated event yakalandı. Eleman sayısı:", e.detail?.length || 0);
  renderChart4(e.detail || []);
});

// if event already missed, but data exists, render immediately
if (window.globalData && Array.isArray(window.globalData) && window.globalData.length) {
  console.log("[Chart4] globalData zaten var. Eleman sayısı:", window.globalData.length);
  renderChart4(window.globalData);
}

function renderChart4(data) {
  console.log("[Chart4] renderChart4 çağrıldı. data.length=", data.length);

  if (!data || data.length === 0) {
    console.warn("[Chart4] Veri yok, çizilmeyecek.");
    return;
  }

  const chartDom = document.getElementById('chart4');
  if (!chartDom) {
    console.error("[Chart4] chart4 div bulunamadı!");
    return;
  }

  // 1) nodeMap oluştur (unique nodes)
  const nodeMap = new Map();
  data.forEach(d => {
    if (!d || !d.JOBNAME) return;
    const id = String(d.JOBNAME);
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { name: id, symbolSize: 8, value: id });
    }
  });

  // 2) edges oluştur ve dependency node'larını ekle (placeholder)
  const rawEdges = [];
  for (const job of data) {
    if (!job || !job.JOBNAME) continue;
    const target = String(job.JOBNAME);
    const deps = getDeps(job);
    if (!deps || deps.length === 0) continue;
    deps.forEach(dep => {
      if (dep == null) return;
      const source = String(dep);
      // ensure source node exists (placeholder if gerekirse)
      if (!nodeMap.has(source)) {
        nodeMap.set(source, { name: source, symbolSize: 6, value: source, itemStyle: { color: '#999' } });
      }
      rawEdges.push({ source: source, target: target });
    });
  }

  console.log("[Chart4] raw nodes:", nodeMap.size, " raw edges:", rawEdges.length);

  // 3) filter invalid edges (only keep those whose source & target exist in nodeMap)
  const validEdges = rawEdges.filter(e => nodeMap.has(e.source) && nodeMap.has(e.target));
  if (validEdges.length !== rawEdges.length) {
    console.log(`[Chart4] Filtered edges: kept ${validEdges.length} / ${rawEdges.length} (some referenced nodes missing)`);
  }

  // 4) perform size checks — çok büyük grafikte performans problemini azalt
  const NODE_THRESHOLD = 3000; // eşikler isteğe bağlı
  const EDGE_THRESHOLD = 8000;

  let finalNodes = Array.from(nodeMap.values());
  let finalEdges = validEdges;

  // reduce to connected subgraph if too large
  if (finalNodes.length > NODE_THRESHOLD || finalEdges.length > EDGE_THRESHOLD) {
    console.log("[Chart4] Büyük dataset algılandı. Sadece bağlantılı altgrafı alınıyor...");

    // hesapla node degree
    const deg = new Map();
    finalEdges.forEach(link => {
      deg.set(link.source, (deg.get(link.source) || 0) + 1);
      deg.set(link.target, (deg.get(link.target) || 0) + 1);
    });

    // keep nodes that have degree > 0 (involved in at least one link)
    const involvedNodes = new Set();
    finalEdges.forEach(l => { involvedNodes.add(l.source); involvedNodes.add(l.target); });

    let filteredNodes = finalNodes.filter(n => involvedNodes.has(n.name));
    let filteredEdges = finalEdges.filter(l => involvedNodes.has(l.source) && involvedNodes.has(l.target));

    console.log("[Chart4] involved nodes:", filteredNodes.length, "involved edges:", filteredEdges.length);

    // if still too large, keep top-K by degree
    if (filteredNodes.length > NODE_THRESHOLD) {
      const nodesByDegree = filteredNodes.map(n => ({n, d: deg.get(n.name) || 0}));
      nodesByDegree.sort((a,b)=>b.d - a.d);
      filteredNodes = nodesByDegree.slice(0, NODE_THRESHOLD).map(x => x.n);
      const keepSet = new Set(filteredNodes.map(n=>n.name));
      filteredEdges = filteredEdges.filter(l => keepSet.has(l.source) && keepSet.has(l.target));
      console.log("[Chart4] Top-K ile kırpıldı -> nodes:", filteredNodes.length, "edges:", filteredEdges.length);
    }

    finalNodes = filteredNodes;
    finalEdges = filteredEdges;
  }

  console.log("[Chart4] Final nodes:", finalNodes.length, " Final edges:", finalEdges.length);

  // 5) prepare echarts instance (reuse if exists)
  let myChart = echarts.getInstanceByDom(chartDom);
  if (!myChart) {
    myChart = echarts.init(chartDom, 'dark');
  } else {
    myChart.clear();
  }

  // label gösterimini kontrol et (çok fazla node varsa kapat)
  const showLabels = finalNodes.length <= 1000;

  const option = {
    tooltip: {
      formatter: function (params) {
        if (params.dataType === 'node') {
          return `Job: ${params.data.name}`;
        } else {
          return `Edge: ${params.data.source} → ${params.data.target}`;
        }
      }
    },
    series: [{
      name: 'Job Dependency Graph',
      type: 'graph',
      layout: 'force',
      roam: true,
      focusNodeAdjacency: true,
      large: finalNodes.length > 2000,         // büyük veri modu
      largeThreshold: 2000,
      data: finalNodes,
      links: finalEdges,
      label: { show: showLabels, position: 'right', formatter: '{b}' },
      force: {
        repulsion: 30,
        edgeLength: [10, 50]
      },
      lineStyle: { color: 'rgba(200,200,200,0.6)' },
      emphasis: { lineStyle: { width: 2 } }
    }]
  };

  // 6) draw
  try {
    myChart.setOption(option, true);
    console.log("[Chart4] Grafik çizildi.");
  } catch (err) {
    console.error("[Chart4] setOption hatası:", err);
    // fallback: küçük örnek göster
    chartDom.innerHTML = "<div style='color:yellow;padding:10px'>Grafik çizilemedi. Konsolu kontrol et.</div>";
  }
}
