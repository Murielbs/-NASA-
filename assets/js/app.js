/**
 * Controlado            // Mostrar estado de carregamento
            this.showLoadingScreen();

            // Inicializar componentes em ordem
            await this.initializeComponents();

            // Configurar ouvintes de eventos globais
            this.setupGlobalEventListeners();

            // Configurar tratamento de erros
            this.setupErrorHandling();

            // Ocultar tela de carregamento
            setTimeout(() => this.hideLoadingScreen(), 1000);

            // Marcar como inicializadoplicação
 * Inicializa e coordena todos os componentes da Plataforma Interativa de Mapas NASA
 */
class NASAMapApp {
    constructor() {
        this.initialized = false;
        this.version = '1.0.0';
        this.components = {};
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 GeoAnalytica Brasil v' + this.version);
            console.log('Inicializando aplicação...');

        
            this.showLoadingScreen();

          
            await this.initializeComponents();

       
            this.setupGlobalEvents();

            this.setupErrorHandling();

            this.hideLoadingScreen();

            this.initialized = true;

            console.log('✅ Aplicação inicializada com sucesso');
            this.showWelcomeMessage();

        } catch (error) {
            console.error('❌ Falha ao inicializar aplicação:', error);
            this.showErrorMessage('Falha ao inicializar aplicação: ' + error.message);
        }
    }

    async initializeComponents() {
        console.log('Inicializando Controlador de Interface...');
        this.components.uiController = new UIController();
        window.uiController = this.components.uiController;

        console.log('Inicializando Gerenciador de Dados...');
        this.components.dataManager = new DataManager();
        window.dataManager = this.components.dataManager;

        console.log('Inicializando Controlador do Mapa...');
        this.components.mapController = new MapController();
        window.mapController = this.components.mapController;

      
        await this.linkComponents();
        
        
        setTimeout(() => {
            if (this.components.mapController && this.components.mapController.map) {
                this.components.mapController.map.invalidateSize();
            }
        }, 500);
    }

    async linkComponents() {
       
        this.components.mapController.dataManager = this.components.dataManager;
        this.components.mapController.uiController = this.components.uiController;
        
        this.components.dataManager.mapController = this.components.mapController;
        this.components.dataManager.uiController = this.components.uiController;
        
        this.components.uiController.mapController = this.components.mapController;
        this.components.uiController.dataManager = this.components.dataManager;
    }

    setupGlobalEvents() {
   
        window.addEventListener('dataUpdated', (event) => {
            console.log('Dados atualizados para a data:', event.detail.date);
            this.handleDataUpdate(event.detail);
        });

       
        window.addEventListener('mapClicked', (event) => {
            this.handleMapClick(event.detail);
        });

       
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleGlobalError(event.error);
        });

        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleGlobalError(event.reason);
        });

        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleAppHidden();
            } else {
                this.handleAppVisible();
            }
        });

       
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });
    }

    setupErrorHandling() {
       
        const originalConsoleError = console.error;
        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            
           
            this.logError(args.join(' '));
        };
    }

    handleDataUpdate(detail) {
      
        const { dataset, date } = detail;
        
       
        if (this.components.uiController) {
            const status = `Loaded ${dataset.metadata.totalPoints} points for ${date.toLocaleDateString()}`;
            document.getElementById('statusText').textContent = status;
        }

        
        if (this.components.mapController) {
            this.components.mapController.updateVisualization();
        }
    }

    handleMapClick(detail) {
        console.log('Mapa clicado em:', detail.coordinates);
        
       
        if (this.components.dataManager) {
            const nearbyData = this.components.dataManager.getDataForCoordinates(
                detail.coordinates.lat,
                detail.coordinates.lng,
                0.1
            );
            
            if (nearbyData.length > 0) {
                console.log(`Found ${nearbyData.length} data points nearby`);
            }
        }
    }

    handleGlobalError(error) {
        console.error('Handling global error:', error);
        
       
        if (this.components.uiController) {
            this.components.uiController.showNotification(
                'An error occurred. Please try refreshing the page.',
                'error',
                5000
            );
        }
        
       
        this.logError(error.toString());
    }

    handleAppHidden() {
        
        if (this.components.dataManager && this.components.dataManager.isPlaying) {
            this.components.dataManager.stopPlayback();
        }
        
        console.log('App oculto - reduzindo atividade');
    }

    handleAppVisible() {
        
        console.log('App visível - retomando atividade normal');
        
        
        if (this.components.mapController) {
            setTimeout(() => {
                this.components.mapController.map.invalidateSize();
            }, 100);
        }
    }

    handleOnlineStatus(isOnline) {
        const status = isOnline ? 'Online' : 'Offline';
        console.log('Status da rede:', status);
        
        if (this.components.uiController) {
            this.components.uiController.showNotification(
                `Network status: ${status}`,
                isOnline ? 'success' : 'error',
                2000
            );
        }
        
        
        document.getElementById('statusText').textContent = 
            isOnline ? 'Ready' : 'Offline mode';
    }

    showLoadingScreen() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('show');
            
           
            const loadingText = loadingOverlay.querySelector('p');
            if (loadingText) {
                loadingText.textContent = 'Initializing NASA Map Platform...';
            }
        }
    }

    hideLoadingScreen() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
            }, 500); 
        }
    }

    showWelcomeMessage() {
        setTimeout(() => {
            if (this.components.uiController) {
                this.components.uiController.showNotification(
                    'Bem-vindo ao GeoAnalytica Brasil! 🇧🇷',
                    'success',
                    4000
                );
            }
        }, 1000);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            z-index: 10001;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <h3>Initialization Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #dc3545;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">Reload Page</button>
        `;
        
        document.body.appendChild(errorDiv);
    }

    logError(error) {
        
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error,
            userAgent: navigator.userAgent,
            url: window.location.href,
            version: this.version
        };
        
        
        try {
            const existingLogs = JSON.parse(localStorage.getItem('nasaMapErrors') || '[]');
            existingLogs.push(errorLog);
            
            
            if (existingLogs.length > 10) {
                existingLogs.shift();
            }
            
            localStorage.setItem('nasaMapErrors', JSON.stringify(existingLogs));
        } catch (e) {
            console.warn('Failed to log error to localStorage:', e);
        }
    }

    
    getVersion() {
        return this.version;
    }

    isInitialized() {
        return this.initialized;
    }

    getComponent(name) {
        return this.components[name];
    }

    restart() {
        console.log('Reiniciando aplicação...');
        location.reload();
    }

    exportApplicationData() {
        const appData = {
            version: this.version,
            timestamp: new Date().toISOString(),
            currentData: this.components.dataManager ? this.components.dataManager.getCurrentDataset() : null,
            mapCenter: this.components.mapController ? this.components.mapController.getCurrentCenter() : null,
            mapBounds: this.components.mapController ? this.components.mapController.getCurrentBounds() : null
        };

        const blob = new Blob([JSON.stringify(appData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nasa_map_session_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

   
    enableDebugMode() {
        window.nasaMapDebug = {
            app: this,
            components: this.components,
            logs: JSON.parse(localStorage.getItem('nasaMapErrors') || '[]')
        };
        
        console.log('Modo debug ativado. Acesse via window.nasaMapDebug');
        
        if (this.components.uiController) {
            this.components.uiController.showNotification(
                'Debug mode enabled',
                'info',
                2000
            );
        }
    }

    clearErrorLogs() {
        localStorage.removeItem('nasaMapErrors');
        console.log('Logs de erro limpos');
    }

    getSystemInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB'
            } : 'Not available',
            online: navigator.onLine,
            components: Object.keys(this.components)
        };
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.nasaMapApp = new NASAMapApp();
});


window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
});


window.NASAMapApp = NASAMapApp;