document.addEventListener('DOMContentLoaded', () => {

    const loaderOverlay = document.getElementById('loader-overlay');
    const stationListContainer = document.getElementById('station-list');
    const searchBar = document.getElementById('search-bar');

    let allStations = [];

    // =========================
    // LOAD DATA
    // =========================
    function loadLocalData() {
        loaderOverlay.style.display = 'flex';

        Papa.parse('predictions.csv', {
            download: true,
            header: true,
            skipEmptyLines: true,

            complete: (results) => {
                allStations = results.data;
                renderStations(allStations);
                loaderOverlay.style.display = 'none';
            },

            error: () => {
                stationListContainer.innerHTML = `<p>Error loading data</p>`;
                loaderOverlay.style.display = 'none';
            }
        });
    }

    // =========================
    // RENDER CARDS
    // =========================
    function renderStations(data) {

        stationListContainer.innerHTML = '';

        if (data.length === 0) {
            stationListContainer.innerHTML = `<p>No data found</p>`;
            return;
        }

        data.forEach((station, index) => {

            const card = document.createElement('div');
            card.className = 'station-card';

            const predicted = parseFloat(station.Predicted_May_2026);
            const accuracy = parseFloat(station.Accuracy);

            // ALERT SYSTEM
            let alertMsg = '';
            if (!isNaN(predicted)) {
                if (predicted > 30) {
                    alertMsg = `<p style="color:red;">⚠ High Water Level</p>`;
                } else if (predicted < 10) {
                    alertMsg = `<p style="color:orange;">⚠ Low Water Level</p>`;
                }
            }

            const chartId = `chart-${index}`;

            card.innerHTML = `
                <div class="card-content">
                    ${alertMsg}

                    <div class="card-header">
                        <h3>${station.station_name || 'N/A'}</h3>
                        <p>${station.district || 'N/A'}</p>
                        <p>Population: ${station.population || 'N/A'}</p>
                        <p>Accuracy: ${!isNaN(accuracy) ? (accuracy * 100).toFixed(2) + '%' : 'N/A'}</p>
                    </div>

                    <div class="card-body">
                        <div>
                            <p class="label">February</p>
                            <p class="value">${station.level_feb_2026 || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="label">March</p>
                            <p class="value">${station.level_mar_2026 || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="label">April</p>
                            <p class="value">${station.level_apr_2026 || 'N/A'}</p>
                        </div>
                    </div>

                    <div class="prediction-section">
                        <p class="label">Predicted (May 2026)</p>
                        <p class="value">
                            ${!isNaN(predicted) ? predicted.toFixed(2) : 'N/A'}
                        </p>
                    </div>

                    <canvas id="${chartId}" height="120"></canvas>
                </div>
            `;

            stationListContainer.appendChild(card);

            // DRAW GRAPH
            drawChart(chartId, station);
        });
    }

    // =========================
    // DRAW GRAPH
    // =========================
    function drawChart(chartId, station) {

        const ctx = document.getElementById(chartId);

        if (!ctx) return;

        const data = [
            parseFloat(station.level_feb_2026),
            parseFloat(station.level_mar_2026),
            parseFloat(station.level_apr_2026),
            parseFloat(station.Predicted_May_2026)
        ];

        if (data.some(isNaN)) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Feb', 'Mar', 'Apr', 'Predicted'],
                datasets: [{
                    label: 'Water Level',
                    data: data,
                    fill: false,
                    tension: 0.3
                }]
            }
        });
    }

    // =========================
    // SEARCH
    // =========================
    searchBar.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();

        const filtered = allStations.filter(station =>
            (station.station_name || '').toLowerCase().includes(term) ||
            (station.district || '').toLowerCase().includes(term)
        );

        renderStations(filtered);
    });

    // =========================
    // INIT
    // =========================
    loadLocalData();
});