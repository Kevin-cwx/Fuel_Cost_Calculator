const apiKey = 'a6a33d0e62e34ba687839d9506d7a74a'; 
let startCoord = null, endCoord = null;
let map, markers = [];

window.onload = () => {
    setupAutocomplete("Start_Location", (lat, lon) => {
        startCoord = [lat, lon];
        updateMarkers();
    });

    setupAutocomplete("End_Location", (lat, lon) => {
        endCoord = [lat, lon];
        updateMarkers();
    });

    initMap();
};

function setupAutocomplete(inputId, onSelectCallback) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(`${inputId}_suggestions`);

    input.addEventListener("input", debounce(async () => {
        const q = input.value;
        if (!q.trim()) {
            container.innerHTML = '';
            return;
        }

        const res = await axios.get("https://api.geoapify.com/v1/geocode/autocomplete", {
            params: {
                text: q,
                apiKey,
                limit: 5,
                lang: "en",
                bias: "proximity:12.1696,-68.99"
            }
        });

        container.innerHTML = '';
        res.data.features.forEach((f) => {
            const fullText = f.properties.formatted;
            const matchIndex = fullText.toLowerCase().indexOf(q.toLowerCase());
            const before = fullText.slice(0, matchIndex);
            const match = fullText.slice(matchIndex, matchIndex + q.length);
            const after = fullText.slice(matchIndex + q.length);

            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.innerHTML = `${before}<span class="bold-match">${match}</span>${after}`;
            div.addEventListener("click", () => {
                input.value = fullText;
                container.innerHTML = '';
                onSelectCallback(f.properties.lat, f.properties.lon);
            });
            container.appendChild(div);
        });
    }, 300));

    document.addEventListener("click", (e) => {
        if (!container.contains(e.target) && e.target !== input) {
            container.innerHTML = '';
        }
    });
}

function initMap() {
    map = L.map('map').setView([37.8, -96], 4);
    L.tileLayer(`https://maps.geoapify.com/v1/tile/osm/{z}/{x}/{y}.png?apiKey=${apiKey}`, {
        maxZoom: 19
    }).addTo(map);
}

async function updateMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    if (startCoord) {
        markers.push(L.marker(startCoord).addTo(map).bindPopup("Start").openPopup());
    }
    if (endCoord) {
        markers.push(L.marker(endCoord).addTo(map).bindPopup("End").openPopup());
    }
    if (startCoord && endCoord) {
        map.fitBounds([startCoord, endCoord], { padding: [50, 50] });

        const routeRes = await axios.get("https://api.geoapify.com/v1/routing", {
            params: {
                waypoints: `lon:${startCoord[1]},lat:${startCoord[0]}|lon:${endCoord[1]},lat:${endCoord[0]}`,
                mode: "drive",
                apiKey
            }
        });
        const props = routeRes.data.features[0].properties;
        console.log(`Distance: ${(props.distance / 1000).toFixed(2)} km`);
        console.log(`Estimated Time: ${(props.time / 60).toFixed(0)} minutes`);
    }
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
