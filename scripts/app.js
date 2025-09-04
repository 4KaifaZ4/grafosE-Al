import { Graph } from './graph-model.js';
import { GraphRenderer } from './render-engine.js';
import { UIController } from './ui-controller.js';

class GraphEditor {
    constructor() {
        this.graph = new Graph();
        this.renderer = new GraphRenderer('graphCanvas', this.graph);
        this.uiController = new UIController(this.graph, this.renderer);
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupHelpSystem();
        this.renderer.render();
        this.uiController.updateMetrics();
        this.uiController.updateAdjacencyMatrix();
    }
    
    setupEventListeners() {
        // Botones de herramientas
        document.getElementById('addVertexBtn').addEventListener('click', () => {
            this.uiController.setMode('addVertex');
            this.showHelp('Haz clic en cualquier lugar del lienzo para añadir un nuevo vértice');
        });
        
        document.getElementById('addEdgeBtn').addEventListener('click', () => {
            this.uiController.setMode('addEdge');
            this.showHelp('Selecciona un vértice (se pondrá verde) y luego otro vértice para crear una conexión entre ellos');
        });
        
        document.getElementById('selectBtn').addEventListener('click', () => {
            this.uiController.setMode('select');
            this.showHelp('Haz clic en cualquier vértice o arista para seleccionarlo y ver sus propiedades');
        });
        
        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.uiController.setMode('delete');
            this.showHelp('Haz clic en cualquier vértice o arista para eliminarlo');
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres limpiar todo el grafo? Se perderán todos los datos.')) {
                if (this.graph.clear()) {
                    this.renderer.render();
                    this.uiController.updateMetrics();
                    this.uiController.updateAdjacencyMatrix();
                    this.showHelp('Grafo limpiado. Puedes comenzar a crear uno nuevo');
                } else {
                    alert('No se pudo limpiar el grafo.');
                }
            }
        });
        
        // Toggles de tipo de grafo
        document.getElementById('directedToggle').addEventListener('click', () => {
            const newDirected = !this.graph.directed;
            if (this.graph.setGraphDirection(newDirected)) {
                this.uiController.updateDirectedToggle();
                this.uiController.updateMetrics();
                this.uiController.updateAdjacencyMatrix();
                this.renderer.render();
                this.showHelp(newDirected ? 
                    'Modo dirigido activado: las conexiones ahora tendrán dirección (flechas)' :
                    'Modo no dirigido activado: las conexiones serán bidireccionales');
            } else {
                alert('No se pudo cambiar la dirección del grafo. Verifique que no haya aristas bidireccionales que causen conflicto.');
            }
        });
        
        document.getElementById('weightedToggle').addEventListener('click', () => {
            this.graph.weighted = !this.graph.weighted;
            this.uiController.updateWeightedToggle();
            this.renderer.render();
            this.uiController.updateMetrics();
            this.uiController.updateAdjacencyMatrix();
            this.showHelp(this.graph.weighted ?
                'Modo ponderado activado: puedes asignar pesos numéricos a las conexiones' :
                'Modo no ponderado activado: las conexiones no tendrán pesos');
        });
        
        // Evento para el canvas
        document.getElementById('graphCanvas').addEventListener('click', (e) => {
            this.uiController.handleCanvasClick(e);
        });
        
        // Event listener para el modal de peso
        document.getElementById('saveWeightBtn').addEventListener('click', () => {
            this.uiController.saveEdgeWeight();
        });
        
        // Event listener para cerrar el modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const weightModal = bootstrap.Modal.getInstance(document.getElementById('weightModal'));
                if (weightModal) {
                    weightModal.hide();
                }
                this.hideHelp();
            }
        });
        
        // Agregar botones de exportación/importación si no existen
        this.addExportImportButtons();
        
        // Tema oscuro/claro
        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            document.getElementById('themeToggle').textContent = isDark ? 'Tema Claro' : 'Tema Oscuro';
        });
        
        // Botón de ayuda principal
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showHelpModal();
        });
        
        // Botón flotante de ayuda
        document.getElementById('floatingHelpBtn').addEventListener('click', () => {
            this.showHelpModal();
        });
    }
    
    setupHelpSystem() {
        // Tooltips para botones
        const tooltips = document.querySelectorAll('[data-help]');
        tooltips.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const helpText = e.target.getAttribute('data-help');
                this.showHelp(helpText, e.target);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideHelp();
            });
        });
        
        // Help para el canvas
        const canvas = document.getElementById('graphCanvas');
        canvas.addEventListener('mouseenter', () => {
            const currentMode = this.uiController.currentMode;
            let helpText = '';
            
            switch(currentMode) {
                case 'addVertex':
                    helpText = 'Haz clic en cualquier lugar para añadir un nuevo vértice';
                    break;
                case 'addEdge':
                    helpText = 'Haz clic en un vértice y luego en otro para crear una conexión';
                    break;
                case 'select':
                    helpText = 'Haz clic en cualquier elemento para seleccionarlo';
                    break;
                case 'delete':
                    helpText = 'Haz clic en cualquier elemento para eliminarlo';
                    break;
                default:
                    helpText = 'Selecciona una herramienta para comenzar';
            }
            
            this.showHelp(helpText, canvas);
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.hideHelp();
        });
    }
    
    showHelp(text, element = null) {
        const helpTooltip = document.getElementById('currentHelp');
        if (!helpTooltip) return;
        
        helpTooltip.textContent = text;
        helpTooltip.style.display = 'block';
        
        if (element) {
            const rect = element.getBoundingClientRect();
            const tooltipHeight = helpTooltip.offsetHeight;
            const tooltipWidth = helpTooltip.offsetWidth;
            
            // Posicionar el tooltip
            helpTooltip.style.top = (rect.top - tooltipHeight - 10) + 'px';
            helpTooltip.style.left = (rect.left + rect.width / 2 - tooltipWidth / 2) + 'px';
            helpTooltip.className = 'help-tooltip bottom';
        } else {
            // Posicionamiento general
            helpTooltip.style.top = '20px';
            helpTooltip.style.left = '50%';
            helpTooltip.style.transform = 'translateX(-50%)';
            helpTooltip.className = 'help-tooltip bottom';
        }
        
        // Auto-ocultar después de 5 segundos
        clearTimeout(this.helpTimeout);
        this.helpTimeout = setTimeout(() => {
            this.hideHelp();
        }, 5000);
    }
    
    hideHelp() {
        const helpTooltip = document.getElementById('currentHelp');
        if (helpTooltip) {
            helpTooltip.style.display = 'none';
        }
    }
    
    showHelpModal() {
        const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
        helpModal.show();
    }
    
    addExportImportButtons() {
        const buttonGroup = document.querySelector('.btn-group.ms-2');
        if (!buttonGroup) return;
        
        // Botón de exportar
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary btn-sm tool-btn';
        exportBtn.id = 'exportBtn';
        exportBtn.textContent = 'Exportar';
        exportBtn.setAttribute('data-help', 'Guarda tu grafo como archivo o imagen');
        exportBtn.addEventListener('click', () => {
            this.showExportMenu();
        });
        
        // Botón de importar
        const importBtn = document.createElement('button');
        importBtn.className = 'btn btn-secondary btn-sm tool-btn';
        importBtn.id = 'importBtn';
        importBtn.textContent = 'Importar';
        importBtn.setAttribute('data-help', 'Carga un grafo previamente guardado');
        importBtn.addEventListener('click', () => {
            this.uiController.importGraph();
        });
        
        buttonGroup.appendChild(exportBtn);
        buttonGroup.appendChild(importBtn);
        
        // Añadir tooltips a los nuevos botones
        exportBtn.addEventListener('mouseenter', (e) => {
            const helpText = e.target.getAttribute('data-help');
            this.showHelp(helpText, e.target);
        });
        
        exportBtn.addEventListener('mouseleave', () => {
            this.hideHelp();
        });
        
        importBtn.addEventListener('mouseenter', (e) => {
            const helpText = e.target.getAttribute('data-help');
            this.showHelp(helpText, e.target);
        });
        
        importBtn.addEventListener('mouseleave', () => {
            this.hideHelp();
        });
    }
    
    showExportMenu() {
        // Crear menú desplegable para exportar
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu show p-2';
        menu.style.position = 'absolute';
        menu.style.zIndex = '1000';
        menu.style.minWidth = '200px';
        
        // Opción para exportar como JSON
        const jsonOption = document.createElement('button');
        jsonOption.className = 'dropdown-item btn btn-sm';
        jsonOption.textContent = 'Exportar como JSON';
        jsonOption.addEventListener('click', (e) => {
            e.preventDefault();
            this.uiController.exportGraph();
            menu.remove();
        });
        
        // Opción para exportar como imagen
        const imageOption = document.createElement('button');
        imageOption.className = 'dropdown-item btn btn-sm';
        imageOption.textContent = 'Exportar como Imagen PNG';
        imageOption.addEventListener('click', (e) => {
            e.preventDefault();
            this.uiController.exportAsImage();
            menu.remove();
        });
        
        menu.appendChild(jsonOption);
        menu.appendChild(document.createElement('hr'));
        menu.appendChild(imageOption);
        
        // Posicionar el menú debajo del botón de exportar
        const exportBtn = document.getElementById('exportBtn');
        const rect = exportBtn.getBoundingClientRect();
        menu.style.left = rect.left + 'px';
        menu.style.top = rect.bottom + 'px';
        
        document.body.appendChild(menu);
        
        // Cerrar el menú al hacer clic fuera de él
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== exportBtn) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new GraphEditor();
});

// Manejar la tecla Enter en el modal de peso
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('weightModal').classList.contains('show')) {
        document.getElementById('saveWeightBtn').click();
    }
});