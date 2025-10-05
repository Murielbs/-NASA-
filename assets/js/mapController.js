/**
 * Controlador do Mapa - Gerencia todas as funcionalidades relacionadas ao mapa
 */
class MapController {
    constructor() {
        this.map = null;
        this.currentLayer = null;
        this.markers = [];
        this.heatmapLayer = null;
        this.currentMode = 'risk';
        this.tempMarker = null;
        this.init();
    }

    init() {
        this.initMap();
        this.setupEventListeners();
    }

    initMap() {

        if (this.map) {
            console.log('Mapa já inicializado, pulando...');
            return;
        }
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Container do mapa não encontrado');
            return;
        }

        if (mapContainer._leaflet_id) {
            mapContainer._leaflet_id = null;
        }

        this.map = L.map('map', {
            center: [-15.7942, -47.8822], 
            zoom: 5,
            zoomControl: true,
            attributionControl: true,
            minZoom: 2,
            maxZoom: 18,
            dragging: true,
            touchZoom: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            boxZoom: true,
            keyboard: true,
            worldCopyJump: false,
            continuousWorld: false,
            noWrap: true,
            zoomSnap: 0.25,
            maxBounds: [
                [-85, -180], 
                [85, 180]    
            ],
            maxBoundsViscosity: 0.7
        });

        // Adicionar camada de azulejos clara
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '', // Remove atribuição
            subdomains: 'abc',
            maxZoom: 18,
            noWrap: true // Evita repetição do mapa
        }).addTo(this.map);

        // Adicionar controle de escala
        L.control.scale({
            position: 'bottomleft'
        }).addTo(this.map);

        // Remove o controle de atribuição do Leaflet
        this.map.attributionControl.setPrefix("");
        this.map.attributionControl.setPosition('bottomright');

        this.setupMapEvents();
        
        // Force map resize after initialization
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }

    fitMapToBrazil() {
        // Garantir que o mapa mostra todo o Brasil de forma suave
        const brazilBounds = [
            [-33.75116944, -73.98283333], // Southwest
            [5.27438888, -28.83872222]    // Northeast
        ];
        
        this.map.fitBounds(brazilBounds, {
            padding: [50, 50],
            animate: true,
            duration: 1.5
        });
    }

    setupMapEvents() {
        // Update coordinates display on mouse move
        this.map.on('mousemove', (e) => {
            const coordinatesDisplay = document.getElementById('coordinatesDisplay');
            if (coordinatesDisplay) {
                coordinatesDisplay.textContent = 
                    `Lat: ${e.latlng.lat.toFixed(4)}, Lon: ${e.latlng.lng.toFixed(4)}`;
            }
        });

        // Handle map clicks (only if not dragging)
        this.map.on('click', (e) => {
            if (!e.originalEvent._dragging) {
                this.handleMapClick(e);
            }
        });

        // Handle zoom changes
        this.map.on('zoomend', () => {
            this.updateMarkerVisibility();
        });

        // Melhorar responsividade do mapa
        this.map.on('movestart', () => {
            this.map.getContainer().style.cursor = 'grabbing';
        });
        
        this.map.on('moveend', () => {
            this.map.getContainer().style.cursor = 'grab';
        });
        
        this.map.on('dragstart', () => {
            this.map.getContainer().style.cursor = 'grabbing';
        });
        
        this.map.on('dragend', () => {
            this.map.getContainer().style.cursor = 'grab';
        });

        this.map.on('moveend', () => {
            this.map.getContainer().style.cursor = 'grab';
        });

        // Suavizar zoom com wheel
        this.map.scrollWheelZoom.addHooks();
        
        // Habilitar navegação por teclado
        this.map.keyboard.addHooks();
    }

    setupEventListeners() {
        const dataLayer = document.getElementById('dataLayer');
        if (dataLayer) {
            dataLayer.addEventListener('change', (e) => {
                this.toggleDataLayer(e.target.checked);
            });
        }

        const heatmapLayer = document.getElementById('heatmapLayer');
        if (heatmapLayer) {
            heatmapLayer.addEventListener('change', (e) => {
                this.toggleHeatmapLayer(e.target.checked);
            });
        }

        const markerLayer = document.getElementById('markerLayer');
        if (markerLayer) {
            markerLayer.addEventListener('change', (e) => {
                this.toggleMarkerLayer(e.target.checked);
            });
        }
    }

    handleMapClick(e) {
        const { lat, lng } = e.latlng;
        
        // Não gerar dados falsos - aguardar dados reais da NASA
        console.log(`Clique no mapa: ${lat.toFixed(4)}, ${lng.toFixed(4)} - aguardando dados da NASA`);
        
        // Mostrar coordenadas sem dados falsos
        document.getElementById('primaryValue').textContent = '--';
        document.getElementById('intensityLevel').textContent = '--%';
        
        // Mostrar painel indicando que não há dados
        this.showEmptyDataPanel(lat, lng);
    }

    showEmptyDataPanel(lat, lng) {
        const dataPanel = document.getElementById('dataPanel');
        const content = document.querySelector('.data-panel-content');
        
        content.innerHTML = `
            <div class="analysis-details">
                <h4>Localização Selecionada</h4>
                <p><strong>Coordenadas:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                <p><strong>Status:</strong> Aguardando dados da NASA</p>
                <p><strong>Dados Disponíveis:</strong> Nenhum</p>
                
                <div class="no-data-message">
                    <p>📡 Carregue dados oficiais da NASA para visualizar informações desta localização.</p>
                </div>
            </div>
        `;
        
        dataPanel.classList.add('open');
    }

    generateAnalysisData(lat, lng) {
        // Generate realistic sample data based on coordinates
        const baseRisk = Math.abs(Math.sin(lat * 0.1) * Math.cos(lng * 0.1)) * 100;
        const baseProbability = Math.abs(Math.cos(lat * 0.05) * Math.sin(lng * 0.05)) * 100;
        
        return {
            coordinates: { lat: lat.toFixed(4), lng: lng.toFixed(4) },
            supportScore: Math.round(baseRisk),
            riskFactor: Math.round(baseProbability),
            timestamp: new Date().toISOString(),
            confidence: Math.round(Math.random() * 30 + 70), // 70-100%
            factors: [
                { name: 'Environmental', value: Math.round(Math.random() * 40 + 20) },
                { name: 'Historical', value: Math.round(Math.random() * 30 + 15) },
                { name: 'Seasonal', value: Math.round(Math.random() * 25 + 10) },
                { name: 'Geographic', value: Math.round(Math.random() * 20 + 5) }
            ]
        };
    }

    showDataPanel(data) {
        const dataPanel = document.getElementById('dataPanel');
        const content = document.querySelector('.data-panel-content');
        
        content.innerHTML = `
            <div class="analysis-details">
                <h4>Location Analysis</h4>
                <p><strong>Coordinates:</strong> ${data.coordinates.lat}, ${data.coordinates.lng}</p>
                <p><strong>Support Score:</strong> ${data.supportScore}/100</p>
                <p><strong>Risk Factor:</strong> ${data.riskFactor}%</p>
                <p><strong>Confidence:</strong> ${data.confidence}%</p>
                <p><strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                
                <h4>Contributing Factors</h4>
                <div class="factors-list">
                    ${data.factors.map(factor => `
                        <div class="factor-item">
                            <span>${factor.name}:</span>
                            <span>${factor.value}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        dataPanel.classList.add('open');
    }

    addTemporaryMarker(lat, lng, data) {
        // Remove previous temporary marker
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
        }

        // Create marker with custom styling based on current mode
        const markerClass = `${this.currentMode}-marker`;
        const icon = L.divIcon({
            className: `custom-marker ${markerClass}`,
            html: '<div class="marker-inner"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        this.tempMarker = L.marker([lat, lng], { icon })
            .addTo(this.map)
            .bindPopup(`
                <div class="popup-content">
                    <h4>Analysis Point</h4>
                    <p><strong>Support:</strong> ${data.supportScore}/100</p>
                    <p><strong>Risk:</strong> ${data.riskFactor}%</p>
                    <p><strong>Confidence:</strong> ${data.confidence}%</p>
                </div>
            `);
    }

    setViewMode(mode) {
        this.currentMode = mode;
        this.updateVisualization();
    }

    updateVisualization() {
        this.clearMarkers();

        if (window.dataManager && window.dataManager.currentDataset && window.dataManager.currentDataset.points) {
            const sharkPoints = window.dataManager.currentDataset.points;
            
            sharkPoints.forEach(point => {
                if (point.coordinates && Array.isArray(point.coordinates)) {
                    const lat = point.coordinates[1];
                    const lng = point.coordinates[0];
                    const marker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'custom-marker shark-marker',
                            html: '<div style="background:#c00;border-radius:50%;width:18px;height:18px;border:2px solid #fff;box-shadow:0 0 5px #000;"></div>',
                            iconSize: [22, 22],
                            iconAnchor: [11, 11]
                        })
                    }).addTo(this.map);
                    
                    marker.on('click', () => {
                        this.showSharkDataPanel(point);
                    });
                    
                    this.markers.push(marker);
                }
            });
        }

        const modeNames = {
            risk: 'Análise de Risco',
            temperature: 'Análise de Temperatura'
        };
        document.getElementById('statusText').textContent = `Modo: ${modeNames[this.currentMode]}`;
    }        showSharkDataPanel(point) {
            const dataPanel = document.getElementById('dataPanel');
            const content = document.querySelector('.data-panel-content');
                content.innerHTML = `
                    <div class="analysis-details">
                        <h4>Ocorrência de Tubarão</h4>
                        <p><strong>Localização:</strong> ${point.location}</p>
                        <p><strong>Coordenadas:</strong> ${point.coordinates[1].toFixed(4)}, ${point.coordinates[0].toFixed(4)}</p>
                        <p><strong>Descrição:</strong> ${point.description}</p>
                        <p><strong>Nome do Tubarão:</strong> ${point.sharkName || 'Não informado'}</p>
                    </div>
                `;
            dataPanel.classList.add('open');
    }

    generateSampleData() {
        // Função desabilitada - não gerar dados falsos
        console.log('generateSampleData() foi chamada mas está desabilitada - aguardando dados da NASA');
        return;
    }

    addDataMarker(lat, lng, data) {
        const markerClass = `${this.currentMode}-marker`;
        const size = this.calculateMarkerSize(data);
        
        const icon = L.divIcon({
            className: `custom-marker ${markerClass}`,
            html: '<div class="marker-inner"></div>',
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
        });

        const marker = L.marker([lat, lng], { icon })
            .addTo(this.map)
            .bindPopup(`
                <div class="popup-content">
                    <h4>${this.currentMode.charAt(0).toUpperCase() + this.currentMode.slice(1)} Data</h4>
                    <p><strong>Support:</strong> ${data.supportScore}/100</p>
                    <p><strong>Risk:</strong> ${data.riskFactor}%</p>
                    <p><strong>Confidence:</strong> ${data.confidence}%</p>
                    <p><strong>Location:</strong> ${data.coordinates.lat}, ${data.coordinates.lng}</p>
                </div>
            `);

        this.markers.push(marker);
    }

    calculateMarkerSize(data) {
        let value;
        switch (this.currentMode) {
            case 'risk':
                value = data.riskValue || 50;
                break;
            case 'temperature':
                value = data.temperatureValue || 50;
                break;
            default:
                value = 50;
        }
        
        return Math.max(8, Math.min(24, (value / 100) * 20 + 8));
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    toggleDataLayer(visible) {
        if (visible) {
            // Apenas limpar marcadores existentes, não gerar novos dados falsos
            // this.updateVisualization(); // Comentado
            console.log('Data layer ativada - aguardando dados da NASA');
        } else {
            this.clearMarkers();
        }
    }

    toggleHeatmapLayer(visible) {
        if (visible && !this.heatmapLayer) {
            // Create a simple heatmap effect using CircleMarkers
            this.createHeatmapEffect();
        } else if (!visible && this.heatmapLayer) {
            this.map.removeLayer(this.heatmapLayer);
            this.heatmapLayer = null;
        }
    }

    createHeatmapEffect() {
        // Não criar pontos de calor falsos - aguardar dados reais da NASA
        console.log('Heatmap layer ativado - aguardando dados da NASA');
    }

    toggleMarkerLayer(visible) {
        this.markers.forEach(marker => {
            if (visible) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });
    }

    updateMarkerVisibility() {
        // Update marker sizes based on zoom level
        const zoom = this.map.getZoom();
        const scaleFactor = Math.max(0.5, Math.min(2, zoom / 10));
        
        // Implementation would scale markers based on zoom
        // This is a placeholder for more complex visibility logic
    }

    exportMap() {
        // Simple implementation - in a real app, you'd use html2canvas or similar
        const mapElement = document.getElementById('map');
        
        // Show loading
        document.getElementById('loadingOverlay').classList.add('show');
        
        // Simulate export process
        setTimeout(() => {
            document.getElementById('loadingOverlay').classList.remove('show');
            alert('Funcionalidade de exportação do mapa seria implementada aqui usando bibliotecas como html2canvas');
        }, 2000);
    }

    fitToBounds(bounds) {
        this.map.fitBounds(bounds);
    }

    setCenter(lat, lng, zoom = 10) {
        this.map.setView([lat, lng], zoom);
    }

    getCurrentBounds() {
        return this.map.getBounds();
    }

    getCurrentCenter() {
        return this.map.getCenter();
    }
}