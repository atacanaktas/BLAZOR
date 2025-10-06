console.log("[timeline-job-dependency-list] Script yüklendi, event listener kuruluyor.");

document.addEventListener("globalDataUpdated", function (e) {
    console.log("[timeline-job-dependency-list] globalDataUpdated event yakalandı. Data sayısı:", e.detail.length);
    renderJobDependencyList(e.detail);
});

function renderJobDependencyList(data) {
    console.log("[timeline-job-dependency-list] Çizim için hazırlanıyor. Data uzunluğu:", data.length);

    const container = document.getElementById("timeline-job-dependency-list");
    if (!container) {
        console.error("[timeline-job-dependency-list] DOM elementi bulunamadı!");
        return;
    }

    container.innerHTML = ""; // temizle

    if (!data || data.length === 0) {
        container.innerHTML = "<div class='text-muted p-3'>Veri yok</div>";
        return;
    }

    // Job lookup tablosu
    const jobMap = new Map();
    data.forEach(j => jobMap.set(j.JOBNAME, j));

    // Job düğmesi oluşturucu (recursive)
    function createJobButton(jobName, level = 0, autoExpand = false) {
        const job = jobMap.get(jobName);
        if (!job) return document.createTextNode(`(Bilinmeyen job: ${jobName})`);

        const wrapper = document.createElement("div");
        wrapper.classList.add("d-flex", "flex-column");
        wrapper.style.marginLeft = `${level * 30}px`;

        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary btn-sm text-start mb-1";
        btn.style.width = "fit-content";
        btn.innerText = jobName;

        const childContainer = document.createElement("div");
        childContainer.className = "ms-3 mt-1";
        childContainer.style.display = "none";

        // bağımlılıkları çizdirme fonksiyonu
        function expandDependencies() {
            if (childContainer.childElementCount === 0 && job.OnSart?.length > 0) {
                job.OnSart.forEach(dep => {
                    const child = createJobButton(dep, level + 1, true); // recursive expand
                    childContainer.appendChild(child);
                });
            }
            childContainer.style.display = "block";
        }

        btn.addEventListener("click", () => {
            const visible = childContainer.style.display === "block";
            if (visible) {
                childContainer.style.display = "none";
            } else {
                expandDependencies();
            }
        });

        // Eğer otomatik genişletme aktifse, direk aç
        if (autoExpand && job.OnSart?.length > 0) {
            expandDependencies();
        }

        wrapper.appendChild(btn);
        wrapper.appendChild(childContainer);
        return wrapper;
    }

    // Bağımsız (root) job'ları bul
    const allDependencies = new Set(data.flatMap(j => j.OnSart || []));
    const rootJobs = data.filter(j => !allDependencies.has(j.JOBNAME));

    // Kökleri render et
    rootJobs.forEach(root => {
        const jobBtn = createJobButton(root.JOBNAME);
        container.appendChild(jobBtn);
    });

    console.log("[timeline-job-dependency-list] Render tamamlandı. Kök iş sayısı:", rootJobs.length);
}
