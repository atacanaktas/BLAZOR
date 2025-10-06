console.log("[DataGrid] Script yüklendi, event listener kuruluyor.");

let currentPage = 1;
const pageSize = 50;
let jobData = [];

// Tablo render fonksiyonu
function renderTablePage(page) {
    const tbody = document.getElementById('jobTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageData = jobData.slice(start, end);

    pageData.forEach((job, index) => {
        // Ana satır
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <button class="btn btn-sm btn-outline-secondary toggle-detail" 
                        data-index="${index}">
                    ▼
                </button>
            </td>
            <td>${job.JOBNAME}</td>
            <td>${job.START_TIME}</td>
            <td>${job.ELAPSED_TIME}</td>
            <td>${job.TOT_SERV_UNIT}</td>
        `;
        tbody.appendChild(tr);

        // Detay satırı (başlangıçta gizli)
        const detailTr = document.createElement('tr');
        detailTr.classList.add('detail-row');
        detailTr.style.display = 'none';
        detailTr.id = `detail-${index}`;
        detailTr.innerHTML = `
            <td colspan="5">
                <pre style="margin:0;">${JSON.stringify(job, null, 2)}</pre>
            </td>
        `;
        tbody.appendChild(detailTr);
    });

    // Toggle butonlarını ata
    tbody.querySelectorAll('.toggle-detail').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = this.dataset.index;
            const detailRow = document.getElementById(`detail-${idx}`);
            if (detailRow.style.display === 'none') {
                detailRow.style.display = '';
                this.textContent = '▲';
            } else {
                detailRow.style.display = 'none';
                this.textContent = '▼';
            }
        });
    });

    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Sayfa ${page} / ${Math.ceil(jobData.length / pageSize)}`;
    }
}

// Sayfa butonları
function setupPaginationButtons() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTablePage(currentPage);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < Math.ceil(jobData.length / pageSize)) {
                currentPage++;
                renderTablePage(currentPage);
            }
        });
    }
}

// dataLoaded eventini dinle
document.addEventListener('dataLoaded', e => {
    console.log("[DataGrid] dataLoaded event yakalandı. Data sayısı:", e.detail.length);
    jobData = e.detail;
    currentPage = 1;
    renderTablePage(currentPage);
    setupPaginationButtons();
});
