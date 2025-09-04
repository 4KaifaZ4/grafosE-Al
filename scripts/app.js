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
        this.renderer.render();
        this.uiController.updateMetrics();
        this.uiController.updateAdjacencyMatrix();
    }
    
    setupEventListeners() {
        // Botones de herramientas
        document.getElementById('addVertexBtn').addEventListener('click', () => {
            this.uiController.setMode('addVertex');
        });
        
        document.getElementById('addEdgeBtn').addEventListener('click', () => {
            this.uiController.setMode('addEdge');
        });
        
        document.getElementById('selectBtn').addEventListener('click', () => {
            this.uiController.setMode('select');
        });
        
        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.uiController.setMode('delete');
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres limpiar todo el grafo? Se perderán todos los datos.')) {
                if (this.graph.clear()) {
                    this.renderer.render();
                    this.uiController.updateMetrics();
                    this.uiController.updateAdjacencyMatrix();
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
                this.renderer.render(); // Re-renderizar para mostrar flechas
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
            }
        });
        
        // Agregar botones de exportación/importación si no existen
        this.addExportImportButtons();
    }
    
    addExportImportButtons() {
        const buttonGroup = document.querySelector('.btn-group.ms-2');
        
        // Botón de exportar
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary btn-sm tool-btn';
        exportBtn.id = 'exportBtn';
        exportBtn.textContent = 'Exportar';
        exportBtn.addEventListener('click', () => {
            this.showExportMenu();
        });
        
        // Botón de importar
        const importBtn = document.createElement('button');
        importBtn.className = 'btn btn-secondary btn-sm tool-btn';
        importBtn.id = 'importBtn';
        importBtn.textContent = 'Importar';
        importBtn.addEventListener('click', () => {
            this.uiController.importGraph();
        });
        
        buttonGroup.appendChild(exportBtn);
        buttonGroup.appendChild(importBtn);
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