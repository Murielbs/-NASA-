/**
 * Gerenciador de Dados - Gerencia carregamento, processamento e controles temporais de dados
 */
class DataManager {
    constructor() {
        this.currentDate = new Date();
        this.dateRange = {
            start: new Date('2024-01-01'),
            end: new Date('2025-12-31')
        };
        this.isPlaying = false;
        this.playInterval = null;
        this.dataCache = new Map();
        this.currentDataset = null;
        
        this.init();
    }

    init() {
        this.setupDateControls();
        // this.generateSampleDataset(); // Comentado - não gerar dados falsos
        this.updateDateDisplay();
        this.clearMetrics(); // Limpar métricas
    }

    clearMetrics() {
        // Limpar métricas na interface
        document.getElementById('primaryValue').textContent = '--';
        document.getElementById('intensityLevel').textContent = '--%';
        document.getElementById('statusText').textContent = 'Aguardando dados da NASA';
        document.getElementById('dataStatus').textContent = 'Nenhum dado carregado';
    }

    setupDateControls() {
        const dateInput = document.getElementById('dateInput');
        const prevBtn = document.getElementById('prevDate');
        const nextBtn = document.getElementById('nextDate');
        const playBtn = document.getElementById('playBtn');

        // Set initial date
        dateInput.value = this.formatDateForInput(this.currentDate);
        dateInput.min = this.formatDateForInput(this.dateRange.start);
        dateInput.max = this.formatDateForInput(this.dateRange.end);

        // Event listeners
        dateInput.addEventListener('change', (e) => {
            this.setDate(new Date(e.target.value));
        });

        prevBtn.addEventListener('click', () => {
            this.navigateDate(-1);
        });

        nextBtn.addEventListener('click', () => {
            this.navigateDate(1);
        });

        playBtn.addEventListener('click', () => {
            this.togglePlayback();
        });
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    setDate(date) {
        if (date < this.dateRange.start || date > this.dateRange.end) {
            return false;
        }

        this.currentDate = date;
        this.updateDateDisplay();
        this.loadDataForDate(date);
        return true;
    }

    navigateDate(days) {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + days);
        this.setDate(newDate);
    }

    updateDateDisplay() {
        const dateInput = document.getElementById('dateInput');
        dateInput.value = this.formatDateForInput(this.currentDate);
        
        // Update status
        document.getElementById('dataStatus').textContent = 
            `Dados de ${this.currentDate.toLocaleDateString('pt-BR')}`;
    }

    togglePlayback() {
        const playBtn = document.getElementById('playBtn');
        
        if (this.isPlaying) {
            this.stopPlayback();
            playBtn.textContent = '▶ Reproduzir';
            playBtn.classList.remove('playing');
        } else {
            this.startPlayback();
            playBtn.textContent = '⏸ Pausar';
            playBtn.classList.add('playing');
        }
    }

    startPlayback() {
        this.isPlaying = true;
        this.playInterval = setInterval(() => {
            const nextDate = new Date(this.currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            
            if (!this.setDate(nextDate)) {
                // Reached end of date range, stop playback
                this.stopPlayback();
                document.getElementById('playBtn').textContent = '▶ Reproduzir';
                document.getElementById('playBtn').classList.remove('playing');
            }
        }, 1000); // Change date every second during playback
    }

    stopPlayback() {
        this.isPlaying = false;
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }

    loadDataForDate(date) {
        const dateKey = this.formatDateForInput(date);
        
        // Check cache first
        if (this.dataCache.has(dateKey)) {
            this.currentDataset = this.dataCache.get(dateKey);
            this.notifyDataLoaded();
            return;
        }

        // Show loading
        document.getElementById('loadingOverlay').classList.add('show');
        document.getElementById('statusText').textContent = 'Carregando dados...';

        // Simulate data loading
        setTimeout(() => {
            const dataset = this.generateDataForDate(date);
            this.dataCache.set(dateKey, dataset);
            this.currentDataset = dataset;
            
            document.getElementById('loadingOverlay').classList.remove('show');
            document.getElementById('statusText').textContent = 'Dados carregados';
            
            this.notifyDataLoaded();
        }, 500 + Math.random() * 1000); // Random loading time
    }

    generateDataForDate(date) {
        const dataset = {
            date: date,
            metadata: {
                totalPoints: 0,
                coverage: 0,
                quality: 0
            },
            points: [],
            statistics: {
                avgRisk: 0,
                avgProbability: 0,
                maxRisk: 0,
                minRisk: 100,
                hotspotCount: 0
            }
        };

        // Generate realistic data based on date - focus on Brazil
        const dayOfYear = this.getDayOfYear(date);
        const seasonalFactor = Math.sin((dayOfYear / 365) * 2 * Math.PI);
        const baseCount = 50 + Math.round(seasonalFactor * 30);

        for (let i = 0; i < baseCount; i++) {
            const point = this.generateDataPoint(date, seasonalFactor);
            dataset.points.push(point);
        }

        // Calculate statistics
        this.calculateStatistics(dataset);

        return dataset;
    }

    generateDataPoint(date, seasonalFactor) {
        // Generate coordinates within Brazil territory
        const brazilBounds = {
            north: 5.27438888,
            south: -33.75116944,
            east: -28.83872222,
            west: -73.98283333
        };

        const baseLat = brazilBounds.south + Math.random() * (brazilBounds.north - brazilBounds.south);
        const baseLng = brazilBounds.west + Math.random() * (brazilBounds.east - brazilBounds.west);

        // Apply seasonal variations
        const riskValue = Math.max(0, Math.min(100, 
            50 + seasonalFactor * 30 + (Math.random() - 0.5) * 40
        ));
        
        const probabilityValue = Math.max(0, Math.min(100,
            45 + seasonalFactor * 25 + (Math.random() - 0.5) * 50
        ));

        return {
            id: `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            coordinates: {
                lat: parseFloat(baseLat.toFixed(4)),
                lng: parseFloat(baseLng.toFixed(4))
            },
            values: {
                risk: Math.round(riskValue),
                probability: Math.round(probabilityValue),
                confidence: Math.round(70 + Math.random() * 30),
                intensity: Math.random()
            },
            timestamp: date.toISOString(),
            metadata: {
                source: 'simulation',
                quality: Math.round(80 + Math.random() * 20),
                processed: new Date().toISOString()
            }
        };
    }

    calculateStatistics(dataset) {
        if (dataset.points.length === 0) return;

        let totalRisk = 0;
        let totalProbability = 0;
        let maxRisk = 0;
        let minRisk = 100;
        let hotspotCount = 0;

        dataset.points.forEach(point => {
            const risk = point.values.risk;
            const probability = point.values.probability;

            totalRisk += risk;
            totalProbability += probability;
            maxRisk = Math.max(maxRisk, risk);
            minRisk = Math.min(minRisk, risk);

            // Count hotspots (high risk + high probability)
            if (risk > 70 && probability > 70) {
                hotspotCount++;
            }
        });

        dataset.metadata.totalPoints = dataset.points.length;
        dataset.metadata.coverage = Math.round((dataset.points.length / 100) * 100);
        dataset.metadata.quality = Math.round(80 + Math.random() * 20);

        dataset.statistics = {
            avgRisk: Math.round(totalRisk / dataset.points.length),
            avgProbability: Math.round(totalProbability / dataset.points.length),
            maxRisk: maxRisk,
            minRisk: minRisk,
            hotspotCount: hotspotCount
        };
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    notifyDataLoaded() {
        // Notify other components that new data is available
        if (window.mapController) {
            window.mapController.updateVisualization();
        }

        // Update UI with current dataset statistics
        this.updateStatisticsDisplay();

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: {
                dataset: this.currentDataset,
                date: this.currentDate
            }
        }));
    }

    updateStatisticsDisplay() {
        if (!this.currentDataset) return;

        const stats = this.currentDataset.statistics;
        
        // Update metrics in the UI
        document.getElementById('supportScore').textContent = `${stats.avgProbability}/100`;
        document.getElementById('riskFactor').textContent = `${stats.avgRisk}%`;
        
        // Update status with data info
        document.getElementById('dataStatus').textContent = 
            `${this.currentDataset.metadata.totalPoints} pontos, ${stats.hotspotCount} focos identificados`;
    }

    getCurrentDataset() {
        return this.currentDataset;
    }

    getDataForCoordinates(lat, lng, radius = 0.1) {
        if (!this.currentDataset) return [];

        return this.currentDataset.points.filter(point => {
            const distance = this.calculateDistance(
                lat, lng,
                point.coordinates.lat, point.coordinates.lng
            );
            return distance <= radius;
        });
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLng = this.deg2rad(lng2 - lng1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    generateSampleDataset() {
        // Não gerar dados de exemplo - aguardar dados reais da NASA
        // this.loadDataForDate(this.currentDate); // Comentado
        console.log('Aguardando dados oficiais da NASA...');
    }

    exportData(format = 'json') {
        if (!this.currentDataset) {
            alert('Nenhum dado para exportar');
            return;
        }

        const data = {
            exportDate: new Date().toISOString(),
            dataDate: this.formatDateForInput(this.currentDate),
            dataset: this.currentDataset
        };

        switch (format.toLowerCase()) {
            case 'json':
                this.downloadJSON(data);
                break;
            case 'csv':
                this.downloadCSV(data);
                break;
            default:
                console.error('Formato de exportação não suportado:', format);
        }
    }

    downloadJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        this.downloadBlob(blob, `dados_${this.formatDateForInput(this.currentDate)}.json`);
    }

    downloadCSV(data) {
        const headers = ['id', 'lat', 'lng', 'risco', 'probabilidade', 'confianca', 'timestamp'];
        const rows = [headers.join(',')];

        data.dataset.points.forEach(point => {
            const row = [
                point.id,
                point.coordinates.lat,
                point.coordinates.lng,
                point.values.risk,
                point.values.probability,
                point.values.confidence,
                point.timestamp
            ];
            rows.push(row.join(','));
        });

        const blob = new Blob([rows.join('\n')], {
            type: 'text/csv'
        });
        this.downloadBlob(blob, `dados_${this.formatDateForInput(this.currentDate)}.csv`);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getAvailableDates() {
        const dates = [];
        const current = new Date(this.dateRange.start);
        
        while (current <= this.dateRange.end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    }

    clearCache() {
        this.dataCache.clear();
        document.getElementById('statusText').textContent = 'Cache limpo';
    }
}