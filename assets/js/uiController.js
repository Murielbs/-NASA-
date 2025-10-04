
class UIController {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.controlPanelOpen = false;
        this.dataPanelOpen = false;
        
        this.init();
    }

    init() {
        this.setupModeButtons();
        this.setupToolButtons();
        this.setupDataPanel();
        this.setupResponsiveHandlers();
        this.setupKeyboardShortcuts();
        this.checkMobileView();
    }

    setupModeButtons() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        
        modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                
                modeButtons.forEach(btn => btn.classList.remove('active'));

                e.target.classList.add('active');

                const mode = e.target.getAttribute('data-mode');

                if (window.mapController) {
                    window.mapController.setViewMode(mode);
                }

                this.updateModeSpecificUI(mode);
            });
        });
    }

    updateModeSpecificUI(mode) {
        
        const modeDescriptions = {
            risk: 'Exibindo dados de avaliação de risco',
            temperature: 'Exibindo análise de temperatura'
        };

        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = modeDescriptions[mode] || 'Modo desconhecido';
        }

        const primaryLabel = document.querySelector('.metric label');
        const intensityLabel = document.querySelectorAll('.metric label')[1];
        
        if (mode === 'temperature') {
            if (primaryLabel) primaryLabel.textContent = 'Temperatura (°C)';
            if (intensityLabel) intensityLabel.textContent = 'Variação Térmica';
        } else {
            if (primaryLabel) primaryLabel.textContent = 'Valor Principal';
            if (intensityLabel) intensityLabel.textContent = 'Nível de Intensidade';
        }
    }

    setupToolButtons() {
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.showExportOptions();
            });
        }

        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showInfoModal();
            });
        }

        const mobileMenuBtn = document.getElementById('mobileMenuToggle');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
    }

    showExportOptions() {
        const options = [
            { label: '🖼️ Exportar Mapa como PNG', action: () => this.exportMap() },
            { label: '📄 Exportar Dados como JSON', action: () => this.exportData('json') },
            { label: '📊 Exportar Dados como CSV', action: () => this.exportData('csv') }
        ];

        this.showContextMenu(options, event);
    }

    exportMap() {
        if (window.mapController) {
            window.mapController.exportMap();
        }
    }

    exportData(format) {
        if (window.dataManager) {
            window.dataManager.exportData(format);
        }
    }

    runAnalysis() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const statusText = document.getElementById('statusText');
        
        if (loadingOverlay) {
            loadingOverlay.classList.add('show');
        }
        if (statusText) {
            statusText.textContent = 'Executando análise...';
        }

        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.classList.remove('show');
            }
            if (statusText) {
                statusText.textContent = 'Análise concluída';
            }

            this.showAnalysisResults();
        }, 2000 + Math.random() * 2000);
    }

    showAnalysisResults() {
        const results = this.generateAnalysisResults();
        
        const dataPanel = document.getElementById('dataPanel');
        const content = document.querySelector('.data-panel-content');
        
        content.innerHTML = `
            <div class="analysis-results">
                <h4>Global Analysis Results</h4>
                <div class="results-grid">
                    <div class="result-item">
                        <span class="result-label">Total Coverage:</span>
                        <span class="result-value">${results.coverage}%</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">High Risk Areas:</span>
                        <span class="result-value">${results.highRiskAreas}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Data Quality:</span>
                        <span class="result-value">${results.dataQuality}%</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Confidence Level:</span>
                        <span class="result-value">${results.confidence}%</span>
                    </div>
                </div>
                
                <h4>Recommendations</h4>
                <ul class="recommendations-list">
                    ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
        
        dataPanel.classList.add('open');
        this.dataPanelOpen = true;
    }

    generateAnalysisResults() {
        return {
            coverage: Math.round(85 + Math.random() * 15),
            highRiskAreas: Math.round(3 + Math.random() * 7),
            dataQuality: Math.round(88 + Math.random() * 12),
            confidence: Math.round(82 + Math.random() * 18),
            recommendations: [
                'Focus monitoring on identified high-risk zones',
                'Consider seasonal variations in data patterns',
                'Increase data collection frequency in sparse areas',
                'Validate results with ground-truth measurements'
            ]
        };
    }

    showInfoModal() {
        const modal = this.createModal('Platform Information', `
            <div class="info-content">
                <h4>NASA Interactive Map Platform</h4>
                <p>An advanced data visualization platform for analyzing spatial and temporal patterns.</p>
                
                <h4>Features:</h4>
                <ul>
                    <li>Interactive map with multiple visualization modes</li>
                    <li>Temporal data navigation and playback</li>
                    <li>Real-time analysis and risk assessment</li>
                    <li>Data export capabilities</li>
                    <li>Responsive design for mobile and desktop</li>
                </ul>
                
                <h4>Controls:</h4>
                <ul>
                    <li><strong>Click map:</strong> View detailed analysis</li>
                    <li><strong>Date controls:</strong> Navigate through time</li>
                    <li><strong>Play button:</strong> Auto-advance dates</li>
                    <li><strong>Mode buttons:</strong> Switch visualization types</li>
                    <li><strong>Layer toggles:</strong> Show/hide data layers</li>
                </ul>
                
                <h4>Atalhos de Teclado:</h4>
                <ul>
                    <li><strong>Space:</strong> Alternar reprodução</li>
                    <li><strong>←/→:</strong> Navegar datas</li>
                    <li><strong>R/T:</strong> Alternar modo Risco/Temperatura</li>
                    <li><strong>E:</strong> Opções de exportação</li>
                    <li><strong>Esc:</strong> Fechar painéis</li>
                </ul>
            </div>
        `);
        
        this.showModal(modal);
    }

    setupDataPanel() {
        const closeBtn = document.getElementById('closePanelBtn');
        
        closeBtn.addEventListener('click', () => {
            this.closeDataPanel();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDataPanel();
            }
        });
    }

    closeDataPanel() {
        const dataPanel = document.getElementById('dataPanel');
        dataPanel.classList.remove('open');
        this.dataPanelOpen = false;
    }

    setupResponsiveHandlers() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        if (this.isMobile) {
            this.addMobileMenuButton();
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            this.checkMobileView();
        }

        if (window.mapController && window.mapController.map) {
            setTimeout(() => {
                window.mapController.map.invalidateSize();
                
                window.mapController.map.setView([-15.7942, -47.8822], window.mapController.map.getZoom());
            }, 200);
        }
    }

    checkMobileView() {
        const controlPanel = document.querySelector('.control-panel');
        
        if (this.isMobile) {
            controlPanel.classList.add('mobile');
            this.addMobileMenuButton();
        } else {
            controlPanel.classList.remove('mobile', 'open');
            this.removeMobileMenuButton();
        }
    }

    addMobileMenuButton() {
        if (document.getElementById('mobileMenuBtn')) return;
        
        const headerControls = document.querySelector('.header-controls');
        const menuBtn = document.createElement('button');
        menuBtn.id = 'mobileMenuBtn';
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.textContent = '☰ Menu';
        
        menuBtn.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        headerControls.insertBefore(menuBtn, headerControls.firstChild);
    }

    removeMobileMenuButton() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        if (menuBtn) {
            menuBtn.remove();
        }
    }

    toggleMobileMenu() {
        const controlPanel = document.querySelector('.control-panel');
        const isOpen = controlPanel.classList.toggle('open');
        
        const menuBtn = document.getElementById('mobileMenuBtn');
        if (menuBtn) {
            menuBtn.textContent = isOpen ? '✕ Close' : '☰ Menu';
        }
        
        this.controlPanelOpen = isOpen;
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (e.key) {
                case ' ': 
                    e.preventDefault();
                    document.getElementById('playBtn').click();
                    break;
                    
                case 'ArrowLeft': 
                    e.preventDefault();
                    document.getElementById('prevDate').click();
                    break;
                    
                case 'ArrowRight': 
                    e.preventDefault();
                    document.getElementById('nextDate').click();
                    break;
                    
                case 'r':
                case 'R': 
                    document.querySelector('[data-mode="risk"]').click();
                    break;
                    
                case 'p':
                case 't':
                case 'T': 
                    document.querySelector('[data-mode="temperature"]').click();
                    break;
                    
                case 'e':
                case 'E': 
                    document.getElementById('exportBtn').click();
                    break;
                    
                case 'Escape': 
                    this.closeDataPanel();
                    if (this.isMobile && this.controlPanelOpen) {
                        this.toggleMobileMenu();
                    }
                    break;
            }
        });
    }

    showContextMenu(options, event) {
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            background: #2c2c2c;
            border: 1px solid #444;
            border-radius: 4px;
            padding: 4px 0;
            z-index: 10000;
            min-width: 150px;
        `;
        
        options.forEach(option => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.textContent = option.label;
            item.style.cssText = `
                padding: 8px 12px;
                color: #ccc;
                cursor: pointer;
                font-size: 12px;
            `;
            
            item.addEventListener('click', () => {
                option.action();
                document.body.removeChild(menu);
            });
            
            item.addEventListener('mouseenter', () => {
                item.style.background = '#444';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });
            
            menu.appendChild(item);
        });
        
        document.body.appendChild(menu);

        const rect = event.target.getBoundingClientRect();
        menu.style.left = rect.left + 'px';
        menu.style.top = (rect.bottom + 5) + 'px';

        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                if (document.body.contains(menu)) {
                    document.body.removeChild(menu);
                }
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: #2c2c2c;
            border: 1px solid #444;
            border-radius: 8px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            color: #ccc;
        `;
        
        modalContent.innerHTML = `
            <div class="modal-header" style="padding: 16px; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #fff;">${title}</h3>
                <button class="modal-close" style="background: none; border: none; color: #ccc; font-size: 18px; cursor: pointer;">×</button>
            </div>
            <div class="modal-body" style="padding: 16px;">
                ${content}
            </div>
        `;
        
        modal.appendChild(modalContent);

        modalContent.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        return modal;
    }

    showModal(modal) {
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.focus();
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#0066cc'};
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, duration);

        notification.addEventListener('click', () => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        });
    }

    updateLoadingState(isLoading, message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const statusText = document.getElementById('statusText');
        
        if (isLoading) {
            overlay.classList.add('show');
            statusText.textContent = message;
        } else {
            overlay.classList.remove('show');
            statusText.textContent = 'Ready';
        }
    }
}