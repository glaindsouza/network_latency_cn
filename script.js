let ctx = document.getElementById('latencyChart').getContext('2d');
let chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Latency (ms)',
            data: [],
            borderColor: 'blue',
            fill: false,
            tension: 0.3
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

let hostInput = document.getElementById("host");
let status = document.getElementById("status");

function fetchPing() {
    const host = hostInput.value;
    if (!host) return;

    fetch("/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host })
    })
    .then(res => res.json())
    .then(data => {
        if (data.rtt !== undefined) {
            status.innerText = `Latest latency for ${host}: ${data.rtt} ms`;
        } else {
            status.innerText = `Ping failed for ${host}`;
        }

        // Update table
        const tbody = document.querySelector("#pingTable tbody");
        tbody.innerHTML = "";
        data.history.forEach(item => {
            let row = `<tr><td>${item.time}</td><td>${item.host}</td><td>${item.rtt !== null ? item.rtt : 'Failed'}</td></tr>`;
            tbody.innerHTML += row;
        });

        // Update chart
        chart.data.labels = data.history.map(item => item.time);
        chart.data.datasets[0].data = data.history.map(item => item.rtt || 0);
        chart.update();
    })
    .catch(err => {
        status.innerText = "Error connecting to server";
        console.error(err);
    });
}

// Auto ping every 5 seconds
setInterval(fetchPing, 5000);
